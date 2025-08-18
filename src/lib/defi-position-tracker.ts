/**
 * DeFi Position Tracking System
 * Monitors active DeFi positions across multiple protocols and provides comprehensive analysis
 */

import { nowNodesService } from './nownodes'

export interface DeFiPosition {
  id: string
  walletAddress: string
  protocol: DeFiProtocol
  type: PositionType
  status: PositionStatus
  chainId: number
  chainName: string
  contractAddress: string
  tokenAddresses: string[]
  assets: PositionAsset[]
  metrics: PositionMetrics
  risks: PositionRisks
  rewards: PositionRewards
  createdAt: number
  lastUpdated: number
}

export interface PositionAsset {
  symbol: string
  name: string
  address: string
  balance: string
  usdValue: number
  price: number
  weight: number // Percentage of position
  apy?: number
  isCollateral?: boolean
  isDebt?: boolean
}

export interface PositionMetrics {
  totalValue: number
  totalSupplied: number
  totalBorrowed: number
  netValue: number
  healthFactor?: number
  ltv?: number // Loan-to-Value ratio
  utilizationRate?: number
  impermanentLoss?: number
  totalRewards: number
  dailyYield: number
  apy: number
}

export interface PositionRisks {
  liquidationRisk: RiskLevel
  liquidationPrice?: number
  liquidationThreshold?: number
  impermanentLossRisk: RiskLevel
  smartContractRisk: RiskLevel
  overallRisk: RiskLevel
  riskFactors: string[]
  recommendations: string[]
}

export interface PositionRewards {
  claimableRewards: RewardToken[]
  totalClaimableUSD: number
  estimatedDailyRewards: number
  estimatedAPY: number
  autoCompoundAvailable: boolean
  lastClaimTimestamp?: number
}

export interface RewardToken {
  symbol: string
  name: string
  address: string
  amount: string
  usdValue: number
  price: number
}

export enum DeFiProtocol {
  AAVE = 'aave',
  COMPOUND = 'compound',
  UNISWAP_V2 = 'uniswap_v2',
  UNISWAP_V3 = 'uniswap_v3',
  CURVE = 'curve',
  LIDO = 'lido',
  PANCAKESWAP = 'pancakeswap',
  SUSHISWAP = 'sushiswap',
  BALANCER = 'balancer',
  YEARN = 'yearn',
  CONVEX = 'convex'
}

export enum PositionType {
  LENDING = 'lending',
  BORROWING = 'borrowing',
  LIQUIDITY_POOL = 'liquidity_pool',
  STAKING = 'staking',
  YIELD_FARMING = 'yield_farming',
  LEVERAGED = 'leveraged',
  SYNTHETIC = 'synthetic'
}

export enum PositionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  AT_RISK = 'at_risk',
  LIQUIDATED = 'liquidated',
  CLOSED = 'closed'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ImpermanentLossAnalysis {
  currentIL: number
  currentILPercent: number
  breakEvenPrice: { [token: string]: number }
  worstCaseIL: number
  timeWeightedIL: number
  ilHistory: { timestamp: number; il: number }[]
}

export interface LiquidationAlert {
  id: string
  positionId: string
  severity: 'warning' | 'critical'
  currentHealthFactor: number
  liquidationThreshold: number
  priceDropRequired: number
  timeToLiquidation?: number
  recommendedActions: string[]
  createdAt: number
}

export interface YieldOptimization {
  positionId: string
  currentAPY: number
  optimizedAPY: number
  potentialGain: number
  strategy: OptimizationStrategy
  actions: OptimizationAction[]
  riskImpact: number
  confidence: number
}

export interface OptimizationStrategy {
  type: 'compound' | 'migrate' | 'rebalance' | 'leverage'
  description: string
  expectedReturn: number
  riskLevel: RiskLevel
  timeframe: string
}

export interface OptimizationAction {
  type: 'claim' | 'compound' | 'migrate' | 'adjust'
  description: string
  estimatedGas: number
  expectedReturn: number
  urgency: 'low' | 'medium' | 'high'
}

export class DeFiPositionTracker {
  private static instance: DeFiPositionTracker
  private positions: Map<string, DeFiPosition[]> = new Map()
  private liquidationAlerts: Map<string, LiquidationAlert[]> = new Map()
  private protocolConfigs: Map<DeFiProtocol, ProtocolConfig> = new Map()

