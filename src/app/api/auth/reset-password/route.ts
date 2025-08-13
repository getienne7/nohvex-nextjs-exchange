import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'
import { emailService } from '@/lib/email-service'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Token, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Find user by email and reset token
    const user = await dbService.findUserByEmail(email)
    
    if (!user || !user.resetToken || !user.resetExpires) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token matches
    if (user.resetToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > user.resetExpires) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    const updatedUser = await dbService.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetExpires: null
    })

    if (!updatedUser) {
      console.error('Failed to update password for user:', user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    // Send password change confirmation email
    await emailService.sendPasswordChangeConfirmation(email, email)

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset. You can now sign in with your new password.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also add a GET endpoint to verify reset token validity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { success: false, error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await dbService.findUserByEmail(email)
    
    if (!user || !user.resetToken || !user.resetExpires) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token matches
    if (user.resetToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > user.resetExpires) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reset token is valid'
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
