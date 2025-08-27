/**
 * Advanced Security Management System
 * Handles session management, threat detection, and security policies
 */

import { EventEmitter } from 'events'

export interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'session_timeout' | 'suspicious_activity' | 'password_change' | '2fa_enabled' | '2fa_disabled'
  userId: string
  timestamp: number
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
    lat: number
    lng: number
  }
  riskScore: number
  details: Record<string, any>
}

export interface SessionInfo {
  sessionId: string
  userId: string
  createdAt: number
  lastActivity: number
  ipAddress: string
  userAgent: string
  deviceFingerprint: string
  isActive: boolean
  isTrusted: boolean
  location?: {
    country: string
    city: string
  }
  securityLevel: 'low' | 'medium' | 'high'
}

export interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  rules: {
    maxFailedAttempts: number
    lockoutDuration: number
    sessionTimeout: number
    requireMFA: boolean
    allowedLocations?: string[]
    blockedCountries?: string[]
    deviceTrustRequired: boolean
    passwordComplexity: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
  }
}

export interface ThreatDetection {
  enabled: boolean
  sensitivity: 'low' | 'medium' | 'high'
  rules: {
    detectBruteForce: boolean
    detectCredentialStuffing: boolean
    detectAnomalousLocation: boolean
    detectDeviceFingerprinting: boolean
    detectSessionHijacking: boolean
    detectBotActivity: boolean
  }
  actions: {
    blockIP: boolean
    requireAdditionalAuth: boolean
    notifyUser: boolean
    notifyAdmin: boolean
    lockAccount: boolean
  }
}

export class SecurityManager extends EventEmitter {
  private static instance: SecurityManager
  private sessions: Map<string, SessionInfo> = new Map()
  private securityEvents: SecurityEvent[] = []
  private blockedIPs: Set<string> = new Set()
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private trustedDevices: Map<string, { userId: string; deviceFingerprint: string; trustedAt: number }> = new Map()
  
  private defaultPolicy: SecurityPolicy = {
    id: 'default',
    name: 'Default Security Policy',
    description: 'Standard security settings for all users',
    enabled: true,
    severity: 'medium',
    rules: {
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      requireMFA: true,
      deviceTrustRequired: false,
      passwordComplexity: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    }
  }

  private threatDetection: ThreatDetection = {
    enabled: true,
    sensitivity: 'medium',
    rules: {
      detectBruteForce: true,
      detectCredentialStuffing: true,
      detectAnomalousLocation: true,
      detectDeviceFingerprinting: true,
      detectSessionHijacking: true,
      detectBotActivity: true
    },
    actions: {
      blockIP: true,
      requireAdditionalAuth: true,
      notifyUser: true,
      notifyAdmin: true,
      lockAccount: false
    }
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint: string
  ): Promise<SessionInfo> {
    const sessionId = this.generateSecureId()
    const location = await this.getLocationFromIP(ipAddress)
    
    const session: SessionInfo = {
      sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress,
      userAgent,
      deviceFingerprint,
      isActive: true,
      isTrusted: this.isDeviceTrusted(userId, deviceFingerprint),
      location,
      securityLevel: this.calculateSecurityLevel(ipAddress, userAgent, deviceFingerprint)
    }

    this.sessions.set(sessionId, session)
    
    // Log security event
    await this.logSecurityEvent({
      id: this.generateSecureId(),
      type: 'login',
      userId,
      timestamp: Date.now(),
      ipAddress,
      userAgent,
      location,
      riskScore: this.calculateRiskScore(session),
      details: { sessionId, deviceFingerprint }
    })

    return session
  }

