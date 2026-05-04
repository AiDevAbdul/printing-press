import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { db } from '@/lib/db'
import { signToken, setTempAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await db.users.findFirst({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create temp JWT (no company_id yet)
    const tempToken = await signToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        is_super_admin: user.is_super_admin || false,
      },
      '15m'
    )

    // Get companies user can access
    let userCompanies: { id: string; name: string }[] = []
    if (user.is_super_admin) {
      // Super admin can access all companies
      const allCompanies = await db.companies.findMany()
      userCompanies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
    } else {
      // Regular user can only access their company
      if (user.company_id) {
        const company = await db.companies.findUnique({
          where: { id: user.company_id },
        })
        if (company) {
          userCompanies = [{ id: company.id, name: company.name }]
        }
      }
    }

    // Set temp cookie
    await setTempAuthCookie(tempToken)

    return NextResponse.json({
      message: 'Login successful. Please select a company.',
      tempToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        is_super_admin: user.is_super_admin,
      },
      companies: userCompanies,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
