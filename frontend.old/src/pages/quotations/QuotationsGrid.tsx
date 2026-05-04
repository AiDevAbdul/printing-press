import { FileText, Calendar, Send, CheckCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface QuotationsGridProps {
  quotations: any[];
  isLoading?: boolean;
  onView?: (quotation: any) => void;
  onEdit?: (quotation: any) => void;
  onSend?: (quotationId: string) => void;
  onApprove?: (quotationId: string) => void;
}

export function QuotationsGrid({
  quotations,
  isLoading = false,
  onView,
  onEdit,
  onSend,
  onApprove,
}: QuotationsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="No quotations found"
        description="Create your first quotation to get started"
      />
    );
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, any> = {
      draft: 'pending',
      sent: 'in_progress',
      approved: 'completed',
      rejected: 'cancelled',
      expired: 'cancelled',
      converted: 'completed',
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quotations.map((quotation) => (
        <Card
          key={quotation.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onView?.(quotation)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base">
                  {quotation.quotation_number}
                  {quotation.version > 1 && (
                    <span className="ml-2 text-xs text-gray-500">
                      v{quotation.version}
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {quotation.customer?.company_name || 'N/A'}
                </p>
              </div>
              <Badge variant="status" status={getStatusColor(quotation.status)}>
                {quotation.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Product</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {quotation.product_name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-sm font-medium text-gray-900">
                  {quotation.quantity} {quotation.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-sm font-semibold text-blue-600">
                  ₹{quotation.total_amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(quotation.quotation_date).toLocaleDateString()}
              </span>
            </div>

            {quotation.valid_until && (
              <div className="text-xs text-gray-500">
                Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              {quotation.status === 'draft' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(quotation);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSend?.(quotation.id);
                    }}
                  >
                    Send
                  </Button>
                </>
              )}
              {quotation.status === 'sent' && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(quotation.id);
                  }}
                >
                  Approve
                </Button>
              )}
              {(quotation.status === 'approved' || quotation.status === 'converted') && (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(quotation);
                  }}
                >
                  View Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
