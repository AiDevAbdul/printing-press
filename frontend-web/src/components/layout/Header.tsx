import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { user } = useAuth();
  
  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <header className="glass sticky top-0 z-40 w-full animate-fade-in" style={{ position: 'sticky', top: 0, width: '100%', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex-center">
        {/* Breadcrumbs or Page Title could go here */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-secondary)'}}>Dashboard Overview</h2>
      </div>
      <div className="flex-center" style={{ gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search orders, jobs..." 
            className="input-field"
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', minWidth: '250px' }}
          />
        </div>
        <button style={{ position: 'relative', padding: '0.5rem' }}>
          {/* Notification Bell Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: 'var(--error-color)', borderRadius: '50%' }}></span>
        </button>
        <div className="flex-center" style={{ gap: '0.75rem'}}>
           <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {initials}
           </div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'Guest User'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{user?.role || 'User'}</span>
           </div>
        </div>
      </div>
    </header>
  );
}
