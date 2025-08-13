import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Global Prisma instance to avoid connection issues in serverless
declare global {
  var prisma: PrismaClient | undefined
}

// Database connection with fallback
let prisma: PrismaClient | null = null
let isDbConnected = false

// In-memory fallback storage
const memoryStore = {
  users: [] as any[],
  portfolios: [] as any[],
  transactions: [] as any[],
  nextId: 1
}

// Initialize database connection
try {
  if (process.env.DATABASE_URL) {
    prisma = globalThis.prisma ?? new PrismaClient()
    if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
    isDbConnected = true
    console.log('✓ Database connection initialized')
  } else {
    console.log('⚠ No DATABASE_URL found, using in-memory storage')
    isDbConnected = false
  }
} catch (error) {
  console.warn('⚠ Database connection failed, falling back to in-memory storage:', error)
  isDbConnected = false
}

export class DatabaseService {
  private prisma: PrismaClient | null
  private isConnected: boolean

  constructor() {
    this.prisma = prisma
    this.isConnected = isDbConnected
  }

  // Connection status check
  async testConnection() {
    if (!this.isConnected || !this.prisma) {
      return { connected: false, storage: 'memory' }
    }
    
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { connected: true, storage: 'database' }
    } catch (error) {
      console.warn('Database connection test failed:', error)
      this.isConnected = false
      return { connected: false, storage: 'memory', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async findUserByEmail(email: string) {
    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      const user = memoryStore.users.find(u => u.email === email)
      return user || null
    }

    try {
      return await this.prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      console.error('Error finding user by email, falling back to memory:', error)
      this.isConnected = false
      const user = memoryStore.users.find(u => u.email === email)
      return user || null
    }
  }

  async createUser(email: string, hashedPassword: string, name?: string) {
    const userId = `user_${memoryStore.nextId++}`
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || null,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      memoryStore.users.push(user)
      await this.seedDemoDataMemory(userId)
      console.log('✓ User created in memory storage')
      return user
    }

    try {
      const dbUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null
        }
      })
      
      // Seed demo data for new user
      await this.seedDemoData(dbUser.id)
      console.log('✓ User created in database')
      return dbUser
    } catch (error) {
      console.error('Error creating user in database, falling back to memory:', error)
      this.isConnected = false
      memoryStore.users.push(user)
      await this.seedDemoDataMemory(userId)
      console.log('✓ User created in memory storage (fallback)')
      return user
    }
  }

  async seedDemoData(userId: string) {
    if (!this.isConnected || !this.prisma) {
      return this.seedDemoDataMemory(userId)
    }

    try {
      // Create demo portfolio entries
      const demoPortfolio = [
        { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, averagePrice: 45000 },
        { symbol: 'ETH', name: 'Ethereum', amount: 2.0, averagePrice: 3200 },
        { symbol: 'BNB', name: 'Binance Coin', amount: 10, averagePrice: 400 },
      ]

      for (const item of demoPortfolio) {
        await this.prisma.portfolio.create({
          data: {
            userId,
            symbol: item.symbol,
            name: item.name,
            amount: item.amount,
            averagePrice: item.averagePrice,
            totalValue: item.amount * item.averagePrice
          }
        })
      }

      // Create demo transactions
      const demoTransactions = [
        {
          type: 'BUY' as const,
          symbol: 'BTC',
          amount: 0.5,
          price: 45000,
          totalValue: 22500
        },
        {
          type: 'BUY' as const,
          symbol: 'ETH',
          amount: 2.0,
          price: 3200,
          totalValue: 6400
        }
      ]

      for (const transaction of demoTransactions) {
        await this.prisma.transaction.create({
          data: {
            userId,
            type: transaction.type,
            symbol: transaction.symbol,
            amount: transaction.amount,
            price: transaction.price,
            totalValue: transaction.totalValue,
            status: 'COMPLETED'
          }
        })
      }
    } catch (error) {
      console.error('Error seeding demo data, falling back to memory:', error)
      this.isConnected = false
      return this.seedDemoDataMemory(userId)
    }
  }

  async seedDemoDataMemory(userId: string) {
    // Create demo portfolio entries in memory
    const demoPortfolio = [
      { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, averagePrice: 45000 },
      { symbol: 'ETH', name: 'Ethereum', amount: 2.0, averagePrice: 3200 },
      { symbol: 'BNB', name: 'Binance Coin', amount: 10, averagePrice: 400 },
    ]

    for (const item of demoPortfolio) {
      memoryStore.portfolios.push({
        id: `portfolio_${memoryStore.nextId++}`,
        userId,
        symbol: item.symbol,
        name: item.name,
        amount: item.amount,
        averagePrice: item.averagePrice,
        totalValue: item.amount * item.averagePrice,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Create demo transactions in memory
    const demoTransactions = [
      { type: 'BUY', symbol: 'BTC', amount: 0.5, price: 45000, totalValue: 22500 },
      { type: 'BUY', symbol: 'ETH', amount: 2.0, price: 3200, totalValue: 6400 }
    ]

    for (const transaction of demoTransactions) {
      memoryStore.transactions.push({
        id: `transaction_${memoryStore.nextId++}`,
        userId,
        type: transaction.type,
        symbol: transaction.symbol,
        amount: transaction.amount,
        price: transaction.price,
        totalValue: transaction.totalValue,
        fee: 0,
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  async getPortfolio(userId: string) {
    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      return memoryStore.portfolios
        .filter(p => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    try {
      return await this.prisma.portfolio.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching portfolio, falling back to memory:', error)
      this.isConnected = false
      return memoryStore.portfolios
        .filter(p => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  async addToPortfolio(userId: string, symbol: string, name: string, amount: number, price: number) {
    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      const existingAsset = memoryStore.portfolios.find(p => p.userId === userId && p.symbol === symbol)
      
      if (existingAsset) {
        const newAmount = existingAsset.amount + amount
        const newAveragePrice = ((existingAsset.amount * existingAsset.averagePrice) + (amount * price)) / newAmount
        existingAsset.amount = newAmount
        existingAsset.averagePrice = newAveragePrice
        existingAsset.totalValue = newAmount * newAveragePrice
        existingAsset.updatedAt = new Date()
        return existingAsset
      } else {
        const newAsset = {
          id: `portfolio_${memoryStore.nextId++}`,
          userId,
          symbol,
          name,
          amount,
          averagePrice: price,
          totalValue: amount * price,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        memoryStore.portfolios.push(newAsset)
        return newAsset
      }
    }

    try {
      // Check if user already has this asset
      const existingAsset = await this.prisma.portfolio.findUnique({
        where: {
          userId_symbol: {
            userId,
            symbol
          }
        }
      })

      if (existingAsset) {
        // Update existing asset
        const newAmount = existingAsset.amount + amount
        const newAveragePrice = ((existingAsset.amount * existingAsset.averagePrice) + (amount * price)) / newAmount
        
        return await this.prisma.portfolio.update({
          where: {
            userId_symbol: {
              userId,
              symbol
            }
          },
          data: {
            amount: newAmount,
            averagePrice: newAveragePrice,
            totalValue: newAmount * newAveragePrice
          }
        })
      } else {
        // Create new asset
        return await this.prisma.portfolio.create({
          data: {
            userId,
            symbol,
            name,
            amount,
            averagePrice: price,
            totalValue: amount * price
          }
        })
      }
    } catch (error) {
      console.error('Error adding to portfolio, falling back to memory:', error)
      this.isConnected = false
      return this.addToPortfolio(userId, symbol, name, amount, price)
    }
  }

  async getTransactions(userId: string) {
    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      return memoryStore.transactions
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50)
    }

    try {
      return await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50 transactions
      })
    } catch (error) {
      console.error('Error fetching transactions, falling back to memory:', error)
      this.isConnected = false
      return memoryStore.transactions
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50)
    }
  }

  async createTransaction(
    userId: string,
    type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL',
    symbol: string,
    amount: number,
    price: number,
    fee = 0
  ) {
    const transaction = {
      id: `transaction_${memoryStore.nextId++}`,
      userId,
      type,
      symbol,
      amount,
      price,
      totalValue: amount * price,
      fee,
      status: 'COMPLETED' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      memoryStore.transactions.push(transaction)
      return transaction
    }

    try {
      return await this.prisma.transaction.create({
        data: {
          userId,
          type,
          symbol,
          amount,
          price,
          totalValue: amount * price,
          fee,
          status: 'COMPLETED'
        }
      })
    } catch (error) {
      console.error('Error creating transaction, falling back to memory:', error)
      this.isConnected = false
      memoryStore.transactions.push(transaction)
      return transaction
    }
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

export const dbService = new DatabaseService()
