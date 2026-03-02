import { useQuery } from '@tanstack/react-query';
import { qualityService } from '../../services/quality.service';

const QualityMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['quality-metrics'],
    queryFn: () => qualityService.getMetrics(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-8 text-gray-500">No metrics available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">First Pass Yield</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.first_pass_yield}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.passed_inspections} / {metrics.total_inspections} passed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Inspections</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.total_inspections}</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.failed_inspections} failed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Rejection Rate</h3>
          <p className="text-3xl font-bold text-red-600">{metrics.rejection_rate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.total_rejections} total rejections
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Open Complaints</h3>
          <p className="text-3xl font-bold text-orange-600">{metrics.open_complaints}</p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.total_complaints} total complaints
          </p>
        </div>
      </div>

      {/* Defects by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Defects by Category</h3>
        {metrics.defects_by_category && metrics.defects_by_category.length > 0 ? (
          <div className="space-y-3">
            {metrics.defects_by_category.map((item: any) => (
              <div key={item.category} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {item.category.replace('_', ' ').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${(item.count / Math.max(...metrics.defects_by_category.map((d: any) => d.count))) * 100}%`,
                      }}
                    >
                      <span className="text-xs font-medium text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No defect data available</p>
        )}
      </div>

      {/* Quality Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600">Passed Inspections</p>
            <p className="text-2xl font-bold text-green-600">{metrics.passed_inspections}</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-gray-600">Failed Inspections</p>
            <p className="text-2xl font-bold text-red-600">{metrics.failed_inspections}</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Total Rejections</p>
            <p className="text-2xl font-bold text-orange-600">{metrics.total_rejections}</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <p className="text-sm text-gray-600">Total Complaints</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.total_complaints}</p>
          </div>
        </div>
      </div>

      {/* Quality Performance Indicator */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">First Pass Yield</span>
              <span className="text-sm font-medium">{metrics.first_pass_yield}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  metrics.first_pass_yield >= 90
                    ? 'bg-green-600'
                    : metrics.first_pass_yield >= 70
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${metrics.first_pass_yield}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Target: 90% | Current: {metrics.first_pass_yield}%
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Rejection Rate</span>
              <span className="text-sm font-medium">{metrics.rejection_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  metrics.rejection_rate <= 5
                    ? 'bg-green-600'
                    : metrics.rejection_rate <= 10
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(metrics.rejection_rate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Target: &lt;5% | Current: {metrics.rejection_rate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMetrics;
