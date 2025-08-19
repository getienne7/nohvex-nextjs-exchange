import { PrismaClient } from '@prisma/client'

// Global Prisma instance to avoid connection issues in serverless
declare global {
  var prisma: PrismaClient | undefined
}

// Database connection with fallback
let prisma: PrismaClient | null = null
let isDbConnected = false

// In-memory fallback storage
type MemoryUser = {
  id: string
  email: string
  password: string
  name: string | null
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  // 2FA fields
  twoFAEnabled?: boolean
  twoFASecret?: string | null
  twoFABackupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }>
  twoFAEnabledAt?: Date | null
  twoFALastUsed?: Date | null
}

type MemoryPortfolio = {
  id: string
  userId: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  totalValue: number
  createdAt: Date
  updatedAt: Date
}

type MemoryTransaction = {
  id: string
  userId: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL'
  symbol: string
  amount: number
  price: number
  totalValue: number
  fee: number
  status: 'COMPLETED'
  createdAt: Date
  updatedAt: Date
}

const memoryStore = {
  users: [] as MemoryUser[],
  portfolios: [] as MemoryPortfolio[],
  transactions: [] as MemoryTransaction[],
  nextId: 1
}

// Pre-seed demo user for development
async function initializeDemoUser() {
  if (memoryStore.users.length === 0 && !process.env.DATABASE_URL) {
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    const demoUser: MemoryUser = {
      id: 'user_demo',
      email: 'gletienne@outlook.com',
      password: hashedPassword,
      name: 'Demo User',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFAEnabled: false,
      twoFASecret: null,
      twoFABackupCodes: [],
      twoFAEnabledAt: null,
      twoFALastUsed: null
    }
    
    memoryStore.users.push(demoUser)
    console.log('✓ Demo user pre-seeded: gletienne@outlook.com / demo123')
  }
}

// Initialize demo user
if (typeof window === 'undefined') {
  initializeDemoUser().catch(console.error)
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
      { type: 'BUY' as const, symbol: 'BTC', amount: 0.5, price: 45000, totalValue: 22500 },
      { type: 'BUY' as const, symbol: 'ETH', amount: 2.0, price: 3200, totalValue: 6400 }
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

  async addToPortfolio(userId: string, symbol: string, name: string, amount: number, price: number): Promise<MemoryPortfolio> {
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

  async updateUser(userId: string, data: {
    password?: string
    resetToken?: string | null
    resetExpires?: Date | null
    name?: string
    emailVerified?: Date | null
    // 2FA fields
    twoFAEnabled?: boolean
    twoFASecret?: string | null
    twoFABackupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }>
    twoFAEnabledAt?: Date | null
    twoFALastUsed?: Date | null
  }) {
    if (!this.isConnected || !this.prisma) {
      // Fallback to in-memory storage
      const userIndex = memoryStore.users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return null
      }
      
      const user = memoryStore.users[userIndex]
      memoryStore.users[userIndex] = {
        ...user,
        ...data,
        updatedAt: new Date()
      }
      return memoryStore.users[userIndex]
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating user, falling back to memory:', error)
      this.isConnected = false
      
      // Fallback to memory update
      const userIndex = memoryStore.users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return null
      }
      
      const user = memoryStore.users[userIndex]
      memoryStore.users[userIndex] = {
        ...user,
        ...data,
        updatedAt: new Date()
      }
      return memoryStore.users[userIndex]
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
    await this.prisma?.$disconnect()
  }

  // Convenience helpers for 2FA
  async set2FA(userId: string, data: {
    enabled: boolean
    secret?: string | null
    backupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }>
    enabledAt?: Date | null
    lastUsed?: Date | null
  }) {
    return this.updateUser(userId, {
      twoFAEnabled: data.enabled,
      twoFASecret: data.secret ?? null,
      twoFABackupCodes: data.backupCodes,
      twoFAEnabledAt: data.enabledAt ?? (data.enabled ? new Date() : null),
      twoFALastUsed: data.lastUsed ?? null
    })
  }

  async markBackupCodeUsed(userId: string, code: string) {
    const user = await (this.isConnected && this.prisma
      ? this.prisma.user.findUnique({ where: { id: userId } })
      : Promise.resolve(memoryStore.users.find(u => u.id === userId)))

    if (!user) return null

    const codes = (user as unknown as { twoFABackupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }> }).twoFABackupCodes ?? null
    if (!codes) return null

    const updated = codes.map(c => c.code === code ? { ...c, used: true, usedAt: new Date() } : c)

    return this.updateUser(userId, {
      twoFABackupCodes: updated,
      twoFALastUsed: new Date()
    })
  }
}

export const dbService = new DatabaseService()
