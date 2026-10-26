import React, { useState } from 'react';
import {
  CheckCheck,
  Send,
  Sparkles,
  ExternalLink,
  DollarSign,
  ChevronDown,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  sender: 'contact' | 'agent';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ConversationItem {
  id: string;
  name: string;
  company: string;
  phone: string;
  initials: string;
  avatarColor: string;
  lastTime: string;
  snippet: string;
  isOutboundSnippet: boolean;
  plan: string;
  planAmount: number;
  dueInDays: number;
  propensityScore: number;
  propensityLevel: 'High' | 'Medium' | 'Low';
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'pn',
    name: 'Priya Nair',
    company: 'Northwind Foods',
    phone: '+91 98765 43210',
    initials: 'PN',
    avatarColor: 'bg-blue-600',
    lastTime: 'Oct 20, 09:48 AM',
    snippet: 'Thank you Priya!',
    isOutboundSnippet: true,
    plan: 'Business · ₹24,900/month',
    planAmount: 24900,
    dueInDays: 3,
    propensityScore: 95,
    propensityLevel: 'High',
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        text: 'Hi Priya, your Business plan renews in 3 days (₹24,900). Pay: pay.humancrm.in/1',
        timestamp: 'Oct 20, 06:48 AM',
        status: 'read',
      },
      {
        id: 'm2',
        sender: 'contact',
        text: 'Will pay by Friday, thanks',
        timestamp: 'Oct 20, 08:48 AM',
      },
      {
        id: 'm3',
        sender: 'agent',
        text: 'Thank you Priya!',
        timestamp: 'Oct 20, 09:48 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'dr',
    name: 'Devika Rao',
    company: 'Freelance',
    phone: '+91 98765 43213',
    initials: 'DR',
    avatarColor: 'bg-rose-600',
    lastTime: 'Oct 21, 07:48 AM',
    snippet: 'Card was declined, can I pay by UPI?',
    isOutboundSnippet: false,
    plan: 'Starter · ₹2,900/month',
    planAmount: 2900,
    dueInDays: 1,
    propensityScore: 57,
    propensityLevel: 'Medium',
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        text: 'Hello Devika, payment link for your Starter invoice: https://rzp.io/i/devika',
        timestamp: 'Oct 21, 07:15 AM',
        status: 'read',
      },
      {
        id: 'm2',
        sender: 'contact',
        text: 'Card was declined, can I pay by UPI?',
        timestamp: 'Oct 21, 07:48 AM',
      },
    ],
  },
  {
    id: 'tk',
    name: 'Tanmay Kulkarni',
    company: 'Kestrel Logistics',
    phone: '+91 98765 43212',
    initials: 'TK',
    avatarColor: 'bg-blue-600',
    lastTime: 'Oct 20, 01:48 PM',
    snippet: 'Done, invoice sent.',
    isOutboundSnippet: true,
    plan: 'Professional · ₹9,900/month',
    planAmount: 9900,
    dueInDays: 5,
    propensityScore: 80,
    propensityLevel: 'High',
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        text: 'Could you share the tax invoice for last month?',
        timestamp: 'Oct 20, 01:10 PM',
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Done, invoice sent.',
        timestamp: 'Oct 20, 01:48 PM',
        status: 'read',
      },
    ],
  },
  {
    id: 'as',
    name: 'Ananya Sharma',
    company: 'Lumen Health Clinics',
    phone: '+91 98765 43211',
    initials: 'AS',
    avatarColor: 'bg-purple-600',
    lastTime: 'Oct 19, 02:48 PM',
    snippet: 'Gentle reminder: ₹24,900 is pending.',
    isOutboundSnippet: true,
    plan: 'Enterprise · ₹24,900/month',
    planAmount: 24900,
    dueInDays: 0,
    propensityScore: 27,
    propensityLevel: 'Low',
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        text: 'Gentle reminder: ₹24,900 is pending. Pay here: https://pay.cashfree.com/lumen',
        timestamp: 'Oct 19, 02:48 PM',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'mv',
    name: 'Manish Verma',
    company: 'Verma & Sons Enterprises',
    phone: '+91 98765 43214',
    initials: 'MV',
    avatarColor: 'bg-amber-700',
    lastTime: 'Oct 17, 11:48 AM',
    snippet: 'Confirmed, thank you!',
    isOutboundSnippet: true,
    plan: 'Custom Enterprise Plan',
    planAmount: 0,
    dueInDays: 0,
    propensityScore: 95,
    propensityLevel: 'High',
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        text: 'Is our annual renewal confirmed for this year?',
        timestamp: 'Oct 17, 10:48 AM',
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Confirmed, thank you!',
        timestamp: 'Oct 17, 11:48 AM',
        status: 'read',
      },
    ],
  },
];

