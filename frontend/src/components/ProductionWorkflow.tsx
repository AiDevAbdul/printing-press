import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import workflowService, { WorkflowStage, WorkflowResponse } from '../services/workflow.service';

interface ProductionWorkflowProps {
  jobId: string;
  operatorName?: string;
  machine?: string;
  operatorId?: string;
}

const stageStatusColors = {
  pending: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 shadow-sm',
  in_progress: 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 shadow-md animate-pulse-slow',
  paused: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400 shadow-md',
  completed: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-sm',
};

const stageBadgeColors = {
  pending: 'bg-gray-500 text-white',
  in_progress: 'bg-green-500 text-white animate-pulse',
  paused: 'bg-orange-500 text-white',
  completed: 'bg-blue-500 text-white',
};

const formatDuration = (minutes: number): string => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const ProductionWorkflow: React.FC<ProductionWorkflowProps> = ({
  jobId,
  operatorName,
  machine: jobMachine,
  operatorId: jobOperatorId
}) => {
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchWorkflow();
    const interval = setInterval(fetchWorkflow, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.getWorkflowStages(jobId);
      setWorkflow(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      setLoading(false);
    }
  };

  const handleStartStage = async (stage: WorkflowStage) => {
    if (!jobOperatorId || !jobMachine) {
      toast.error('Job must have an assigned operator and machine');
      return;
    }

    try {
      await workflowService.startStage(jobId, stage.id, {
        operator_id: jobOperatorId,
        machine: jobMachine,
      });
      toast.success(`${stage.stage_name} started`);
      await fetchWorkflow();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start stage');
    }
  };

  const handlePauseStage = async (stage: WorkflowStage) => {
    try {
      await workflowService.pauseStage(jobId, stage.id, {
        reason: pauseReason,
      });
      toast.success(`${stage.stage_name} paused`);
      setShowPauseDialog(false);
      setPauseReason('');
      setActiveStageId(null);
      await fetchWorkflow();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to pause stage');
    }
  };

  const handleResumeStage = async (stage: WorkflowStage) => {
    try {
      await workflowService.resumeStage(jobId, stage.id);
      toast.success(`${stage.stage_name} resumed`);
      await fetchWorkflow();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume stage');
    }
  };

  const handleCompleteStage = async (stage: WorkflowStage) => {
    try {
      await workflowService.completeStage(jobId, stage.id, {
        waste_quantity: wasteQuantity ? Number(wasteQuantity) : undefined,
        notes,
      });
      toast.success(`${stage.stage_name} completed`);
      setShowCompleteDialog(false);
      setWasteQuantity('');
      setNotes('');
      setActiveStageId(null);
      await fetchWorkflow();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete stage');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading workflow...</div>;
  }

  if (!workflow) {
    return <div className="text-center py-8 text-red-600">Failed to load workflow</div>;
  }

  const completedCount = workflow.stages.filter(s => s.status === 'completed').length;
  const totalStages = workflow.stages.length;
  const progressPercent = (completedCount / totalStages) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Production Workflow</h2>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-bold">{completedCount} / {totalStages} stages</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Operator</div>
            <div className="font-semibold truncate">{operatorName || 'Not assigned'}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Machine</div>
            <div className="font-semibold truncate">{jobMachine || 'Not assigned'}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Current Stage</div>
            <div className="font-semibold truncate">{workflow.current_stage || 'Not started'}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {workflow.stages.map((stage, index) => {
          const isActive = stage.status === 'in_progress';
          const isCompleted = stage.status === 'completed';
          const isPending = stage.status === 'pending';

          return (
            <div
              key={stage.id}
              className={`border-2 rounded-xl p-5 transition-all duration-300 ${stageStatusColors[stage.status]} ${
                isActive ? 'scale-[1.02] ring-2 ring-green-400' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {/* Stage Number Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    isCompleted ? 'bg-blue-500 text-white' :
                    isActive ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : stage.stage_order}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {stage.stage_name}
                    </h3>
                    {index > 0 && isPending && !workflow.stages[index - 1] && (
                      <p className="text-xs text-gray-500 mt-1">Waiting for previous stage</p>
                    )}
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${stageBadgeColors[stage.status]}`}>
                  {stage.status.replace('_', ' ')}
                </span>
              </div>

            {stage.status === 'in_progress' && (
              <div className="bg-white rounded-lg p-4 mb-4 shadow-inner border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    <div>
                      <div className="text-xs text-gray-500">Machine</div>
                      <div className="font-semibold text-gray-800">{stage.machine || 'Not assigned'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="text-xs text-gray-500">Operator</div>
                      <div className="font-semibold text-gray-800">{stage.operator_name || 'Not assigned'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-semibold text-green-600">{formatDuration(stage.active_duration_minutes)}</div>
                    </div>
                  </div>
                  {stage.started_at && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🕐</span>
                      <div>
                        <div className="text-xs text-gray-500">Started</div>
                        <div className="font-semibold text-gray-800">{new Date(stage.started_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {stage.status === 'paused' && (
              <div className="bg-orange-50 rounded-lg p-4 mb-4 border-l-4 border-orange-500">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">⏸️</span>
                  <div className="flex-1">
                    <div className="text-xs text-orange-600 font-semibold mb-1">PAUSED</div>
                    <div className="text-sm text-gray-700">{stage.pause_reason || 'No reason provided'}</div>
                  </div>
                </div>
              </div>
            )}

            {stage.status === 'completed' && (
              <div className="bg-white rounded-lg p-4 mb-4 shadow-inner border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="text-xs text-gray-500">Total Duration</div>
                      <div className="font-semibold text-blue-600">{formatDuration(stage.total_duration_minutes || 0)}</div>
                    </div>
                  </div>
                  {stage.waste_quantity !== undefined && stage.waste_quantity !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">♻️</span>
                      <div>
                        <div className="text-xs text-gray-500">Waste Quantity</div>
                        <div className="font-semibold text-gray-800">{stage.waste_quantity}</div>
                      </div>
                    </div>
                  )}
                </div>
                {stage.notes && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <div className="text-sm text-gray-700 italic">{stage.notes}</div>
                  </div>
                )}
              </div>
            )}

            {stage.status === 'pending' && (
              <button
                onClick={() => handleStartStage(stage)}
                disabled={!stage.can_start || !jobOperatorId || !jobMachine}
                className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 transform ${
                  stage.can_start && jobOperatorId && jobMachine
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {stage.can_start && jobOperatorId && jobMachine ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">▶️</span>
                    Start Stage
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🔒</span>
                    {!jobOperatorId || !jobMachine ? 'Assign Operator & Machine' : 'Complete Previous Stage'}
                  </span>
                )}
              </button>
            )}

            {stage.status === 'in_progress' && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setShowPauseDialog(true);
                  }}
                  disabled={!stage.can_pause}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 transform ${
                    stage.can_pause
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">⏸️</span>
                    Pause
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setShowCompleteDialog(true);
                  }}
                  disabled={!stage.can_complete}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 transform ${
                    stage.can_complete
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">✅</span>
                    Complete
                  </span>
                </button>
              </div>
            )}

            {stage.status === 'paused' && (
              <button
                onClick={() => handleResumeStage(stage)}
                className="w-full py-3 px-6 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl">▶️</span>
                  Resume Stage
                </span>
              </button>
            )}
            </div>
          );
        })}
      </div>

      {/* Pause Dialog */}
      {showPauseDialog && activeStageId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Pause Stage</h3>
            <textarea
              placeholder="Reason for pause (optional)"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPauseDialog(false);
                  setPauseReason('');
                  setActiveStageId(null);
                }}
                className="flex-1 py-2 px-4 rounded font-medium bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const stage = workflow.stages.find((s) => s.id === activeStageId);
                  if (stage) {
                    handlePauseStage(stage);
                  }
                }}
                className="flex-1 py-2 px-4 rounded font-medium bg-orange-500 text-white hover:bg-orange-600"
              >
                Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Dialog */}
      {showCompleteDialog && activeStageId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Complete Stage</h3>
            <input
              type="number"
              placeholder="Waste Quantity (optional)"
              value={wasteQuantity}
              onChange={(e) => setWasteQuantity(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3 text-sm"
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCompleteDialog(false);
                  setWasteQuantity('');
                  setNotes('');
                  setActiveStageId(null);
                }}
                className="flex-1 py-2 px-4 rounded font-medium bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const stage = workflow.stages.find((s) => s.id === activeStageId);
                  if (stage) {
                    handleCompleteStage(stage);
                  }
                }}
                className="flex-1 py-2 px-4 rounded font-medium bg-blue-500 text-white hover:bg-blue-600"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionWorkflow;
