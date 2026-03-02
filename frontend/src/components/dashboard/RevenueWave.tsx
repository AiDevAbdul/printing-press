import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { motion } from 'framer-motion';

export default function RevenueWave() {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-trend'],
    queryFn: dashboardService.getRevenueTrend,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8 mb-8">
        <div className="animate-shimmer h-64"></div>
      </div>
    );
  }

  const chartData = revenueData || [];
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Revenue Wave
          </h2>
          <p className="text-gray-400 text-sm">Last 7 days financial pulse</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total (7 days)</div>
          <div className="text-3xl font-bold text-green-400 font-mono">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Avg: ₹{Math.round(avgRevenue).toLocaleString()}/day
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 14, 39, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}
            itemStyle={{ color: '#00D9FF', fontFamily: 'JetBrains Mono, monospace' }}
            formatter={(value: number | undefined) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00D9FF"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Target Line Indicator */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-green-400"></div>
          <span className="text-gray-400">Revenue Trend</span>
        </div>
      </div>
    </motion.div>
  );
}
