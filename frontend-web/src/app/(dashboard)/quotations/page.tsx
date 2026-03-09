'use client';

import { useState } from 'react';

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function QuotationsPage() {
  const [items, setItems] = useState<QuotationItem[]>([
    { id: 1, description: 'Premium Gloss Business Cards - 350gsm', quantity: 1000, unitPrice: 0.12 },
  ]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof QuotationItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.15; // 15% Tax
  const total = subtotal + tax;

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1>Interactive Quotation Builder</h1>
          <p className="text-secondary">Generate professional estimates for clients instantly</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline">Drafts</button>
           <button className="btn btn-primary">Save & Send Quote</button>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass p-8" style={{ borderRadius: 'var(--radius-xl)' }}>
          <h3 className="mb-6">Project Line Items</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.id} className="glass p-4" style={{ 
                borderRadius: 'var(--radius-md)', 
                display: 'grid', 
                gridTemplateColumns: '3fr 1fr 1fr 0.5fr',
                gap: '1rem',
                alignItems: 'end'
              }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Description</label>
                  <input 
                    className="input-field" 
                    value={item.description} 
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g., A4 Magazine - 50 Pages" 
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Qty</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Unit Price ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input-field" 
                    value={item.unitPrice} 
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ color: 'var(--error-color)', padding: '0.75rem', display: 'flex', justifyContent: 'center' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
            
            <button 
               onClick={addItem}
               className="btn btn-outline" 
               style={{ borderStyle: 'dashed', marginTop: '1rem', justifyContent: 'center' }}
            >
              + Add Item
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="glass p-8" style={{ borderRadius: 'var(--radius-xl)', height: 'fit-content' }}>
              <h3 className="mb-6">Estimation Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div className="flex-between">
                    <span className="text-secondary">Subtotal</span>
                    <span style={{ fontWeight: 600 }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex-between">
                    <span className="text-secondary">Tax (15%)</span>
                    <span style={{ fontWeight: 600 }}>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Total Amount</h2>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                 </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
                 Download PDF Preview
              </button>
           </div>

           <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
              <h4 className="mb-4">Internal Notes</h4>
              <textarea 
                className="input-field" 
                rows={4} 
                style={{ width: '100%', resize: 'none' }}
                placeholder="Discounts applied, special requests..."
              ></textarea>
           </div>
        </div>
      </div>
    </div>
  );
}
