import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken, signRefreshToken, setAuthCookies, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { company_id } = await req.json()

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // Verify temp token
    const tempToken = req.cookies.get('auth_temp')?.value
    if (!tempToken) {
      return NextResponse.json({ error: 'No temp token found' }, { status: 401 })
    }

    const tempPayload = await verifyToken(tempToken)
    if (!tempPayload) {
      return NextResponse.json({ error: 'Invalid temp token' }, { status: 401 })
    }

    // Verify company exists
    const company = await db.companies.findUnique({
      where: { id: company_id },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if user belongs to company (unless super admin)
    if (!tempPayload.is_super_admin) {
      const userRecord = await db.users.findUnique({
        where: { id: tempPayload.sub },
        select: { company_id: true },
      })

      if (userRecord?.company_id !== company_id) {
        return NextResponse.json({ error: 'User does not have access to this company' }, { status: 403 })
      }
    }

    // Create full JWT with company_id
    const accessToken = await signToken(
      {
        sub: tempPayload.sub,
        email: tempPayload.email,
        role: tempPayload.role,
        company_id,
        is_super_admin: tempPayload.is_super_admin,
      },
      '1h'
    )

    const refreshToken = await signRefreshToken({
      sub: tempPayload.sub,
      email: tempPayload.email,
      role: tempPayload.role,
      company_id,
      is_super_admin: tempPayload.is_super_admin,
    })

    // Set auth cookies
    await setAuthCookies(accessToken, refreshToken)

    // Get user details
    const user = await db.users.findUnique({
      where: { id: tempPayload.sub },
    })

    return NextResponse.json({
      message: 'Company selected successfully',
      accessToken,
      refreshToken,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.full_name,
        role: user?.role,
        is_super_admin: user?.is_super_admin,
      },
      company: {
        id: company.id,
        name: company.name,
      },
    })
  } catch (error) {
    console.error('Select company error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
