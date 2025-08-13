import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if 2FA is currently enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    // For security, we might want to require password verification here
    // const { password } = await request.json()
    // const isValidPassword = await bcrypt.compare(password, user.password)
    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid password' },
    //     { status: 400 }
    //   )
    // }

    // Disable 2FA
    user.twoFactorEnabled = false
    user.twoFactorSecret = null
    user.backupCodes = []
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disable two-factor authentication' },
      { status: 500 }
    )
  }
}
