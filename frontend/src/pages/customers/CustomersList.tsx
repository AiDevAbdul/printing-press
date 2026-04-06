import { Mail, Phone, MapPin, CreditCard, Edit2, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

export interface CustomersListProps {
  customers: any[];
  isLoading?: boolean;
  onViewCustomer?: (customerId: string) => void;
}

export function CustomersList({
  customers,
  isLoading = false,
  onViewCustomer,
}: CustomersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-16" />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="No customers found"
        description="Add your first customer to get started"
      />
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Company</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Credit Limit</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">{customer.company_name || '-'}</p>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {(customer.city || customer.state) ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {customer.city && customer.state
                        ? `${customer.city}, ${customer.state}`
                        : customer.city || customer.state}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    ₹{customer.credit_limit.toLocaleString()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant="status"
                  status={customer.is_active ? 'completed' : 'cancelled'}
                >
                  {customer.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={() => onViewCustomer?.(customer.id)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
