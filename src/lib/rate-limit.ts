type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

/**
 * Simple in-memory sliding window counter. Suitable for serverless/dev only.
 */
export function checkLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt, retryAfterMs: 0 }
  }

  if (bucket.count < limit) {
    bucket.count += 1
    buckets.set(key, bucket)
    return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt, retryAfterMs: 0 }
  }

  return { allowed: false, remaining: 0, resetAt: bucket.resetAt, retryAfterMs: Math.max(0, bucket.resetAt - now) }
}

export function clientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for') || headers.get('x-real-ip')
  if (fwd) return fwd.split(',')[0].trim()
  return 'unknown'
}
