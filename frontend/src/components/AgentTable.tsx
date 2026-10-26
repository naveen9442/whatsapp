import React, { useState, useMemo } from 'react';
import { AgentMetric } from '../hooks/useDashboard';
import { ArrowUpDown, ArrowUp, ArrowDown, UserCheck, Search, Trophy } from 'lucide-react';

interface AgentTableProps {
  agents: AgentMetric[];
  loading?: boolean;
}

type SortField =
  | 'name'
  | 'messagesSent'
  | 'replies'
  | 'linksShared'
  | 'payments'
  | 'amount'
  | 'replyRate'
  | 'conversion';

export const AgentTable: React.FC<AgentTableProps> = ({
  agents = [],
  loading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAgents = useMemo(() => {
    return (agents || []).filter(agent => {
      const name = agent?.name || (agent as any)?.agentName || '';
      return name.toLowerCase().includes((searchQuery || '').toLowerCase());
    });
  }, [agents, searchQuery]);

  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => {
      const aVal = a?.[sortField];
      const bVal = b?.[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [filteredAgents, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
    );
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-40 rounded"></div>
          <div className="skeleton h-8 w-36 rounded-lg"></div>
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
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Agent Performance
            </h3>
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {agents.length} Active
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time messaging, conversions & revenue by representative
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-xs bg-gray-950/80 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-800/80 text-gray-400">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 font-semibold cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Agent Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('messagesSent')}
                className="py-3 px-3 font-semibold text-right cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Sent</span>
                  {renderSortIcon('messagesSent')}
                </div>
              </th>
              <th
                onClick={() => handleSort('replies')}
                className="py-3 px-3 font-semibold text-right cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Replies</span>
                  {renderSortIcon('replies')}
                </div>
              </th>
              <th
                onClick={() => handleSort('replyRate')}
                className="py-3 px-3 font-semibold cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Reply Rate</span>
                  {renderSortIcon('replyRate')}
                </div>
              </th>
              <th
                onClick={() => handleSort('linksShared')}
                className="py-3 px-3 font-semibold text-right cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Links</span>
                  {renderSortIcon('linksShared')}
                </div>
              </th>
              <th
                onClick={() => handleSort('payments')}
                className="py-3 px-3 font-semibold text-right cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Paid</span>
                  {renderSortIcon('payments')}
                </div>
              </th>
              <th
                onClick={() => handleSort('conversion')}
                className="py-3 px-3 font-semibold cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Conv. %</span>
                  {renderSortIcon('conversion')}
                </div>
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3 px-3 font-semibold text-right cursor-pointer group hover:text-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount (₹)</span>
                  {renderSortIcon('amount')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {sortedAgents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No agents found matching criteria.
                </td>
              </tr>
            ) : (
              sortedAgents.map((agent, idx) => (
                <tr
                  key={agent.id || idx}
                  className="group hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
                        {(agent.name || 'A').charAt(0)}
                      </div>
                      <div className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{agent.name || 'Agent'}</span>
                        {idx === 0 && (
                          <Trophy className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-300">
                    {(agent.messagesSent ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">
                    {(agent.replies ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 min-w-[110px]">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, agent.replyRate ?? 0)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-gray-300">
                        {agent.replyRate ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-400">
                    {(agent.linksShared ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-blue-400">
                    {(agent.payments ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 min-w-[110px]">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, agent.conversion ?? 0)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-gray-300">
                        {agent.conversion ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-100">
                    ₹{(agent.amount ?? 0).toLocaleString()}
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

export default AgentTable;
