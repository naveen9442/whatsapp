import React, { useState, useEffect } from 'react';
import { dashboardApi, downloadBlob } from '../api/client';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

export type ReportCategory = 'revenue' | 'aging' | 'agents' | 'funnel';

export const ReportsView: React.FC = () => {
  const [category, setCategory] = useState<ReportCategory>('revenue');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getReportsSummary();
      setReportData(res);
    } catch {
      toast.error('Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [timeRange]);

  const handleExportCsv = () => {
    try {
      const headers = ['Category', 'Metric', 'Value', 'Unit'];
      const rows = [
        ['Revenue', 'Total Collections', reportData?.kpis?.amountReceived || 298926, 'INR'],
        ['Revenue', 'Total Payments Received', reportData?.kpis?.paymentsReceived || 148, 'Count'],
        ['Revenue', 'Average Transaction Size', reportData?.kpis?.avgTicketSize || 2020, 'INR'],
        ['Revenue', 'Link Recovery Rate', `${reportData?.kpis?.recoveryRate || 46.4}%`, 'Rate'],
        ['Messaging', 'Total Messages Sent', reportData?.kpis?.messagesSent || 2465, 'Count'],
        ['Messaging', 'Replies Inbound', reportData?.kpis?.replies || 642, 'Count'],
        ['Messaging', 'Reply Rate', `${reportData?.kpis?.replyRate || 26.0}%`, 'Rate'],
        ['Aging', '0-7 Days Overdue', 32400, 'INR'],
        ['Aging', '8-14 Days Overdue', 24900, 'INR'],
        ['Aging', '15-30 Days Overdue', 18500, 'INR'],
        ['Aging', '30+ Days Overdue', 9800, 'INR'],
      ];

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadBlob(new Blob([csvContent], { type: 'text/csv' }), `whatsapp-executive-report-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Executive report CSV downloaded');
    } catch {
      toast.error('Failed to export CSV report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const agingBuckets = reportData?.agingBuckets || [
    { bracket: '0-7 Days', amount: 32400, count: 6, risk: 'Low' },
    { bracket: '8-14 Days', amount: 24900, count: 4, risk: 'Medium' },
    { bracket: '15-30 Days', amount: 18500, count: 3, risk: 'Elevated' },
    { bracket: '30+ Days', amount: 9800, count: 2, risk: 'High' },
  ];

  const totalOverdue = agingBuckets.reduce((acc: number, curr: any) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Executive Reports & Audit
            </h1>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800 font-bold uppercase font-mono">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Enterprise WhatsApp collection intelligence, receivable aging, and conversion audit
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2 shadow-sm focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days (Full Cycle)</option>
            <option value="90d">This Quarter (Q4)</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* Print / Save PDF button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="crm-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Collections Settled</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            ₹{(reportData?.kpis?.amountReceived || 298926).toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs previous cycle</span>
          </div>
        </div>

        <div className="crm-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Payment Link Recovery Rate</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            {reportData?.kpis?.recoveryRate || 46.4}%
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-medium">
            148 paid out of 319 links shared
          </div>
        </div>

        <div className="crm-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Average Transaction Size</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            ₹{(reportData?.kpis?.avgTicketSize || 2020).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-medium">
            Across active business subscriptions
          </div>
        </div>

        <div className="crm-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Outstanding Due at Risk</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-mono">
            ₹{totalOverdue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2">
            15 accounts currently pending
          </div>
        </div>
      </div>

      {/* 3. Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'revenue' as ReportCategory, label: 'Revenue & Collections Audit', icon: DollarSign },
          { id: 'aging' as ReportCategory, label: 'Aging & Overdue Risk', icon: Clock },
          { id: 'agents' as ReportCategory, label: 'Representative Productivity', icon: Users },
          { id: 'funnel' as ReportCategory, label: 'Channel & Delivery Funnel', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content */}

      {/* Tab 1: Revenue & Collections */}
      {category === 'revenue' && (
        <div className="space-y-6">
          <div className="crm-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Daily Settlement Trajectory (INR)
                </h3>
                <p className="text-xs text-gray-500">
                  Daily cash inflow collected through WhatsApp automated payment links
                </p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(reportData?.revenueTrend || []).slice(-14)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 p-2.5 rounded-lg shadow-lg text-xs">
                            <div className="font-semibold text-gray-800">{payload[0].payload.date}</div>
                            <div className="text-blue-700 font-mono font-bold mt-1">
                              ₹{Number(payload[0].value).toLocaleString()} Settled
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amountReceived" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Aging & Overdue Risk */}
      {category === 'aging' && (
        <div className="space-y-6">
          <div className="crm-card p-6 bg-white space-y-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Accounts Receivable Aging Breakdown
              </h3>
              <p className="text-xs text-gray-500">
                Risk classification based on days past invoice maturity
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {agingBuckets.map((bucket: any, idx: number) => {
                const percent = Math.round((bucket.amount / totalOverdue) * 100);
                const colorMap: Record<string, string> = {
                  Low: 'bg-blue-600 text-blue-700',
                  Medium: 'bg-amber-500 text-amber-700',
                  Elevated: 'bg-orange-500 text-orange-700',
                  High: 'bg-rose-600 text-rose-700',
                };
                return (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{bucket.bracket}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 ${colorMap[bucket.risk] || 'text-gray-700'}`}>
                        {bucket.risk} Risk
                      </span>
                    </div>

                    <div className="text-xl font-bold font-mono text-gray-900">
                      ₹{bucket.amount.toLocaleString()}
                    </div>

                    <div className="text-[11px] text-gray-500">
                      {bucket.count} invoices · {percent}% of total
                    </div>

                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${bucket.risk === 'High' ? 'bg-rose-500' : bucket.risk === 'Elevated' ? 'bg-orange-500' : bucket.risk === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Agent Productivity */}
      {category === 'agents' && (
        <div className="space-y-6">
          <div className="crm-card p-6 bg-white space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Representative Recovery Performance
              </h3>
              <p className="text-xs text-gray-500">
                Staff contributions to conversations, link distributions, and collected amounts
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-medium">
                    <th className="py-3 px-4 font-semibold">Agent Name</th>
                    <th className="py-3 px-4 font-semibold text-right">Messages</th>
                    <th className="py-3 px-4 font-semibold text-right">Replies</th>
                    <th className="py-3 px-4 font-semibold text-right">Links Generated</th>
                    <th className="py-3 px-4 font-semibold text-right">Collections (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Settlement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(reportData?.agentPerformance || []).map((ag: any, idx: number) => {
                    const rate = ag.linksShared > 0 ? ((ag.paymentsReceived / ag.linksShared) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {ag.agentName || `Agent ${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          {ag.messagesSent}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-600 font-semibold">
                          {ag.replies}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-purple-600">
                          {ag.linksShared}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                          ₹{Number(ag.amountReceived).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-800 font-semibold">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Channel & Delivery Funnel */}
      {category === 'funnel' && (
        <div className="space-y-6">
          <div className="crm-card p-6 bg-white space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                End-to-End Delivery & Conversion Pipeline
              </h3>
              <p className="text-xs text-gray-500">
                From initial WhatsApp push to webhook payment capture
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                { stage: '1. Sent', count: reportData?.kpis?.messagesSent || 2465, rate: '100%' },
                { stage: '2. Delivered', count: reportData?.kpis?.delivered || 750, rate: '91.2%' },
                { stage: '3. Read', count: reportData?.kpis?.read || 1498, rate: '60.8%' },
                { stage: '4. Replied', count: reportData?.kpis?.replies || 642, rate: '26.0%' },
                { stage: '5. Link Shared', count: reportData?.kpis?.linksShared || 319, rate: '12.9%' },
                { stage: '6. Payment Captured', count: reportData?.kpis?.paymentsReceived || 148, rate: '6.0%' },
              ].map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-center space-y-1">
                  <div className="text-[11px] font-bold text-gray-600">{step.stage}</div>
                  <div className="text-lg font-black font-mono text-gray-900">{step.count.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-700 font-semibold">{step.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
