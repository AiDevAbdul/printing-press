import { ReactNode } from 'react'

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
