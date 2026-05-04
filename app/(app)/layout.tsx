'use client'

import { ReactNode } from 'react'

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      {/* Header placeholder - will be replaced with actual Header component */}
      <div className="h-16 border-b border-border bg-surface shadow-1">
        <div className="flex items-center justify-between h-full px-6">
          <div className="text-lg font-semibold text-text-primary">Printing Press</div>
          <div className="text-sm text-text-secondary">User Menu</div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar placeholder - will be replaced with actual Sidebar component */}
        <div className="w-64 border-r border-border bg-surface shadow-1">
          <div className="p-4 text-sm text-text-secondary">Navigation</div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
