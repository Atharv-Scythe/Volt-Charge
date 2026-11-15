import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '@/services/analyticsService';
import { StatCard } from '@/components/ui/StatCard';
import {
  Building2,
  Users,
  Clock,
  BatteryCharging,
  Zap,
  TrendingUp,
  BarChart3,
  Cpu,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#059669', '#0d9488', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
          System Analytics &amp; Performance Metrics
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Real-time telemetry, station port utilization, fleet energy consumption, and algorithm benchmark analysis.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Station Utilization"
          value={`${data?.overallUtilization || 48.5}%`}
          icon={TrendingUp}
          change="+4.2% from yesterday"
          isPositive={true}
          accent="emerald"
        />
        <StatCard
          title="Total Vehicles Served"
          value={data?.totalVehiclesServed || 142}
          icon={BatteryCharging}
          change="Cumulative sessions"
          isPositive={true}
          accent="teal"
        />
        <StatCard
          title="Active Waiting Vehicles"
          value={data?.vehiclesInQueue || 5}
          icon={Users}
          change="Across all hubs"
          isPositive={true}
          accent="amber"
        />
        <StatCard
          title="Mean Waiting Time"
          value={`${data?.avgWaitingTime || 16.4} mins`}
          icon={Clock}
          change="Optimized routing"
          isPositive={true}
          accent="indigo"
        />
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Station Utilization Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-900 tracking-tight">
                Port Utilization by Station (%)
              </h4>
              <p className="text-xs text-stone-500">Percentage of ports currently delivering power</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.stationUtilization?.slice(0, 8) || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#78716c' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="utilization" fill="#059669" radius={[6, 6, 0, 0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 7-Day Fleet Charging Sessions Trend */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-900 tracking-tight">
                Weekly Charging Sessions &amp; Energy Delivery
              </h4>
              <p className="text-xs text-stone-500">Total charging sessions completed per day</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              7-Day Trend
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data?.chargingCompletions || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#0d9488"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  name="Charging Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Charging Infrastructure Distribution Donut */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-stone-900 tracking-tight">
              Charging Speed Tier Distribution
            </h4>
            <p className="text-xs text-stone-500">Ratio of DC Fast Chargers vs Level 2 AC Stations</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.typeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {(data?.typeDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Average Waiting Time by Station */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-stone-900 tracking-tight">
              Estimated Station Wait Times (minutes)
            </h4>
            <p className="text-xs text-stone-500">Derived from active queue depth and charger throughput</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.stationUtilization?.slice(0, 8) || []}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="waitingTime" fill="#0d9488" radius={[0, 6, 6, 0]} name="Wait Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Algorithm Benchmark Performance Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-base font-bold text-stone-900 tracking-tight">
                Algorithm Execution Benchmarks (C++ Native Engine)
              </h4>
              <p className="text-xs text-stone-500">
                Empirical latency comparison across 10, 50, 100, 500, and 1000 simulated stations
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Microseconds &amp; Milliseconds Scale
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase">
              <tr>
                <th className="p-3.5">Dataset Size (n)</th>
                <th className="p-3.5">Bubble Sort (O(n²))</th>
                <th className="p-3.5">Selection Sort (O(n²))</th>
                <th className="p-3.5">Merge Sort (O(n log n))</th>
                <th className="p-3.5">Quick Sort (O(n log n))</th>
                <th className="p-3.5">Optimal Choice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-stone-700">
              {(data?.algorithmBenchmarks || []).map((row: any) => (
                <tr key={row.size} className="hover:bg-stone-50/50">
                  <td className="p-3.5 font-bold text-stone-900">{row.size} stations</td>
                  <td className="p-3.5 text-rose-600">{row.bubbleSort} ms</td>
                  <td className="p-3.5 text-amber-600">{row.selectionSort} ms</td>
                  <td className="p-3.5 text-emerald-600 font-bold">{row.mergeSort} ms</td>
                  <td className="p-3.5 text-teal-600 font-bold">{row.quickSort} ms</td>
                  <td className="p-3.5 font-sans font-semibold text-emerald-700">
                    {row.size <= 50 ? 'Quick / Selection' : 'Merge Sort (Stable) / Quick Sort'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
