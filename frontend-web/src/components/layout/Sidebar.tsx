'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Command Center', href: '/' },
    { name: 'Orders', href: '/orders' },
    { name: 'Production', href: '/production' },
    { name: 'Quotations', href: '/quotations' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Quality', href: '/quality' },
    { name: 'Customers', href: '/customers' },
    { name: 'Costing', href: '/costing' },
    { name: 'Dispatch', href: '/dispatch' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r z-50 animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      borderRight: '1px solid var(--border-color)' 
    }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="p-6 flex-center" style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="8" fill="var(--primary-color)"/>
                <path d="M7 7h3v3H7V7zm7 0h3v3h-3V7zm-7 7h3v3H7v-3zm7 0h3v3h-3v-3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
             <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.5px', fontWeight: 700 }}>PrintPM</h2>
          </div>
        </div>
      </Link>
      
      <nav className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all var(--transition-fast)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)'}}>
         <button onClick={logout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            Logout
         </button>
      </div>
    </aside>
  );
}
