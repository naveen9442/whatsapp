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
import { Download, ChevronDown, Layers } from 'lucide-react';
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
              {/* Dashboard Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    WhatsApp revenue collection, reply velocity, and customer propensity
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Preset Dropdown */}
                  <div className="relative">
                    <select
                      value={dateSummaryPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="appearance-none text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl px-3.5 py-2 pr-8 shadow-sm focus:outline-none cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      <option value="30d">Daily summary (30 days)</option>
                      <option value="7d">Last 7 days</option>
                      <option value="today">Today's metrics</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Export CSV Button (Blue Theme) */}
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
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
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  Customers & Accounts
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage payment follow-ups, overdue invoices, and WhatsApp conversations
                </p>
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