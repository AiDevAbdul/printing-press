import { useState, useEffect } from 'react';
import { Download, TrendingDown, AlertCircle } from 'lucide-react';
import { wastageService } from '../../services/wastage.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wastage Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze production wastage</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wastage Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze production wastage</p>
        </div>
        <Card variant="outlined" className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available</p>
        </Card>
      </div>
    );
  }

  const wastageByType = analytics.wastageByType || [];
  const wastageByStage = analytics.wastageByStage || [];
  const totalWastage = analytics.summary?.totalWastage || 0;
  const totalCost = analytics.summary?.totalCost || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wastage Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze production wastage</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Download className="w-4 h-4" />}
          onClick={() => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            window.open(
              `${apiUrl}/export/wastage-analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
              '_blank'
            );
          }}
        >
          Export Excel
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Wastage</p>
            <p className="text-3xl font-bold text-red-600">{totalWastage}</p>
            <p className="text-xs text-gray-500">incidents</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Cost</p>
            <p className="text-3xl font-bold text-red-600">₹{totalCost.toLocaleString()}</p>
            <p className="text-xs text-gray-500">estimated loss</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Avg Cost/Incident</p>
            <p className="text-3xl font-bold text-orange-600">₹{Math.round(totalCost / totalWastage)}</p>
            <p className="text-xs text-gray-500">per incident</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Reduction Target</p>
            <p className="text-3xl font-bold text-green-600">25%</p>
            <p className="text-xs text-gray-500">target reduction</p>
          </div>
        </Card>
      </div>

      {/* Wastage by Type */}
      <Card variant="elevated">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Wastage by Type</h3>
          {wastageByType.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No wastage data available for this period</p>
          ) : (
            <div className="space-y-3">
              {wastageByType.map((item: any) => (
                <div key={item.type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                    <span className="text-sm text-gray-600">
                      {item.count} incidents | ₹{item.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-red-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
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
      </Card>

      {/* Wastage by Stage */}
      <Card variant="elevated">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Wastage by Production Stage</h3>
          {wastageByStage.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stage data available for this period</p>
          ) : (
            <div className="space-y-3">
              {wastageByStage.map((item: any) => (
                <div key={item.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                    <span className="text-sm text-gray-600">
                      {item.quantity} units | ₹{item.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-orange-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
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
      </Card>

      {/* Cost Analysis & Reduction Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="elevated">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
            <div className="space-y-3">
              {wastageByType.map((item: any) => (
                <div key={item.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{item.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
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
        </Card>

        <Card variant="elevated">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reduction Targets</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Current Wastage Rate</span>
                  <span className="text-sm font-medium text-gray-700">8.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="bg-red-600 h-4 rounded-full transition-all" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Target Wastage Rate</span>
                  <span className="text-sm font-medium text-green-600">6.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: '65%' }} />
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
        </Card>
      </div>

      {/* Trends */}
      <Card variant="elevated">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Wastage Trends</h3>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Trend chart would be displayed here with historical data</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WastageAnalytics;
