import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname.startsWith('/api/auth') || pathname === '/login' || pathname === '/') {
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/customer') || pathname.startsWith('/store')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'STORE_OWNER' && decoded.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/driver')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'DRIVER' && decoded.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer/:path*',
    '/store/:path*',
    '/driver/:path*',
    '/api/:path*'
  ]
}

