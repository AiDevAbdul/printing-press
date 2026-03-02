import { useState } from 'react';

const WastageAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Mock data for demonstration
  const wastageByType = [
    { type: 'Setup Waste', count: 45, cost: 12500 },
    { type: 'Production Waste', count: 78, cost: 23400 },
    { type: 'Quality Rejection', count: 32, cost: 18900 },
    { type: 'Machine Error', count: 23, cost: 15600 },
    { type: 'Material Defect', count: 15, cost: 8700 },
    { type: 'Other', count: 12, cost: 4200 },
  ];

  const wastageByStage = [
    { stage: 'Printing', quantity: 1250, cost: 35000 },
    { stage: 'Die Cutting', quantity: 890, cost: 22000 },
    { stage: 'Lamination', quantity: 650, cost: 18000 },
    { stage: 'UV Coating', quantity: 420, cost: 12000 },
    { stage: 'Pasting', quantity: 280, cost: 8000 },
  ];

  const totalWastage = wastageByType.reduce((sum, item) => sum + item.count, 0);
  const totalCost = wastageByType.reduce((sum, item) => sum + item.cost, 0);

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
        <div className="space-y-3">
          {wastageByType.map((item) => (
            <div key={item.type}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.type}</span>
                <span className="text-sm text-gray-600">
                  {item.count} incidents | ₹{item.cost.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-red-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.count / Math.max(...wastageByType.map((w) => w.count))) * 100}%`,
                  }}
                >
                  <span className="text-xs font-medium text-white">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wastage by Stage */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Wastage by Production Stage</h3>
        <div className="space-y-3">
          {wastageByStage.map((item) => (
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
                    width: `${(item.quantity / Math.max(...wastageByStage.map((w) => w.quantity))) * 100}%`,
                  }}
                >
                  <span className="text-xs font-medium text-white">{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            {wastageByType.map((item) => (
              <div key={item.type} className="flex justify-between items-center">
                <span className="text-sm">{item.type}</span>
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