export const WhatsAppInbox: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>('pn');
  const [inputText, setInputText] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const currentContact =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'read',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastTime: newMsg.timestamp,
              snippet: newMsg.text,
              isOutboundSnippet: true,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    // Call ingest API in background to maintain realism
    fetch('/api/ingest/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'change-me-ingest-api-key',
      },
      body: JSON.stringify({
        type: 'message_sent',
        contact: currentContact.phone,
        agent: 'Admin User',
        metadata: { text: inputText.trim() },
      }),
    }).catch(() => {});

    setInputText('');
    toast.success('WhatsApp message delivered');
  };

  const handleSimulateIncoming = () => {
    const replies = [
      'Payment initiated through UPI just now! Please verify.',
      'Thanks for the reminder, will clear this by end of day.',
      'Can you please resend the invoice breakdown?',
      'Done! Received confirmation on WhatsApp.',
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    const inboundMsg: ChatMessage = {
      id: `m_in_${Date.now()}`,
      sender: 'contact',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastTime: inboundMsg.timestamp,
              snippet: inboundMsg.text,
              isOutboundSnippet: false,
              messages: [...c.messages, inboundMsg],
            }
          : c
      )
    );

    // Enqueue into real ingest pipeline
    fetch('/api/ingest/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'change-me-ingest-api-key',
      },
      body: JSON.stringify({
        type: 'reply_received',
        contact: currentContact.phone,
        metadata: { text: replyText },
      }),
    }).catch(() => {});

    toast.success(`New incoming WhatsApp from ${currentContact.name}`);
  };

  const handleSendPaymentLink = () => {
    const linkText = `Hi ${currentContact.name}, here is your instant payment link: https://pay.humancrm.in/pl_${Date.now().toString().slice(-6)} (₹${currentContact.planAmount.toLocaleString()})`;
    setInputText(linkText);
  };

  const handleRecordPayment = () => {
    toast.success(`Payment of ₹${currentContact.planAmount.toLocaleString()} recorded!`);

    const confirmationMsg: ChatMessage = {
      id: `m_paid_${Date.now()}`,
      sender: 'agent',
      text: `Payment confirmed! ₹${currentContact.planAmount.toLocaleString()} received via Razorpay. Thank you!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'read',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              dueInDays: 0,
              messages: [...c.messages, confirmationMsg],
            }
          : c
      )
    );

    // Enqueue payment capture into pipeline
    fetch('/api/ingest/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'change-me-ingest-api-key',
      },
      body: JSON.stringify({
        type: 'payment_received',
        contact: currentContact.phone,
        amount: currentContact.planAmount,
        currency: 'INR',
        reference: `pay_wa_${Date.now()}`,
      }),
    }).catch(() => {});
  };

  const handleTemplateSelect = (val: string) => {
    setSelectedTemplate(val);
    if (!val) return;
    if (val === 'renewal') {
      setInputText(
        `Hi ${currentContact.name}, your Business plan renews in 3 days (₹${currentContact.planAmount.toLocaleString()}). Pay: pay.humancrm.in/1`
      );
    } else if (val === 'reminder') {
      setInputText(
        `Gentle reminder: ₹${currentContact.planAmount.toLocaleString()} is pending for Northwind Foods. Let us know if you need assistance.`
      );
    } else if (val === 'thanks') {
      setInputText(`Thank you ${currentContact.name}!`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          WhatsApp Inbox
        </h1>
        <button
          onClick={handleSimulateIncoming}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Simulate incoming WhatsApp</span>
        </button>
      </div>

      {/* Main 3-Column Split Interface */}
      <div className="grid grid-cols-12 gap-5 min-h-[640px] items-stretch">
        {/* Left Column: Conversations List (3 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 crm-card p-0 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              WhatsApp conversations
            </h3>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
            {conversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Avatar with WhatsApp blue badge */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full ${conv.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
                    >
                      {conv.initials}
                    </div>
                    {/* Blue WhatsApp Icon Pill */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {conv.lastTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                      {conv.isOutboundSnippet && (
                        <CheckCheck className="w-3 h-3 text-blue-600 shrink-0" />
                      )}
                      <span className="truncate">{conv.snippet}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Chat Thread (6 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 crm-card p-0 flex flex-col justify-between bg-[#fbfcfd]">
          {/* Conversation Header */}
          <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {currentContact.name}
              </h2>
              <div className="text-[11px] text-gray-500">
                {currentContact.company} · {currentContact.phone}
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto">
            {currentContact.messages.map((m) => {
              const isOutbound = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-xs ${
                      isOutbound ? 'bubble-outbound' : 'bubble-inbound'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                      <span>{m.timestamp}</span>
                      {isOutbound && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Chat Bar */}
          <div className="p-3.5 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              {/* Template dropdown */}
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Template...</option>
                <option value="renewal">Plan Renewal Notice</option>
                <option value="reminder">Payment Reminder</option>
                <option value="thanks">Thank You Confirmation</option>
              </select>

              {/* Message text input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a WhatsApp message"
                className="flex-1 text-xs bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Intelligence (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Card 1: Payment */}
          <div className="crm-card p-5 bg-white space-y-3">
            <h4 className="text-xs font-bold text-gray-900 tracking-tight uppercase">
              Payment
            </h4>

            <div>
              <div className="text-xs font-semibold text-gray-800">
                {currentContact.plan}
              </div>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  Due in {currentContact.dueInDays} d · ₹
                  {currentContact.planAmount.toLocaleString()} due
                </span>
              </div>
            </div>

            {/* Propensity Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-blue-800 mb-1">
                <span>High propensity · {currentContact.propensityScore}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentContact.propensityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Quick actions */}
          <div className="crm-card p-5 bg-white space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 tracking-tight uppercase">
              Quick actions
            </h4>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendPaymentLink}
                className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Send payment link
              </button>

              <button
                onClick={handleRecordPayment}
                className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Record payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInbox;
