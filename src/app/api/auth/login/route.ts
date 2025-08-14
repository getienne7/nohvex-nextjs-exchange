import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbService } from '@/lib/db-service'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔐 Custom Login API - Processing login for:', email)
    
    // Look up user in actual database
    const user = await dbService.findUserByEmail(email)
    console.log('👤 User lookup result:', { found: !!user })
    
    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.password) {
      console.log('❌ User has no password set')
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('🔐 Verifying password...')
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔐 Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    console.log('✅ Password verification successful')

    // Check if user has 2FA enabled (DB-backed)
    const requires2FA = !!(user.twoFAEnabled && user.twoFASecret)

    return NextResponse.json({
      success: true,
      requires2FA,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
