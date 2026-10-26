import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Copy,
  Trash2,
  X,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Smartphone,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Campaign {
  id: string;
  name: string;
  category: 'Collection' | 'Promotion' | 'Alert' | 'Announcement';
  status: 'Active' | 'Scheduled' | 'Completed' | 'Draft' | 'Paused';
  senderNumber: string;
  targetSegment: string;
  contactCount: number;
  templateName: string;
  scheduledFor: string;
  createdAt: string;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  collectedAmount?: number;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Overdue Invoice Final Reminder',
    category: 'Collection',
    status: 'Active',
    senderNumber: '+91 98765 00001 (HALOOCOM Official)',
    targetSegment: 'Overdue Invoices (>15 Days)',
    contactCount: 1240,
    templateName: 'payment_reminder_v2',
    scheduledFor: 'Immediate',
    createdAt: 'Oct 25, 2026',
    sent: 1240,
    delivered: 1215,
    read: 980,
    replied: 432,
    collectedAmount: 89500,
  },
  {
    id: 'camp_2',
    name: 'Q4 Festive Early Settle Discount',
    category: 'Promotion',
    status: 'Scheduled',
    senderNumber: '+91 98765 00001 (HALOOCOM Official)',
    targetSegment: 'High Payment Propensity',
    contactCount: 850,
    templateName: 'promotional_offer_festive',
    scheduledFor: 'Oct 28, 2026 · 10:00 AM',
    createdAt: 'Oct 26, 2026',
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    collectedAmount: 0,
  },
  {
    id: 'camp_3',
    name: 'Monthly Subscription Renewal Notice',
    category: 'Collection',
    status: 'Completed',
    senderNumber: '+91 98765 00002 (Billing Support)',
    targetSegment: 'All Active Subscribers',
    contactCount: 3420,
    templateName: 'invoice_due_urgent',
    scheduledFor: 'Oct 20, 2026',
    createdAt: 'Oct 19, 2026',
    sent: 3420,
    delivered: 3380,
    read: 2740,
    replied: 890,
    collectedAmount: 142000,
  },
  {
    id: 'camp_4',
    name: 'UPI AutoPay Mandate Activation',
    category: 'Alert',
    status: 'Paused',
    senderNumber: '+91 98765 00001 (HALOOCOM Official)',
    targetSegment: 'Pending UPI Mandates',
    contactCount: 450,
    templateName: 'autopay_mandate_setup',
    scheduledFor: 'Oct 22, 2026',
    createdAt: 'Oct 21, 2026',
    sent: 450,
    delivered: 440,
    read: 310,
    replied: 78,
    collectedAmount: 13500,
  },
];