  // Protocol contract addresses and configurations
  private initializeProtocolConfigs() {
    // Ethereum
    this.protocolConfigs.set(DeFiProtocol.AAVE, {
      chainId: 1,
      lendingPool: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      dataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      oracle: '0xA50ba011c48153De246E5192C8f9258A2ba79Ca9',
      tokens: new Map([
        ['USDC', '0xa0b86a33e6441e8c8c7b0b8b8b8b8b8b8b8b8b8b'],
        ['USDT', '0x3ed3b47dd13ec9a98b44e6204a523e766b225811'],
        ['DAI', '0x028171bca77440897b824ca71d1c56cac55b68a3']
      ])
    })

    this.protocolConfigs.set(DeFiProtocol.COMPOUND, {
      chainId: 1,
      comptroller: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      oracle: '0x046728da7cb8272284238bd3e47909823d63a58d',
      tokens: new Map([
        ['cUSDC', '0x39aa39c021dfbae8fac545936693ac917d5e7563'],
        ['cUSDT', '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'],
        ['cDAI', '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643']
      ])
    })

    this.protocolConfigs.set(DeFiProtocol.UNISWAP_V3, {
      chainId: 1,
      factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
      router: '0xe592427a0aece92de3edee1f18e0157c05861564',
      positionManager: '0xc36442b4a4522e871399cd717abdd847ab11fe88'
    })

    // BSC
    this.protocolConfigs.set(DeFiProtocol.PANCAKESWAP, {
      chainId: 56,
      factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
      router: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
      masterChef: '0x73feaa1ee314f8c655e354234017be2193c9e24e'
    })
  }

  static getInstance(): DeFiPositionTracker {
    if (!DeFiPositionTracker.instance) {
      DeFiPositionTracker.instance = new DeFiPositionTracker()
      DeFiPositionTracker.instance.initializeProtocolConfigs()
    }
    return DeFiPositionTracker.instance
  }

  // Scan wallet for DeFi positions across all protocols
  async scanWalletPositions(walletAddress: string): Promise<DeFiPosition[]> {
    const allPositions: DeFiPosition[] = []
    
    try {
      // Scan each supported chain
      const chainIds = [1, 56, 137, 42161, 10] // ETH, BSC, Polygon, Arbitrum, Optimism
      
      for (const chainId of chainIds) {
        const chainPositions = await this.scanChainPositions(walletAddress, chainId)
        allPositions.push(...chainPositions)
      }
      
      // Store positions
      this.positions.set(walletAddress.toLowerCase(), allPositions)
      
      // Generate liquidation alerts
      await this.generateLiquidationAlerts(walletAddress, allPositions)
      
      return allPositions
    } catch (error) {
      console.error('Failed to scan wallet positions:', error)
      return []
    }
  }

  // Scan positions on a specific chain
  private async scanChainPositions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Scan Aave positions
      if (chainId === 1) {
        const aavePositions = await this.scanAavePositions(walletAddress, chainId)
        positions.push(...aavePositions)
        
        // Scan Compound positions
        const compoundPositions = await this.scanCompoundPositions(walletAddress, chainId)
        positions.push(...compoundPositions)
        
        // Scan Uniswap V3 positions
        const uniswapPositions = await this.scanUniswapV3Positions(walletAddress, chainId)
        positions.push(...uniswapPositions)
        
        // Scan Lido staking
        const lidoPositions = await this.scanLidoPositions(walletAddress, chainId)
        positions.push(...lidoPositions)
      }
      
