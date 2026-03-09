import Link from 'next/link';

export default function CommandCenter() {
  const modules = [
    {
      name: 'Orders',
      description: 'Track and manage production orders',
      href: '/orders',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#3b82f6',
      stat: '24'
    },
    {
      name: 'Production',
      description: 'Monitor shop floor processes',
      href: '/production',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#8b5cf6',
      stat: '12'
    },
    {
      name: 'Inventory',
      description: 'Manage materials and stocks',
      href: '/inventory',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#10b981',
      stat: 'Low'
    },
    {
      name: 'Quotations',
      description: 'Generate and track project quotes',
      href: '/quotations',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#f59e0b',
      stat: '+5'
    },
    {
      name: 'Customers',
      description: 'Manage clients and CRM',
      href: '/customers',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#ec4899',
      stat: '50+'
    },
    {
      name: 'Costing',
      description: 'Calculate and optimize job costs',
      href: '/costing',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 2a10 10 0 100 20 10 10 0 000-20zM12 20V4m8 8H4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#06b6d4',
      stat: 'Update'
    }
  ];

  return (
    <main className="min-h-screen p-8 animate-fade-in command-center">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center p-8">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Command Center
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Centralized orchestration for your printing operations. Access all systems and real-time metrics from a single hub.
          </p>
        </header>

        <section className="mb-12">
          <div className="search-bar">
            <span className="search-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Jump to a module, search orders, or run a command..." 
              className="input-field glass"
            />
          </div>
        </section>

        <div className="module-grid">
          {modules.map((module, i) => (
            <Link 
              key={module.name} 
              href={module.href} 
              className="module-tile glass animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div 
                className="module-icon" 
                style={{ 
                  backgroundColor: `${module.color}15`, 
                  color: module.color,
                  border: `1px solid ${module.color}30` 
                }}
              >
                {module.icon}
              </div>
              <span className="module-stat">{module.stat}</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{module.name}</h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{module.description}</p>
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>View All</button>
                <button 
                  className="btn" 
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.4rem 0.8rem', 
                    backgroundColor: `${module.color}15`, 
                    color: module.color,
                    border: `1px solid ${module.color}30`
                  }}
                >
                  Quick Action
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
