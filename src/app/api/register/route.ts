import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { demoDb } from '@/lib/demo-db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // Check if user already exists
    const existingUser = await demoDb.findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await demoDb.createUser(email, hashedPassword, name)

    // Seed demo data for the new user
    await demoDb.seedDemoData(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
