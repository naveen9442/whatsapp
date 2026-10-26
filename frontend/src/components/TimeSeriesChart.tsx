import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TimeseriesPoint } from '../hooks/useDashboard';

interface TimeSeriesChartProps {
  data: TimeseriesPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[150px]">
        <p className="font-semibold text-gray-300 pb-1 border-b border-gray-800">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-gray-100 font-mono">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-[380px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-48 rounded"></div>
          <div className="skeleton h-4 w-28 rounded"></div>
        </div>
        <div className="skeleton h-[280px] w-full rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Traffic & Response Velocity
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Sent messages vs customer replies over selected timeline
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Messages Sent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Replies Received</span>
          </div>
        </div>
      </div>

      <div className="h-[290px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ display: 'none' }} />
            <Line
              name="Messages Sent"
              type="monotone"
              dataKey="sent"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#1e3a8a', strokeWidth: 2 }}
            />
            <Line
              name="Replies Received"
              type="monotone"
              dataKey="replies"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#0369a1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeSeriesChart;
