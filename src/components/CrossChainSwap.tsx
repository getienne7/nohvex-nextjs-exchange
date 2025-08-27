'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowUpDown, Clock, Zap, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { DEXAggregator, CrossChainSwapParams, CrossChainSwapResult } from '@/lib/dex/aggregator'
import { Token } from '@/lib/dex/index'

interface CrossChainSwapProps {
  onSwapComplete?: (result: CrossChainSwapResult) => void
  className?: string
}

interface ChainConfig {
  chainId: number
  name: string
  symbol: string
  icon: string
  rpcUrl: string
}

const SUPPORTED_CHAINS: ChainConfig[] = [
  { chainId: 1, name: 'Ethereum', symbol: 'ETH', icon: '🔷', rpcUrl: 'https://ethereum-rpc.publicnode.com' },
  { chainId: 56, name: 'BSC', symbol: 'BNB', icon: '🟡', rpcUrl: 'https://bsc-rpc.publicnode.com' },
  { chainId: 137, name: 'Polygon', symbol: 'MATIC', icon: '🟣', rpcUrl: 'https://polygon-rpc.com' },
  { chainId: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵', rpcUrl: 'https://arbitrum-one.publicnode.com' },
  { chainId: 10, name: 'Optimism', symbol: 'ETH', icon: '🔴', rpcUrl: 'https://optimism.publicnode.com' },
  { chainId: 43114, name: 'Avalanche', symbol: 'AVAX', icon: '❄️', rpcUrl: 'https://avalanche-c-chain.publicnode.com' }
]

const POPULAR_TOKENS: { [chainId: number]: Token[] } = {
  1: [
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, chainId: 1 },
    { address: '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 1 }
  ],
  56: [
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, chainId: 56 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18, chainId: 56 }
  ],
  137: [
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18, chainId: 137 },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6, chainId: 137 }
  ]
}

// UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-4">{children}</div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Button = ({ children, onClick, disabled = false, className = '', variant = 'default', size = 'default' }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: string
  size?: string
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium'
  const stateClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
  const variantClasses = variant === 'outline' ? 'border border-gray-300 bg-white text-gray-700' : 'bg-blue-600 text-white'
  const sizeClasses = size === 'lg' ? 'px-6 py-3 text-lg' : size === 'icon' ? 'p-2' : ''
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({ type = 'text', placeholder = '', value, onChange, className = '' }: {
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

const Select = ({ value, onValueChange, children, className = '' }: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {children}
  </select>
)

const Alert = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 border border-red-200 bg-red-50 rounded-md ${className}`}>{children}</div>
)

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const variantClasses = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses}`}>
      {children}
    </span>
  )
}

const Progress = ({ value, className = '' }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

export default function CrossChainSwap({ onSwapComplete, className }: CrossChainSwapProps) {
  const [dexAggregator] = useState(() => new DEXAggregator())
  
  // Form state
  const [fromChain, setFromChain] = useState<number>(1)
  const [toChain, setToChain] = useState<number>(56)
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [prioritizeSpeed, setPrioritizeSpeed] = useState(false)
  
  // Quote and execution state
  const [quote, setQuote] = useState<CrossChainSwapResult | null>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Execution tracking
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<CrossChainSwapResult | null>(null)

  // Initialize default tokens
  useEffect(() => {
    if (!fromToken && POPULAR_TOKENS[fromChain]) {
      setFromToken(POPULAR_TOKENS[fromChain][0])
    }
    if (!toToken && POPULAR_TOKENS[toChain]) {
      setToToken(POPULAR_TOKENS[toChain][0])
    }
  }, [fromChain, toChain, fromToken, toToken])

  // Get quote when parameters change
  const getQuote = useCallback(async () => {
    if (!fromToken || !toToken || !amountIn || parseFloat(amountIn) <= 0) {
      setQuote(null)
      setComparison(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params: CrossChainSwapParams = {
        fromChain,
        toChain,
        tokenIn: fromToken,
        tokenOut: toToken,
        amountIn,
        slippageTolerance: slippage * 100,
        recipient: '0x0000000000000000000000000000000000000000',
        prioritizeSpeed
      }

      const [crossChainQuote, optionsComparison] = await Promise.all([
        dexAggregator.getCrossChainQuote(params),
        dexAggregator.compareSwapOptions(params)
      ])

      setQuote(crossChainQuote)
      setComparison(optionsComparison)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote')
    } finally {
      setIsLoading(false)
    }
  }, [fromToken, toToken, amountIn, slippage, fromChain, toChain, prioritizeSpeed, dexAggregator])

  const handleSwapChains = () => {
    const tempChain = fromChain
    const tempToken = fromToken
    setFromChain(toChain)
    setToChain(tempChain)
    setFromToken(toToken)
    setToToken(tempToken)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Cross-Chain Swap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain and Token Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From */}
            <div className="space-y-3">
              <label className="text-sm font-medium">From</label>
              <Select value={fromChain.toString()} onValueChange={(value) => setFromChain(parseInt(value))}>
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.chainId} value={chain.chainId.toString()}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </Select>
              
              <Select 
                value={fromToken?.address || ''} 
                onValueChange={(address) => {
                  const token = POPULAR_TOKENS[fromChain]?.find(t => t.address === address)
                  setFromToken(token || null)
                }}
              >
                <option value="">Select token</option>
                {POPULAR_TOKENS[fromChain]?.map(token => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </Select>
              
              <Input
                type="number"
                placeholder="Amount"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
              />
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapChains}
                className="rounded-full"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To */}
            <div className="space-y-3">
              <label className="text-sm font-medium">To</label>
              <Select value={toChain.toString()} onValueChange={(value) => setToChain(parseInt(value))}>
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.chainId} value={chain.chainId.toString()}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </Select>
              
              <Select 
                value={toToken?.address || ''} 
                onValueChange={(address) => {
                  const token = POPULAR_TOKENS[toChain]?.find(t => t.address === address)
                  setToToken(token || null)
                }}
              >
                <option value="">Select token</option>
                {POPULAR_TOKENS[toChain]?.map(token => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </Select>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">You'll receive</div>
                <div className="text-lg font-semibold">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : quote ? (
                    <span>~{parseFloat(amountIn || '0') * 0.99} {toToken?.symbol}</span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </Alert>
          )}

          {/* Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Slippage:</label>
              <Select value={slippage.toString()} onValueChange={(value) => setSlippage(parseFloat(value))} className="w-20">
                <option value="0.1">0.1%</option>
                <option value="0.5">0.5%</option>
                <option value="1.0">1.0%</option>
                <option value="3.0">3.0%</option>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prioritize-speed"
                checked={prioritizeSpeed}
                onChange={(e) => setPrioritizeSpeed(e.target.checked)}
              />
              <label htmlFor="prioritize-speed" className="text-sm font-medium cursor-pointer">
                Prioritize Speed
              </label>
            </div>
          </div>

          {/* Execute Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={getQuote}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Getting Quote...
              </div>
            ) : (
              'Get Cross-Chain Quote'
            )}
          </Button>

          {/* Quote Display */}
          {quote && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Estimated Time</div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{quote.estimatedTime} min</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Gas Cost</div>
                  <div className="font-medium">{quote.totalGasEstimate} ETH</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Steps</div>
                  <div className="font-medium">{quote.steps.length}</div>
                </div>
              </div>
              
              {comparison && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recommendation</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={comparison.recommendation === 'cross-chain' ? 'default' : 'secondary'}>
                      {comparison.recommendation === 'cross-chain' ? 'Cross-Chain' : 'Same-Chain'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {comparison.reasoning}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}