  /**
   * Validate session and check for security issues
   */
  async validateSession(sessionId: string): Promise<SessionInfo | null> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return null
    }

    // Check session timeout
    const now = Date.now()
    if (now - session.lastActivity > this.defaultPolicy.rules.sessionTimeout) {
      await this.invalidateSession(sessionId, 'timeout')
      return null
    }

    // Update last activity
    session.lastActivity = now
    this.sessions.set(sessionId, session)

    return session
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(sessionId: string, reason: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.sessions.set(sessionId, session)
      
      await this.logSecurityEvent({
        id: this.generateSecureId(),
        type: 'logout',
        userId: session.userId,
        timestamp: Date.now(),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        location: session.location,
        riskScore: 0,
        details: { sessionId, reason }
      })
    }
  }

  /**
   * Handle failed login attempt
   */
  async handleFailedLogin(
    identifier: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ blocked: boolean; lockoutTime?: number }> {
    const key = `${identifier}:${ipAddress}`
    const attempts = this.failedAttempts.get(key) || { count: 0, lastAttempt: 0 }
    
    attempts.count++
    attempts.lastAttempt = Date.now()
    this.failedAttempts.set(key, attempts)

    // Check if should block
    if (attempts.count >= this.defaultPolicy.rules.maxFailedAttempts) {
      this.blockedIPs.add(ipAddress)
      
      await this.logSecurityEvent({
        id: this.generateSecureId(),
        type: 'failed_login',
        userId: identifier,
        timestamp: Date.now(),
        ipAddress,
        userAgent,
        riskScore: 90,
        details: { attempts: attempts.count, blocked: true }
      })

      // Auto-unblock after lockout duration
      setTimeout(() => {
        this.blockedIPs.delete(ipAddress)
        this.failedAttempts.delete(key)
      }, this.defaultPolicy.rules.lockoutDuration)

      return { 
        blocked: true, 
        lockoutTime: this.defaultPolicy.rules.lockoutDuration 
      }
    }

    await this.logSecurityEvent({
      id: this.generateSecureId(),
      type: 'failed_login',
      userId: identifier,
      timestamp: Date.now(),
      ipAddress,
      userAgent,
      riskScore: 30 + (attempts.count * 10),
      details: { attempts: attempts.count, blocked: false }
    })

    return { blocked: false }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress)
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(
    userId: string,
    ipAddress: string,
    userAgent: string,
    action: string
  ): Promise<{ suspicious: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = []
    let riskScore = 0

    // Check for location anomalies
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.isActive)
    
    if (userSessions.length > 0) {
      const lastLocation = userSessions[userSessions.length - 1].location
      const currentLocation = await this.getLocationFromIP(ipAddress)
      
      if (lastLocation && currentLocation) {
        const distance = this.calculateDistance(lastLocation, currentLocation)
        const timeDiff = Date.now() - userSessions[userSessions.length - 1].lastActivity
        
        // Check for impossible travel
        if (distance > 1000 && timeDiff < 2 * 60 * 60 * 1000) { // 1000km in 2 hours
          reasons.push('Impossible travel detected')
          riskScore += 50
        }
      }
    }

    // Check for multiple concurrent sessions
    const activeSessions = userSessions.filter(s => s.isActive).length
    if (activeSessions > 3) {
      reasons.push('Multiple concurrent sessions')
      riskScore += 20
    }

    // Check for unusual hours
    const hour = new Date().getHours()
    if (hour < 6 || hour > 23) {
      reasons.push('Activity during unusual hours')
      riskScore += 10
    }

    // Check for known malicious patterns
    if (this.isKnownMaliciousUA(userAgent)) {
      reasons.push('Suspicious user agent')
      riskScore += 30
    }

    const suspicious = riskScore > 30

    if (suspicious) {
      await this.logSecurityEvent({
        id: this.generateSecureId(),
        type: 'suspicious_activity',
        userId,
        timestamp: Date.now(),
        ipAddress,
        userAgent,
        riskScore,
        details: { action, reasons }
      })
    }

    return { suspicious, riskScore, reasons }
  }

  /**
   * Trust a device
   */
  async trustDevice(userId: string, deviceFingerprint: string): Promise<void> {
    this.trustedDevices.set(deviceFingerprint, {
      userId,
      deviceFingerprint,
      trustedAt: Date.now()
    })
  }

  /**
   * Get security events for a user
   */
  getSecurityEvents(userId: string, limit: number = 50): SecurityEvent[] {
    return this.securityEvents
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Get active sessions for a user
   */
  getActiveSessions(userId: string): SessionInfo[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActivity - a.lastActivity)
  }

  /**
   * Terminate all sessions for a user except current
   */
  async terminateOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const sessions = this.getActiveSessions(userId)
    let terminated = 0
    
    for (const session of sessions) {
      if (session.sessionId !== currentSessionId) {
        await this.invalidateSession(session.sessionId, 'user_requested')
        terminated++
      }
    }
    
    return terminated
  }

  /**
   * Update security policy
   */
  updateSecurityPolicy(policy: Partial<SecurityPolicy>): void {
    this.defaultPolicy = { ...this.defaultPolicy, ...policy }
    this.emit('policyUpdated', this.defaultPolicy)
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    activeSessions: number
    securityEvents24h: number
    blockedIPs: number
    trustedDevices: number
    suspiciousActivity: number
  } {
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    
    return {
      activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
      securityEvents24h: this.securityEvents.filter(e => e.timestamp > last24h).length,
      blockedIPs: this.blockedIPs.size,
      trustedDevices: this.trustedDevices.size,
      suspiciousActivity: this.securityEvents.filter(e => 
        e.timestamp > last24h && e.type === 'suspicious_activity'
      ).length
    }
  }

  // Private helper methods
  private generateSecureId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private async getLocationFromIP(ipAddress: string): Promise<{ country: string; city: string; lat: number; lng: number } | undefined> {
    // In production, integrate with a geolocation service
    // For now, return mock data for localhost
    if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return {
        country: 'Local',
        city: 'Localhost',
        lat: 0,
        lng: 0
      }
    }
    
    // Mock implementation - replace with actual geolocation service
    return {
      country: 'US',
      city: 'New York',
      lat: 40.7128,
      lng: -74.0060
    }
  }

  private isDeviceTrusted(userId: string, deviceFingerprint: string): boolean {
    const trusted = this.trustedDevices.get(deviceFingerprint)
    return trusted ? trusted.userId === userId : false
  }

  private calculateSecurityLevel(ipAddress: string, userAgent: string, deviceFingerprint: string): 'low' | 'medium' | 'high' {
    let score = 0
    
    // Check if device is trusted
    if (this.trustedDevices.has(deviceFingerprint)) score += 30
    
    // Check user agent
    if (this.isKnownMaliciousUA(userAgent)) score -= 50
    
    // Check IP reputation (mock)
    if (this.isKnownGoodIP(ipAddress)) score += 20
    
    if (score >= 40) return 'high'
    if (score >= 10) return 'medium'
    return 'low'
  }

  private calculateRiskScore(session: SessionInfo): number {
    let riskScore = 0
    
    // Base risk
    riskScore += 10
    
    // Trusted device reduces risk
    if (session.isTrusted) riskScore -= 20
    
    // Security level affects risk
    switch (session.securityLevel) {
      case 'high': riskScore -= 10; break
      case 'low': riskScore += 20; break
    }
    
    return Math.max(0, Math.min(100, riskScore))
  }

  private calculateDistance(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private isKnownMaliciousUA(userAgent: string): boolean {
    const maliciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ]
    
    return maliciousPatterns.some(pattern => pattern.test(userAgent))
  }

  private isKnownGoodIP(ipAddress: string): boolean {
    // Mock implementation - in production, check against IP reputation services
    return !this.blockedIPs.has(ipAddress)
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.unshift(event)
    
    // Keep only last 10000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents.splice(10000)
    }
    
    // Emit event for real-time monitoring
    this.emit('securityEvent', event)
    
    // Log to external security monitoring system in production
    // await this.sendToSIEM(event)
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance()