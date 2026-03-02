import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qualityService } from '../../services/quality.service';
import InspectionForm from './InspectionForm';
import DefectForm from './DefectForm';
import RejectionForm from './RejectionForm';
import ComplaintForm from './ComplaintForm';
import QualityMetrics from './QualityMetrics';

const Quality = () => {
  const [activeTab, setActiveTab] = useState<string>('inspections');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const { data: inspections, isLoading: loadingInspections } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => qualityService.getInspections(),
    enabled: activeTab === 'inspections',
  });

  const { data: rejections, isLoading: loadingRejections } = useQuery({
    queryKey: ['rejections'],
    queryFn: () => qualityService.getRejections(),
    enabled: activeTab === 'rejections',
  });

  const { data: complaints, isLoading: loadingComplaints } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => qualityService.getComplaints(),
    enabled: activeTab === 'complaints',
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      open: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'inspections', label: 'Inspections' },
    { id: 'rejections', label: 'Rejections' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'metrics', label: 'Metrics' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quality Control</h1>
        <div className="space-x-2">
          {activeTab === 'inspections' && (
            <button
              onClick={() => setShowInspectionForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Inspection
            </button>
          )}
          {activeTab === 'rejections' && (
            <button
              onClick={() => setShowRejectionForm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Record Rejection
            </button>
          )}
          {activeTab === 'complaints' && (
            <button
              onClick={() => setShowComplaintForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              New Complaint
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div>
          {loadingInspections ? (
            <div className="text-center py-8">Loading...</div>
          ) : !inspections?.data || inspections.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No inspections found</div>
          ) : (
            <div className="bg-white shadow-md rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inspection #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Checkpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Defects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inspector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspections.data.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inspection.inspection_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.checkpoint.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(inspection.status)}`}>
                          {inspection.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.defects_found || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.inspector.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inspection.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rejections Tab */}
      {activeTab === 'rejections' && (
        <div>
          {loadingRejections ? (
            <div className="text-center py-8">Loading...</div>
          ) : !rejections?.data || rejections.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No rejections found</div>
          ) : (
            <div className="bg-white shadow-md rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rejection #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Disposition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rejections.data.map((rejection) => (
                    <tr key={rejection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rejection.rejection_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rejection.rejected_quantity} {rejection.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rejection.disposition.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rejection.estimated_loss ? `₹${rejection.estimated_loss}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${rejection.is_resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {rejection.is_resolved ? 'RESOLVED' : 'OPEN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rejection.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && (
        <div>
          {loadingComplaints ? (
            <div className="text-center py-8">Loading...</div>
          ) : !complaints?.data || complaints.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No complaints found</div>
          ) : (
            <div className="bg-white shadow-md rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Complaint #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.data.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.complaint_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.customer.company_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {complaint.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          complaint.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          complaint.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(complaint.status)}`}>
                          {complaint.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && <QualityMetrics />}

      {/* Modals */}
      {showInspectionForm && (
        <InspectionForm onClose={() => setShowInspectionForm(false)} />
      )}
      {showDefectForm && (
        <DefectForm onClose={() => setShowDefectForm(false)} />
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
