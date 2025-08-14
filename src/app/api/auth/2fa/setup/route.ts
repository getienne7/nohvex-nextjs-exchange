import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
// import { Setup2FAResponse } from '@/types/auth'
import { dbService } from '@/lib/db-service'

// Temporary setup store (in-memory) only for pending setup verification
const twoFactorSetupStore = new Map<string, {
  secret: string
  backupCodes: string[]
  createdAt: Date
  expiresAt: Date
}>()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if 2FA is already enabled (via DB)
    const user = await dbService.findUserByEmail(session.user.email)
    if (user?.twoFAEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is already enabled' },
        { status: 400 }
      )
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `NohVex Exchange (${session.user.email})`,
      issuer: 'NohVex Exchange',
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Generate backup codes (8 codes, 8 characters each)
    const backupCodes: string[] = []
    for (let i = 0; i < 8; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
    }

    // Store temporary 2FA setup data (expires in 10 minutes)
    twoFactorSetupStore.set(session.user.email, {
      secret: secret.base32,
      backupCodes,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })

    return NextResponse.json({
      success: true,
      setup: {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: secret.base32
      }
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { verificationCode, password } = await req.json()

    if (!verificationCode || !password) {
      return NextResponse.json(
        { success: false, error: 'Verification code and password are required' },
        { status: 400 }
      )
    }

    // Get user and pending setup data
    const user = await dbService.findUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify password
    const validPassword = await import('bcryptjs').then(m => m.compare(password, (user as unknown as { password: string }).password))
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Get temporary setup data
    const setupData = twoFactorSetupStore.get(session.user.email)
    if (!setupData || setupData.expiresAt < new Date()) {
      twoFactorSetupStore.delete(session.user.email)
      return NextResponse.json(
        { success: false, error: 'Setup session expired. Please start over.' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: setupData.secret,
      encoding: 'base32',
      token: verificationCode,
      window: 2 // Allow 2 steps tolerance
    })

    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Persist 2FA for user in DB
    const backupCodes = setupData.backupCodes.map(code => ({ code, used: false, createdAt: new Date() }))
    await dbService.set2FA(user.id, {
      enabled: true,
      secret: setupData.secret,
      backupCodes,
      enabledAt: new Date()
    })

    // Clean up setup data
    twoFactorSetupStore.delete(session.user.email)

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled',
      backupCodesGenerated: setupData.backupCodes
    })

  } catch (error) {
    console.error('2FA enable error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
