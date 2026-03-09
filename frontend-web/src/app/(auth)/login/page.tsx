'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      login(access_token, {
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.email.split('@')[0],
        role: userData.role || 'User',
      });
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="glass p-8 animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        borderRadius: 'var(--radius-xl)' 
      }}>
        <div className="flex-center mb-8" style={{ flexDirection: 'column' }}>
           <div style={{ 
               width: '48px', height: '48px', 
               borderRadius: 'var(--radius-md)', 
               backgroundColor: 'var(--primary-color)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               marginBottom: '1rem'
           }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17V7M12 17V11M17 17V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h2>PrintPM</h2>
           <p className="text-secondary" style={{ marginTop: '0.5rem' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="manager@printco.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <div className="flex-between">
               <label className="input-label" htmlFor="password">Password</label>
               <a href="#" style={{ fontSize: '0.75rem' }}>Forgot password?</a>
            </div>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
