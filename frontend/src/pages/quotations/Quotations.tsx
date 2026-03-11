import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import { quotationService, Quotation } from '../../services/quotation.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { SortButton } from '../../components/ui/SortButton';
import { QuotationsGrid } from './QuotationsGrid';
import QuotationForm from './QuotationForm';
import QuotationDetails from './QuotationDetails';
import toast from 'react-hot-toast';
import { useSorting } from '../../hooks/useSorting';

const Quotations = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', activeTab, searchTerm],
    queryFn: () =>
      quotationService.getAll({
        status: activeTab === 'all' ? undefined : activeTab,
        search: searchTerm || undefined,
      }),
  });

  const { sortedItems, sortConfig, toggleSort } = useSorting(data?.data || [], 'created_at');

  const sendMutation = useMutation({
    mutationFn: quotationService.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation sent to customer');
    },
    onError: () => {
      toast.error('Failed to send quotation');
    },
  });

  const approveMutation = useMutation({
    mutationFn: quotationService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation approved');
    },
    onError: () => {
      toast.error('Failed to approve quotation');
    },
  });

  const quotations = sortedItems || [];

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowForm(true);
  };

  const handleView = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetails(true);
  };

  const handleSend = async (id: string) => {
    const confirmed = window.confirm('Send this quotation to the customer?');
    if (confirmed) {
      await sendMutation.mutateAsync(id);
    }
  };

  const handleApprove = async (id: string) => {
    const confirmed = window.confirm('Approve this quotation?');
    if (confirmed) {
      await approveMutation.mutateAsync(id);
    }
  };

  const tabsConfig = [
    { id: 'all', label: 'All', icon: <FileText className="w-4 h-4" /> },
    { id: 'draft', label: 'Draft', icon: <FileText className="w-4 h-4" /> },
    { id: 'sent', label: 'Sent', icon: <FileText className="w-4 h-4" /> },
    { id: 'approved', label: 'Approved', icon: <FileText className="w-4 h-4" /> },
    { id: 'rejected', label: 'Rejected', icon: <FileText className="w-4 h-4" /> },
    { id: 'converted', label: 'Converted', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">Create and manage customer quotations</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedQuotation(null);
            setShowForm(true);
          }}
        >
          New Quotation
        </Button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by quotation number, product, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <SortButton
            label="Latest"
            isActive={sortConfig.key === 'created_at'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('created_at')}
          />
          <SortButton
            label="Amount"
            isActive={sortConfig.key === 'total_amount'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('total_amount')}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig.map((tab) => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
          content: (
            <QuotationsGrid
              quotations={quotations}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onSend={handleSend}
              onApprove={handleApprove}
            />
          ),
        }))}
        defaultTab="all"
        onChange={setActiveTab}
      />

      {/* Modals */}
      {showForm && (
        <QuotationForm
          quotation={selectedQuotation}
          onClose={() => {
            setShowForm(false);
            setSelectedQuotation(null);
          }}
        />
      )}

      {showDetails && selectedQuotation && (
        <QuotationDetails
          quotation={selectedQuotation}
          onClose={() => {
            setShowDetails(false);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
};

export default Quotations;
