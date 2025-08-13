// Two-Factor Authentication Types
export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
}

export interface TwoFactorVerification {
  token: string
  backupCode?: string
  trustDevice?: boolean
}

export interface TwoFactorStatus {
  isEnabled: boolean
  lastUsed?: Date
  backupCodesRemaining: number
  setupAt?: Date
}

export interface AuthSession {
  requiresTwoFactor: boolean
  userId: string
  tempSessionId?: string
  challengeType?: 'totp' | 'backup'
}

export interface SecurityAction {
  action: 'enable_2fa' | 'disable_2fa' | 'change_password' | 'login' | 'withdraw' | 'trade_large'
  requiresTwoFactor: boolean
  description: string
}

export interface BackupCode {
  code: string
  used: boolean
  usedAt?: Date
}

export interface TrustedDevice {
  id: string
  name: string
  userAgent: string
  ipAddress: string
  addedAt: Date
  lastUsed: Date
  isActive: boolean
}

// API Response Types
export interface Setup2FAResponse {
  success: boolean
  setup?: TwoFactorSetup
  error?: string
}

export interface Verify2FAResponse {
  success: boolean
  message: string
  backupCodesGenerated?: string[]
  error?: string
}

export interface Disable2FAResponse {
  success: boolean
  message: string
  error?: string
}

export interface BackupCodesResponse {
  success: boolean
  codes: string[]
  error?: string
}

// Form validation types
export interface Setup2FAFormData {
  verificationCode: string
  password: string
}

export interface Verify2FAFormData {
  code: string
  useBackupCode: boolean
  trustDevice: boolean
}
