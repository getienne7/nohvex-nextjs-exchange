// Temporary in-memory storage for demo purposes
// In production, this would be replaced with a real database

interface User {
  id: string
  email: string
  name?: string
  password: string
  createdAt: Date
}

interface Portfolio {
  id: string
  userId: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  totalValue: number
}

interface Transaction {
  id: string
  userId: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL'
  symbol: string
  amount: number
  price: number
  totalValue: number
  fee: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdAt: Date
}

// In-memory stores
const users: User[] = []
const portfolios: Portfolio[] = []
const transactions: Transaction[] = []

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const demoDb = {
  // User operations
  async createUser(email: string, password: string, name?: string): Promise<User> {
    const user: User = {
      id: generateId(),
      email,
      name,
      password,
      createdAt: new Date()
    }
    users.push(user)
    return user
  },

  async findUserByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null
  },

  async findUserById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null
  },

  // Portfolio operations
  async getPortfolio(userId: string): Promise<Portfolio[]> {
    return portfolios.filter(p => p.userId === userId)
  },

  async addToPortfolio(userId: string, symbol: string, name: string, amount: number, price: number): Promise<Portfolio> {
    const existing = portfolios.find(p => p.userId === userId && p.symbol === symbol)
    
    if (existing) {
      existing.amount += amount
      existing.averagePrice = ((existing.averagePrice * (existing.amount - amount)) + (price * amount)) / existing.amount
      existing.totalValue = existing.amount * price
      return existing
    } else {
      const portfolio: Portfolio = {
        id: generateId(),
        userId,
        symbol,
        name,
        amount,
        averagePrice: price,
        totalValue: amount * price
      }
      portfolios.push(portfolio)
      return portfolio
    }
  },

  // Transaction operations
  async getTransactions(userId: string): Promise<Transaction[]> {
    return transactions.filter(t => t.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  async createTransaction(
    userId: string,
    type: Transaction['type'],
    symbol: string,
    amount: number,
    price: number,
    fee = 0
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: generateId(),
      userId,
      type,
      symbol,
      amount,
      price,
      totalValue: amount * price,
      fee,
      status: 'COMPLETED',
      createdAt: new Date()
    }
    transactions.push(transaction)
    return transaction
  },

  // Utility for demo data
  async seedDemoData(userId: string) {
    // Add some demo portfolio data
    await this.addToPortfolio(userId, 'BTC', 'Bitcoin', 0.1, 45000)
    await this.addToPortfolio(userId, 'ETH', 'Ethereum', 2.5, 3000)
    await this.addToPortfolio(userId, 'BNB', 'Binance Coin', 10, 400)

    // Add some demo transactions
    await this.createTransaction(userId, 'BUY', 'BTC', 0.05, 44000)
    await this.createTransaction(userId, 'BUY', 'BTC', 0.05, 46000)
    await this.createTransaction(userId, 'BUY', 'ETH', 1.0, 2900)
    await this.createTransaction(userId, 'BUY', 'ETH', 1.5, 3100)
    await this.createTransaction(userId, 'BUY', 'BNB', 10, 400)
  }
}
