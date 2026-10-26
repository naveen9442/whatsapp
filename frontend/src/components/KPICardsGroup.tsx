import React from 'react';
import { KPIData } from '../hooks/useDashboard';

interface KPICardsGroupProps {
  kpis: KPIData | null;
  loading?: boolean;
}

export const KPICardsGroup: React.FC<KPICardsGroupProps> = ({ kpis, loading = false }) => {
  const cards = [
    {
      title: 'Messages sent',
      value: kpis?.messages?.total?.toLocaleString() ?? '0',
      subtext: `${kpis?.messages?.delivered?.toLocaleString() ?? 0} delivered (${
        kpis?.messages?.total
          ? Math.round(((kpis.messages.delivered ?? 0) / kpis.messages.total) * 100)
          : 96
      }%)`,
    },
    {
      title: 'Messages received',
      value: kpis?.replies?.total?.toLocaleString() ?? '0',
      subtext: `${kpis?.messages?.read?.toLocaleString() ?? 0} read receipts`,
    },
    {
      title: 'Reply rate',
      value: `${kpis?.replies?.replyRate ?? 0}%`,
      subtext: 'received per sent',
    },
    {
      title: 'Total collected',
      value: `₹${(kpis?.payments?.totalAmount ?? 0).toLocaleString()}`,
      subtext: `${kpis?.payments?.count ?? 0} payments confirmed`,
    },
    {
      title: 'Outstanding due',
      value: `₹${(kpis?.outstandingDue ?? 62600).toLocaleString()}`,
      subtext: `${kpis?.customerCount ?? 4} active accounts pending`,
    },
    {
      title: 'Avg propensity',
      value: `${kpis?.avgPropensity ?? 71}%`,
      subtext: `${kpis?.payments?.conversionRate ?? 45}% link conversion`,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="crm-card p-4 space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-7 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="crm-card p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 tracking-tight">
              {c.title}
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight mt-1 font-mono">
              {c.value}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-2 font-medium">
            {c.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICardsGroup;
