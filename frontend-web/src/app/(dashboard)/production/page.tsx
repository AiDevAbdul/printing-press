'use client';

import { useState } from 'react';

interface ProductionJob {
  id: string;
  orderId: string;
  clientName: string;
  jobName: string;
  priority: 'High' | 'Normal' | 'Low';
  machine: string;
}

interface Column {
  id: string;
  title: string;
  jobs: ProductionJob[];
}

export default function ProductionPage() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'pre-press',
      title: 'Pre-Press / Design',
      jobs: [
        { id: 'J1', orderId: 'ORD-001', clientName: 'TechCorp', jobName: 'Q1 Catalog Design', priority: 'High', machine: 'Workstation 4' },
      ]
    },
    {
      id: 'printing',
      title: 'Printing / Press',
      jobs: [
        { id: 'J2', orderId: 'ORD-002', clientName: 'Local Retailers', jobName: 'Flyer Batch A', priority: 'Normal', machine: 'Offset Press 1' },
        { id: 'J3', orderId: 'ORD-003', clientName: 'Event Flyers', jobName: 'Poster Series', priority: 'High', machine: 'Digital Press' },
      ]
    },
    {
      id: 'finishing',
      title: 'Finishing / Binding',
      jobs: [
        { id: 'J4', orderId: 'ORD-004', clientName: 'Book House', jobName: 'Annual Report', priority: 'Low', machine: 'Binding Line 2' },
      ]
    },
    {
      id: 'qc',
      title: 'Quality Control',
      jobs: []
    }
  ]);

  return (
    <div className="p-8 animate-fade-in" style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-between mb-8">
        <div>
          <h1>Production Floor</h1>
          <p className="text-secondary">Real-time status of all active print jobs across workstations</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline">Machine Status</button>
           <button className="btn btn-primary">Schedule New Job</button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        flex: 1, 
        overflowX: 'auto', 
        paddingBottom: '1rem' 
      }}>
        {columns.map((column) => (
          <div key={column.id} style={{ 
            minWidth: '320px', 
            width: '320px',
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="flex-between glass p-4" style={{ borderRadius: 'var(--radius-md)', borderTop: '3px solid var(--primary-color)' }}>
               <h3 style={{ fontSize: '1rem', margin: 0 }}>{column.title}</h3>
               <span className="badge badge-info">{column.jobs.length}</span>
            </div>
            
            <div className="glass" style={{ 
              flex: 1, 
              borderRadius: 'var(--radius-lg)', 
              backgroundColor: 'rgba(0,0,0,0.1)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowY: 'auto'
            }}>
              {column.jobs.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No active jobs
                </div>
              )}
              {column.jobs.map((job) => (
                <div key={job.id} className="glass p-4 animate-slide-up" style={{ 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)',
                }}>
                  <div className="flex-between mb-2">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>{job.orderId}</span>
                    <span className={`badge ${job.priority === 'High' ? 'badge-error' : 'badge-info'}`} style={{ transform: 'scale(0.8)', transformOrigin: 'right' }}>
                      {job.priority}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{job.jobName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer: {job.clientName}</p>
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '0.75rem', 
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    {job.machine}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
