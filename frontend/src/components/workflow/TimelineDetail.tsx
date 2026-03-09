import { useEffect, useRef, useState } from 'react';
import { WorkflowStage } from '../../services/workflow.service';
import { StageStatusBadge } from './StageStatusBadge';
import { DurationDisplay } from './DurationDisplay';
import { WorkflowStageActions } from './WorkflowStageActions';

interface TimelineDetailProps {
  jobId: string;
  stages: WorkflowStage[];
  operatorId?: string;
  operatorName?: string;
  machine?: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function TimelineDetail({
  jobId,
  stages,
  operatorId,
  operatorName,
  machine,
  onClose,
  onRefresh,
}: TimelineDetailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Auto-scroll to current stage on mount
  useEffect(() => {
    const currentStageIndex = stages.findIndex(
      s => s.status === 'in_progress' || s.status === 'paused'
    );

    if (currentStageIndex !== -1 && scrollContainerRef.current) {
      const stageCards = scrollContainerRef.current.querySelectorAll('.stage-card');
      const currentCard = stageCards[currentStageIndex] as HTMLElement;

      if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [stages]);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const currentStage = stages.find(s => s.status === 'in_progress' || s.status === 'paused');

  return (
    <div className="bg-white border-t-2 border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Production Workflow</h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            <span>Operator: {operatorName || 'Not assigned'}</span>
            <span>Machine: {machine || 'Not assigned'}</span>
            {currentStage && (
              <span className="font-medium text-gray-900">
                Current: {currentStage.stage_name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          title="Collapse"
        >
          ×
        </button>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            ‹
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            ›
          </button>
        )}

        {/* Scrollable stage cards */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-4 px-12 -mx-12"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => {
              const isActive = stage.status === 'in_progress' || stage.status === 'paused';

              return (
                <div
                  key={stage.id}
                  className={`
                    stage-card flex-shrink-0 w-[200px] border-2 rounded-xl p-4
                    transition-all duration-300
                    ${isActive ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
                    ${stage.status === 'completed' ? 'bg-blue-50' : 'bg-white'}
                    ${stage.status === 'in_progress' ? 'bg-green-50' : ''}
                    ${stage.status === 'paused' ? 'bg-orange-50' : ''}
                  `}
                >
                  {/* Stage header */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Stage {stage.stage_order}</div>
                    <h4 className="font-bold text-sm mb-2">{stage.stage_name}</h4>
                    <StageStatusBadge status={stage.status} size="sm" />
                  </div>

                  {/* Stage metrics */}
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    {stage.status === 'in_progress' && (
                      <>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          <DurationDisplay minutes={stage.active_duration_minutes} format="short" />
                        </div>
                        <div>
                          <span className="font-medium">Operator:</span>{' '}
                          {stage.operator_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Machine:</span>{' '}
                          {stage.machine || 'N/A'}
                        </div>
                        {stage.started_at && (
                          <div>
                            <span className="font-medium">Started:</span>{' '}
                            {new Date(stage.started_at).toLocaleTimeString()}
                          </div>
                        )}
                      </>
                    )}

                    {stage.status === 'paused' && (
                      <>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          <DurationDisplay minutes={stage.active_duration_minutes} format="short" />
                        </div>
                        {stage.pause_reason && (
                          <div>
                            <span className="font-medium">Reason:</span>{' '}
                            {stage.pause_reason}
                          </div>
                        )}
                      </>
                    )}

                    {stage.status === 'completed' && (
                      <>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          <DurationDisplay minutes={stage.total_duration_minutes || 0} format="short" />
                        </div>
                        {stage.waste_quantity && (
                          <div>
                            <span className="font-medium">Waste:</span>{' '}
                            {stage.waste_quantity} units
                          </div>
                        )}
                        {stage.notes && (
                          <div>
                            <span className="font-medium">Notes:</span>{' '}
                            <div className="text-gray-500 mt-1 line-clamp-2">{stage.notes}</div>
                          </div>
                        )}
                      </>
                    )}

                    {stage.status === 'pending' && (
                      <div className="text-gray-400 italic">
                        {stage.can_start ? 'Ready to start' : 'Waiting for previous stage'}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {stage.status !== 'completed' && (
                    <WorkflowStageActions
                      stage={stage}
                      jobId={jobId}
                      operatorId={operatorId}
                      operatorName={operatorName}
                      machine={machine}
                      onSuccess={onRefresh}
                      touchOptimized={false}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
