'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Printer, Mail, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getDashboardRoute = (role: string): string => {
    const roleRoutes: Record<string, string> = {
      admin: '/dashboard',
      sales: '/dashboard/sales',
      planner: '/dashboard/production',
      accounts: '/dashboard/finance',
      inventory: '/dashboard/inventory',
    }
    return roleRoutes[role] || '/dashboard'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()

      if (data.user?.is_super_admin) {
        router.push('/company-selector')
      } else {
        router.push(getDashboardRoute(data.user?.role))
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left brand panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)' }}
      >
        {/* Decorative rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-1/3 -right-12 w-64 h-64 rounded-full border border-white/[0.07]" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/[0.04]" />

        {/* Wordmark */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">PrintFlow</span>
        </div>

        {/* Headline + tagline */}
        <div className="relative space-y-5">
          {/* Registration mark decoration */}
          <div className="flex items-center gap-3 mb-6">
            {['#F97316', '#1B4FDB', '#34C759', '#FF3B30'].map((c, i) => (
              <div key={i} className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full opacity-70" style={{ backgroundColor: c }} />
                <div className="absolute inset-1 rounded-full bg-white/20" />
              </div>
            ))}
          </div>

          <h2 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
            Capital Print<br />& Pack
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-[280px]">
            End-to-end print workflow management — pre-press, production, dispatch.
          </p>
        </div>

        {/* Footer tags */}
        <div className="relative flex items-center gap-4">
          {['Multi-company', 'Real-time', 'Role-based'].map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest font-semibold text-white/35">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 px-8 py-12 bg-[var(--color-surface)]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-brand)' }}>
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--color-text-primary)] tracking-tight">PrintFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                fullWidth
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                fullWidth
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] mt-1.5 flex-shrink-0" />
                <p className="text-sm text-[var(--color-danger)] leading-snug">{error}</p>
              </div>
            )}

            <div className="pt-1">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign in
              </Button>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-3.5 rounded-xl bg-[var(--color-page-bg)] border border-[var(--color-border-subtle)]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">
              Demo credentials
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-mono">
              admin@printingpress.com
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-mono">
              admin123
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
