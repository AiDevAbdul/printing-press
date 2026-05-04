import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { ProductionJob, ProductionJobStatus } from '../../types';

const STAGES = [
  { id: 'queued', label: 'Queued', icon: '⏳' },
  { id: 'printing', label: 'Printing', icon: '🖨️' },
  { id: 'die_cutting', label: 'Die Cutting', icon: '✂️' },
  { id: 'lamination', label: 'Lamination', icon: '📄' },
  { id: 'uv_coating', label: 'UV Coating', icon: '✨' },
  { id: 'completed', label: 'Completed', icon: '✅' },
];

export default function FlowStream() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['production-flow'],
    queryFn: dashboardService.getProductionFlow,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8 mb-8">
        <div className="animate-shimmer h-32"></div>
      </div>
    );
  }

  // Group jobs by stage
  const jobsByStage = jobs?.reduce((acc, job) => {
    const stage = job.current_stage || 'queued';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(job);
    return acc;
  }, {} as Record<string, ProductionJob[]>) || {};

  const getStatusColor = (status: ProductionJobStatus) => {
    switch (status) {
      case ProductionJobStatus.IN_PROGRESS:
        return 'bg-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.6)]';
      case ProductionJobStatus.QUEUED:
        return 'bg-yellow-400 shadow-[0_0_20px_rgba(255,214,10,0.6)]';
      case ProductionJobStatus.PAUSED:
        return 'bg-magenta-400 shadow-[0_0_20px_rgba(255,0,110,0.6)]';
      case ProductionJobStatus.COMPLETED:
        return 'bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="glass-card rounded-xl p-8 mb-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Production Flow Stream
        </h2>
        <a
          href="/production"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
        >
          View All →
        </a>
      </div>

      {/* Flow Visualization */}
      <div className="relative min-w-[800px] overflow-x-auto pb-4">
        {/* Stage Nodes */}
        <div className="flex items-center justify-between mb-8 px-4">
          {STAGES.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-1">
              {/* Stage Node */}
              <div className="flex flex-col items-center">
                <div className="glass-card rounded-full w-20 h-20 flex items-center justify-center border-2 border-cyan-500/30 mb-2 transition-all hover:scale-110 hover:border-cyan-400">
                  <span className="text-3xl">{stage.icon}</span>
                </div>
                <span className="text-xs text-gray-300 font-medium text-center">{stage.label}</span>
                <span className="text-xs text-cyan-400 font-mono mt-1">
                  {jobsByStage[stage.id]?.length || 0}
                </span>
              </div>

              {/* Connecting Line */}
              {index < STAGES.length - 1 && (
                <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500/30 to-cyan-500/10 mx-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-transparent animate-pulse-glow"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Job Pulses */}
        <div className="relative h-24">
          {STAGES.flatMap((stage, stageIndex) => {
            const stageJobs = jobsByStage[stage.id] || [];
            const stageWidth = 100 / STAGES.length;
            const stageCenter = stageWidth * stageIndex + stageWidth / 2;

            return stageJobs.slice(0, 3).map((job, jobIndex) => {
              const offset = (jobIndex - 1) * 15; // Spread jobs vertically

              return (
                <div
                  key={job.id}
                  className="absolute transition-all duration-1000 ease-in-out group cursor-pointer"
                  style={{
                    left: `${stageCenter}%`,
                    top: `${50 + offset}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`${job.job_number} - ${job.order.product_name}`}
                >
                  {/* Job Pulse */}
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(job.status)} animate-pulse`}>
                    {/* Ripple Effect */}
                    <div className={`absolute inset-0 rounded-full ${getStatusColor(job.status)} animate-ping opacity-75`}></div>
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="glass-card rounded-lg p-3 whitespace-nowrap text-xs">
                      <div className="text-white font-bold font-mono">{job.job_number}</div>
                      <div className="text-gray-300">{job.order.product_name}</div>
                      <div className="text-cyan-400 mt-1">{job.inline_status || job.status}</div>
                      {job.progress_percent !== undefined && (
                        <div className="text-yellow-400 font-mono">{job.progress_percent}% complete</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.6)]"></div>
            <span className="text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(255,214,10,0.6)]"></div>
            <span className="text-gray-400">Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-magenta-400 shadow-[0_0_10px_rgba(255,0,110,0.6)]"></div>
            <span className="text-gray-400">Paused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
            <span className="text-gray-400">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
