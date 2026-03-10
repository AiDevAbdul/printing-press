import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    name: string;
    company_name: string;
  };
  order: {
    order_number: string;
  };
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
}

interface InvoicesGridProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onInvoiceClick?: (invoice: Invoice) => void;
}

const statusColors: Record<string, { badge: string; bg: string }> = {
  draft: { badge: 'default', bg: 'bg-gray-50' },
  sent: { badge: 'default', bg: 'bg-blue-50' },
  paid: { badge: 'success', bg: 'bg-green-50' },
  overdue: { badge: 'error', bg: 'bg-red-50' },
  cancelled: { badge: 'error', bg: 'bg-red-50' },
};

export function InvoicesGrid({ invoices, isLoading = false, onInvoiceClick }: InvoicesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="No invoices found"
        description="Create your first invoice to get started"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map((invoice) => {
        const daysUntilDue = Math.ceil(
          (new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = daysUntilDue < 0;
        const statusConfig = statusColors[invoice.status] || statusColors.draft;

        return (
          <Card
            key={invoice.id}
            variant="elevated"
            padding="md"
            hover
            className={`${statusConfig.bg} cursor-pointer transition-transform hover:scale-[1.02]`}
            onClick={() => onInvoiceClick?.(invoice)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {invoice.invoice_number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Order: {invoice.order.order_number}
                  </p>
                </div>
                <Badge
                  variant="status"
                  status={
                    invoice.status === 'paid'
                      ? 'completed'
                      : invoice.status === 'overdue'
                      ? 'cancelled'
                      : 'pending'
                  }
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-medium text-gray-900">
                  {invoice.customer.name}
                </p>
                {invoice.customer.company_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    {invoice.customer.company_name}
                  </p>
                )}
              </div>

              {/* Amount Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{invoice.total_amount.toLocaleString()}
                  </span>
                </div>
                {invoice.paid_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Paid</span>
                    <span className="text-sm font-medium text-green-600">
                      ₹{invoice.paid_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {invoice.balance_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance</span>
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                      ₹{invoice.balance_amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Invoice Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Due Status */}
              {daysUntilDue >= 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                  <p className="text-xs font-medium text-blue-700">
                    Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                  <p className="text-xs font-medium text-red-700">
                    Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
