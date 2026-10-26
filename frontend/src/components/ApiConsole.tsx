import React, { useState } from 'react';
import { Cpu, Copy, Check, Send, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export const ApiConsole: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestIngest = async (type: string) => {
    setTesting(true);
    try {
      let body: any = {
        type: 'message_sent',
        contact: '+919876543210',
        agent: 'Priya Patel',
        timestamp: new Date().toISOString(),
      };

      if (type === 'reply') {
        body = {
          type: 'reply_received',
          contact: '+919876543210',
          timestamp: new Date().toISOString(),
        };
      } else if (type === 'payment') {
        body = {
          type: 'payment_received',
          contact: '+919876543210',
          amount: 24900,
          currency: 'INR',
          reference: `pay_sim_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
      }

      const res = await fetch('/api/ingest/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'change-me-ingest-api-key',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(`Successfully dispatched ${type} event to queue!`);
      } else {
        toast.error('Failed to dispatch event');
      }
    } catch {
      toast.error('Network error contacting ingest API');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          WhatsApp API & Ingestion Setup
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure Meta Cloud API webhooks, payment providers, and CRM ingest endpoints
        </p>
      </div>

      {/* Endpoints Table */}
      <div className="crm-card p-6 bg-white space-y-4">
        <h3 className="text-sm font-bold text-gray-900">
          Inbound Monitoring Endpoints
        </h3>

        <div className="space-y-3 text-xs">
          {/* Meta Cloud Webhook */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <span>Meta WhatsApp Cloud Webhook</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Active
                </span>
              </div>
              <div className="font-mono text-gray-500 mt-1">
                POST /webhook/whatsapp (GET verification + HMAC-SHA256)
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('wa', 'http://localhost/webhook/whatsapp')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1 shadow-sm"
            >
              {copiedKey === 'wa' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
              <span>Copy URL</span>
            </button>
          </div>

          {/* Razorpay Webhook */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <span>Razorpay / Payment Webhook</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Signature Verified
                </span>
              </div>
              <div className="font-mono text-gray-500 mt-1">
                POST /webhook/payment/razorpay
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('rzp', 'http://localhost/webhook/payment/razorpay')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1 shadow-sm"
            >
              {copiedKey === 'rzp' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
              <span>Copy URL</span>
            </button>
          </div>

          {/* Generic Ingest API */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <span>Generic CRM / Agent Tool Ingest</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  x-api-key Protected
                </span>
              </div>
              <div className="font-mono text-gray-500 mt-1">
                POST /api/ingest/events & POST /api/ingest/csv
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('ingest', 'http://localhost/api/ingest/events')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1 shadow-sm"
            >
              {copiedKey === 'ingest' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
              <span>Copy URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Test Sandbox */}
      <div className="crm-card p-6 bg-white space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>Interactive Test Dispatcher</span>
        </h3>
        <p className="text-xs text-gray-500">
          Push mock events directly into the BullMQ asynchronous queue to verify database rollups and dashboard updates:
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => handleTestIngest('sent')}
            disabled={testing}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            Dispatch Outbound Message
          </button>
          <button
            onClick={() => handleTestIngest('reply')}
            disabled={testing}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            Dispatch Customer Reply
          </button>
          <button
            onClick={() => handleTestIngest('payment')}
            disabled={testing}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            Dispatch Payment Capture (₹24,900)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConsole;
