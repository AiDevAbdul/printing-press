import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import workflowService, { WorkflowResponse } from '../../services/workflow.service';
import { MiniTimeline } from './MiniTimeline';

interface ExpandableJobRowProps {
  job: any; // ProductionJob type
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExpandableJobRow({ job }: ExpandableJobRowProps) {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch workflow on mount for mini timeline
  useEffect(() => {
    fetchWorkflow();
  }, []);

  const fetchWorkflow = async () => {
    setLoading(true);
    try {
      const data = await workflowService.getWorkflowStages(job.id);
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = () => {
    navigate(`/workflow/${job.id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <td className="px-4 py-3 text-sm font-medium">{job.job_number}</td>
      <td className="px-4 py-3 text-sm">{job.order?.order_number || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{job.product_name}</td>
      <td className="px-4 py-3 text-sm">{job.quantity}</td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${job.inline_status === 'pending' ? 'bg-gray-100 text-gray-700' : ''}
            ${job.inline_status === 'in_progress' ? 'bg-green-100 text-green-700' : ''}
            ${job.inline_status === 'paused' ? 'bg-orange-100 text-orange-700' : ''}
            ${job.inline_status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
          `}
        >
          {job.inline_status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{job.operator_name || 'Not assigned'}</td>
      <td className="px-4 py-3 text-sm">{job.machine || 'Not assigned'}</td>

      {/* Mini Timeline Column */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {workflow && workflow.stages.length > 0 ? (
          <div className="w-[200px]">
            <MiniTimeline stages={workflow.stages} compact={true} />
          </div>
        ) : (
          <div className="text-xs text-gray-400">
            {loading ? 'Loading...' : 'Click to view'}
          </div>
        )}
      </td>
    </tr>
  );
}
