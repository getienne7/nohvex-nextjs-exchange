/**
 * NOHVEX API Documentation Generator
 * Comprehensive OpenAPI/Swagger documentation for all platform endpoints
 */

export interface APIEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary: string
  description: string
  tags: string[]
  parameters?: APIParameter[]
  requestBody?: APIRequestBody
  responses: Record<string, APIResponse>
  security?: string[]
  examples?: Record<string, any>
}

export interface APIParameter {
  name: string
  in: 'query' | 'path' | 'header'
  required: boolean
  schema: any
  description: string
  example?: any
}

export interface APIRequestBody {
  description: string
  required: boolean
  content: {
    'application/json': {
      schema: any
      examples?: Record<string, any>
    }
  }
}

export interface APIResponse {
  description: string
  content?: {
    'application/json': {
      schema: any
      examples?: Record<string, any>
    }
  }
  $ref?: string
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    description: string
    version: string
    contact: {
      name: string
      email: string
      url: string
    }
    license: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, Record<string, any>>
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
    examples: Record<string, any>
  }
  tags: Array<{
    name: string
    description: string
  }>
}

export class APIDocumentationGenerator {
  private endpoints: APIEndpoint[] = []
  private schemas: Record<string, any> = {}

  constructor() {
    this.initializeSchemas()
    this.initializeEndpoints()
  }

