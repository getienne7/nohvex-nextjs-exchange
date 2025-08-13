import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'

export async function GET(request: NextRequest) {
  try {
    // Get connection status
    const connectionStatus = await dbService.testConnection()
    
    // This is a debug endpoint - in production you'd want authentication
    // For now, let's just return basic info
    
    let users = []
    
    if (connectionStatus.connected) {
      // If database is connected, we'd query actual users
      // For security, we'll just return count and connection status
      users = [{
        info: 'Database connected - user details hidden for security',
        count: 'Query database for actual count'
      }]
    } else {
      // If using memory storage, we can show the test data
      // Access the memory store (this is just for debugging)
      const memoryStore = (dbService as any).memoryStore || { users: [] }
      users = memoryStore.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }))
    }
    
    return NextResponse.json({
      connectionStatus,
      users,
      message: connectionStatus.connected 
        ? 'Connected to database' 
        : 'Using in-memory storage - create an account to see it here'
    })
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
