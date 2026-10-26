import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { FunnelStage } from '../hooks/useDashboard';
import { ArrowDown, CheckCircle2, MessageSquare, Send, Share2 } from 'lucide-react';

interface FunnelChartProps {
  data: FunnelStage[] | any;
  loading?: boolean;
}

const stageIcons: Record<string, React.ReactNode> = {
  Sent: <Send className="w-3.5 h-3.5 text-blue-400" />,
  Replied: <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />,
  'Link Shared': <Share2 className="w-3.5 h-3.5 text-sky-400" />,
  Paid: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,
};

const stageColors = [
  '#2563eb', // blue-600
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#1d4ed8', // blue-700
];

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  loading = false,
}) => {
  // Normalize data into array format
  const normalizedData: FunnelStage[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // If an object is passed: { sent: 100, replied: 40, linkShared: 20, paid: 10 }
    const sent = data.sent || data.messagesSent || 100;
    const replied = data.replied || data.repliesReceived || 0;
    const linkShared = data.linkShared || data.linksShared || 0;
    const paid = data.paid || data.paymentsReceived || 0;

    return [
      { stage: 'Sent', count: sent, percentage: 100 },
      {
        stage: 'Replied',
        count: replied,
        percentage: sent > 0 ? Number(((replied / sent) * 100).toFixed(1)) : 0,
      },
      {
        stage: 'Link Shared',
        count: linkShared,
        percentage: sent > 0 ? Number(((linkShared / sent) * 100).toFixed(1)) : 0,
      },
      {
        stage: 'Paid',
        count: paid,
        percentage: sent > 0 ? Number(((paid / sent) * 100).toFixed(1)) : 0,
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-[380px] flex flex-col justify-between">
        <div className="skeleton h-5 w-36 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-xl"></div>
          <div className="skeleton h-12 w-full rounded-xl"></div>
          <div className="skeleton h-12 w-full rounded-xl"></div>
          <div className="skeleton h-12 w-full rounded-xl"></div>
        </div>
      </div>
    );
  }

  const maxCount = normalizedData.length > 0 ? Math.max(...normalizedData.map(d => d.count)) : 1;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Conversion Funnel
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Journey drop-off from Sent to Settlement
        </p>
      </div>

      <div className="space-y-3.5 my-auto">
        {normalizedData.map((item, index) => {
          const widthPercent = Math.max(12, Math.round((item.count / maxCount) * 100));
          const stepConversion =
            index > 0 && normalizedData[index - 1].count > 0
              ? ((item.count / normalizedData[index - 1].count) * 100).toFixed(1)
              : null;

          return (
            <div key={item.stage} className="relative">
              {/* Drop-off connector indicator between stages */}
              {index > 0 && (
                <div className="flex items-center gap-1.5 ml-4 -mt-2.5 mb-1 text-[10px] text-gray-400 font-mono">
                  <ArrowDown className="w-3 h-3 text-gray-400" />
                  <span>{stepConversion}% step conv.</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-gray-950/70 border border-gray-800/80 transition-all hover:border-gray-700">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-medium text-gray-300">
                    <span className="p-1 rounded-md bg-gray-900 border border-gray-800">
                      {stageIcons[item.stage] || <Send className="w-3.5 h-3.5" />}
                    </span>
                    <span>{item.stage}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-gray-100">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Visual Bar representation */}
                <div className="w-full bg-gray-900/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-800">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: stageColors[index % stageColors.length],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Overall Sent to Paid</span>
        <span className="font-bold text-brand-500 font-mono">
          {normalizedData.length > 3
            ? `${normalizedData[3].percentage}%`
            : '0.0%'}
        </span>
      </div>
    </div>
  );
};

export default FunnelChart;
