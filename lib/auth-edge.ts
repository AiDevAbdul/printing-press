import { jwtVerify } from 'jose'

export interface JWTPayload {
  sub: string
  email: string
  role: string
  company_id?: string
  is_super_admin: boolean
  [key: string]: unknown
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function verifyTokenEdge(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as unknown as JWTPayload
  } catch {
    return null
  }
}
