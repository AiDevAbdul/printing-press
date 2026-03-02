import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopFloorService } from '../../services/shop-floor.service';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [showStartStage, setShowStartStage] = useState(false);
  const [showCompleteStage, setShowCompleteStage] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => shopFloorService.getMyActiveJobs().then(jobs => jobs.find(j => j.id === id)),
    refetchInterval: 10000,
  });

  const { data: materials } = useQuery({
    queryKey: ['materials', id],
    queryFn: () => shopFloorService.getMaterialConsumption(id!),
    enabled: !!id,
  });

  const { data: wastage } = useQuery({
    queryKey: ['wastage', id],
    queryFn: () => shopFloorService.getWastageRecords(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!job) {
    return <div className="p-4">Job not found</div>;
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'materials', label: 'Materials' },
    { id: 'wastage', label: 'Wastage' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="p-4">
          <button
            onClick={() => navigate('/shop-floor')}
            className="text-blue-600 mb-2 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold">{job.job_number}</h1>
          <p className="text-sm text-gray-600">{job.order.product_name}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Job Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{job.order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{job.order.customer.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{job.status.replace('_', ' ').toUpperCase()}</span>
                </div>
                {job.current_stage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stage:</span>
                    <span className="font-medium">{job.current_stage}</span>
                  </div>
                )}
                {job.assigned_machine && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Machine:</span>
                    <span className="font-medium">{job.assigned_machine}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">{job.inline_status}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!job.current_stage && (
                <button
                  onClick={() => setShowStartStage(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-lg"
                >
                  Start Stage
                </button>
              )}
              {job.current_stage && (
                <button
                  onClick={() => setShowCompleteStage(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium text-lg"
                >
                  Complete Stage
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/shop-floor/job/${id}/issue-material`)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              Issue Material
            </button>

            {materials && materials.length > 0 ? (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{material.material_name}</h3>
                        {material.material_code && (
                          <p className="text-xs text-gray-600">{material.material_code}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          material.transaction_type === 'issue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {material.transaction_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">By:</span>
                        <span>{material.issued_by.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{new Date(material.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No materials issued yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'wastage' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/shop-floor/job/${id}/record-wastage`)}
              className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium"
            >
              Record Wastage
            </button>

            {wastage && wastage.length > 0 ? (
              <div className="space-y-2">
                {wastage.map((record) => (
                  <div key={record.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {record.wastage_type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <span className="text-lg font-bold text-red-600">
                        {record.quantity} {record.unit}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {record.estimated_cost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium">₹{record.estimated_cost}</span>
                        </div>
                      )}
                      {record.reason && (
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <p className="mt-1">{record.reason}</p>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Recorded by:</span>
                        <span>{record.recorded_by.full_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No wastage recorded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
