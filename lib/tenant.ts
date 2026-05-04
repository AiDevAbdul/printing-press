import { NextRequest } from 'next/server'
import { getAuthToken } from './auth'

export async function getTenantContext(req: NextRequest) {
  const token = await getAuthToken(req)

  return {
    userId: token.sub,
    companyId: token.company_id,
    role: token.role,
    isSuperAdmin: token.is_super_admin,
    email: token.email,
  }
}

export async function getCompanyId(req: NextRequest): Promise<string> {
  const token = await getAuthToken(req)
  if (!token.company_id) {
    throw new Error('Company not selected')
  }
  return token.company_id
}
