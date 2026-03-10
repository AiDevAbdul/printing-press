import { X, Download, Printer, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    state?: string;
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
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  notes?: string;
  items?: InvoiceItem[];
  company_name?: string;
  product_type?: string;
  final_quantity?: number;
  unit_rate?: number;
  strength?: string;
}

interface InvoiceViewProps {
  invoice: Invoice;
  onClose: () => void;
  onMarkPaid?: (invoiceId: string) => void;
  isMarkingPaid?: boolean;
}

export function InvoiceView({ invoice, onClose, onMarkPaid, isMarkingPaid = false }: InvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF-like download by printing to PDF
    window.print();
  };

  const handleEmail = () => {
    const subject = `Invoice ${invoice.invoice_number}`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoice_number} for ${invoice.order.order_number}.\n\nTotal Amount: ₹${invoice.total_amount.toLocaleString()}\nDue Date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nThank you for your business!`;

    const mailtoLink = `mailto:${invoice.customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleMarkPaid = () => {
    if (onMarkPaid && window.confirm('Mark this invoice as paid?')) {
      onMarkPaid(invoice.id);
    }
  };

  const subtotal = invoice.subtotal || invoice.total_amount;
  const taxRate = invoice.tax_rate || 0;
  const taxAmount = invoice.tax_amount || (subtotal * taxRate) / 100;
  const total = invoice.total_amount;

  // Generate items if not provided
  const items: InvoiceItem[] = invoice.items || [
    {
      description: `${invoice.product_type || 'Product'} - ${invoice.strength || ''}`,
      quantity: invoice.final_quantity || 1,
      unit_price: invoice.unit_rate || subtotal,
      amount: subtotal,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-4 md:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header Actions - No Print */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 print:hidden">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Invoice Details</h2>
          <div className="flex items-center gap-1 md:gap-2">
            {invoice.status !== 'paid' && onMarkPaid && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={handleMarkPaid}
                disabled={isMarkingPaid}
                className="hidden md:flex"
              >
                {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Mail className="w-4 h-4" />}
              onClick={handleEmail}
              className="hidden sm:flex"
            >
              <span className="hidden lg:inline">Email</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
              className="hidden sm:flex"
            >
              <span className="hidden lg:inline">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              <span className="hidden lg:inline">Print</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Invoice Content - Printable */}
        <div className="p-4 md:p-6 lg:p-8 print:p-12">
          {/* Company Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-gray-600 text-sm md:text-base">{invoice.invoice_number}</p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                {invoice.company_name || 'Printing Press Co.'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">123 Business Street</p>
              <p className="text-xs md:text-sm text-gray-600">City, State 12345</p>
              <p className="text-xs md:text-sm text-gray-600">Phone: (123) 456-7890</p>
              <p className="text-xs md:text-sm text-gray-600">Email: info@printingpress.com</p>
            </div>
          </div>

          {/* Status Badge - No Print */}
          <div className="mb-6 print:hidden">
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
              {invoice.status.toUpperCase()}
            </Badge>
          </div>

          {/* Bill To & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h3>
              <div className="space-y-1">
                <p className="font-semibold text-sm md:text-base text-gray-900">{invoice.customer.name}</p>
                {invoice.customer.company_name && (
                  <p className="text-sm md:text-base text-gray-700">{invoice.customer.company_name}</p>
                )}
                {invoice.customer.address && (
                  <p className="text-xs md:text-sm text-gray-600">{invoice.customer.address}</p>
                )}
                {(invoice.customer.city || invoice.customer.state || invoice.customer.postal_code) && (
                  <p className="text-xs md:text-sm text-gray-600">
                    {[invoice.customer.city, invoice.customer.state, invoice.customer.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {invoice.customer.email && (
                  <p className="text-xs md:text-sm text-gray-600">{invoice.customer.email}</p>
                )}
                {invoice.customer.phone && (
                  <p className="text-xs md:text-sm text-gray-600">{invoice.customer.phone}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-3">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Invoice Date:</span>
                  <span className="font-medium text-xs md:text-sm text-gray-900">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium text-xs md:text-sm text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm text-gray-600">Order Number:</span>
                  <span className="font-medium text-xs md:text-sm text-gray-900">{invoice.order.order_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6 md:mb-8 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 md:py-3 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="text-right py-2 md:py-3 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 uppercase">
                    Qty
                  </th>
                  <th className="text-right py-2 md:py-3 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 uppercase">
                    Unit Price
                  </th>
                  <th className="text-right py-2 md:py-3 px-1 md:px-2 text-xs md:text-sm font-semibold text-gray-700 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 md:py-4 px-1 md:px-2 text-sm md:text-base text-gray-900">{item.description}</td>
                    <td className="py-3 md:py-4 px-1 md:px-2 text-right text-sm md:text-base text-gray-900">{item.quantity}</td>
                    <td className="py-3 md:py-4 px-1 md:px-2 text-right text-sm md:text-base text-gray-900">
                      ₹{item.unit_price.toLocaleString()}
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-2 text-right font-medium text-sm md:text-base text-gray-900">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6 md:mb-8">
            <div className="w-full md:w-80 space-y-2 md:space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm md:text-base text-gray-600">Subtotal:</span>
                <span className="font-medium text-sm md:text-base text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-sm md:text-base text-gray-600">Tax ({taxRate}%):</span>
                  <span className="font-medium text-sm md:text-base text-gray-900">₹{taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 md:py-3 border-t-2 border-gray-300">
                <span className="text-base md:text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-base md:text-lg font-bold text-gray-900">₹{total.toLocaleString()}</span>
              </div>
              {invoice.paid_amount > 0 && (
                <>
                  <div className="flex justify-between py-2 text-green-600">
                    <span className="font-medium text-sm md:text-base">Paid:</span>
                    <span className="font-medium text-sm md:text-base">₹{invoice.paid_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 md:py-3 border-t border-gray-300">
                    <span className="text-base md:text-lg font-semibold text-gray-900">Balance Due:</span>
                    <span className="text-base md:text-lg font-bold text-red-600">
                      ₹{invoice.balance_amount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 md:mb-8">
              <h3 className="text-xs md:text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
              <p className="text-gray-600 text-xs md:text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-sm text-gray-500">
              Thank you for your business!
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Payment is due within {Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.invoice_date).getTime()) / (1000 * 60 * 60 * 24))} days of invoice date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
