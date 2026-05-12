const API_BASE = '/api';

export interface Payment {
  id: string;
  invoice_id: string;
  company_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  received_by_id: string;
  created_at: string;
  users?: { id: string; full_name: string };
}

export const paymentsService = {
  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments?invoice_id=${invoiceId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async create(data: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    reference_number?: string;
    notes?: string;
  }): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create payment');
    }
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/payments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete payment');
  },
};
