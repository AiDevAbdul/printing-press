import { Mail, Phone, MapPin, Building2, FileText, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export interface CustomerProfileProps {
  customer: any;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              {customer.company_name && (
                <p className="text-gray-600 mt-2">{customer.company_name}</p>
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
      </Card>

      {/* Contact Information */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-gray-900">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      {(customer.address || customer.city || customer.state || customer.postal_code) && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle className="text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.address && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Street Address</p>
                  <p className="text-sm font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
            )}
            {(customer.city || customer.state || customer.postal_code) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {[customer.city, customer.state, customer.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Credit Limit</p>
              <p className="text-sm font-medium text-gray-900">
                ₹{customer.credit_limit.toLocaleString()}
              </p>
            </div>
          </div>
          {customer.gstin && (
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">GSTIN</p>
                <p className="text-sm font-medium text-gray-900">{customer.gstin}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
