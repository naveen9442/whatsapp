import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCheck,
  Send,
  Sparkles,
  ExternalLink,
  DollarSign,
  ChevronDown,
  RotateCw,
  Search,
  Plus,
  X,
  MessageSquare,
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

  // Search in conversation list
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Search inside active conversation messages
  const [isChatSearchOpen, setIsChatSearchOpen] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');

  // New Chat modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState<boolean>(false);
  const [newChatForm, setNewChatForm] = useState({
    name: '',
    phone: '',
    company: '',
    plan: 'Business Plan',
    planAmount: 9900,
    initialMessage: '',
  });

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone.toLowerCase().includes(q);
    const matchCompany = c.company.toLowerCase().includes(q);
    const matchSnippet = c.snippet.toLowerCase().includes(q);
    const matchMessages = c.messages.some((m) => m.text.toLowerCase().includes(q));
    return matchName || matchPhone || matchCompany || matchSnippet || matchMessages;
  });

  const currentContact =
    conversations.find((c) => c.id === selectedId) ||
    filteredConversations[0] ||
    conversations[0];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll to bottom immediately when switching conversation
  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedId]);

  // Auto-scroll smoothly when new messages arrive
  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentContact?.messages?.length]);

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatForm.name.trim() || !newChatForm.phone.trim()) {
      toast.error('Please enter customer name and WhatsApp number');
      return;
    }

    const nameParts = newChatForm.name.trim().split(' ');
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : newChatForm.name.slice(0, 2).toUpperCase();

    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-sky-600',
      'bg-teal-600',
      'bg-purple-600',
      'bg-cyan-700',
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const initialMsgText =
      newChatForm.initialMessage.trim() ||
      `Hello ${newChatForm.name.trim()}, this is HALOOCOM WhatsApp Billing regarding your account ${
        newChatForm.company ? `at ${newChatForm.company}` : ''
      }.`;

    const newId = `conv_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: initialMsgText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'read',
    };

    const newConv: ConversationItem = {
      id: newId,
      name: newChatForm.name.trim(),
      company: newChatForm.company.trim() || 'Independent Enterprise',
      phone: newChatForm.phone.trim(),
      initials,
      avatarColor,
      lastTime: 'Just now',
      snippet: initialMsgText,
      isOutboundSnippet: true,
      plan: `${newChatForm.plan || 'Business'} · ₹${Number(
        newChatForm.planAmount || 9900
      ).toLocaleString()}/month`,
      planAmount: Number(newChatForm.planAmount || 9900),
      dueInDays: 7,
      propensityScore: 88,
      propensityLevel: 'High',
      messages: [newMsg],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newId);
    setIsNewChatOpen(false);
    setNewChatForm({
      name: '',
      phone: '',
      company: '',
      plan: 'Business Plan',
      planAmount: 9900,
      initialMessage: '',
    });

    // Fire ingest webhook in background
    fetch('/api/ingest/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'change-me-ingest-api-key',
      },
      body: JSON.stringify({
        type: 'message_sent',
        contact: newConv.phone,
        agent: 'Admin User',
        metadata: { text: initialMsgText },
      }),
    }).catch(() => {});

    toast.success(`WhatsApp chat started with ${newConv.name}!`);
  };

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
    <div className="h-full flex-1 min-h-0 flex flex-col">
      {/* Main 3-Column Split Interface - Fills 100% of available viewport */}
      <div className="grid grid-cols-12 gap-3.5 flex-1 min-h-0 h-full items-stretch">
        {/* Left Column: Conversations List (3 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-gray-200/90 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
          {/* Header */}
          <div className="shrink-0 p-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-gray-800 tracking-tight">
                Conversations
              </h3>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
                {filteredConversations.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="shrink-0 p-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or msg..."
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="divide-y divide-gray-50 overflow-y-auto flex-1 min-h-0">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-9 h-9 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-gray-600">No chats found</div>
                <p className="text-[11px] text-gray-400">No contacts match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
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
              })
            )}
          </div>
        </div>

        {/* Middle Column: Chat Thread (6 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
          {/* Conversation Header - Fixed at Top */}
          <div className="shrink-0 px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full ${currentContact.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                  {currentContact.initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900 truncate">
                    {currentContact.name}
                  </h2>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 hidden sm:inline">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                  {currentContact.company} · {currentContact.phone}
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Simulate Incoming Button right in chat header */}
              <button
                type="button"
                onClick={handleSimulateIncoming}
                title="Simulate incoming WhatsApp reply from customer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Simulate reply</span>
              </button>

              {/* In-chat search button */}
              <button
                type="button"
                onClick={() => setIsChatSearchOpen((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  isChatSearchOpen
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="Search messages in this chat"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Search in chat</span>
              </button>
            </div>
          </div>

          {/* In-chat message search bar (expandable) */}
          {isChatSearchOpen && (
            <div className="shrink-0 px-4 py-2 border-b border-gray-100 bg-blue-50/60 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Filter messages in this conversation..."
                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {chatSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChatSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Chat Messages Body - Scrollable Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]/90">
            {/* WhatsApp Day Divider */}
            <div className="flex justify-center my-1">
              <span className="px-3 py-1 bg-white/95 text-gray-500 text-[10px] font-semibold rounded-full shadow-2xs border border-gray-200/60">
                Today
              </span>
            </div>

            {currentContact.messages.filter((m) => {
              if (!chatSearchQuery.trim()) return true;
              return m.text.toLowerCase().includes(chatSearchQuery.toLowerCase());
            }).length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No messages match "{chatSearchQuery}" in this conversation.
              </div>
            ) : (
              currentContact.messages
                .filter((m) => {
                  if (!chatSearchQuery.trim()) return true;
                  return m.text.toLowerCase().includes(chatSearchQuery.toLowerCase());
                })
                .map((m) => {
                  const isOutbound = m.sender === 'agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 text-xs rounded-2xl shadow-2xs transition-all ${
                          isOutbound
                            ? 'bg-[#dcf8c6] text-gray-900 border border-[#bbf7d0]/60 rounded-tr-xs'
                            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-xs'
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
                })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Template Response Pills Bar */}
          <div className="shrink-0 px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Quick:
            </span>
            <button
              type="button"
              onClick={() => handleTemplateSelect('renewal')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700 whitespace-nowrap shadow-2xs transition-colors shrink-0"
            >
              📅 Plan Renewal
            </button>
            <button
              type="button"
              onClick={() => handleTemplateSelect('reminder')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700 whitespace-nowrap shadow-2xs transition-colors shrink-0"
            >
              ⏰ Payment Reminder
            </button>
            <button
              type="button"
              onClick={() => handleTemplateSelect('thanks')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700 whitespace-nowrap shadow-2xs transition-colors shrink-0"
            >
              🙏 Thank You
            </button>
            <button
              type="button"
              onClick={handleSendPaymentLink}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 whitespace-nowrap shadow-2xs transition-colors shrink-0 font-semibold"
            >
              💳 Payment Link
            </button>
          </div>

          {/* Bottom Chat Bar - Fixed at Bottom */}
          <div className="shrink-0 p-3 bg-white border-t border-gray-200/80">
            <div className="flex items-center gap-2">
              {/* Template dropdown */}
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                placeholder="Type a WhatsApp message..."
                className="flex-1 text-xs bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                  inputText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Intelligence (3 cols) */}
        <div className="col-span-12 lg:col-span-3 h-full flex flex-col space-y-3.5 overflow-y-auto pr-0.5">
          {/* Card 1: Payment */}
          <div className="crm-card p-4 bg-white space-y-3 shrink-0">
            <h4 className="text-xs font-bold text-gray-900 tracking-tight uppercase">
              Payment & Plan
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
            <div className="pt-1">
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
          <div className="crm-card p-4 bg-white space-y-2.5 shrink-0">
            <h4 className="text-xs font-bold text-gray-900 tracking-tight uppercase">
              Quick actions
            </h4>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendPaymentLink}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-2xs flex items-center justify-between"
              >
                <span>Send payment link</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={handleRecordPayment}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-800 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-2xs flex items-center justify-between"
              >
                <span>Record payment</span>
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Card 3: Contact overview metadata */}
          <div className="crm-card p-4 bg-white space-y-2 shrink-0">
            <h4 className="text-xs font-bold text-gray-900 tracking-tight uppercase">
              Customer Overview
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Phone</span>
                <span className="font-mono font-medium text-gray-800">{currentContact.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Company</span>
                <span className="font-medium text-gray-800">{currentContact.company}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">WhatsApp SLA</span>
                <span className="text-emerald-600 font-semibold">Active &lt; 2 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New WhatsApp Chat Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.43 19.64L5.26 16.59L5.07 16.29C4.24 14.97 3.8 13.46 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Start New WhatsApp Conversation
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Dispatch an instant WhatsApp message to an existing or new customer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newChatForm.name}
                    onChange={(e) =>
                      setNewChatForm({ ...newChatForm, name: e.target.value })
                    }
                    placeholder="e.g. Vikram Sen"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newChatForm.phone}
                    onChange={(e) =>
                      setNewChatForm({ ...newChatForm, phone: e.target.value })
                    }
                    placeholder="+91 98765 00000"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={newChatForm.company}
                    onChange={(e) =>
                      setNewChatForm({ ...newChatForm, company: e.target.value })
                    }
                    placeholder="e.g. Apex Tech Corp"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Due / Subscription Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newChatForm.planAmount}
                    onChange={(e) =>
                      setNewChatForm({
                        ...newChatForm,
                        planAmount: Number(e.target.value),
                      })
                    }
                    placeholder="9900"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Initial WhatsApp Message
                </label>
                <textarea
                  rows={3}
                  value={newChatForm.initialMessage}
                  onChange={(e) =>
                    setNewChatForm({
                      ...newChatForm,
                      initialMessage: e.target.value,
                    })
                  }
                  placeholder="Type opening message or leave blank for automatic HALOOCOM greeting..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppInbox;
