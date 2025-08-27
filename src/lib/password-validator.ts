/**
 * Password Strength Validation Utility
 * Provides comprehensive password strength checking and recommendations
 */

export interface PasswordStrengthResult {
  score: number // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
  isValid: boolean
  entropy: number
  timeToCrack: string
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  requireNonSequential: boolean
  requireNonRepeating: boolean
  blacklistedPasswords: string[]
  maxConsecutiveChars: number
}

export class PasswordValidator {
  private static commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'admin123', 'welcome123', 'login', 'guest', 'test'
  ]

  private static keyboardPatterns = [
    'qwerty', 'asdf', 'zxcv', '1234', '4321', 'abcd', 'dcba'
  ]

  private static defaultPolicy: PasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireNonSequential: true,
    requireNonRepeating: true,
    blacklistedPasswords: PasswordValidator.commonPasswords,
    maxConsecutiveChars: 3
  }

  /**
   * Validate password strength against policy
   */
  static validatePassword(
    password: string, 
    policy: Partial<PasswordPolicy> = {}
  ): PasswordStrengthResult {
    const fullPolicy = { ...this.defaultPolicy, ...policy }
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length < fullPolicy.minLength) {
      feedback.push(`Password must be at least ${fullPolicy.minLength} characters long`)
    } else {
      score += Math.min(25, password.length * 2)
    }

    // Character variety checks
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    if (fullPolicy.requireUppercase && !hasUpper) {
      feedback.push('Password must contain uppercase letters')
    } else if (hasUpper) {
      score += 10
    }

    if (fullPolicy.requireLowercase && !hasLower) {
      feedback.push('Password must contain lowercase letters')
    } else if (hasLower) {
      score += 10
    }

    if (fullPolicy.requireNumbers && !hasNumber) {
      feedback.push('Password must contain numbers')
    } else if (hasNumber) {
      score += 10
    }

    if (fullPolicy.requireSymbols && !hasSymbol) {
      feedback.push('Password must contain special characters (!@#$%^&*)')
    } else if (hasSymbol) {
      score += 15
    }

    // Entropy calculation
    const entropy = this.calculateEntropy(password)
    score += Math.min(20, entropy / 2)

    // Common password check
    const lowerPassword = password.toLowerCase()
    if (fullPolicy.blacklistedPasswords.some(common => 
      lowerPassword.includes(common.toLowerCase())
    )) {
      feedback.push('Password contains common words or patterns')
      score -= 20
    }

    // Sequential character check
    if (fullPolicy.requireNonSequential && this.hasSequentialChars(password)) {
      feedback.push('Avoid sequential characters (abc, 123)')
      score -= 10
    }

    // Repeating character check
    if (fullPolicy.requireNonRepeating && this.hasRepeatingChars(password, fullPolicy.maxConsecutiveChars)) {
      feedback.push(`Avoid more than ${fullPolicy.maxConsecutiveChars} consecutive identical characters`)
      score -= 10
    }

    // Keyboard pattern check
    if (this.hasKeyboardPattern(password)) {
      feedback.push('Avoid keyboard patterns (qwerty, asdf)')
      score -= 15
    }

    // Date pattern check
    if (this.hasDatePattern(password)) {
      feedback.push('Avoid dates and years in passwords')
      score -= 10
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    // Determine level
    let level: PasswordStrengthResult['level']
    if (score < 20) level = 'very-weak'
    else if (score < 40) level = 'weak'
    else if (score < 60) level = 'fair'
    else if (score < 80) level = 'good'
    else if (score < 95) level = 'strong'
    else level = 'very-strong'

    // Add positive feedback for strong passwords
    if (score >= 80 && feedback.length === 0) {
      feedback.push('Excellent password strength!')
    } else if (score >= 60 && feedback.length <= 1) {
      feedback.push('Good password strength')
    }

    const isValid = feedback.length === 0 || (feedback.length === 1 && feedback[0].includes('Excellent'))

    return {
      score,
      level,
      feedback,
      isValid,
      entropy,
      timeToCrack: this.calculateTimeToCrack(entropy)
    }
  }

  /**
   * Calculate password entropy
   */
  private static calculateEntropy(password: string): number {
    let charsetSize = 0
    
    if (/[a-z]/.test(password)) charsetSize += 26
    if (/[A-Z]/.test(password)) charsetSize += 26
    if (/[0-9]/.test(password)) charsetSize += 10
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32

    return Math.log2(Math.pow(charsetSize, password.length))
  }

  /**
   * Check for sequential characters
   */
  private static hasSequentialChars(password: string): boolean {
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiopasdfghjklzxcvbnm']
    
    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 3; i++) {
        const subseq = seq.slice(i, i + 3)
        if (password.toLowerCase().includes(subseq)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Check for repeating characters
   */
  private static hasRepeatingChars(password: string, maxConsecutive: number): boolean {
    for (let i = 0; i < password.length - maxConsecutive; i++) {
      const char = password[i]
      let consecutive = 1
      
      for (let j = i + 1; j < password.length && password[j] === char; j++) {
        consecutive++
      }
      
      if (consecutive > maxConsecutive) {
        return true
      }
    }
    return false
  }

  /**
   * Check for keyboard patterns
   */
  private static hasKeyboardPattern(password: string): boolean {
    const lowerPassword = password.toLowerCase()
    return this.keyboardPatterns.some(pattern => 
      lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split('').reverse().join(''))
    )
  }

  /**
   * Check for date patterns
   */
  private static hasDatePattern(password: string): boolean {
    // Check for years (1900-2099)
    if (/19[0-9][0-9]|20[0-9][0-9]/.test(password)) return true
    
    // Check for date formats (MM/DD, DD/MM, MM-DD, DD-MM)
    if (/\d{1,2}[\/\-]\d{1,2}/.test(password)) return true
    
    return false
  }

  /**
   * Calculate estimated time to crack password
   */
  private static calculateTimeToCrack(entropy: number): string {
    // Assuming 1 billion guesses per second
    const guessesPerSecond = 1e9
    const possibleCombinations = Math.pow(2, entropy)
    const secondsToCrack = possibleCombinations / (2 * guessesPerSecond)

    if (secondsToCrack < 1) return 'Instantly'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    
    const centuries = secondsToCrack / (31536000 * 100)
    if (centuries < 1000) return `${Math.round(centuries)} centuries`
    
    return 'Millions of years'
  }

  /**
   * Generate password suggestions
   */
  static generateSuggestions(feedback: string[]): string[] {
    const suggestions: string[] = []

    if (feedback.some(f => f.includes('length'))) {
      suggestions.push('Consider using a passphrase with multiple words')
    }

    if (feedback.some(f => f.includes('uppercase'))) {
      suggestions.push('Add some capital letters')
    }

    if (feedback.some(f => f.includes('numbers'))) {
      suggestions.push('Include some numbers (but not just at the end)')
    }

    if (feedback.some(f => f.includes('special'))) {
      suggestions.push('Add special characters like !@#$%^&*')
    }

    if (feedback.some(f => f.includes('common'))) {
      suggestions.push('Avoid dictionary words and common passwords')
    }

    if (feedback.some(f => f.includes('sequential'))) {
      suggestions.push('Mix up character order - avoid abc or 123 patterns')
    }

    if (suggestions.length === 0) {
      suggestions.push('Your password meets all security requirements!')
    }

    return suggestions
  }

  /**
   * Get password strength color for UI
   */
  static getStrengthColor(level: PasswordStrengthResult['level']): string {
    switch (level) {
      case 'very-weak': return 'text-red-500'
      case 'weak': return 'text-red-400'
      case 'fair': return 'text-yellow-500'
      case 'good': return 'text-yellow-400'
      case 'strong': return 'text-green-400'
      case 'very-strong': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  /**
   * Get password strength background color for progress bars
   */
  static getStrengthBgColor(level: PasswordStrengthResult['level']): string {
    switch (level) {
      case 'very-weak': return 'bg-red-500'
      case 'weak': return 'bg-red-400'
      case 'fair': return 'bg-yellow-500'
      case 'good': return 'bg-yellow-400'
      case 'strong': return 'bg-green-400'
      case 'very-strong': return 'bg-green-500'
      default: return 'bg-gray-400'
    }
  }
}