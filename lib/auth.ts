import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'
)

export interface JWTPayload {
  sub: string
  email: string
  role: string
  company_id?: string
  is_super_admin: boolean
  [key: string]: unknown
}

export async function signToken(payload: JWTPayload, expiresIn = '1h'): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)

  return token
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  return token
}

export async function verifyToken(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as JWTPayload
  } catch (err) {
    return null
  }
}

export async function verifyRefreshToken(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_REFRESH_SECRET)
    return verified.payload as unknown as JWTPayload
  } catch (err) {
    return null
  }
}

export async function getAuthToken(req: NextRequest): Promise<JWTPayload> {
  const token = req.cookies.get('auth_token')?.value
  const payload = await verifyToken(token)

  if (!payload) {
    throw new Error('Unauthorized')
  }

  return payload
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
  })

  cookieStore.set('auth_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function setTempAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set('auth_temp', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('auth_refresh')
  cookieStore.delete('auth_temp')
}
