import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import Sidebar, { NavView } from '../components/Sidebar';
import KPICardsGroup from '../components/KPICardsGroup';
import WhatsAppDeliveryPipeline from '../components/WhatsAppDeliveryPipeline';
import CollectionChart from '../components/CollectionChart';
import MessagesVolumeChart from '../components/MessagesVolumeChart';
import CustomerCollectionTable, { CustomerRow } from '../components/CustomerCollectionTable';
import WhatsAppInbox from '../components/WhatsAppInbox';
import ReportsView from '../components/ReportsView';
import CampaignsView from '../components/CampaignsView';
import ApiConsole from '../components/ApiConsole';
import AgentTable from '../components/AgentTable';
import PaymentsTable from '../components/PaymentsTable';
import PendingLinksTable from '../components/PendingLinksTable';
import { dashboardApi, downloadBlob } from '../api/client';
import { Download, ChevronDown, Layers, LayoutDashboard, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [dateSummaryPreset, setDateSummaryPreset] = useState('30d');
  const [showEnterpriseDetails, setShowEnterpriseDetails] = useState(false);

  const {
    loading,
    refreshing,
    lastUpdated,
    kpis,
    timeseries,
    agents,
    recentPayments,
    pendingLinks,
    dateRange,
    setDateRange,
    agentId,
    setAgentId,
    refresh,
  } = useDashboard();

  const handlePresetChange = (preset: string) => {
    setDateSummaryPreset(preset);
    const now = new Date();
    const toStr = now.toISOString().slice(0, 10);
    let fromStr = toStr;
    if (preset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromStr = d.toISOString().slice(0, 10);
    } else if (preset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      fromStr = d.toISOString().slice(0, 10);
    }
    setDateRange({ from: fromStr, to: toStr, preset });
    toast.success(
      preset === 'today'
        ? "Displaying Today's live metrics"
        : preset === '7d'
        ? 'Displaying Last 7 days metrics'
        : 'Displaying 30 days summary'
    );
  };

  const handleExportCsv = async () => {
    try {
      const data = await dashboardApi.exportCsv('payments', {
        from: dateRange.from,
        to: dateRange.to,
      });
      downloadBlob(data, `haloocom-whatsapp-collection-summary-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Collection summary CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleRemindCustomer = (customer: CustomerRow) => {
    setActiveView('inbox');
    toast.success(`Opening WhatsApp Inbox for ${customer.name}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex font-sans antialiased">
      {/* 1. Deep Blue Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(v) => setActiveView(v)}
        unreadCount={2}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Top Header — Zoho-Style High-Contrast Banner */}
              <div className="bg-[#0f172a] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-black text-white tracking-tight">
                        Executive Collections Dashboard
                      </h1>
                      {/* Zoho-style Authenticated / Live Operations Green Pill */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#10b981] text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Live Operations</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      WhatsApp revenue collection, message dispatch velocity, and customer payment propensity
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Preset Dropdown */}
                  <div className="relative">
                    <select
                      value={dateSummaryPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="appearance-none text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 pr-8 shadow-xs focus:outline-none cursor-pointer hover:bg-slate-750 transition-colors"
                    >
                      <option value="30d">Daily summary (30 days)</option>
                      <option value="7d">Last 7 days</option>
                      <option value="today">Today's live metrics</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Export CSV Button (Blue Theme like Zoho's Save button) */}
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 6 Metric Cards Row */}
              <KPICardsGroup kpis={kpis} loading={loading} />

              {/* Granular Delivery & Waiting For Reply Pipeline */}
              <WhatsAppDeliveryPipeline kpis={kpis} loading={loading} />

              {/* 2 Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CollectionChart data={timeseries} loading={loading} />
                <MessagesVolumeChart data={timeseries} loading={loading} />
              </div>

              {/* Customer Collection & Propensity Table */}
              <CustomerCollectionTable onRemind={handleRemindCustomer} />

              {/* Collapsible Deep Operational Drilldown */}
              <div className="pt-2">
                <button
                  onClick={() => setShowEnterpriseDetails((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 py-1"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {showEnterpriseDetails
                      ? 'Hide Operational Drilldown (Agents & Pending Links)'
                      : 'Show Operational Drilldown (Agents & Pending Links)'}
                  </span>
                </button>

                {showEnterpriseDetails && (
                  <div className="mt-4 space-y-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AgentTable agents={agents} loading={loading} />
                      <PaymentsTable
                        payments={recentPayments}
                        dateRange={dateRange}
                        agentId={agentId}
                        loading={loading}
                      />
                    </div>
                    <PendingLinksTable
                      links={pendingLinks}
                      dateRange={dateRange}
                      agentId={agentId}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'inbox' && <WhatsAppInbox />}

          {activeView === 'customers' && (
            <div className="space-y-6">
              <div className="bg-[#0f172a] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-black text-white tracking-tight">
                        Customers & Accounts
                      </h1>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#10b981] text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Active CRM Sync</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Manage payment follow-ups, overdue invoices, and WhatsApp conversations
                    </p>
                  </div>
                </div>
              </div>
              <CustomerCollectionTable onRemind={handleRemindCustomer} />
            </div>
          )}

          {activeView === 'reports' && <ReportsView />}

          {/* Dedicated Campaigns View with Campaign Creation */}
          {activeView === 'campaigns' && <CampaignsView />}

          {activeView === 'api' && <ApiConsole />}

          {activeView === 'automation' && (
            <div className="crm-card p-12 text-center bg-white space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800 capitalize">
                Automation & SLAs Intelligence
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Connected to WhatsApp Meta Cloud API. Incoming messages, auto-replies, and SLA escalations are actively monitored.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}