      // Scan PancakeSwap positions on BSC
      if (chainId === 56) {
        const pancakePositions = await this.scanPancakeSwapPositions(walletAddress, chainId)
        positions.push(...pancakePositions)
      }
      
    } catch (error) {
      console.error(`Failed to scan positions on chain ${chainId}:`, error)
    }
    
    return positions
  }

  // Scan Aave lending/borrowing positions
  private async scanAavePositions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Mock Aave position data (in real implementation, this would call Aave contracts)
      const mockAavePosition: DeFiPosition = {
        id: `aave_${walletAddress}_${Date.now()}`,
        walletAddress: walletAddress.toLowerCase(),
        protocol: DeFiProtocol.AAVE,
        type: PositionType.LENDING,
        status: PositionStatus.ACTIVE,
        chainId,
        chainName: 'Ethereum',
        contractAddress: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
        tokenAddresses: ['0xa0b86a33e6441e8c8c7b0b8b8b8b8b8b8b8b8b8b'],
        assets: [
          {
            symbol: 'aUSDC',
            name: 'Aave USDC',
            address: '0xa0b86a33e6441e8c8c7b0b8b8b8b8b8b8b8b8b8b',
            balance: '1000.00',
            usdValue: 1000,
            price: 1.0,
            weight: 100,
            apy: 3.2,
            isCollateral: true
          }
        ],
        metrics: {
          totalValue: 1000,
          totalSupplied: 1000,
          totalBorrowed: 0,
          netValue: 1000,
          healthFactor: 999,
          ltv: 0,
          utilizationRate: 0,
          totalRewards: 0.85,
          dailyYield: 0.087,
          apy: 3.2
        },
        risks: {
          liquidationRisk: RiskLevel.LOW,
          impermanentLossRisk: RiskLevel.LOW,
          smartContractRisk: RiskLevel.LOW,
          overallRisk: RiskLevel.LOW,
          riskFactors: ['Low utilization', 'Stable asset'],
          recommendations: ['Consider borrowing against collateral for yield farming']
        },
        rewards: {
          claimableRewards: [
            {
              symbol: 'AAVE',
              name: 'Aave Token',
              address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
              amount: '0.25',
              usdValue: 25,
              price: 100
            }
          ],
          totalClaimableUSD: 25,
          estimatedDailyRewards: 0.68,
          estimatedAPY: 2.5,
          autoCompoundAvailable: true
        },
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
        lastUpdated: Date.now()
      }
      
      positions.push(mockAavePosition)
    } catch (error) {
      console.error('Failed to scan Aave positions:', error)
    }
    
    return positions
  }

  // Scan Compound positions
  private async scanCompoundPositions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Mock Compound position
      const mockCompoundPosition: DeFiPosition = {
        id: `compound_${walletAddress}_${Date.now()}`,
        walletAddress: walletAddress.toLowerCase(),
        protocol: DeFiProtocol.COMPOUND,
        type: PositionType.LENDING,
        status: PositionStatus.ACTIVE,
        chainId,
        chainName: 'Ethereum',
        contractAddress: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
        tokenAddresses: ['0x39aa39c021dfbae8fac545936693ac917d5e7563'],
        assets: [
          {
            symbol: 'cUSDC',
            name: 'Compound USDC',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            balance: '500.00',
            usdValue: 500,
            price: 1.0,
            weight: 100,
            apy: 2.8
          }
        ],
        metrics: {
          totalValue: 500,
          totalSupplied: 500,
          totalBorrowed: 0,
          netValue: 500,
          totalRewards: 0.42,
          dailyYield: 0.038,
          apy: 2.8
        },
        risks: {
          liquidationRisk: RiskLevel.LOW,
          impermanentLossRisk: RiskLevel.LOW,
          smartContractRisk: RiskLevel.LOW,
          overallRisk: RiskLevel.LOW,
          riskFactors: ['Stable lending position'],
          recommendations: ['Consider migrating to higher yield protocols']
        },
        rewards: {
          claimableRewards: [
            {
              symbol: 'COMP',
              name: 'Compound Token',
              address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
              amount: '0.15',
              usdValue: 12,
              price: 80
            }
          ],
          totalClaimableUSD: 12,
          estimatedDailyRewards: 0.32,
          estimatedAPY: 1.2,
          autoCompoundAvailable: false
        },
        createdAt: Date.now() - 86400000 * 15, // 15 days ago
        lastUpdated: Date.now()
      }
      
      positions.push(mockCompoundPosition)
    } catch (error) {
      console.error('Failed to scan Compound positions:', error)
    }
    
    return positions
  }

  // Scan Uniswap V3 LP positions
  private async scanUniswapV3Positions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Mock Uniswap V3 LP position
      const mockUniswapPosition: DeFiPosition = {
        id: `uniswap_v3_${walletAddress}_${Date.now()}`,
        walletAddress: walletAddress.toLowerCase(),
        protocol: DeFiProtocol.UNISWAP_V3,
        type: PositionType.LIQUIDITY_POOL,
        status: PositionStatus.ACTIVE,
        chainId,
        chainName: 'Ethereum',
        contractAddress: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
        tokenAddresses: ['0xa0b86a33e6441e8c8c7b0b8b8b8b8b8b8b8b8b8b', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
        assets: [
          {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0xa0b86a33e6441e8c8c7b0b8b8b8b8b8b8b8b8b8b',
            balance: '750.00',
            usdValue: 750,
            price: 1.0,
            weight: 50
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            balance: '0.172',
            usdValue: 750,
            price: 4360,
            weight: 50
          }
        ],
        metrics: {
          totalValue: 1500,
          totalSupplied: 1500,
          totalBorrowed: 0,
          netValue: 1500,
          impermanentLoss: -2.3,
          totalRewards: 12.5,
          dailyYield: 0.85,
          apy: 18.5
        },
        risks: {
          liquidationRisk: RiskLevel.LOW,
          impermanentLossRisk: RiskLevel.MEDIUM,
          smartContractRisk: RiskLevel.LOW,
          overallRisk: RiskLevel.MEDIUM,
          riskFactors: ['Impermanent loss risk', 'Price volatility'],
          recommendations: ['Monitor IL closely', 'Consider narrower price range']
        },
        rewards: {
          claimableRewards: [
            {
              symbol: 'UNI',
              name: 'Uniswap Token',
              address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              amount: '2.5',
              usdValue: 15,
              price: 6
            }
          ],
          totalClaimableUSD: 15,
          estimatedDailyRewards: 1.2,
          estimatedAPY: 15.8,
          autoCompoundAvailable: false
        },
        createdAt: Date.now() - 86400000 * 7, // 7 days ago
        lastUpdated: Date.now()
      }
      
      positions.push(mockUniswapPosition)
    } catch (error) {
      console.error('Failed to scan Uniswap V3 positions:', error)
    }
    
    return positions
  }

  // Scan Lido staking positions
  private async scanLidoPositions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Mock Lido staking position
      const mockLidoPosition: DeFiPosition = {
        id: `lido_${walletAddress}_${Date.now()}`,
        walletAddress: walletAddress.toLowerCase(),
        protocol: DeFiProtocol.LIDO,
        type: PositionType.STAKING,
        status: PositionStatus.ACTIVE,
        chainId,
        chainName: 'Ethereum',
        contractAddress: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        tokenAddresses: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
        assets: [
          {
            symbol: 'stETH',
            name: 'Lido Staked ETH',
            address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
            balance: '0.5',
            usdValue: 2180,
            price: 4360,
            weight: 100,
            apy: 4.2
          }
        ],
        metrics: {
          totalValue: 2180,
          totalSupplied: 2180,
          totalBorrowed: 0,
          netValue: 2180,
          totalRewards: 3.8,
          dailyYield: 0.25,
          apy: 4.2
        },
        risks: {
          liquidationRisk: RiskLevel.LOW,
          impermanentLossRisk: RiskLevel.LOW,
          smartContractRisk: RiskLevel.LOW,
          overallRisk: RiskLevel.LOW,
          riskFactors: ['ETH 2.0 slashing risk', 'Smart contract risk'],
          recommendations: ['Diversify staking across multiple validators']
        },
        rewards: {
          claimableRewards: [],
          totalClaimableUSD: 0,
          estimatedDailyRewards: 0.25,
          estimatedAPY: 4.2,
          autoCompoundAvailable: true
        },
        createdAt: Date.now() - 86400000 * 60, // 60 days ago
        lastUpdated: Date.now()
      }
      
      positions.push(mockLidoPosition)
    } catch (error) {
      console.error('Failed to scan Lido positions:', error)
    }
    
    return positions
  }

  // Scan PancakeSwap positions on BSC
  private async scanPancakeSwapPositions(walletAddress: string, chainId: number): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = []
    
    try {
      // Mock PancakeSwap farming position
      const mockPancakePosition: DeFiPosition = {
        id: `pancakeswap_${walletAddress}_${Date.now()}`,
        walletAddress: walletAddress.toLowerCase(),
        protocol: DeFiProtocol.PANCAKESWAP,
        type: PositionType.YIELD_FARMING,
        status: PositionStatus.ACTIVE,
        chainId,
        chainName: 'BNB Smart Chain',
        contractAddress: '0x73feaa1ee314f8c655e354234017be2193c9e24e',
        tokenAddresses: ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', '0xe9e7cea3dedca5984780bafc599bd69add087d56'],
        assets: [
          {
            symbol: 'BNB',
            name: 'BNB',
            address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            balance: '0.5',
            usdValue: 425,
            price: 850,
            weight: 50
          },
          {
            symbol: 'BUSD',
            name: 'Binance USD',
            address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            balance: '425.00',
            usdValue: 425,
            price: 1.0,
            weight: 50
          }
        ],
        metrics: {
          totalValue: 850,
          totalSupplied: 850,
          totalBorrowed: 0,
          netValue: 850,
          impermanentLoss: -1.2,
          totalRewards: 8.5,
          dailyYield: 1.2,
          apy: 28.5
        },
        risks: {
          liquidationRisk: RiskLevel.LOW,
          impermanentLossRisk: RiskLevel.MEDIUM,
          smartContractRisk: RiskLevel.MEDIUM,
          overallRisk: RiskLevel.MEDIUM,
          riskFactors: ['Impermanent loss', 'CAKE token volatility'],
          recommendations: ['Claim and compound rewards regularly']
        },
        rewards: {
          claimableRewards: [
            {
              symbol: 'CAKE',
              name: 'PancakeSwap Token',
              address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
              amount: '15.5',
              usdValue: 31,
              price: 2
            }
          ],
          totalClaimableUSD: 31,
          estimatedDailyRewards: 2.1,
          estimatedAPY: 25.2,
          autoCompoundAvailable: true
        },
        createdAt: Date.now() - 86400000 * 14, // 14 days ago
        lastUpdated: Date.now()
      }
      
      positions.push(mockPancakePosition)
    } catch (error) {
      console.error('Failed to scan PancakeSwap positions:', error)
    }
    
    return positions
  }

  // Calculate impermanent loss for LP positions
  async calculateImpermanentLoss(position: DeFiPosition): Promise<ImpermanentLossAnalysis> {
    if (position.type !== PositionType.LIQUIDITY_POOL) {
      throw new Error('Impermanent loss calculation only applies to liquidity pool positions')
    }
    
    // Mock IL calculation (in real implementation, this would use historical price data)
    const currentIL = position.metrics.impermanentLoss || 0
    
    return {
      currentIL: Math.abs(currentIL),
      currentILPercent: currentIL,
      breakEvenPrice: {
        [position.assets[0].symbol]: position.assets[0].price * 0.95,
        [position.assets[1].symbol]: position.assets[1].price * 1.05
      },
      worstCaseIL: Math.abs(currentIL) * 2,
      timeWeightedIL: Math.abs(currentIL) * 0.8,
      ilHistory: [
        { timestamp: Date.now() - 86400000 * 7, il: 0 },
        { timestamp: Date.now() - 86400000 * 5, il: -0.8 },
        { timestamp: Date.now() - 86400000 * 3, il: -1.5 },
        { timestamp: Date.now() - 86400000 * 1, il: -2.1 },
        { timestamp: Date.now(), il: currentIL }
      ]
    }
  }

  // Generate liquidation alerts
  private async generateLiquidationAlerts(walletAddress: string, positions: DeFiPosition[]): Promise<void> {
    const alerts: LiquidationAlert[] = []
    
    for (const position of positions) {
      if (position.metrics.healthFactor && position.metrics.healthFactor < 2.0) {
        const alert: LiquidationAlert = {
          id: `alert_${position.id}_${Date.now()}`,
          positionId: position.id,
          severity: position.metrics.healthFactor < 1.2 ? 'critical' : 'warning',
          currentHealthFactor: position.metrics.healthFactor,
          liquidationThreshold: 1.0,
          priceDropRequired: ((position.metrics.healthFactor - 1.0) / position.metrics.healthFactor) * 100,
          recommendedActions: [
            'Add more collateral',
            'Repay some debt',
            'Close risky positions'
          ],
          createdAt: Date.now()
        }
        
        alerts.push(alert)
      }
    }
    
    this.liquidationAlerts.set(walletAddress.toLowerCase(), alerts)
  }

  // Generate yield optimization recommendations
  async generateYieldOptimizations(walletAddress: string): Promise<YieldOptimization[]> {
    const positions = this.positions.get(walletAddress.toLowerCase()) || []
    const optimizations: YieldOptimization[] = []
    
    for (const position of positions) {
      // Auto-compound optimization
      if (position.rewards.claimableRewards.length > 0 && position.rewards.totalClaimableUSD > 10) {
        optimizations.push({
          positionId: position.id,
          currentAPY: position.metrics.apy,
          optimizedAPY: position.metrics.apy * 1.15, // 15% boost from compounding
          potentialGain: position.rewards.totalClaimableUSD * 0.15,
          strategy: {
            type: 'compound',
            description: 'Auto-compound claimable rewards to maximize yield',
            expectedReturn: position.rewards.totalClaimableUSD * 0.15,
            riskLevel: RiskLevel.LOW,
            timeframe: 'Daily'
          },
          actions: [
            {
              type: 'claim',
              description: `Claim ${position.rewards.totalClaimableUSD.toFixed(2)} USD in rewards`,
              estimatedGas: 0.02,
              expectedReturn: position.rewards.totalClaimableUSD,
              urgency: 'medium'
            },
            {
              type: 'compound',
              description: 'Reinvest rewards into the same position',
              estimatedGas: 0.03,
              expectedReturn: position.rewards.totalClaimableUSD * 0.15,
              urgency: 'medium'
            }
          ],
          riskImpact: 0,
          confidence: 0.9
        })
      }
      
      // Migration optimization for low-yield positions
      if (position.metrics.apy < 5 && position.metrics.totalValue > 100) {
        optimizations.push({
          positionId: position.id,
          currentAPY: position.metrics.apy,
          optimizedAPY: position.metrics.apy * 2.5, // Potential 2.5x improvement
          potentialGain: position.metrics.totalValue * 0.15, // 15% annual gain
          strategy: {
            type: 'migrate',
            description: 'Migrate to higher-yield protocol',
            expectedReturn: position.metrics.totalValue * 0.15,
            riskLevel: RiskLevel.MEDIUM,
            timeframe: 'One-time'
          },
          actions: [
            {
              type: 'migrate',
              description: `Move ${position.metrics.totalValue.toFixed(2)} USD to higher-yield protocol`,
              estimatedGas: 0.05,
              expectedReturn: position.metrics.totalValue * 0.15,
              urgency: 'low'
            }
          ],
          riskImpact: 10,
          confidence: 0.7
        })
      }
    }
    
    return optimizations.sort((a, b) => b.potentialGain - a.potentialGain)
  }

  // Public methods
  getPositions(walletAddress: string): DeFiPosition[] {
    return this.positions.get(walletAddress.toLowerCase()) || []
  }

  getLiquidationAlerts(walletAddress: string): LiquidationAlert[] {
    return this.liquidationAlerts.get(walletAddress.toLowerCase()) || []
  }

  getPositionsByProtocol(walletAddress: string, protocol: DeFiProtocol): DeFiPosition[] {
    const positions = this.getPositions(walletAddress)
    return positions.filter(pos => pos.protocol === protocol)
  }

  getPositionsByType(walletAddress: string, type: PositionType): DeFiPosition[] {
    const positions = this.getPositions(walletAddress)
    return positions.filter(pos => pos.type === type)
  }

  getTotalValueLocked(walletAddress: string): number {
    const positions = this.getPositions(walletAddress)
    return positions.reduce((total, pos) => total + pos.metrics.totalValue, 0)
  }

  getTotalDailyYield(walletAddress: string): number {
    const positions = this.getPositions(walletAddress)
    return positions.reduce((total, pos) => total + pos.metrics.dailyYield, 0)
  }

  getAverageAPY(walletAddress: string): number {
    const positions = this.getPositions(walletAddress)
    if (positions.length === 0) return 0
    
    const weightedAPY = positions.reduce((sum, pos) => {
      const weight = pos.metrics.totalValue / this.getTotalValueLocked(walletAddress)
      return sum + (pos.metrics.apy * weight)
    }, 0)
    
    return weightedAPY
  }
}

interface ProtocolConfig {
  chainId: number
  [key: string]: any
}

// Global DeFi position tracker instance
export const defiPositionTracker = DeFiPositionTracker.getInstance()