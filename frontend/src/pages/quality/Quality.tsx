import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardCheck, AlertCircle, XCircle, BarChart3 } from 'lucide-react';
import { qualityService } from '../../services/quality.service';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { InspectionsGrid } from './InspectionsGrid';
import { ComplaintsGrid } from './ComplaintsGrid';
import { RejectionsGrid } from './RejectionsGrid';
import InspectionForm from './InspectionForm';
import RejectionForm from './RejectionForm';
import ComplaintForm from './ComplaintForm';
import QualityMetrics from './QualityMetrics';

const Quality = () => {
  const [activeTab, setActiveTab] = useState<string>('inspections');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const { data: inspectionsData, isLoading: loadingInspections } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => qualityService.getInspections(),
    enabled: activeTab === 'inspections',
  });

  const { data: rejectionsData, isLoading: loadingRejections } = useQuery({
    queryKey: ['rejections'],
    queryFn: () => qualityService.getRejections(),
    enabled: activeTab === 'rejections',
  });

  const { data: complaintsData, isLoading: loadingComplaints } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => qualityService.getComplaints(),
    enabled: activeTab === 'complaints',
  });

  const inspections = inspectionsData?.data || [];
  const rejections = rejectionsData?.data || [];
  const complaints = complaintsData?.data || [];

  const filteredInspections = inspections.filter((i) =>
    i.inspection_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.checkpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRejections = rejections.filter((r) =>
    r.rejection_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComplaints = complaints.filter((c) =>
    c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabsConfig = [
    {
      id: 'inspections',
      label: 'Inspections',
      icon: <ClipboardCheck className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <InspectionsGrid
            inspections={filteredInspections}
            isLoading={loadingInspections}
          />
        </div>
      ),
    },
    {
      id: 'rejections',
      label: 'Rejections',
      icon: <XCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <RejectionsGrid
            rejections={filteredRejections}
            isLoading={loadingRejections}
          />
        </div>
      ),
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: <AlertCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <ComplaintsGrid
            complaints={filteredComplaints}
            isLoading={loadingComplaints}
          />
        </div>
      ),
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: <BarChart3 className="w-4 h-4" />,
      content: <QualityMetrics />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-gray-600 mt-1">Manage inspections, rejections, and complaints</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'inspections' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowInspectionForm(true)}
            >
              New Inspection
            </Button>
          )}
          {activeTab === 'rejections' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowRejectionForm(true)}
            >
              Record Rejection
            </Button>
          )}
          {activeTab === 'complaints' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowComplaintForm(true)}
            >
              New Complaint
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar (for non-metrics tabs) */}
      {activeTab !== 'metrics' && (
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        defaultTab="inspections"
        onChange={setActiveTab}
      />

      {/* Modals */}
      {showInspectionForm && (
        <InspectionForm onClose={() => setShowInspectionForm(false)} />
      )}
      {showRejectionForm && (
        <RejectionForm onClose={() => setShowRejectionForm(false)} />
      )}
      {showComplaintForm && (
        <ComplaintForm onClose={() => setShowComplaintForm(false)} />
      )}
    </div>
  );
};

export default Quality;