  /**
   * Generate complete OpenAPI specification
   */
  generateOpenAPISpec(): OpenAPISpec {
    return {
      openapi: '3.0.3',
      info: {
        title: 'NOHVEX DeFi Platform API',
        description: 'Comprehensive API for decentralized finance portfolio management, cross-chain operations, and institutional-grade features',
        version: '1.0.0',
        contact: {
          name: 'NOHVEX Support',
          email: 'api@nohvex.com',
          url: 'https://nohvex.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'https://api.nohvex.com/v1',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.nohvex.com/v1',
          description: 'Staging server'
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Development server'
        }
      ],
      paths: this.generatePaths(),
      components: {
        schemas: this.schemas,
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        },
        examples: this.generateExamples()
      },
      tags: [
        { name: 'Portfolio', description: 'Portfolio management and analytics' },
        { name: 'Cross-Chain', description: 'Cross-chain bridge and swap operations' },
        { name: 'Institutional', description: 'Institutional-grade portfolio features' },
        { name: 'Yield', description: 'Yield farming and optimization' },
        { name: 'Trading', description: 'Trading and order management' },
        { name: 'Analytics', description: 'Analytics and reporting' },
        { name: 'User', description: 'User management and authentication' },
        { name: 'Monitoring', description: 'System monitoring and health checks' }
      ]
    }
  }

  /**
   * Generate API paths from endpoints
   */
  private generatePaths(): Record<string, Record<string, any>> {
    const paths: Record<string, Record<string, any>> = {}

    this.endpoints.forEach(endpoint => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {}
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses,
        security: endpoint.security?.map(scheme => ({ [scheme]: [] }))
      }
    })

    return paths
  }

  /**
   * Initialize API schemas/models
   */
  private initializeSchemas(): void {
    this.schemas = {
      // Portfolio Schemas
      Portfolio: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique portfolio identifier' },
          userId: { type: 'string', description: 'Owner user ID' },
          name: { type: 'string', description: 'Portfolio name' },
          description: { type: 'string', description: 'Portfolio description' },
          totalValue: { type: 'number', description: 'Total portfolio value in USD' },
          totalInvested: { type: 'number', description: 'Total amount invested' },
          pnl: { type: 'number', description: 'Profit and loss' },
          pnlPercentage: { type: 'number', description: 'PnL percentage' },
          currency: { type: 'string', description: 'Base currency' },
          riskLevel: { 
            type: 'string', 
            enum: ['conservative', 'moderate', 'aggressive'],
            description: 'Risk tolerance level'
          },
          createdAt: { type: 'number', description: 'Creation timestamp' },
          updatedAt: { type: 'number', description: 'Last update timestamp' },
          assets: {
            type: 'array',
            items: { $ref: '#/components/schemas/Asset' },
            description: 'Portfolio assets'
          }
        },
        required: ['id', 'userId', 'name', 'totalValue', 'currency']
      },

      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Asset identifier' },
          symbol: { type: 'string', description: 'Asset symbol (e.g., BTC, ETH)' },
          name: { type: 'string', description: 'Asset full name' },
          type: { 
            type: 'string',
            enum: ['crypto', 'defi', 'nft', 'derivative'],
            description: 'Asset type'
          },
          allocation: { type: 'number', description: 'Current allocation percentage' },
          currentValue: { type: 'number', description: 'Current USD value' },
          invested: { type: 'number', description: 'Amount invested' },
          pnl: { type: 'number', description: 'Profit/loss' },
          pnlPercentage: { type: 'number', description: 'PnL percentage' },
          chain: { type: 'string', description: 'Blockchain network' },
          protocol: { type: 'string', description: 'DeFi protocol if applicable' },
          lastUpdated: { type: 'number', description: 'Last price update timestamp' }
        },
        required: ['id', 'symbol', 'name', 'type', 'allocation', 'currentValue']
      },

      // Cross-Chain Schemas
      CrossChainRoute: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Route identifier' },
          sourceChain: { type: 'string', description: 'Source blockchain' },
          targetChain: { type: 'string', description: 'Target blockchain' },
          sourceAsset: { type: 'string', description: 'Source asset symbol' },
          targetAsset: { type: 'string', description: 'Target asset symbol' },
          protocol: { type: 'string', description: 'Bridge protocol used' },
          estimatedTime: { type: 'number', description: 'Estimated completion time in seconds' },
          estimatedCost: { type: 'number', description: 'Estimated cost in USD' },
          estimatedOutput: { type: 'number', description: 'Expected output amount' },
          securityScore: { type: 'number', description: 'Security score (0-100)' },
          liquidityScore: { type: 'number', description: 'Liquidity score (0-100)' },
          steps: {
            type: 'array',
            items: { $ref: '#/components/schemas/RouteStep' },
            description: 'Route execution steps'
          }
        },
        required: ['id', 'sourceChain', 'targetChain', 'sourceAsset', 'targetAsset', 'protocol']
      },

      RouteStep: {
        type: 'object',
        properties: {
          stepNumber: { type: 'number', description: 'Step sequence number' },
          action: { type: 'string', description: 'Action type (bridge, swap, etc.)' },
          protocol: { type: 'string', description: 'Protocol used for this step' },
          estimatedTime: { type: 'number', description: 'Step estimated time' },
          estimatedCost: { type: 'number', description: 'Step estimated cost' }
        }
      },

      // Institutional Schemas
      InstitutionalPortfolio: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Portfolio identifier' },
          institutionId: { type: 'string', description: 'Institution identifier' },
          name: { type: 'string', description: 'Portfolio name' },
          description: { type: 'string', description: 'Portfolio description' },
          totalValue: { type: 'number', description: 'Total AUM in USD' },
          totalInvested: { type: 'number', description: 'Total invested amount' },
          pnl: { type: 'number', description: 'Total P&L' },
          pnlPercentage: { type: 'number', description: 'P&L percentage' },
          riskLevel: {
            type: 'string',
            enum: ['conservative', 'moderate', 'aggressive', 'high-risk'],
            description: 'Risk tolerance'
          },
          benchmark: { type: 'string', description: 'Benchmark index' },
          assets: {
            type: 'array',
            items: { $ref: '#/components/schemas/InstitutionalAsset' }
          },
          riskMetrics: { $ref: '#/components/schemas/RiskMetrics' },
          compliance: { $ref: '#/components/schemas/ComplianceStatus' }
        }
      },

      RiskMetrics: {
        type: 'object',
        properties: {
          var95: { type: 'number', description: 'Value at Risk 95%' },
          var99: { type: 'number', description: 'Value at Risk 99%' },
          cvar95: { type: 'number', description: 'Conditional VaR 95%' },
          beta: { type: 'number', description: 'Portfolio beta' },
          alpha: { type: 'number', description: 'Portfolio alpha' },
          sharpeRatio: { type: 'number', description: 'Sharpe ratio' },
          sortinoRatio: { type: 'number', description: 'Sortino ratio' },
          maxDrawdown: { type: 'number', description: 'Maximum drawdown' },
          volatility: { type: 'number', description: 'Portfolio volatility' }
        }
      },

      // DeFi Strategy Schemas
      DeFiStrategy: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Strategy identifier' },
          name: { type: 'string', description: 'Strategy name' },
          description: { type: 'string', description: 'Strategy description' },
          category: {
            type: 'string',
            enum: ['yield-farming', 'liquidity-mining', 'arbitrage', 'staking', 'lending'],
            description: 'Strategy category'
          },
          riskLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'very-high'],
            description: 'Risk level'
          },
          expectedApy: { type: 'number', description: 'Expected APY percentage' },
          minInvestment: { type: 'number', description: 'Minimum investment amount' },
          maxInvestment: { type: 'number', description: 'Maximum investment amount' },
          protocols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Supported protocols'
          },
          chains: {
            type: 'array',
            items: { type: 'string' },
            description: 'Supported blockchain networks'
          },
          tvl: { type: 'number', description: 'Total Value Locked' },
          performance: {
            type: 'object',
            properties: {
              apy7d: { type: 'number', description: '7-day APY' },
              apy30d: { type: 'number', description: '30-day APY' },
              maxDrawdown: { type: 'number', description: 'Maximum drawdown percentage' },
              sharpeRatio: { type: 'number', description: 'Sharpe ratio' },
              volatility: { type: 'number', description: 'Volatility percentage' }
            }
          },
          risks: {
            type: 'object',
            properties: {
              impermanentLoss: { type: 'number', description: 'Impermanent loss risk score' },
              smartContractRisk: { type: 'number', description: 'Smart contract risk score' },
              liquidityRisk: { type: 'number', description: 'Liquidity risk score' },
              protocolRisk: { type: 'number', description: 'Protocol risk score' }
            }
          }
        },
        required: ['id', 'name', 'category', 'riskLevel', 'expectedApy']
      },

      YieldOpportunity: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Opportunity identifier' },
          protocol: { type: 'string', description: 'DeFi protocol name' },
          chain: { type: 'string', description: 'Blockchain network' },
          apy: { type: 'number', description: 'Current APY percentage' },
          tvl: { type: 'number', description: 'Total Value Locked' },
          riskScore: { type: 'number', description: 'Risk score (0-100)' },
          assets: {
            type: 'array',
            items: { type: 'string' },
            description: 'Required assets'
          },
          minDeposit: { type: 'number', description: 'Minimum deposit amount' },
          lockupPeriod: { type: 'number', description: 'Lockup period in seconds' },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Available features (auto-compound, etc.)'
          },
          impermanentLossRisk: { type: 'number', description: 'IL risk percentage' }
        },
        required: ['id', 'protocol', 'chain', 'apy', 'riskScore']
      },

      WebSocketMessage: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['subscribe', 'unsubscribe', 'portfolio.update', 'price.change', 'alert'],
            description: 'Message type'
          },
          topics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Topics to subscribe/unsubscribe'
          },
          data: {
            type: 'object',
            description: 'Message payload'
          },
          timestamp: { type: 'number', description: 'Message timestamp' }
        },
        required: ['type']
      },

      AnalyticsMetric: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Metric name' },
          value: { type: 'number', description: 'Metric value' },
          unit: { type: 'string', description: 'Value unit' },
          change: { type: 'number', description: 'Change from previous period' },
          changePercentage: { type: 'number', description: 'Percentage change' },
          timestamp: { type: 'number', description: 'Metric timestamp' },
          category: { type: 'string', description: 'Metric category' }
        },
        required: ['name', 'value', 'timestamp']
      },

      ComplianceStatus: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['compliant', 'warning', 'violation'],
            description: 'Overall compliance status'
          },
          lastCheck: { type: 'number', description: 'Last compliance check timestamp' },
          violations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { type: 'string', description: 'Violated rule' },
                severity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'Violation severity'
                },
                description: { type: 'string', description: 'Violation description' },
                detectedAt: { type: 'number', description: 'Detection timestamp' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Compliance recommendations'
          }
        },
        required: ['status', 'lastCheck']
      },

      InstitutionalAsset: {
        type: 'object',
        allOf: [
          { $ref: '#/components/schemas/Asset' },
          {
            type: 'object',
            properties: {
              custodian: { type: 'string', description: 'Asset custodian' },
              complianceStatus: { $ref: '#/components/schemas/ComplianceStatus' },
              riskClassification: {
                type: 'string',
                enum: ['low-risk', 'medium-risk', 'high-risk', 'speculative'],
                description: 'Institutional risk classification'
              },
              regulatoryStatus: {
                type: 'string',
                enum: ['approved', 'restricted', 'prohibited'],
                description: 'Regulatory approval status'
              }
            }
          }
        ]
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: 'Response data' },
          message: { type: 'string', description: 'Success message' },
          timestamp: { type: 'number', description: 'Response timestamp' }
        },
        required: ['success']
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', description: 'Error message' },
          code: { type: 'string', description: 'Error code' },
          details: { type: 'object', description: 'Additional error details' },
          timestamp: { type: 'number', description: 'Error timestamp' }
        },
        required: ['success', 'error']
      },

      PaginationResponse: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Current page number' },
          limit: { type: 'number', description: 'Items per page' },
          total: { type: 'number', description: 'Total items' },
          totalPages: { type: 'number', description: 'Total pages' },
          hasNext: { type: 'boolean', description: 'Has next page' },
          hasPrev: { type: 'boolean', description: 'Has previous page' }
        }
      }
    }
  }

  /**
   * Initialize all API endpoints
   */
  private initializeEndpoints(): void {
    this.endpoints = [
      // Portfolio Management Endpoints
      {
        path: '/api/portfolio',
        method: 'GET',
        summary: 'Get user portfolios',
        description: 'Retrieve all portfolios for the authenticated user with optional filtering',
        tags: ['Portfolio'],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by user ID',
            example: 'user-123'
          },
          {
            name: 'riskLevel',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] },
            description: 'Filter by risk level'
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'number', default: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'number', default: 10 },
            description: 'Items per page'
          }
        ],
        responses: {
          '200': {
            description: 'Portfolios retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Portfolio' }
                        },
                        pagination: { $ref: '#/components/schemas/PaginationResponse' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      },

      {
        path: '/api/portfolio',
        method: 'POST',
        summary: 'Create new portfolio',
        description: 'Create a new portfolio for the authenticated user',
        tags: ['Portfolio'],
        requestBody: {
          description: 'Portfolio creation data',
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Portfolio name' },
                  description: { type: 'string', description: 'Portfolio description' },
                  currency: { type: 'string', default: 'USD' },
                  riskLevel: { 
                    type: 'string', 
                    enum: ['conservative', 'moderate', 'aggressive'],
                    default: 'moderate'
                  },
                  initialAssets: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Asset' },
                    description: 'Initial portfolio assets'
                  }
                },
                required: ['name']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Portfolio created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Portfolio' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      },

      // Cross-Chain Endpoints
      {
        path: '/api/cross-chain/routes',
        method: 'GET',
        summary: 'Find optimal cross-chain routes',
        description: 'Find and compare optimal routes for cross-chain asset transfers',
        tags: ['Cross-Chain'],
        parameters: [
          {
            name: 'sourceChain',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Source blockchain network',
            example: 'ethereum'
          },
          {
            name: 'targetChain',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Target blockchain network',
            example: 'polygon'
          },
          {
            name: 'sourceAsset',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Source asset symbol',
            example: 'USDC'
          },
          {
            name: 'targetAsset',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Target asset symbol',
            example: 'USDC'
          },
          {
            name: 'amount',
            in: 'query',
            required: true,
            schema: { type: 'number' },
            description: 'Amount to bridge',
            example: 1000
          },
          {
            name: 'prioritize',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['cost', 'time', 'security'] },
            description: 'Route optimization priority',
            example: 'cost'
          },
          {
            name: 'includeYield',
            in: 'query',
            required: false,
            schema: { type: 'boolean', default: false },
            description: 'Include yield opportunities in routing'
          }
        ],
        responses: {
          '200': {
            description: 'Routes found successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/CrossChainRoute' }
                        },
                        count: { type: 'number', description: 'Number of routes found' },
                        filters: { type: 'object', description: 'Applied filters' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad Request', $ref: '#/components/responses/BadRequest' },
          '500': { description: 'Internal Server Error', $ref: '#/components/responses/InternalError' }
        }
      },

      // Institutional Endpoints
      {
        path: '/api/institutional/portfolios',
        method: 'GET',
        summary: 'Get institutional portfolios',
        description: 'Retrieve institutional portfolios with analytics and compliance data',
        tags: ['Institutional'],
        parameters: [
          {
            name: 'institutionId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Institution identifier'
          },
          {
            name: 'includeRisk',
            in: 'query',
            required: false,
            schema: { type: 'boolean', default: true },
            description: 'Include risk metrics'
          },
          {
            name: 'includeCompliance',
            in: 'query',
            required: false,
            schema: { type: 'boolean', default: true },
            description: 'Include compliance status'
          }
        ],
        responses: {
          '200': {
            description: 'Institutional portfolios retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            portfolios: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/InstitutionalPortfolio' }
                            },
                            complianceDashboard: { type: 'object' },
                            summary: { type: 'object' }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad Request', $ref: '#/components/responses/BadRequest' },
          '401': { description: 'Unauthorized', $ref: '#/components/responses/Unauthorized' },
          '403': { description: 'Forbidden', $ref: '#/components/responses/Forbidden' },
          '500': { description: 'Internal Server Error', $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      },

      // Advanced DeFi Endpoints
      {
        path: '/api/defi/strategies',
        method: 'GET',
        summary: 'Get available DeFi strategies',
        description: 'Retrieve available DeFi strategies with filtering options',
        tags: ['DeFi'],
        parameters: [
          {
            name: 'riskLevel',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['low', 'medium', 'high', 'very-high'] },
            description: 'Filter by risk level'
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['yield-farming', 'liquidity-mining', 'staking', 'lending'] },
            description: 'Filter by strategy category'
          },
          {
            name: 'minApy',
            in: 'query',
            required: false,
            schema: { type: 'number' },
            description: 'Minimum APY percentage'
          },
          {
            name: 'chains',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Comma-separated list of supported chains'
          }
        ],
        responses: {
          '200': {
            description: 'DeFi strategies retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/DeFiStrategy' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      },

      // Yield Optimization Endpoints
      {
        path: '/api/yield-optimization/opportunities',
        method: 'GET',
        summary: 'Find yield farming opportunities',
        description: 'Discover yield farming opportunities across protocols and chains',
        tags: ['Yield'],
        parameters: [
          {
            name: 'minAPY',
            in: 'query',
            required: false,
            schema: { type: 'number', default: 5 },
            description: 'Minimum APY percentage'
          },
          {
            name: 'maxRisk',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
            description: 'Maximum risk level'
          },
          {
            name: 'amount',
            in: 'query',
            required: false,
            schema: { type: 'number', default: 1000 },
            description: 'Investment amount for opportunity sizing'
          },
          {
            name: 'chains',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Comma-separated list of chains'
          }
        ],
        responses: {
          '200': {
            description: 'Yield opportunities found successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/YieldOpportunity' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      },

      // WebSocket Endpoints
      {
        path: '/api/websocket',
        method: 'GET',
        summary: 'WebSocket connection endpoint',
        description: 'Establish WebSocket connection for real-time updates',
        tags: ['WebSocket'],
        parameters: [
          {
            name: 'topics',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Comma-separated list of topics to subscribe to'
          }
        ],
        responses: {
          '101': {
            description: 'WebSocket connection established'
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' }
        },
        security: ['BearerAuth']
      },

      // Analytics Endpoints
      {
        path: '/api/analytics',
        method: 'GET',
        summary: 'Get comprehensive analytics',
        description: 'Retrieve analytics data with filtering and aggregation options',
        tags: ['Analytics'],
        parameters: [
          {
            name: 'start',
            in: 'query',
            required: false,
            schema: { type: 'number' },
            description: 'Start timestamp for data range'
          },
          {
            name: 'end',
            in: 'query',
            required: false,
            schema: { type: 'number' },
            description: 'End timestamp for data range'
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            description: 'Analytics categories to include'
          },
          {
            name: 'userId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by specific user'
          }
        ],
        responses: {
          '200': {
            description: 'Analytics data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            metrics: { type: 'array', items: { type: 'object' } },
                            aggregations: { type: 'object' },
                            trends: { type: 'array', items: { type: 'object' } }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' }
        },
        security: ['BearerAuth']
      }
    ]
  }

  /**
   * Generate example responses
   */
  private generateExamples(): Record<string, any> {
    return {
      PortfolioExample: {
        summary: 'Example portfolio',
        value: {
          id: 'portfolio-123',
          userId: 'user-456',
          name: 'Diversified Crypto Portfolio',
          description: 'A balanced cryptocurrency portfolio',
          totalValue: 50000,
          totalInvested: 45000,
          pnl: 5000,
          pnlPercentage: 11.11,
          currency: 'USD',
          riskLevel: 'moderate',
          createdAt: 1703001600000,
          updatedAt: 1703088000000,
          assets: [
            {
              id: 'asset-1',
              symbol: 'BTC',
              name: 'Bitcoin',
              type: 'crypto',
              allocation: 40,
              currentValue: 20000,
              invested: 18000,
              pnl: 2000,
              pnlPercentage: 11.11,
              chain: 'bitcoin',
              lastUpdated: 1703088000000
            }
          ]
        }
      },

      CrossChainRouteExample: {
        summary: 'Example cross-chain route',
        value: {
          id: 'route-abc123',
          sourceChain: 'ethereum',
          targetChain: 'polygon',
          sourceAsset: 'USDC',
          targetAsset: 'USDC',
          protocol: 'Stargate',
          estimatedTime: 900,
          estimatedCost: 15.50,
          estimatedOutput: 984.50,
          securityScore: 95,
          liquidityScore: 88,
          steps: [
            {
              stepNumber: 1,
              action: 'bridge',
              protocol: 'Stargate',
              estimatedTime: 900,
              estimatedCost: 15.50
            }
          ]
        }
      },

      ErrorExample: {
        summary: 'Example error response',
        value: {
          success: false,
          error: 'Portfolio not found',
          code: 'PORTFOLIO_NOT_FOUND',
          timestamp: 1703088000000
        }
      }
    }
  }

  /**
   * Export OpenAPI specification as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.generateOpenAPISpec(), null, 2)
  }

  /**
   * Export OpenAPI specification as YAML
   */
  exportAsYAML(): string {
    // Simple JSON to YAML conversion (for basic use)
    const spec = this.generateOpenAPISpec()
    return this.jsonToYaml(spec)
  }

  private jsonToYaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent)
    let yaml = ''

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue
      
      yaml += `${spaces}${key}:`
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += '\n' + this.jsonToYaml(value, indent + 1)
      } else if (Array.isArray(value)) {
        yaml += '\n'
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${this.jsonToYaml(item, indent + 2)}`
          } else {
            yaml += `${spaces}  - ${item}\n`
          }
        })
      } else {
        yaml += ` ${typeof value === 'string' ? `"${value}"` : value}\n`
      }
    }

    return yaml
  }
}

// Singleton instance
export const apiDocGenerator = new APIDocumentationGenerator()