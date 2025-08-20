/**
 * PancakeSwap V3 DEX Implementation
 */

import { ethers } from 'ethers'
import { BaseDEX, TradeParams, QuoteResult, TradeResult, DEX_CONFIGS, UnsupportedChainError, InsufficientLiquidityError } from './index'

// PancakeSwap V3 Router ABI (similar to Uniswap V3)
const PANCAKESWAP_V3_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
  'function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)'
]

// PancakeSwap V3 Quoter ABI
const PANCAKESWAP_V3_QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)'
]

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
]

export class PancakeSwapV3DEX extends BaseDEX {
  private config = DEX_CONFIGS.pancakeswap_v3

  getName(): string {
    return this.config.name
  }

  isSupported(chainId: number): boolean {
    return this.config.chains.includes(chainId)
  }

  async getQuote(params: TradeParams): Promise<QuoteResult> {
    if (!this.isSupported(params.tokenIn.chainId)) {
      throw new UnsupportedChainError(params.tokenIn.chainId, this.getName())
    }

    try {
      const quoter = new ethers.Contract(
        this.config.quoter,
        PANCAKESWAP_V3_QUOTER_ABI,
        this.provider
      )

      // Use 2500 (0.25%) as default fee tier for PancakeSwap
      const fee = 2500
      const amountIn = ethers.parseUnits(params.amountIn, params.tokenIn.decimals)

      // Get quote from PancakeSwap V3
      const [amountOut, , , gasEstimate] = await quoter.quoteExactInputSingle.staticCall(
        params.tokenIn.address,
        params.tokenOut.address,
        fee,
        amountIn,
        0 // sqrtPriceLimitX96 = 0 (no limit)
      )

      const amountOutFormatted = ethers.formatUnits(amountOut, params.tokenOut.decimals)
      const minimumAmountOut = this.calculateMinimumAmountOut(amountOutFormatted, params.slippageTolerance)

      // Calculate price impact (simplified)
      const inputValue = parseFloat(params.amountIn)
      const outputValue = parseFloat(amountOutFormatted)
      const expectedPrice = inputValue / outputValue
      const priceImpact = Math.abs((expectedPrice - 1) * 100) // Simplified calculation

      return {
        amountOut: amountOutFormatted,
        priceImpact,
        route: [params.tokenIn.symbol, params.tokenOut.symbol],
        gasEstimate: gasEstimate.toString(),
        minimumAmountOut
      }
    } catch (error: any) {
      if (error.message.includes('STF') || error.message.includes('INSUFFICIENT_LIQUIDITY')) {
        throw new InsufficientLiquidityError(params.tokenIn.symbol, params.tokenOut.symbol)
      }
      throw new Error(`Failed to get quote: ${error.message}`)
    }
  }

  async executeTrade(params: TradeParams, signer: ethers.Signer): Promise<TradeResult> {
    if (!this.isSupported(params.tokenIn.chainId)) {
      throw new UnsupportedChainError(params.tokenIn.chainId, this.getName())
    }

    try {
      const router = new ethers.Contract(
        this.config.router,
        PANCAKESWAP_V3_ROUTER_ABI,
        signer
      )

      const tokenIn = new ethers.Contract(params.tokenIn.address, ERC20_ABI, signer)
      const amountIn = ethers.parseUnits(params.amountIn, params.tokenIn.decimals)
      const recipient = params.recipient || await signer.getAddress()

      // Check and approve token if necessary
      const allowance = await tokenIn.allowance(recipient, this.config.router)
      if (allowance < amountIn) {
        const approveTx = await tokenIn.approve(this.config.router, amountIn)
        await approveTx.wait()
      }

      // Get quote for minimum amount out
      const quote = await this.getQuote(params)
      const amountOutMinimum = ethers.parseUnits(quote.minimumAmountOut, params.tokenOut.decimals)

      // Execute the swap
      const swapParams = {
        tokenIn: params.tokenIn.address,
        tokenOut: params.tokenOut.address,
        fee: 2500, // 0.25% fee tier
        recipient,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96: 0
      }

      const tx = await router.exactInputSingle(swapParams)
      const receipt = await tx.wait()

      // Parse the swap event to get actual amounts
      const swapEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('Swap(address,address,int256,int256,uint160,uint128,int24)')
      )

      let actualAmountOut = quote.amountOut
      if (swapEvent) {
        // Parse the actual amount out from the event
        const parsedLog = router.interface.parseLog(swapEvent)
        actualAmountOut = ethers.formatUnits(
          parsedLog?.args.amount1 || parsedLog?.args.amount0,
          params.tokenOut.decimals
        )
      }

      const effectivePrice = parseFloat(params.amountIn) / parseFloat(actualAmountOut)

      return {
        hash: receipt.hash,
        amountIn: params.amountIn,
        amountOut: actualAmountOut,
        gasUsed: receipt.gasUsed.toString(),
        effectivePrice: effectivePrice.toString(),
        priceImpact: quote.priceImpact
      }
    } catch (error: any) {
      throw new Error(`Trade execution failed: ${error.message}`)
    }
  }

  // Helper method to get the best fee tier for a pair
  async getBestFeeTier(tokenA: string, tokenB: string): Promise<number> {
    const feeTiers = [100, 500, 2500, 10000] // 0.01%, 0.05%, 0.25%, 1%
    
    for (const fee of feeTiers) {
      try {
        const quoter = new ethers.Contract(
          this.config.quoter,
          PANCAKESWAP_V3_QUOTER_ABI,
          this.provider
        )
        
        // Try to get a quote with this fee tier
        await quoter.quoteExactInputSingle.staticCall(
          tokenA,
          tokenB,
          fee,
          ethers.parseUnits('1', 18), // 1 token
          0
        )
        
        return fee // Return the first working fee tier
      } catch {
        continue
      }
    }
    
    return 2500 // Default to 0.25% if none work
  }
}