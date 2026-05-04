import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken(req)

    const user = await db.users.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_super_admin: true,
        department: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get companies user can access
    let companies: { id: string; name: string }[] = []
    if (user.is_super_admin) {
      const allCompanies = await db.companies.findMany()
      companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
    } else {
      const userCompany = await db.companies.findUnique({
        where: { id: token.company_id || '' },
      })
      if (userCompany) {
        companies = [{ id: userCompany.id, name: userCompany.name }]
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        companyId: token.company_id,
      },
      companies,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
