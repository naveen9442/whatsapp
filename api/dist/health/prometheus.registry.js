"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestsCounter = exports.paymentsReceivedCounter = exports.repliesCounter = exports.messagesSentCounter = exports.prometheusRegistry = void 0;
const client = require("prom-client");
exports.prometheusRegistry = new client.Registry();
client.collectDefaultMetrics({ register: exports.prometheusRegistry });
exports.messagesSentCounter = new client.Counter({
    name: 'whatsapp_messages_sent_total',
    help: 'Total number of WhatsApp messages sent',
    labelNames: ['tenantId', 'agentId'],
    registers: [exports.prometheusRegistry],
});
exports.repliesCounter = new client.Counter({
    name: 'whatsapp_replies_total',
    help: 'Total number of WhatsApp replies received',
    labelNames: ['tenantId', 'agentId'],
    registers: [exports.prometheusRegistry],
});
exports.paymentsReceivedCounter = new client.Counter({
    name: 'whatsapp_payments_received_total',
    help: 'Total number of WhatsApp payments received',
    labelNames: ['tenantId', 'currency'],
    registers: [exports.prometheusRegistry],
});
exports.httpRequestsCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.prometheusRegistry],
});
//# sourceMappingURL=prometheus.registry.js.map