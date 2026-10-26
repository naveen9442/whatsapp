import React from 'react';
import { KPIData } from '../hooks/useDashboard';
import {
  Check,
  CheckCheck,
  Clock,
  Link2,
  MessageSquare,
  Send,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface WhatsAppDeliveryPipelineProps {
  kpis: KPIData | null;
  loading?: boolean;
}

export const WhatsAppDeliveryPipeline: React.FC<WhatsAppDeliveryPipelineProps> = ({
  kpis,
  loading = false,
}) => {
  const totalSent = kpis?.messages?.total ?? 0;
  const delivered = kpis?.messages?.delivered ?? 0;
  const seen = kpis?.messages?.read ?? 0;
  const replies = kpis?.replies?.total ?? 0;
  const linksSent = kpis?.paymentLinks?.total ?? 0;
  const paymentsPaid = kpis?.payments?.count ?? 0;

  // Messages waiting for reply = Total sent minus replies received
  const waitingForReply = Math.max(0, totalSent - replies);
  const waitingRate = totalSent > 0 ? ((waitingForReply / totalSent) * 100).toFixed(1) : '0.0';
  const deliveryRate = totalSent > 0 ? (((delivered + seen) / totalSent) * 100).toFixed(1) : '0.0';
  const readRate = totalSent > 0 ? ((seen / totalSent) * 100).toFixed(1) : '0.0';
  const conversionRate = linksSent > 0 ? ((paymentsPaid / linksSent) * 100).toFixed(1) : '0.0';

  const pipelineCards = [
    {
      id: 'sent',
      title: 'Messages Sent',
      value: totalSent.toLocaleString(),
      subtext: 'Total Outbound Dispatched',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
          <Send className="w-4 h-4" />
        </div>
      ),
      badge: '100%',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    {
      id: 'delivered',
      title: 'Delivered (Double Tick)',
      value: delivered.toLocaleString(),
      subtext: `${deliveryRate}% reached device`,
      icon: (
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
          {/* Grey double tick */}
          <CheckCheck className="w-5 h-5 text-slate-400 stroke-[2.5]" />
        </div>
      ),
      badge: 'Grey Tick',
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'seen',
      title: 'Messages Seen',
      value: seen.toLocaleString(),
      subtext: `${readRate}% opened by contact`,
      icon: (
        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
          {/* Blue double tick */}
          <CheckCheck className="w-5 h-5 text-sky-500 stroke-[2.5]" />
        </div>
      ),
      badge: 'Blue Tick',
      badgeColor: 'bg-sky-50 text-sky-700',
    },
    {
      id: 'waiting',
      title: 'Waiting for Reply',
      value: waitingForReply.toLocaleString(),
      subtext: `${waitingRate}% pending customer reply`,
      icon: (
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
      ),
      badge: 'Action Needed',
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    {
      id: 'links',
      title: 'Payment Links Sent',
      value: linksSent.toLocaleString(),
      subtext: `${conversionRate}% conversion rate`,
      icon: (
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <Link2 className="w-4 h-4" />
        </div>
      ),
      badge: `${paymentsPaid} Paid`,
      badgeColor: 'bg-purple-50 text-purple-700',
    },
    {
      id: 'replies',
      title: 'Replies Received',
      value: replies.toLocaleString(),
      subtext: `${kpis?.replies?.replyRate ?? 0}% response velocity`,
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
      ),
      badge: 'Customer Active',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
  ];

  if (loading) {
    return (
      <div className="crm-card p-6 bg-white space-y-4">
        <div className="skeleton h-5 w-60 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="crm-card p-6 bg-white space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>WhatsApp Delivery & Response Pipeline</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              Live Receipts
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time tracking of message dispatch, double-tick delivery, blue-tick views, and pending responses
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
            <span>Delivered</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
            <span>Seen</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting Reply</span>
          </div>
        </div>
      </div>

      {/* 6 Delivery Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipelineCards.map((card) => (
          <div
            key={card.id}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                {card.icon}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-600 truncate">
                {card.title}
              </div>
              <div className="text-2xl font-black text-gray-900 mt-1 font-mono tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="text-[11px] text-gray-500 mt-2 font-medium truncate">
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Pipeline Funnel Flow Bar */}
      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>Delivery to Reply Conversion Journey</span>
          <span className="font-mono text-blue-700 font-bold">
            {readRate}% Seen Rate · {kpis?.replies?.replyRate ?? 0}% Reply Rate
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex">
          {/* Seen segment (sky blue) */}
          <div
            title={`Seen: ${seen}`}
            style={{ width: `${Math.min(100, Number(readRate))}%` }}
            className="bg-sky-500 h-full transition-all"
          />
          {/* Delivered but not seen segment (slate) */}
          <div
            title={`Delivered: ${delivered}`}
            style={{ width: `${Math.min(100, Math.max(5, (delivered / (totalSent || 1)) * 100))}%` }}
            className="bg-slate-400 h-full transition-all"
          />
          {/* Remaining awaiting reply (amber) */}
          <div
            title={`Waiting for Reply: ${waitingForReply}`}
            style={{ width: `${Math.min(100, Math.max(5, (waitingForReply / (totalSent || 1)) * 100))}%` }}
            className="bg-amber-400 h-full transition-all opacity-80"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Messages Seen ({seen.toLocaleString()})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Delivered on Device ({delivered.toLocaleString()})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Waiting for Customer Reply ({waitingForReply.toLocaleString()})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Links Shared ({linksSent.toLocaleString()})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDeliveryPipeline;
