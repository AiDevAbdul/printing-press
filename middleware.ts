import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Company selector requires either a temp or full token
  if (pathname === '/company-selector') {
    const tempToken =
      request.cookies.get('auth_temp')?.value ||
      request.cookies.get('auth_token')?.value
    const payload = await verifyToken(tempToken)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Protected routes — require a full token with company_id
  const token = request.cookies.get('auth_token')?.value
  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!payload.company_id) {
    return NextResponse.redirect(new URL('/company-selector', request.url))
  }

  // Inject tenant context into request headers for Route Handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-company-id', payload.company_id)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
