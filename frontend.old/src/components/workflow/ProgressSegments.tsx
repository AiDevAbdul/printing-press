import React from 'react';
import { WorkflowStage } from '../../services/workflow.service';

interface ProgressSegmentsProps {
  stages: WorkflowStage[];
}

const statusColors: { [key: string]: string } = {
  completed: 'bg-blue-500',
  in_progress: 'bg-green-500',
  paused: 'bg-orange-500',
  pending: 'bg-gray-300',
};

const statusLabels: { [key: string]: string } = {
  completed: 'Completed',
  in_progress: 'In Progress',
  paused: 'Paused',
  pending: 'Pending',
};

export const ProgressSegments: React.FC<ProgressSegmentsProps> = ({ stages }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Stage Progress</span>
        <span className="text-sm font-bold text-white">
          {stages.filter(s => s.status === 'completed').length} / {stages.length}
        </span>
      </div>

      {/* Colored Segments */}
      <div className="flex gap-1 items-center">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="relative flex-1 group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Segment */}
            <div
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
                statusColors[stage.status]
              } ${
                stage.status === 'in_progress' ? 'animate-pulse' : ''
              } ${
                hoveredIndex === index ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-600' : ''
              }`}
            />

            {/* Tooltip */}
            {hoveredIndex === index && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
                {stage.stage_name}
                <div className="text-xs opacity-75">{statusLabels[stage.status]}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-white opacity-90 capitalize">{statusLabels[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSegments;
