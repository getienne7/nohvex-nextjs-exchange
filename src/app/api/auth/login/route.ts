import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { twoFactorStore } from '../2fa/setup/route'

// Mock user database for demo (replace with real database)
const mockUsers = new Map([
  ['user@example.com', {
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
  }]
])

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists (replace with real database lookup)
    const user = mockUsers.get(email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user has 2FA enabled
    const user2FA = twoFactorStore.get(email)
    const requires2FA = user2FA?.isEnabled || false

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
