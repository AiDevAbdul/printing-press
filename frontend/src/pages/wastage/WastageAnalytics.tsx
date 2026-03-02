import { useState, useEffect } from 'react';
import { wastageService } from '../../services/wastage.service';

const WastageAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await wastageService.getAnalytics(dateRange.startDate, dateRange.endDate);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch wastage analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const wastageByType = analytics.wastageByType || [];
  const wastageByStage = analytics.wastageByStage || [];
  const totalWastage = analytics.summary?.totalWastage || 0;
  const totalCost = analytics.summary?.totalCost || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wastage Analytics</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <span className="py-2">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={() => {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
              window.open(
                `${apiUrl}/export/wastage-analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                '_blank'
              );
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Wastage</h3>
          <p className="text-3xl font-bold text-red-600">{totalWastage}</p>
          <p className="text-xs text-gray-500 mt-1">incidents</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Cost</h3>
          <p className="text-3xl font-bold text-red-600">₹{totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">estimated loss</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Cost/Incident</h3>
          <p className="text-3xl font-bold text-orange-600">₹{Math.round(totalCost / totalWastage)}</p>
          <p className="text-xs text-gray-500 mt-1">per incident</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Reduction Target</h3>
          <p className="text-3xl font-bold text-green-600">25%</p>
          <p className="text-xs text-gray-500 mt-1">target reduction</p>
        </div>
      </div>

      {/* Wastage by Type */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Wastage by Type</h3>
        {wastageByType.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No wastage data available for this period</p>
        ) : (
          <div className="space-y-3">
            {wastageByType.map((item: any) => (
              <div key={item.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} incidents | ₹{item.cost.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-red-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${(item.count / Math.max(...wastageByType.map((w: any) => w.count))) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-medium text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wastage by Stage */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Wastage by Production Stage</h3>
        {wastageByStage.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No stage data available for this period</p>
        ) : (
          <div className="space-y-3">
            {wastageByStage.map((item: any) => (
              <div key={item.stage}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.stage}</span>
                  <span className="text-sm text-gray-600">
                    {item.quantity} units | ₹{item.cost.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-orange-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${(item.quantity / Math.max(...wastageByStage.map((w: any) => w.quantity))) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-medium text-white">{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            {wastageByType.map((item: any) => (
              <div key={item.type} className="flex justify-between items-center">
                <span className="text-sm">{item.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{
                        width: `${(item.cost / totalCost) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">
                    ₹{item.cost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Reduction Targets</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Current Wastage Rate</span>
                <span className="text-sm font-medium">8.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-red-600 h-4 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Target Wastage Rate</span>
                <span className="text-sm font-medium text-green-600">6.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-600 h-4 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Achieving the target reduction of 25% would save approximately{' '}
                <span className="font-bold text-green-600">₹{Math.round(totalCost * 0.25).toLocaleString()}</span> per month.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trends (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Wastage Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Trend chart would be displayed here with historical data</p>
        </div>
      </div>
    </div>
  );
};

export default WastageAnalytics;
