/**
 * DEX Trading Integration
 * Supports Uniswap V3, PancakeSwap, and other major DEXs
 */

import { ethers } from 'ethers'

// Chain configurations
export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.nownodes.io',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io'
  },
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc.nownodes.io',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorer: 'https://bscscan.com'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon.nownodes.io',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com'
  }
} as const

// DEX configurations
export const DEX_CONFIGS = {
  uniswap_v3: {
    name: 'Uniswap V3',
    chains: [1] as number[], // Ethereum
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
  },
  pancakeswap_v3: {
    name: 'PancakeSwap V3',
    chains: [56] as number[], // BSC
    router: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997'
  },
  quickswap_v3: {
    name: 'QuickSwap V3',
    chains: [137] as number[], // Polygon
    router: '0xf5b509bB0909a69B1c207E495f687a596C168E12',
    factory: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
    quoter: '0xa15F0D7377B2A0C0c10262E4ABB0B37C4B9d8e0C'
  }
}

// Common token addresses
export const COMMON_TOKENS = {
  1: { // Ethereum
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  },
  56: { // BSC
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
  },
  137: { // Polygon
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
  }
} as const

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
}

export interface TradeParams {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippageTolerance: number // in basis points (100 = 1%)
  deadline?: number // timestamp
  recipient?: string
}

export interface QuoteResult {
  amountOut: string
  priceImpact: number
  route: string[]
  gasEstimate: string
  minimumAmountOut: string
}

export interface TradeResult {
  hash: string
  amountIn: string
  amountOut: string
  gasUsed: string
  effectivePrice: string
  priceImpact: number
}

export abstract class BaseDEX {
  protected provider: ethers.Provider
  protected chainId: number
  
  constructor(provider: ethers.Provider, chainId: number) {
    this.provider = provider
    this.chainId = chainId
  }

  abstract getName(): string
  abstract isSupported(chainId: number): boolean
  abstract getQuote(params: TradeParams): Promise<QuoteResult>
  abstract executeTrade(params: TradeParams, signer: ethers.Signer): Promise<TradeResult>
  
  protected calculateMinimumAmountOut(amountOut: string, slippageTolerance: number): string {
    const amount = ethers.parseUnits(amountOut, 18)
    const slippage = BigInt(slippageTolerance)
    const minAmount = amount * (BigInt(10000) - slippage) / BigInt(10000)
    return ethers.formatUnits(minAmount, 18)
  }
  
  protected getDeadline(minutes: number = 20): number {
    return Math.floor(Date.now() / 1000) + (minutes * 60)
  }
}

// Error types
export class DEXError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message)
    this.name = 'DEXError'
  }
}

export class InsufficientLiquidityError extends DEXError {
  constructor(tokenA: string, tokenB: string) {
    super(`Insufficient liquidity for ${tokenA}/${tokenB} pair`, 'INSUFFICIENT_LIQUIDITY')
  }
}

export class SlippageExceededError extends DEXError {
  constructor(expected: string, actual: string) {
    super(`Slippage exceeded: expected ${expected}, got ${actual}`, 'SLIPPAGE_EXCEEDED')
  }
}

export class UnsupportedChainError extends DEXError {
  constructor(chainId: number, dexName: string) {
    super(`Chain ${chainId} not supported by ${dexName}`, 'UNSUPPORTED_CHAIN')
  }
}