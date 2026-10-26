import * as client from 'prom-client';

export const prometheusRegistry = new client.Registry();

// Collect process & runtime metrics
client.collectDefaultMetrics({ register: prometheusRegistry });

export const messagesSentCounter = new client.Counter({
  name: 'whatsapp_messages_sent_total',
  help: 'Total number of WhatsApp messages sent',
  labelNames: ['tenantId', 'agentId'],
  registers: [prometheusRegistry],
});

export const repliesCounter = new client.Counter({
  name: 'whatsapp_replies_total',
  help: 'Total number of WhatsApp replies received',
  labelNames: ['tenantId', 'agentId'],
  registers: [prometheusRegistry],
});

export const paymentsReceivedCounter = new client.Counter({
  name: 'whatsapp_payments_received_total',
  help: 'Total number of WhatsApp payments received',
  labelNames: ['tenantId', 'currency'],
  registers: [prometheusRegistry],
});

export const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry],
});
