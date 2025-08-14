import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password required'
      }, { status: 400 })
    }

    console.log('🔍 Debug Auth - Starting authentication test')
    console.log(`Email: ${email}`)
    
    // Test database connection
    const connectionTest = await dbService.testConnection()
    console.log('Database connection:', connectionTest)

    // Find user
    const user = await dbService.findUserByEmail(email)
    console.log('User lookup result:', {
      found: !!user,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length,
      lastUpdated: user?.updatedAt,
      resetToken: user?.resetToken ? 'present' : 'none'
    })

    if (!user) {
      return NextResponse.json({
        debug: true,
        step: 'user_lookup',
        success: false,
        message: 'User not found',
        connectionStatus: connectionTest
      })
    }

    if (!user.password) {
      return NextResponse.json({
        debug: true,
        step: 'password_check',
        success: false,
        message: 'User has no password set',
        user: {
          id: user.id,
          email: user.email,
          updatedAt: user.updatedAt
        }
      })
    }

    // Test password comparison
    console.log('Testing password comparison...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log(`Password comparison result: ${isPasswordValid}`)

    // Additional password hash analysis
    const hashInfo = {
      starts_with: user.password.substring(0, 7),
      length: user.password.length,
      is_bcrypt: user.password.startsWith('$2b$')
    }
    console.log('Password hash info:', hashInfo)

    return NextResponse.json({
      debug: true,
      step: 'password_comparison',
      success: isPasswordValid,
      message: isPasswordValid ? 'Password matches!' : 'Password does not match',
      connectionStatus: connectionTest,
      user: {
        id: user.id,
        email: user.email,
        updatedAt: user.updatedAt,
        hasResetToken: !!user.resetToken
      },
      hashInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      debug: true,
      step: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
