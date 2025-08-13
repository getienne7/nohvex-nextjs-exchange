import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db-service'
import { emailService } from '@/lib/email-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await dbService.findUserByEmail(email)
    
    if (!user) {
      // For security, we always return success even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Save reset token to database
    const updatedUser = await dbService.updateUser(user.id, {
      resetToken,
      resetExpires
    })

    if (!updatedUser) {
      console.error('Failed to save reset token for user:', user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to process password reset request' },
        { status: 500 }
      )
    }

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      email
    )

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email)
      // Don't reveal that email sending failed for security reasons
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
