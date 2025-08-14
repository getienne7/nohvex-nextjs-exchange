import { NextResponse, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Minimal 2FA enforcement middleware
// Logic:
// - If user has 2FA enabled (from JWT), require a recent verification cookie on protected pages
// - Public routes are allowed
// - API 2FA routes are allowed

const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/deployment-test',
  '/api/auth',
]

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api/auth/2fa') // allow 2FA API
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Get JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    // Not signed in: allow NextAuth to redirect via page logic
    return NextResponse.next()
  }

  const twoFAEnabled = (token as any).twoFAEnabled === true
  if (!twoFAEnabled) {
    return NextResponse.next()
  }

  // Require verification cookie set by /api/auth/2fa/verify
  const verifiedCookie = req.cookies.get('nx_twofa_verified')?.value
  if (verifiedCookie !== '1') {
    // Redirect to sign-in (which should trigger 2FA UI) or to settings if desired
    const url = req.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('reason', '2fa_required')
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ],
}

