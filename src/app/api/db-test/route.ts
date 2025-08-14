import { NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'

export async function GET() {
  try {
    // Test database connection
    const connectionTest = await dbService.testConnection()
    
    return NextResponse.json({
      success: connectionTest.connected,
      storage: connectionTest.storage,
      message: connectionTest.connected 
        ? 'Database connection successful' 
        : 'Using fallback memory storage',
      timestamp: new Date().toISOString(),
      ...(connectionTest.error && { error: connectionTest.error })
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false,
        storage: 'memory',
        error: 'Database test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
