export interface EmailConfig {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from?: string
  // AWS SES specific
  awsRegion?: string
  awsAccessKeyId?: string
  awsSecretAccessKey?: string
}

export class EmailService {
  private config: EmailConfig
  
  constructor(config?: EmailConfig) {
    // Support both SMTP and AWS SES configuration
    this.config = {
      // SMTP Configuration (traditional)
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      
      // AWS SES Configuration
      awsRegion: process.env.AWS_SES_REGION || process.env.AWS_REGION,
      awsAccessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
      
      ...config
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userEmail: string): Promise<boolean> {
    try {
      // Check if AWS SES is configured
      if (this.config.awsRegion && this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
        return await this.sendSESEmail(
          to,
          'Reset Your NOHVEX Password',
          this.generatePasswordResetEmailHTML(resetToken, userEmail),
          this.generatePasswordResetEmailText(resetToken, userEmail)
        )
      }
      
      // Check if SMTP is configured
      if (this.config.host && this.config.user && this.config.pass) {
        return await this.sendSMTPEmail(
          to,
          'Reset Your NOHVEX Password',
          this.generatePasswordResetEmailHTML(resetToken, userEmail),
          this.generatePasswordResetEmailText(resetToken, userEmail)
        )
      }
      
      // Development/demo mode - log the reset link instead of sending emails
      console.log('📧 Password Reset Email (Development Mode)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${to}`)
      console.log(`Reset Link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return true
      
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }

  async sendPasswordChangeConfirmation(to: string, userEmail: string): Promise<boolean> {
    try {
      // Check if AWS SES is configured
      if (this.config.awsRegion && this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
        return await this.sendSESEmail(
          to,
          'NOHVEX Password Changed Successfully',
          this.generatePasswordChangeEmailHTML(userEmail),
          this.generatePasswordChangeEmailText(userEmail)
        )
      }
      
      // Check if SMTP is configured
      if (this.config.host && this.config.user && this.config.pass) {
        return await this.sendSMTPEmail(
          to,
          'NOHVEX Password Changed Successfully',
          this.generatePasswordChangeEmailHTML(userEmail),
          this.generatePasswordChangeEmailText(userEmail)
        )
      }
      
      // Development/demo mode - log the confirmation
      console.log('📧 Password Changed Confirmation (Development Mode)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${to}`)
      console.log('Message: Your password has been successfully changed.')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return true
      
    } catch (error) {
      console.error('Failed to send password change confirmation:', error)
      return false
    }
  }

  // AWS SES Email Sending Method
  private async sendSESEmail(to: string, subject: string, htmlBody: string, textBody: string): Promise<boolean> {
    try {
      // Dynamic import to avoid issues during build
      const { SESv2Client, SendEmailCommand } = await import('@aws-sdk/client-sesv2')
      
      // Create SES client with credentials
      const sesClient = new SESv2Client({
        region: this.config.awsRegion,
        credentials: {
          accessKeyId: this.config.awsAccessKeyId!,
          secretAccessKey: this.config.awsSecretAccessKey!
        }
      })

      const emailCommand = new SendEmailCommand({
        FromEmailAddress: this.config.from || 'getienne@nohvech.com',
        Destination: {
          ToAddresses: [to]
        },
        Content: {
          Simple: {
            Subject: {
              Data: subject,
              Charset: 'UTF-8'
            },
            Body: {
              Html: {
                Data: htmlBody,
                Charset: 'UTF-8'
              },
              Text: {
                Data: textBody,
                Charset: 'UTF-8'
              }
            }
          }
        }
      })

      // Send email via AWS SES
      const result = await sesClient.send(emailCommand)
      
      console.log('📧 AWS SES Email Sent Successfully!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Message ID: ${result.MessageId}`)
      console.log(`Region: ${this.config.awsRegion}`)
      console.log('✅ Email sent via AWS SES successfully')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return true
    } catch (error) {
      console.error('AWS SES sending failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        region: this.config.awsRegion,
        from: this.config.from
      })
      return false
    }
  }

  // SMTP Email Sending Method (fallback)
  private async sendSMTPEmail(to: string, subject: string, _htmlBody: string, _textBody: string): Promise<boolean> {
    void _htmlBody; void _textBody;
    try {
      console.log('📧 SMTP Email (Ready to Send)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Host: ${this.config.host}:${this.config.port}`)
      console.log('✅ Would send via SMTP with provided credentials')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // TODO: Implement actual SMTP sending with nodemailer
      return true
    } catch (error) {
      console.error('SMTP sending failed:', error)
      return false
    }
  }

  // Email Template Generators
  private generatePasswordResetEmailHTML(resetToken: string, userEmail: string): string {
    // Get the base URL, ensuring we use the production URL for emails
    const baseUrl = process.env.NEXTAUTH_URL?.trim() && process.env.NEXTAUTH_URL !== '' 
      ? process.env.NEXTAUTH_URL.replace(/\/$/, '') // Remove trailing slash
      : 'https://nohvex-nextjs-exchange.vercel.app'
    
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your NOHVEX Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">NOHVEX Exchange</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-top: 0;">Reset Your Password</h2>
            <p>You requested a password reset for your NOHVEX Exchange account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 15 minutes for security reasons.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">NOHVEX Exchange - Secure Cryptocurrency Trading Platform</p>
          </div>
        </body>
      </html>
    `
  }

  private generatePasswordResetEmailText(resetToken: string, userEmail: string): string {
    // Get the base URL, ensuring we use the production URL for emails
    const baseUrl = process.env.NEXTAUTH_URL?.trim() && process.env.NEXTAUTH_URL !== '' 
      ? process.env.NEXTAUTH_URL.replace(/\/$/, '') // Remove trailing slash
      : 'https://nohvex-nextjs-exchange.vercel.app'
    
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`
    
    return `
      NOHVEX Exchange - Password Reset Request
      
      You requested a password reset for your NOHVEX Exchange account.
      
      To reset your password, please click the following link:
      ${resetLink}
      
      This link will expire in 15 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      ---
      NOHVEX Exchange - Secure Cryptocurrency Trading Platform
    `
  }

  private generatePasswordChangeEmailHTML(_userEmail: string): string {
    void _userEmail;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Changed Successfully</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">NOHVEX Exchange</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">Password Changed Successfully</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-top: 0;">✅ Password Updated</h2>
            <p>Your NOHVEX Exchange account password has been successfully changed.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
            
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;"><strong>Security Tip:</strong> Always use a strong, unique password for your crypto exchange account.</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">NOHVEX Exchange - Secure Cryptocurrency Trading Platform</p>
          </div>
        </body>
      </html>
    `
  }

  private generatePasswordChangeEmailText(_userEmail: string): string {
    void _userEmail;
    return `
      NOHVEX Exchange - Password Changed Successfully
      
      Your NOHVEX Exchange account password has been successfully changed.
      
      If you didn't make this change, please contact support immediately.
      
      Security Tip: Always use a strong, unique password for your crypto exchange account.
      
      ---
      NOHVEX Exchange - Secure Cryptocurrency Trading Platform
    `
  }
  // Alert triggered emails
  async sendAlertTriggered(to: string, symbol: string, operator: 'GT' | 'LT', threshold: number, price: number): Promise<boolean> {
    try {
      const subject = `Price Alert: ${symbol} ${operator} ${threshold} hit (now ${price})`
      const html = this.generateAlertEmailHTML(symbol, operator, threshold, price)
      const text = this.generateAlertEmailText(symbol, operator, threshold, price)

      if (this.config.awsRegion && this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
        return await this.sendSESEmail(to, subject, html, text)
      }
      if (this.config.host && this.config.user && this.config.pass) {
        return await this.sendSMTPEmail(to, subject, html, text)
      }
      console.log('📧 Alert Email (Development Mode)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Message: ${symbol} ${operator} ${threshold} hit. Current price: ${price}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return true
    } catch (e) {
      console.error('Failed to send alert email:', e)
      return false
    }
  }

  private generateAlertEmailHTML(symbol: string, operator: 'GT'|'LT', threshold: number, price: number): string {
    const opText = operator === 'GT' ? '>' : '<'
    const ts = new Date().toUTCString()
    const baseUrl = (process.env.NEXTAUTH_URL?.trim() && process.env.NEXTAUTH_URL !== '')
      ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
      : 'https://nohvex-nextjs-exchange.vercel.app'
    const viewLink = `${baseUrl}/settings?tab=alerts&symbol=${encodeURIComponent(symbol)}`
    const num = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(n)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>NOHVEX Price Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">NOHVEX Exchange</h1>
            <p style="color: #dbeafe; margin: 8px 0 0 0;">Price Alert Triggered</p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; margin-top: 0;">${symbol.toUpperCase()} ${opText} ${num(threshold)} USD</h2>
            <p>The price alert you created has been triggered.</p>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
              <p style="margin: 0;">Current Price: <strong>${num(price)} USD</strong></p>
              <p style="margin: 4px 0 0 0;">Condition: <strong>${symbol.toUpperCase()} ${opText} ${num(threshold)} USD</strong></p>
              <p style="margin: 8px 0 0 0; color:#6b7280; font-size: 12px;">Triggered at: ${ts}</p>
            </div>

            <div style="text-align:center; margin-top: 20px;">
              <a href="${viewLink}" style="display:inline-block; background:#111827; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:600;">View Alert</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">You received this email because you enabled Price Alerts in NOHVEX.</p>
          </div>
        </body>
      </html>
    `
  }

  private generateAlertEmailText(symbol: string, operator: 'GT'|'LT', threshold: number, price: number): string {
    const opText = operator === 'GT' ? '>' : '<'
    const ts = new Date().toUTCString()
    const baseUrl = (process.env.NEXTAUTH_URL?.trim() && process.env.NEXTAUTH_URL !== '')
      ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
      : 'https://nohvex-nextjs-exchange.vercel.app'
    const viewLink = `${baseUrl}/settings?tab=alerts&symbol=${encodeURIComponent(symbol)}`
    const num = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(n)

    return `
      NOHVEX Exchange - Price Alert Triggered

      ${symbol.toUpperCase()} ${opText} ${num(threshold)} USD has been hit.
      Current price: ${num(price)} USD
      Triggered at: ${ts}

      Manage/view this alert: ${viewLink}

      You received this email because you enabled Price Alerts in NOHVEX.
    `
  }
}

export const emailService = new EmailService()
