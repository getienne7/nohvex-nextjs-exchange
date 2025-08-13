export interface EmailConfig {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from?: string
}

export class EmailService {
  private config: EmailConfig
  
  constructor(config?: EmailConfig) {
    // For now, we'll use environment variables for email configuration
    // In production, you would use a service like SendGrid, Mailgun, etc.
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      ...config
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userEmail: string): Promise<boolean> {
    try {
      // In development/demo mode, we'll log the reset link instead of sending emails
      if (!this.config.user || !this.config.pass) {
        console.log('📧 Password Reset Email (Development Mode)')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`To: ${to}`)
        console.log(`Reset Link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        return true
      }

      // In production, you would implement actual email sending here
      // For now, we'll simulate successful email sending
      console.log(`Password reset email would be sent to ${to} with token ${resetToken}`)
      return true
      
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }

  async sendPasswordChangeConfirmation(to: string, userEmail: string): Promise<boolean> {
    try {
      // In development/demo mode, we'll log the confirmation
      if (!this.config.user || !this.config.pass) {
        console.log('📧 Password Changed Confirmation (Development Mode)')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`To: ${to}`)
        console.log('Message: Your password has been successfully changed.')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        return true
      }

      // In production, you would implement actual email sending here
      console.log(`Password change confirmation would be sent to ${to}`)
      return true
      
    } catch (error) {
      console.error('Failed to send password change confirmation:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
