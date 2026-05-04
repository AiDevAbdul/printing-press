import { NextRequest, NextResponse } from 'next/server'
import { signToken, verifyRefreshToken, setAuthCookies } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('auth_refresh')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshToken)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    // Create new access token
    const newAccessToken = await signToken(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        company_id: payload.company_id,
        is_super_admin: payload.is_super_admin,
      },
      '1h'
    )

    // Set new auth cookies
    await setAuthCookies(newAccessToken, refreshToken)

    return NextResponse.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
