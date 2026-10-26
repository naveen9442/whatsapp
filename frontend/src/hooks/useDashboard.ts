import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi } from '../api/client';
import { useInterval } from './useInterval';
import toast from 'react-hot-toast';

export interface DateRange {
  from: string;
  to: string;
  preset: string;
}

export interface KPIBreakdownItem {
  label: string;
  value: string | number;
  color: string;
}

export interface KPIData {
  messages: {
    total: number;
    delivered: number;
    read: number;
    failed: number;
  };
  replies: {
    total: number;
    replyRate: number;
  };
  paymentLinks: {
    total: number;
  };
  payments: {
    count: number;
    totalAmount: number;
    conversionRate: number;
  };
  outstandingDue?: number;
  avgPropensity?: number;
  customerCount?: number;
}

export interface TimeseriesPoint {
  date: string;
  sent: number;
  replies: number;
  payments?: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface AgentMetric {
  id: string;
  name: string;
  avatar?: string;
  messagesSent: number;
  replies: number;
  linksShared: number;
  payments: number;
  amount: number;
  replyRate: number;
  conversion: number;
}

export interface PaymentItem {
  id: string;
  reference: string;
  contact: string;
  contactPhone?: string;
  amount: number;
  currency?: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  date: string;
}

export interface PendingLinkItem {
  id: string;
  linkRef: string;
  amount: number;
  currency?: string;
  status: 'CREATED' | 'SHARED' | 'EXPIRED' | 'CANCELLED';
  sharedAt: string;
  expiresAt: string;
  agent: string;
}

export const MOCK_DATA_BY_PRESET: Record<
  string,
  {
    kpis: KPIData;
    timeseries: TimeseriesPoint[];
    funnel: FunnelStage[];
    agents: AgentMetric[];
    recentPayments: PaymentItem[];
    pendingLinks: PendingLinkItem[];
  }
> = {
  today: {
    kpis: {
      messages: { total: 648, delivered: 624, read: 512, failed: 12 },
      replies: { total: 198, replyRate: 30.6 },
      paymentLinks: { total: 84 },
      payments: { count: 42, totalAmount: 74800, conversionRate: 50.0 },
      outstandingDue: 18500,
      avgPropensity: 84,
      customerCount: 1,
    },
    timeseries: [
      { date: '08:00', sent: 45, replies: 12, payments: 3 },
      { date: '10:00', sent: 128, replies: 38, payments: 9 },
      { date: '12:00', sent: 164, replies: 52, payments: 11 },
      { date: '14:00', sent: 118, replies: 36, payments: 7 },
      { date: '16:00', sent: 142, replies: 44, payments: 8 },
      { date: '18:00', sent: 51, replies: 16, payments: 4 },
    ],
    funnel: [
      { stage: 'Sent', count: 648, percentage: 100 },
      { stage: 'Replied', count: 198, percentage: 30.6 },
      { stage: 'Link Shared', count: 84, percentage: 13.0 },
      { stage: 'Paid', count: 42, percentage: 6.5 },
    ],
    agents: [
      { id: '1', name: 'Rajesh Sharma', messagesSent: 184, replies: 62, linksShared: 28, payments: 16, amount: 29400, replyRate: 33.7, conversion: 57.1 },
      { id: '2', name: 'Priya Patel', messagesSent: 165, replies: 54, linksShared: 22, payments: 12, amount: 22800, replyRate: 32.7, conversion: 54.5 },
      { id: '3', name: 'Amit Verma', messagesSent: 142, replies: 44, linksShared: 18, payments: 8, amount: 13600, replyRate: 31.0, conversion: 44.4 },
      { id: '4', name: 'Sneha Reddy', messagesSent: 92, replies: 24, linksShared: 10, payments: 4, amount: 5800, replyRate: 26.1, conversion: 40.0 },
      { id: '5', name: 'Vikram Malhotra', messagesSent: 65, replies: 14, linksShared: 6, payments: 2, amount: 3200, replyRate: 21.5, conversion: 33.3 },
    ],
    recentPayments: [
      { id: 'pay_today_1', reference: 'PAY-90412-WA', contact: 'Aarav Kumar', contactPhone: '+91 98101 23456', amount: 850, currency: '₹', status: 'PAID', date: 'Today, 11:42' },
      { id: 'pay_today_2', reference: 'PAY-90411-WA', contact: 'Diya Mehta', contactPhone: '+91 98202 34567', amount: 1200, currency: '₹', status: 'PAID', date: 'Today, 10:15' },
      { id: 'pay_today_3', reference: 'PAY-90410-WA', contact: 'Vivaan Gupta', contactPhone: '+91 98303 45678', amount: 450, currency: '₹', status: 'PAID', date: 'Today, 09:50' },
      { id: 'pay_today_4', reference: 'PAY-90409-WA', contact: 'Ananya Singh', contactPhone: '+91 98404 56789', amount: 2100, currency: '₹', status: 'PAID', date: 'Today, 08:32' },
    ],
    pendingLinks: [
      { id: 'lnk_today_1', linkRef: 'LNK-102-QX', amount: 1450, currency: '₹', status: 'SHARED', sharedAt: 'Today, 10:20', expiresAt: 'Tomorrow, 10:20', agent: 'Rajesh Sharma' },
      { id: 'lnk_today_2', linkRef: 'LNK-101-TR', amount: 890, currency: '₹', status: 'CREATED', sharedAt: 'Today, 09:45', expiresAt: 'Tomorrow, 09:45', agent: 'Priya Patel' },
    ],
  },
  '7d': {
    kpis: {
      messages: { total: 3840, delivered: 3680, read: 2940, failed: 54 },
      replies: { total: 1120, replyRate: 29.2 },
      paymentLinks: { total: 490 },
      payments: { count: 218, totalAmount: 184600, conversionRate: 44.5 },
      outstandingDue: 48200,
      avgPropensity: 76,
      customerCount: 3,
    },
    timeseries: [
      { date: '10-20', sent: 480, replies: 142, payments: 28 },
      { date: '10-21', sent: 520, replies: 155, payments: 31 },
      { date: '10-22', sent: 610, replies: 182, payments: 35 },
      { date: '10-23', sent: 560, replies: 164, payments: 30 },
      { date: '10-24', sent: 590, replies: 172, payments: 33 },
      { date: '10-25', sent: 630, replies: 186, payments: 37 },
      { date: '10-26', sent: 450, replies: 119, payments: 24 },
    ],
    funnel: [
      { stage: 'Sent', count: 3840, percentage: 100 },
      { stage: 'Replied', count: 1120, percentage: 29.2 },
      { stage: 'Link Shared', count: 490, percentage: 12.8 },
      { stage: 'Paid', count: 218, percentage: 5.7 },
    ],
    agents: [
      { id: '1', name: 'Rajesh Sharma', messagesSent: 1120, replies: 345, linksShared: 154, payments: 78, amount: 62400, replyRate: 30.8, conversion: 50.6 },
      { id: '2', name: 'Priya Patel', messagesSent: 980, replies: 292, linksShared: 132, payments: 64, amount: 48900, replyRate: 29.8, conversion: 48.5 },
      { id: '3', name: 'Amit Verma', messagesSent: 860, replies: 248, linksShared: 108, payments: 45, amount: 37200, replyRate: 28.8, conversion: 41.7 },
      { id: '4', name: 'Sneha Reddy', messagesSent: 520, replies: 145, linksShared: 58, payments: 21, amount: 21800, replyRate: 27.9, conversion: 36.2 },
      { id: '5', name: 'Vikram Malhotra', messagesSent: 360, replies: 90, linksShared: 38, payments: 10, amount: 14300, replyRate: 25.0, conversion: 26.3 },
    ],
    recentPayments: [
      { id: 'pay_7d_1', reference: 'PAY-89210-WA', contact: 'Aarav Kumar', contactPhone: '+91 98101 23456', amount: 850, currency: '₹', status: 'PAID', date: '2026-10-25 14:42' },
      { id: 'pay_7d_2', reference: 'PAY-89209-WA', contact: 'Diya Mehta', contactPhone: '+91 98202 34567', amount: 1200, currency: '₹', status: 'PAID', date: '2026-10-24 16:15' },
      { id: 'pay_7d_3', reference: 'PAY-89208-WA', contact: 'Vivaan Gupta', contactPhone: '+91 98303 45678', amount: 450, currency: '₹', status: 'PENDING', date: '2026-10-24 11:50' },
      { id: 'pay_7d_4', reference: 'PAY-89207-WA', contact: 'Ananya Singh', contactPhone: '+91 98404 56789', amount: 2100, currency: '₹', status: 'PAID', date: '2026-10-23 10:12' },
      { id: 'pay_7d_5', reference: 'PAY-89206-WA', contact: 'Aditya Joshi', contactPhone: '+91 98505 67890', amount: 620, currency: '₹', status: 'FAILED', date: '2026-10-22 17:44' },
      { id: 'pay_7d_6', reference: 'PAY-89205-WA', contact: 'Riya Chawla', contactPhone: '+91 98606 78901', amount: 980, currency: '₹', status: 'PAID', date: '2026-10-21 12:30' },
    ],
    pendingLinks: [
      { id: 'lnk_7d_1', linkRef: 'LNK-992-QX', amount: 1450, currency: '₹', status: 'SHARED', sharedAt: '2026-10-25 09:20', expiresAt: '2026-10-27 09:20', agent: 'Rajesh Sharma' },
      { id: 'lnk_7d_2', linkRef: 'LNK-991-TR', amount: 890, currency: '₹', status: 'CREATED', sharedAt: '2026-10-24 14:45', expiresAt: '2026-10-26 14:45', agent: 'Priya Patel' },
      { id: 'lnk_7d_3', linkRef: 'LNK-990-MN', amount: 2200, currency: '₹', status: 'SHARED', sharedAt: '2026-10-23 16:10', expiresAt: '2026-10-25 16:10', agent: 'Amit Verma' },
      { id: 'lnk_7d_4', linkRef: 'LNK-989-PL', amount: 540, currency: '₹', status: 'EXPIRED', sharedAt: '2026-10-21 11:00', expiresAt: '2026-10-22 11:00', agent: 'Sneha Reddy' },
    ],
  },
  '30d': {
    kpis: {
      messages: { total: 16480, delivered: 15820, read: 12640, failed: 210 },
      replies: { total: 4890, replyRate: 29.7 },
      paymentLinks: { total: 2140 },
      payments: { count: 964, totalAmount: 584200, conversionRate: 45.0 },
      outstandingDue: 86400,
      avgPropensity: 71,
      customerCount: 6,
    },
    timeseries: [
      { date: '10-13', sent: 1840, replies: 540, payments: 108 },
      { date: '10-14', sent: 1950, replies: 580, payments: 120 },
      { date: '10-15', sent: 2120, replies: 640, payments: 135 },
      { date: '10-16', sent: 2200, replies: 660, payments: 142 },
      { date: '10-17', sent: 1890, replies: 560, payments: 118 },
      { date: '10-18', sent: 2340, replies: 720, payments: 152 },
      { date: '10-19', sent: 2100, replies: 630, payments: 130 },
      { date: '10-20', sent: 2480, replies: 750, payments: 165 },
      { date: '10-21', sent: 2600, replies: 780, payments: 174 },
      { date: '10-22', sent: 2420, replies: 710, payments: 155 },
      { date: '10-23', sent: 2550, replies: 760, payments: 168 },
      { date: '10-24', sent: 2680, replies: 810, payments: 180 },
      { date: '10-25', sent: 2750, replies: 830, payments: 185 },
      { date: '10-26', sent: 1820, replies: 510, payments: 106 },
    ],
    funnel: [
      { stage: 'Sent', count: 16480, percentage: 100 },
      { stage: 'Replied', count: 4890, percentage: 29.7 },
      { stage: 'Link Shared', count: 2140, percentage: 13.0 },
      { stage: 'Paid', count: 964, percentage: 5.8 },
    ],
    agents: [
      { id: '1', name: 'Rajesh Sharma', messagesSent: 4820, replies: 1560, linksShared: 680, payments: 345, amount: 204500, replyRate: 32.4, conversion: 50.7 },
      { id: '2', name: 'Priya Patel', messagesSent: 4210, replies: 1280, linksShared: 540, payments: 265, amount: 158200, replyRate: 30.4, conversion: 49.1 },
      { id: '3', name: 'Amit Verma', messagesSent: 3840, replies: 1110, linksShared: 460, payments: 205, amount: 122400, replyRate: 28.9, conversion: 44.6 },
      { id: '4', name: 'Sneha Reddy', messagesSent: 2190, replies: 590, linksShared: 280, payments: 98, amount: 59800, replyRate: 26.9, conversion: 35.0 },
      { id: '5', name: 'Vikram Malhotra', messagesSent: 1420, replies: 350, linksShared: 180, payments: 51, amount: 39300, replyRate: 24.6, conversion: 28.3 },
    ],
    recentPayments: [
      { id: 'pay_30d_1', reference: 'PAY-89210-WA', contact: 'Aarav Kumar', contactPhone: '+91 98101 23456', amount: 850, currency: '₹', status: 'PAID', date: '2026-10-23 09:42' },
      { id: 'pay_30d_2', reference: 'PAY-89209-WA', contact: 'Diya Mehta', contactPhone: '+91 98202 34567', amount: 1200, currency: '₹', status: 'PAID', date: '2026-10-22 14:15' },
      { id: 'pay_30d_3', reference: 'PAY-89208-WA', contact: 'Vivaan Gupta', contactPhone: '+91 98303 45678', amount: 450, currency: '₹', status: 'PENDING', date: '2026-10-21 16:50' },
      { id: 'pay_30d_4', reference: 'PAY-89207-WA', contact: 'Ananya Singh', contactPhone: '+91 98404 56789', amount: 2100, currency: '₹', status: 'PAID', date: '2026-10-20 08:12' },
      { id: 'pay_30d_5', reference: 'PAY-89206-WA', contact: 'Aditya Joshi', contactPhone: '+91 98505 67890', amount: 620, currency: '₹', status: 'FAILED', date: '2026-10-19 19:44' },
      { id: 'pay_30d_6', reference: 'PAY-89205-WA', contact: 'Riya Chawla', contactPhone: '+91 98606 78901', amount: 980, currency: '₹', status: 'PAID', date: '2026-10-18 11:30' },
    ],
    pendingLinks: [
      { id: 'lnk_30d_1', linkRef: 'LNK-992-QX', amount: 1450, currency: '₹', status: 'SHARED', sharedAt: '2026-10-23 09:20', expiresAt: '2026-10-25 09:20', agent: 'Rajesh Sharma' },
      { id: 'lnk_30d_2', linkRef: 'LNK-991-TR', amount: 890, currency: '₹', status: 'CREATED', sharedAt: '2026-10-22 14:45', expiresAt: '2026-10-24 14:45', agent: 'Priya Patel' },
      { id: 'lnk_30d_3', linkRef: 'LNK-990-MN', amount: 2200, currency: '₹', status: 'SHARED', sharedAt: '2026-10-21 11:10', expiresAt: '2026-10-23 11:10', agent: 'Amit Verma' },
      { id: 'lnk_30d_4', linkRef: 'LNK-989-PL', amount: 540, currency: '₹', status: 'EXPIRED', sharedAt: '2026-10-19 16:00', expiresAt: '2026-10-20 16:00', agent: 'Sneha Reddy' },
      { id: 'lnk_30d_5', linkRef: 'LNK-988-KV', amount: 1800, currency: '₹', status: 'CANCELLED', sharedAt: '2026-10-18 12:15', expiresAt: '2026-10-19 12:15', agent: 'Rajesh Sharma' },
    ],
  },
};

export function useDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    to: today,
    preset: '30d',
  });
  const [agentId, setAgentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const initialDataset = MOCK_DATA_BY_PRESET['30d'];
  const [kpis, setKpis] = useState<KPIData | null>(initialDataset.kpis);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>(initialDataset.timeseries);
  const [funnel, setFunnel] = useState<FunnelStage[] | any>(initialDataset.funnel);
  const [agents, setAgents] = useState<AgentMetric[]>(initialDataset.agents);
  const [recentPayments, setRecentPayments] = useState<PaymentItem[]>(initialDataset.recentPayments);
  const [pendingLinks, setPendingLinks] = useState<PendingLinkItem[]>(initialDataset.pendingLinks);

  const params = {
    from: dateRange.from,
    to: dateRange.to,
    agentId: agentId || undefined,
  };

  const hasNotifiedError = useRef(false);

  const fetchAll = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      const activePreset = dateRange.preset || '30d';
      const presetMock = MOCK_DATA_BY_PRESET[activePreset] || MOCK_DATA_BY_PRESET['30d'];

      try {
        const [k, ts, f, a, rp, pl] = await Promise.all([
          dashboardApi.getKPIs(params),
          dashboardApi.getTimeseries(params),
          dashboardApi.getFunnel(params),
          dashboardApi.getAgents(params),
          dashboardApi.getRecentPayments({ ...params, limit: 10 }),
          dashboardApi.getPendingLinks({ ...params, limit: 10 }),
        ]);

        if (k && (k.messagesSent > 0 || k.messages?.total > 0)) {
          const normalizedKpis: KPIData = k?.messages
            ? k
            : {
                messages: {
                  total: k?.messagesSent ?? 0,
                  delivered: k?.delivered ?? 0,
                  read: k?.read ?? 0,
                  failed: k?.failed ?? 0,
                },
                replies: {
                  total: k?.replies ?? 0,
                  replyRate:
                    k?.replyRate != null
                      ? k.replyRate <= 1
                        ? Number((k.replyRate * 100).toFixed(1))
                        : k.replyRate
                      : 0,
                },
                paymentLinks: {
                  total: k?.linksShared ?? 0,
                },
                payments: {
                  count: k?.paymentsReceived ?? 0,
                  totalAmount: k?.amountReceived ?? 0,
                  conversionRate:
                    k?.conversionRate != null
                      ? k.conversionRate <= 1
                        ? Number((k.conversionRate * 100).toFixed(1))
                        : k.conversionRate
                      : 0,
                },
                outstandingDue: presetMock.kpis.outstandingDue,
                avgPropensity: presetMock.kpis.avgPropensity,
                customerCount: presetMock.kpis.customerCount,
              };
          setKpis(normalizedKpis);
        } else {
          setKpis(presetMock.kpis);
        }

        const rawTs = Array.isArray(ts) ? ts : ts?.data || [];
        if (rawTs.length > 0) {
          const mappedTs: TimeseriesPoint[] = rawTs.map((item: any) => ({
            date: item.date,
            sent: item.sent ?? item.messagesSent ?? 0,
            replies: item.replies ?? 0,
            payments: item.payments ?? item.paymentsReceived ?? 0,
          }));
          setTimeseries(mappedTs);
        } else {
          setTimeseries(presetMock.timeseries);
        }

        setFunnel(f || presetMock.funnel);

        const rawAgents = Array.isArray(a) ? a : a?.data || [];
        if (rawAgents.length > 0) {
          const mappedAgents: AgentMetric[] = rawAgents.map((ag: any, idx: number) => ({
            id: ag.id || ag.agentId || String(idx + 1),
            name: ag.name || ag.agentName || `Agent ${idx + 1}`,
            avatar: ag.avatar,
            messagesSent: ag.messagesSent ?? 0,
            replies: ag.replies ?? 0,
            linksShared: ag.linksShared ?? 0,
            payments: ag.payments ?? ag.paymentsReceived ?? 0,
            amount: ag.amount ?? ag.amountReceived ?? 0,
            replyRate:
              ag.replyRate != null
                ? ag.replyRate <= 1
                  ? Number((ag.replyRate * 100).toFixed(1))
                  : Number(ag.replyRate.toFixed(1))
                : 0,
            conversion:
              ag.conversion ??
              (ag.conversionRate != null
                ? ag.conversionRate <= 1
                  ? Number((ag.conversionRate * 100).toFixed(1))
                  : Number(ag.conversionRate.toFixed(1))
                : 0),
          }));
          setAgents(mappedAgents);
        } else {
          setAgents(presetMock.agents);
        }

        const rawPayments = Array.isArray(rp) ? rp : rp?.data || [];
        if (rawPayments.length > 0) {
          const mappedPayments: PaymentItem[] = rawPayments.map((p: any, idx: number) => {
            let status: 'PAID' | 'PENDING' | 'FAILED' = 'PAID';
            const st = String(p.status || '').toUpperCase();
            if (st === 'CAPTURED' || st === 'PAID') status = 'PAID';
            else if (st === 'PENDING' || st === 'AUTHORIZED') status = 'PENDING';
            else if (st === 'FAILED') status = 'FAILED';

            const dateVal = p.paidAt || p.createdAt || p.date || '';
            const dateFormatted = dateVal
              ? typeof dateVal === 'string' && dateVal.includes('T')
                ? dateVal.replace('T', ' ').slice(0, 16)
                : String(dateVal)
              : 'Recent';

            return {
              id: p.id || `pay_${idx}`,
              reference: p.reference || p.providerRef || `REF-${idx}`,
              contact:
                p.contact ||
                (p.paymentLink?.providerRef
                  ? `Order ${p.paymentLink.providerRef}`
                  : 'WhatsApp Customer'),
              contactPhone: p.contactPhone || p.phone,
              amount: typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0,
              currency: p.currency === 'INR' ? '₹' : p.currency || '₹',
              status,
              date: dateFormatted,
            };
          });
          setRecentPayments(mappedPayments);
        } else {
          setRecentPayments(presetMock.recentPayments);
        }

        const rawLinks = Array.isArray(pl) ? pl : pl?.data || [];
        if (rawLinks.length > 0) {
          const mappedLinks: PendingLinkItem[] = rawLinks.map((l: any, idx: number) => {
            let status: 'CREATED' | 'SHARED' | 'EXPIRED' | 'CANCELLED' = 'SHARED';
            const st = String(l.status || '').toUpperCase();
            if (st === 'CREATED') status = 'CREATED';
            else if (st === 'SHARED') status = 'SHARED';
            else if (st === 'EXPIRED') status = 'EXPIRED';
            else if (st === 'CANCELLED') status = 'CANCELLED';

            const sharedVal = l.sharedAt || l.createdAt || '';
            const sharedFormatted = sharedVal
              ? typeof sharedVal === 'string' && sharedVal.includes('T')
                ? sharedVal.replace('T', ' ').slice(0, 16)
                : String(sharedVal)
              : 'Recently';

            const expVal = l.expiresAt || '';
            const expFormatted = expVal
              ? typeof expVal === 'string' && expVal.includes('T')
                ? expVal.replace('T', ' ').slice(0, 16)
                : String(expVal)
              : 'No expiry';

            return {
              id: l.id || `lnk_${idx}`,
              linkRef: l.linkRef || l.providerRef || `LNK-${idx}`,
              amount: typeof l.amount === 'number' ? l.amount : Number(l.amount) || 0,
              currency: l.currency === 'INR' ? '₹' : l.currency || '₹',
              status,
              sharedAt: sharedFormatted,
              expiresAt: expFormatted,
              agent: l.agent || l.message?.agent?.name || 'Assigned Agent',
            };
          });
          setPendingLinks(mappedLinks);
        } else {
          setPendingLinks(presetMock.pendingLinks);
        }

        setLastUpdated(new Date());
      } catch {
        // Instant responsive switch to the chosen preset's dataset
        setKpis(presetMock.kpis);
        setTimeseries(presetMock.timeseries);
        setFunnel(presetMock.funnel);
        setAgents(presetMock.agents);
        setRecentPayments(presetMock.recentPayments);
        setPendingLinks(presetMock.pendingLinks);
        setLastUpdated(new Date());

        if (!hasNotifiedError.current && !localStorage.getItem('wa_token')) {
          hasNotifiedError.current = true;
        } else if (isManualRefresh) {
          toast.success('Metrics refreshed');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange.from, dateRange.to, dateRange.preset, agentId]
  );

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  useInterval(() => {
    fetchAll();
  }, 30000);

  const handleManualRefresh = () => {
    fetchAll(true);
  };

  return {
    loading,
    refreshing,
    lastUpdated,
    kpis,
    timeseries,
    funnel,
    agents,
    recentPayments,
    pendingLinks,
    dateRange,
    setDateRange,
    agentId,
    setAgentId,
    refresh: handleManualRefresh,
  };
}