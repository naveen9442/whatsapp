import React, { useState } from 'react';
import { PendingLinkItem } from '../hooks/useDashboard';
import { dashboardApi, downloadBlob } from '../api/client';
import { Download, ExternalLink, Link2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingLinksTableProps {
  links: PendingLinkItem[];
  dateRange?: { from: string; to: string };
  agentId?: string;
  loading?: boolean;
}

export const PendingLinksTable: React.FC<PendingLinksTableProps> = ({
  links = [],
  dateRange,
  agentId,
  loading = false,
}) => {
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(`https://pay.wa.link/${text}`);
    setCopiedId(id);
    toast.success('Payment link URL copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        from: dateRange?.from,
        to: dateRange?.to,
        agentId: agentId || undefined,
      };

      try {
        const data = await dashboardApi.exportCsv('links', params);
        downloadBlob(data, `pending-links-${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('Pending links CSV downloaded');
      } catch {
        // Fallback CSV generation if backend endpoint is unavailable
        const headers = ['Link Ref', 'Amount', 'Status', 'Shared At', 'Expires At', 'Agent'];
        const rows = links.map(l => [
          l.linkRef,
          l.amount,
          l.status,
          `"${l.sharedAt}"`,
          `"${l.expiresAt}"`,
          `"${l.agent}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        downloadBlob(new Blob([csvContent], { type: 'text/csv' }), `pending-links-${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('Pending links exported to CSV');
      }
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: PendingLinkItem['status']) => {
    switch (status) {
      case 'CREATED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            CREATED
          </span>
        );
      case 'SHARED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            SHARED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            EXPIRED
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-600/20 text-gray-400 border border-gray-600/30">
            CANCELLED
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-44 rounded"></div>
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
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Active & Pending Payment Links
            </h3>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              {links.length} Tracked
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor link delivery, expiration windows, and assigned agents
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting || links.length === 0}
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
              <th className="py-3 px-3 font-semibold">Link Reference</th>
              <th className="py-3 px-3 font-semibold text-right">Amount</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-3 font-semibold">Shared At</th>
              <th className="py-3 px-3 font-semibold">Expires At</th>
              <th className="py-3 px-3 font-semibold">Agent</th>
              <th className="py-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {links.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No pending payment links found.
                </td>
              </tr>
            ) : (
              links.map((item, idx) => (
                <tr
                  key={item.id || item.linkRef || idx}
                  className="group hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-gray-900 border border-gray-800 text-cyan-400">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono font-medium text-gray-200">
                        {item.linkRef}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-100">
                    {item.currency || '₹'}{(item.amount ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3 px-3 text-gray-300 font-mono text-[11px]">
                    {item.sharedAt}
                  </td>
                  <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                    {item.expiresAt}
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300 font-medium text-[11px]">
                      {item.agent}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleCopyLink(item.linkRef, item.id || String(idx))}
                      title="Copy Payment Link"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors"
                    >
                      {copiedId === (item.id || String(idx)) ? (
                        <>
                          <Check className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
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

export default PendingLinksTable;
