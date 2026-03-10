import { Users, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface CustomersGridProps {
  customers: any[];
  isLoading?: boolean;
  onViewCustomer?: (customerId: string) => void;
}

export function CustomersGrid({
  customers,
  isLoading = false,
  onViewCustomer,
}: CustomersGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewCustomer?.(customer.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {customer.name}
                </CardTitle>
                {customer.company_name && (
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {customer.company_name}
                  </p>
                )}
              </div>
              <Badge
                variant="status"
                status={customer.is_active ? 'completed' : 'cancelled'}
              >
                {customer.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>

            {(customer.city || customer.state) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {customer.city && customer.state
                    ? `${customer.city}, ${customer.state}`
                    : customer.city || customer.state}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Limit</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{customer.credit_limit.toLocaleString()}
                </span>
              </div>
            </div>

            {customer.gstin && (
              <div className="text-xs text-gray-500">
                GSTIN: {customer.gstin}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