const TEMPLATES: Record<string, { label: string; text: string; buttonText?: string }> = {
  payment_reminder_v2: {
    label: 'Payment Reminder with Pay Link (Recommended)',
    text: 'Hello {{1}}, this is an automated reminder from HALOOCOM. Your invoice #{{2}} of ₹{{3}} is pending settlement. Please click the button below to pay securely via UPI or Card.',
    buttonText: 'Pay Now Online',
  },
  invoice_due_urgent: {
    label: 'Urgent Overdue Notice',
    text: 'URGENT: Hi {{1}}, your HALOOCOM account shows an outstanding balance of ₹{{3}} due since {{2}}. To prevent service interruption, kindly clear dues immediately.',
    buttonText: 'Settle Payment',
  },
  promotional_offer_festive: {
    label: 'Festive Offer & Quick Renewal',
    text: 'Festive Celebration Offer! Hi {{1}}, settle your subscription today and claim 15% instant cashback on next renewal. Exclusive for HALOOCOM verified partners.',
    buttonText: 'Claim Cashback Now',
  },
  custom_announcement: {
    label: 'Custom Text Broadcast',
    text: 'Dear {{1}}, thank you for partnering with HALOOCOM. We are happy to share that your WhatsApp Business integration has been upgraded with real-time response analytics.',
  },
};

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Collection' | 'Promotion' | 'Alert' | 'Announcement'>('Collection');
  const [formSender, setFormSender] = useState('+91 98765 00001 (HALOOCOM Official)');
  const [formSegment, setFormSegment] = useState('Overdue Invoices (>15 Days)');
  const [formTemplate, setFormTemplate] = useState('payment_reminder_v2');
  const [formScheduleType, setFormScheduleType] = useState<'immediate' | 'later'>('immediate');
  const [formScheduleDate, setFormScheduleDate] = useState('2026-10-28T10:00');
  const [customSampleName, setCustomSampleName] = useState('Acme Corp');
  const [customSampleAmount, setCustomSampleAmount] = useState('24,900');
  const [customSampleInvoice, setCustomSampleInvoice] = useState('INV-8821');

  // Calculated Segment Counts
  const getSegmentCount = (segment: string) => {
    switch (segment) {
      case 'Overdue Invoices (>15 Days)':
        return 1240;
      case 'High Payment Propensity':
        return 850;
      case 'All Active Subscribers':
        return 3420;
      case 'Subscribers Due for Renewal':
        return 2100;
      case 'Upload CSV / Custom List':
        return 480;
      default:
        return 1000;
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }

    const count = getSegmentCount(formSegment);
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      status: formScheduleType === 'immediate' ? 'Active' : 'Scheduled',
      senderNumber: formSender,
      targetSegment: formSegment,
      contactCount: count,
      templateName: formTemplate,
      scheduledFor:
        formScheduleType === 'immediate'
          ? 'Immediate'
          : new Date(formScheduleDate).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
      createdAt: 'Just now',
      sent: formScheduleType === 'immediate' ? count : 0,
      delivered: formScheduleType === 'immediate' ? Math.round(count * 0.98) : 0,
      read: formScheduleType === 'immediate' ? Math.round(count * 0.72) : 0,
      replied: formScheduleType === 'immediate' ? Math.round(count * 0.28) : 0,
      collectedAmount: formScheduleType === 'immediate' ? Math.round(count * 85) : 0,
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    toast.success(`Campaign "${formName}" created successfully!`);

    // Reset Form
    setFormName('');
    setFormScheduleType('immediate');
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'Active' ? 'Paused' : 'Active';
          toast.success(`Campaign marked as ${nextStatus}`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCampaign = (id: string, name: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success(`Campaign "${name}" removed`);
  };

  const handleDuplicateCampaign = (camp: Campaign) => {
    const copy: Campaign = {
      ...camp,
      id: `camp_${Date.now()}`,
      name: `${camp.name} (Copy)`,
      status: 'Draft',
      createdAt: 'Just now',
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      collectedAmount: 0,
    };
    setCampaigns([copy, ...campaigns]);
    toast.success(`Duplicated "${camp.name}" as draft`);
  };

  const handleSendTest = () => {
    toast.success('Test WhatsApp message sent to administrator mobile device (+91 98765 43210)');
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetSegment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Totals
  const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + c.delivered, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.replied, 0);
  const totalCollected = campaigns.reduce((acc, c) => acc + (c.collectedAmount || 0), 0);
  const overallDeliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '98.5';
  const overallReplyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '32.4';

  const previewText = TEMPLATES[formTemplate]?.text
    .replace('{{1}}', customSampleName)
    .replace('{{2}}', customSampleInvoice)
    .replace('{{3}}', customSampleAmount) || '';

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Campaigns & Broadcasts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase font-mono">
              HALOOCOM Suite
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch compliant WhatsApp template broadcasts, automated collection reminders, and personalized drives
          </p>
        </div>

        {/* Primary Action: Create Campaign */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="crm-card p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Campaigns</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Megaphone className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-2">
            {campaigns.length}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {campaigns.filter(c => c.status === 'Active').length} currently active
          </div>
        </div>

        <div className="crm-card p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Dispatched</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-2">
            {totalSent.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Outbound WhatsApp pushes
          </div>
        </div>

        <div className="crm-card p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Delivery Rate</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-2">
            {overallDeliveryRate}%
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-1">
            Verified double-ticks
          </div>
        </div>

        <div className="crm-card p-5 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Response Velocity</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-2">
            {overallReplyRate}%
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            {totalReplied.toLocaleString()} customer replies
          </div>
        </div>

        <div className="crm-card p-5 bg-white flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Recovered Dues</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-2">
            ₹{totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Direct link settlements
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="crm-card p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns or segments..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-gray-400 font-medium mr-1 hidden sm:inline">Status:</span>
          {['All', 'Active', 'Scheduled', 'Completed', 'Paused', 'Draft'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Campaigns Table */}
      <div className="crm-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-medium bg-gray-50/50">
                <th className="py-3.5 px-5 font-semibold">Campaign Name</th>
                <th className="py-3.5 px-4 font-semibold">Target Audience</th>
                <th className="py-3.5 px-4 font-semibold">Schedule</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Sent / Deliv.</th>
                <th className="py-3.5 px-4 font-semibold text-right">Replies</th>
                <th className="py-3.5 px-4 font-semibold text-right">Collected</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Megaphone className="w-8 h-8 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-600">No campaigns found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or click Create Campaign.</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                      >
                        Create Campaign
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => {
                  const delivPct = camp.sent > 0 ? Math.round((camp.delivered / camp.sent) * 100) : 0;
                  const replyPct = camp.sent > 0 ? Math.round((camp.replied / camp.sent) * 100) : 0;

                  return (
                    <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div>
                          <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                            <span>{camp.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                              {camp.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            Template: {camp.templateName}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-gray-800">
                          {camp.targetSegment}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {camp.contactCount.toLocaleString()} recipients
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-gray-600 text-[11px]">
                        {camp.scheduledFor}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            camp.status === 'Active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : camp.status === 'Scheduled'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : camp.status === 'Completed'
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : camp.status === 'Paused'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-gray-900 text-xs">
                          {camp.sent.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-blue-600 font-medium">
                          {delivPct}% delivered
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-semibold text-gray-800 text-xs">
                          {camp.replied.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {replyPct}% rate
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-gray-900 text-xs">
                          {camp.collectedAmount ? `₹${camp.collectedAmount.toLocaleString()}` : '—'}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {['Active', 'Paused'].includes(camp.status) && (
                            <button
                              onClick={() => handleToggleStatus(camp.id)}
                              title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              {camp.status === 'Active' ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicateCampaign(camp)}
                            title="Duplicate Campaign"
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            title="Delete Campaign"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create Campaign Interactive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Create WhatsApp Campaign
                  </h3>
                  <p className="text-xs text-gray-500">
                    Target contacts, configure Meta-approved templates, and schedule dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Split Form + Live Preview */}
            <form onSubmit={handleCreateCampaign} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Settings (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Campaign Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. November Payment Recovery Drive"
                    className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* 2. Category & Sender Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Objective
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Collection">Payment Collection</option>
                      <option value="Promotion">Promotional Blast</option>
                      <option value="Alert">Account Alert</option>
                      <option value="Announcement">Service Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      WhatsApp Sender Profile
                    </label>
                    <select
                      value={formSender}
                      onChange={(e) => setFormSender(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                    >
                      <option value="+91 98765 00001 (HALOOCOM Official)">
                        +91 98765 00001 (Official Verified)
                      </option>
                      <option value="+91 98765 00002 (Billing Support)">
                        +91 98765 00002 (Billing Support)
                      </option>
                    </select>
                  </div>
                </div>

                {/* 3. Target Segment */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Audience Segment
                  </label>
                  <select
                    value={formSegment}
                    onChange={(e) => setFormSegment(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Overdue Invoices (>15 Days)">
                      Overdue Invoices (&gt;15 Days) — 1,240 contacts
                    </option>
                    <option value="High Payment Propensity">
                      High Payment Propensity — 850 contacts
                    </option>
                    <option value="Subscribers Due for Renewal">
                      Subscribers Due for Renewal — 2,100 contacts
                    </option>
                    <option value="All Active Subscribers">
                      All Active Subscribers — 3,420 contacts
                    </option>
                    <option value="Upload CSV / Custom List">
                      Custom CSV Contact List — 480 contacts
                    </option>
                  </select>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Selected recipients: <strong className="text-blue-700 font-mono">{getSegmentCount(formSegment).toLocaleString()}</strong> contacts</span>
                    <span className="text-blue-600 font-medium">WhatsApp opt-in verified</span>
                  </div>
                </div>

                {/* 4. WhatsApp Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp Approved Template
                  </label>
                  <select
                    value={formTemplate}
                    onChange={(e) => setFormTemplate(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(TEMPLATES).map(([key, t]) => (
                      <option key={key} value={key}>
                        {key} — {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Variables Mock Editor */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dynamic Message Parameters</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-blue-800 font-medium block">
                        {"{{1}}"} Name
                      </span>
                      <input
                        type="text"
                        value={customSampleName}
                        onChange={(e) => setCustomSampleName(e.target.value)}
                        className="w-full text-[11px] bg-white border border-blue-200 rounded-lg px-2 py-1 text-gray-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-800 font-medium block">
                        {"{{2}}"} Ref / Date
                      </span>
                      <input
                        type="text"
                        value={customSampleInvoice}
                        onChange={(e) => setCustomSampleInvoice(e.target.value)}
                        className="w-full text-[11px] bg-white border border-blue-200 rounded-lg px-2 py-1 text-gray-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-800 font-medium block">
                        {"{{3}}"} Amount (₹)
                      </span>
                      <input
                        type="text"
                        value={customSampleAmount}
                        onChange={(e) => setCustomSampleAmount(e.target.value)}
                        className="w-full text-[11px] bg-white border border-blue-200 rounded-lg px-2 py-1 text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Schedule Options */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Dispatch Timing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormScheduleType('immediate')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        formScheduleType === 'immediate'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Immediately</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormScheduleType('later')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        formScheduleType === 'later'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule for Later</span>
                    </button>
                  </div>

                  {formScheduleType === 'later' && (
                    <div className="mt-2.5">
                      <input
                        type="datetime-local"
                        value={formScheduleDate}
                        onChange={(e) => setFormScheduleDate(e.target.value)}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Phone Mockup Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80">
                <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5 self-start">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>WhatsApp Mobile Preview</span>
                </div>

                {/* Mobile Frame */}
                <div className="w-full max-w-[280px] bg-slate-900 rounded-[2.2rem] p-3 shadow-xl border-4 border-slate-800">
                  {/* Phone screen */}
                  <div className="bg-[#eef2f5] rounded-[1.6rem] overflow-hidden flex flex-col h-[380px] text-xs">
                    {/* Phone Header */}
                    <div className="bg-[#0b1c36] text-white p-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center">
                        <img src="/haloocom-logo.png" alt="HALOOCOM" className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[11px] truncate flex items-center gap-1">
                          <span>HALOOCOM Official</span>
                          <CheckCircle2 className="w-3 h-3 text-blue-400 inline" />
                        </div>
                        <div className="text-[9px] text-blue-300">Verified Business</div>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-end">
                      {/* Incoming bubble */}
                      <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200/60 text-gray-900 space-y-2">
                        <p className="text-[11px] leading-relaxed break-words text-gray-800">
                          {previewText}
                        </p>

                        {TEMPLATES[formTemplate]?.buttonText && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="w-full py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 text-center text-[11px] font-bold border border-blue-200 flex items-center justify-center gap-1.5 shadow-sm">
                              <ExternalLink className="w-3 h-3" />
                              <span>{TEMPLATES[formTemplate].buttonText}</span>
                            </div>
                          </div>
                        )}

                        <div className="text-right text-[9px] text-gray-400 font-mono">
                          11:58 AM
                        </div>
                      </div>
                    </div>

                    {/* Simulated input bar */}
                    <div className="p-2 bg-white border-t border-gray-200 text-[10px] text-gray-400">
                      Message...
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTest}
                  className="mt-3 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Test to Administrator Device</span>
                </button>
              </div>

              {/* Modal Footer Buttons */}
              <div className="lg:col-span-12 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>
                    {formScheduleType === 'immediate'
                      ? 'Launch Campaign Now'
                      : 'Schedule Campaign'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsView;