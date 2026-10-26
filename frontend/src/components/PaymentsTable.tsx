import React, { useState } from 'react';
import { PaymentItem } from '../hooks/useDashboard';
import { dashboardApi, downloadBlob } from '../api/client';
import { Download, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentsTableProps {
  payments: PaymentItem[];
  dateRange?: { from: string; to: string };
  agentId?: string;
  loading?: boolean;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments = [],
  dateRange,
  agentId,
  loading = false,
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        from: dateRange?.from,
        to: dateRange?.to,
        agentId: agentId || undefined,
      };

      try {
        const data = await dashboardApi.exportCsv('payments', params);
        downloadBlob(data, `payments-export-${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('Payments CSV downloaded');
      } catch {
        // Fallback CSV generation if backend endpoint is unavailable
        const headers = ['Reference', 'Contact', 'Amount', 'Status', 'Date'];
        const rows = payments.map(p => [
          p.reference,
          `"${p.contact}"`,
          p.amount,
          p.status,
          `"${p.date}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        downloadBlob(new Blob([csvContent], { type: 'text/csv' }), `payments-export-${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('Payments exported to CSV');
      }
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: PaymentItem['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            PAID
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-40 rounded"></div>
          <div className="skeleton h-8 w-24 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Recent Payments
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time transaction activity and settlement status
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting || payments.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-800/80 text-gray-400">
              <th className="py-3 px-3 font-semibold">Reference</th>
              <th className="py-3 px-3 font-semibold">Contact</th>
              <th className="py-3 px-3 font-semibold text-right">Amount</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p, idx) => (
                <tr
                  key={p.id || p.reference || idx}
                  className="group hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-mono text-gray-300 group-hover:text-blue-400 transition-colors">
                      <span>{p.reference}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-400" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-200">
                    <div>
                      <div className="font-medium text-gray-200">{p.contact}</div>
                      {p.contactPhone && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {p.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-100">
                    {p.currency || '₹'}{(p.amount ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(p.status)}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400 font-mono text-[11px]">
                    {p.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;
