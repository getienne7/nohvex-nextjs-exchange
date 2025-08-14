import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'

export async function GET(request: NextRequest) {
  try {
    // Get detailed connection status
    const connectionStatus = await dbService.testConnection()
    
    // Database health information
    const healthInfo = {
      timestamp: new Date().toISOString(),
      database: {
        connected: connectionStatus.connected,
        storage: connectionStatus.storage,
        url: process.env.DATABASE_URL ? 'configured' : 'not configured',
        error: connectionStatus.error || null
      },
      prisma: {
        version: '6.14.0',
        generated: true
      }
    }
    
    let userInfo = []
    
    if (connectionStatus.connected) {
      // Database is connected - return summary info only for security
      userInfo = [{
        info: '🗄️ Database connected - user details protected',
        note: 'User accounts are persisted in PostgreSQL database',
        status: 'Users will be permanently stored'
      }]
    } else {
      // Using memory storage - show current in-memory users for debugging
      const memoryStore = (dbService as unknown as { memoryStore?: { users: Arrayc{ id: string; email: string; name?: string; createdAt: string | Date }e } }).memoryStore || { users: [] }
      
      if (memoryStore.users.length === 0) {
        userInfo = [{
          info: '💾 Using in-memory storage (temporary)',
          note: 'No users currently in memory',
          instruction: 'Create an account to see it appear here temporarily'
        }]
      } else {
        userInfo = memoryStore.users.map((user: { id: string; email: string; name?: string; createdAt: string | Date }) =e ({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          storage: 'memory (temporary)'
        }))
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      health: healthInfo,
      users: userInfo,
      message: connectionStatus.connected 
        ? '✅ Database connected - accounts will be permanently stored' 
        : '⚠️ Using temporary storage - database connection needed for persistence'
    })
  } catch (error) {
    console.error('Error in database health check:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Database health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
