import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { Setup2FAResponse } from '@/types/auth'

// In-memory storage for 2FA setup data (replace with database in production)
const twoFactorSetupStore = new Map<string, {
  secret: string
  backupCodes: string[]
  createdAt: Date
  expiresAt: Date
}>()

// In-memory storage for user 2FA data
export const twoFactorStore = new Map<string, {
  isEnabled: boolean
  secret?: string
  backupCodes?: Array<{ code: string; used: boolean; createdAt: Date; usedAt?: Date }>
  enabledAt?: Date
  lastUsed?: Date
}>()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if 2FA is already enabled
    const user2FA = twoFactorStore.get(session.user.email)
    if (user2FA?.isEnabled) {
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

    // Enable 2FA for user in memory store
    twoFactorStore.set(session.user.email, {
      isEnabled: true,
      secret: setupData.secret,
      backupCodes: setupData.backupCodes.map(code => ({
        code,
        used: false,
        createdAt: new Date()
      })),
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
