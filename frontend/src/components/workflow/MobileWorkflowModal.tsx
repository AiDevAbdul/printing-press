import { useEffect, useState } from 'react';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import workflowService, { WorkflowResponse } from '../../services/workflow.service';
import { StageStatusBadge } from './StageStatusBadge';
import { DurationDisplay } from './DurationDisplay';
import { WorkflowStageActions } from './WorkflowStageActions';

interface MobileWorkflowModalProps {
  jobId: string;
  operatorId?: string;
  operatorName?: string;
  machine?: string;
  onClose: () => void;
  allJobIds: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function MobileWorkflowModal({
  jobId,
  operatorId,
  operatorName,
  machine,
  onClose,
  allJobIds,
  currentIndex,
  onNavigate,
}: MobileWorkflowModalProps) {
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllStages, setShowAllStages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const swipeRef = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentIndex < allJobIds.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    },
    onSwipeDown: () => {
      handleRefresh();
    },
  });

  useEffect(() => {
    fetchWorkflow();
    const interval = setInterval(fetchWorkflow, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.getWorkflowStages(jobId);
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWorkflow();
  };

  const currentStage = workflow?.stages.find(
    s => s.status === 'in_progress' || s.status === 'paused'
  );

  const completedCount = workflow?.stages.filter(s => s.status === 'completed').length || 0;
  const totalCount = workflow?.stages.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
          <button
            onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="text-2xl disabled:opacity-30"
          >
            ‹
          </button>
          <div className="text-center">
            <div className="text-sm opacity-90">Job {currentIndex + 1} of {allJobIds.length}</div>
            <div className="font-bold">Workflow</div>
          </div>
          <button
            onClick={() => currentIndex < allJobIds.length - 1 && onNavigate(currentIndex + 1)}
            disabled={currentIndex === allJobIds.length - 1}
            className="text-2xl disabled:opacity-30"
          >
            ›
          </button>
          <button onClick={onClose} className="text-2xl ml-4">
            ×
          </button>
        </div>

        {/* Content */}
        <div ref={swipeRef} className="flex-1 overflow-y-auto p-4">
          {isRefreshing && (
            <div className="text-center text-sm text-gray-500 mb-2">Refreshing...</div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading workflow...</div>
          ) : !workflow ? (
            <div className="text-center py-8 text-red-500">Failed to load workflow</div>
          ) : (
            <>
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Operator:</span> {operatorName || 'Not assigned'}
                  </div>
                  <div>
                    <span className="font-medium">Machine:</span> {machine || 'Not assigned'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{completedCount}/{totalCount} stages ({Math.round(progressPercentage)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Current Stage */}
              {currentStage && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-300">
                  <div className="text-xs text-gray-500 mb-2">CURRENT STAGE</div>
                  <h3 className="text-2xl font-bold mb-3">{currentStage.stage_name}</h3>
                  <div className="mb-4">
                    <StageStatusBadge status={currentStage.status} size="lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    {currentStage.status === 'in_progress' && (
                      <>
                        <div>
                          <div className="text-gray-600">Duration</div>
                          <div className="font-bold text-lg">
                            <DurationDisplay minutes={currentStage.active_duration_minutes} />
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Started</div>
                          <div className="font-medium">
                            {currentStage.started_at
                              ? new Date(currentStage.started_at).toLocaleTimeString()
                              : '-'}
                          </div>
                        </div>
                      </>
                    )}
                    {currentStage.status === 'paused' && currentStage.pause_reason && (
                      <div className="col-span-2">
                        <div className="text-gray-600">Pause Reason</div>
                        <div className="font-medium">{currentStage.pause_reason}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <WorkflowStageActions
                    stage={currentStage}
                    jobId={jobId}
                    operatorId={operatorId}
                    operatorName={operatorName}
                    machine={machine}
                    onSuccess={fetchWorkflow}
                    touchOptimized={true}
                  />
                </div>
              )}

              {/* All Stages Accordion */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAllStages(!showAllStages)}
                  className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between text-left font-medium"
                >
                  <span>All Stages ({totalCount})</span>
                  <span className="text-xl">{showAllStages ? '▲' : '▼'}</span>
                </button>

                {showAllStages && (
                  <div className="divide-y">
                    {workflow.stages.map((stage) => (
                      <div key={stage.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs text-gray-500">Stage {stage.stage_order}</div>
                            <div className="font-bold">{stage.stage_name}</div>
                          </div>
                          <StageStatusBadge status={stage.status} size="sm" />
                        </div>

                        {stage.status === 'completed' && (
                          <div className="text-sm text-gray-600 mt-2">
                            <div>
                              Duration:{' '}
                              <DurationDisplay minutes={stage.total_duration_minutes || 0} />
                            </div>
                            {stage.waste_quantity && (
                              <div>Waste: {stage.waste_quantity} units</div>
                            )}
                          </div>
                        )}

                        {stage.status === 'in_progress' && (
                          <div className="text-sm text-gray-600 mt-2">
                            <div>
                              Duration:{' '}
                              <DurationDisplay minutes={stage.active_duration_minutes} />
                            </div>
                          </div>
                        )}

                        {stage.status === 'pending' && (
                          <div className="text-sm text-gray-400 italic mt-2">
                            {stage.can_start ? 'Ready to start' : 'Waiting...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swipe hint */}
              <div className="text-center text-xs text-gray-400 mt-6">
                Swipe left/right to navigate • Pull down to refresh
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
