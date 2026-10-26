"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const bull_2 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let WhatsappProcessor = WhatsappProcessor_1 = class WhatsappProcessor {
    constructor(prisma, config, rollupQueue) {
        this.prisma = prisma;
        this.config = config;
        this.rollupQueue = rollupQueue;
        this.logger = new common_1.Logger(WhatsappProcessor_1.name);
    }
    async handleWhatsappEvent(job) {
        const rawData = job.data;
        this.logger.log(`Processing WhatsApp event: job ID ${job.id}`);
        const payload = rawData.payload || rawData;
        const eventId = rawData.eventId || rawData.id;
        let tenantId = rawData.tenantId;
        if (!tenantId) {
            const firstTenant = await this.prisma.tenant.findFirst();
            if (!firstTenant) {
                this.logger.error('No tenant found in database for WhatsApp event');
                return;
            }
            tenantId = firstTenant.id;
        }
        const affectedDates = new Set();
        const entries = Array.isArray(payload.entry) ? payload.entry : [];
        for (const entry of entries) {
            const changes = Array.isArray(entry.changes) ? entry.changes : [];
            for (const change of changes) {
                const value = change.value;
                if (!value)
                    continue;
                const contactMap = new Map();
                if (Array.isArray(value.contacts)) {
                    for (const c of value.contacts) {
                        if (c.wa_id && c.profile?.name) {
                            contactMap.set(c.wa_id, c.profile.name);
                        }
                    }
                }
                if (Array.isArray(value.statuses)) {
                    for (const statusItem of value.statuses) {
                        const waMessageId = statusItem.id;
                        if (!waMessageId)
                            continue;
                        const tsDate = this.parseTimestamp(statusItem.timestamp);
                        const dateStr = tsDate.toISOString().slice(0, 10);
                        affectedDates.add(dateStr);
                        const status = this.mapStatus(statusItem.status);
                        const errorsJson = statusItem.errors ? JSON.stringify(statusItem.errors) : null;
                        const existingMessage = await this.prisma.message.findUnique({
                            where: { waMessageId },
                        });
                        const sentAt = status === 'SENT' ? tsDate : existingMessage?.sentAt;
                        const deliveredAt = status === 'DELIVERED' ? tsDate : existingMessage?.deliveredAt;
                        const readAt = status === 'READ' ? tsDate : existingMessage?.readAt;
                        const failedAt = status === 'FAILED' ? tsDate : existingMessage?.failedAt;
                        const message = await this.prisma.message.upsert({
                            where: { waMessageId },
                            create: {
                                tenantId,
                                waMessageId,
                                direction: 'OUTBOUND',
                                status,
                                sentAt: status === 'SENT' ? tsDate : undefined,
                                deliveredAt: status === 'DELIVERED' ? tsDate : undefined,
                                readAt: status === 'READ' ? tsDate : undefined,
                                failedAt: status === 'FAILED' ? tsDate : undefined,
                                error: errorsJson,
                                rawPayload: statusItem,
                                createdAt: tsDate,
                            },
                            update: {
                                status,
                                sentAt: sentAt ?? undefined,
                                deliveredAt: deliveredAt ?? undefined,
                                readAt: readAt ?? undefined,
                                failedAt: failedAt ?? undefined,
                                error: errorsJson ?? existingMessage?.error,
                                rawPayload: statusItem,
                            },
                        });
                        if (message.body) {
                            await this.detectAndStorePaymentLink(message.id, message.body, tenantId, tsDate);
                        }
                    }
                }
                if (Array.isArray(value.messages)) {
                    for (const msg of value.messages) {
                        const waMessageId = msg.id;
                        if (!waMessageId)
                            continue;
                        const tsDate = this.parseTimestamp(msg.timestamp);
                        const dateStr = tsDate.toISOString().slice(0, 10);
                        affectedDates.add(dateStr);
                        const phone = msg.from;
                        const contactName = contactMap.get(phone) || phone;
                        let contactId;
                        if (phone) {
                            const contact = await this.prisma.contact.upsert({
                                where: {
                                    tenantId_phone: {
                                        tenantId,
                                        phone,
                                    },
                                },
                                create: {
                                    tenantId,
                                    phone,
                                    name: contactName,
                                },
                                update: {
                                    name: contactName,
                                },
                            });
                            contactId = contact.id;
                        }
                        const body = msg.text?.body || (msg.type !== 'text' ? `[${msg.type || 'media'}]` : null);
                        await this.prisma.message.upsert({
                            where: { waMessageId },
                            create: {
                                tenantId,
                                waMessageId,
                                direction: 'INBOUND',
                                status: 'SENT',
                                contactId,
                                body,
                                sentAt: tsDate,
                                rawPayload: msg,
                                createdAt: tsDate,
                            },
                            update: {
                                direction: 'INBOUND',
                                contactId: contactId ?? undefined,
                                body: body ?? undefined,
                                rawPayload: msg,
                            },
                        });
                    }
                }
            }
        }
        if (eventId) {
            await this.prisma.webhookEvent.updateMany({
                where: { eventId },
                data: { processedAt: new Date() },
            });
        }
        if (affectedDates.size === 0) {
            affectedDates.add(new Date().toISOString().slice(0, 10));
        }
        for (const date of affectedDates) {
            await this.rollupQueue.add('rollup', { tenantId, date }, { attempts: 3, removeOnComplete: true });
        }
    }
    async detectAndStorePaymentLink(messageId, body, tenantId, sharedAt) {
        const patternStr = this.config.get('PAYMENT_LINK_PATTERNS') ||
            process.env.PAYMENT_LINK_PATTERNS ||
            'rzp\\.io|razorpay\\.com/pl_|pay\\.cashfree\\.com';
        const regex = new RegExp(`(?:https?://[^\\s]+)?(?:${patternStr})[^\\s]*`, 'gi');
        const matches = body.match(regex);
        if (!matches || matches.length === 0)
            return;
        for (const rawUrl of matches) {
            const url = rawUrl.trim();
            const providerRef = url;
            await this.prisma.paymentLink.upsert({
                where: { providerRef },
                create: {
                    tenantId,
                    providerRef,
                    provider: 'razorpay',
                    amount: 0,
                    currency: 'INR',
                    status: 'SHARED',
                    messageId,
                    sharedAt,
                },
                update: {
                    status: 'SHARED',
                    messageId,
                    sharedAt,
                },
            });
            this.logger.log(`Detected payment link ${providerRef} for message ${messageId}`);
        }
    }
    mapStatus(status) {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'DELIVERED';
            case 'read':
                return 'READ';
            case 'failed':
                return 'FAILED';
            case 'sent':
            default:
                return 'SENT';
        }
    }
    parseTimestamp(timestamp) {
        if (!timestamp)
            return new Date();
        const tsNum = Number(timestamp);
        if (isNaN(tsNum) || tsNum <= 0)
            return new Date();
        return tsNum > 1e11 ? new Date(tsNum) : new Date(tsNum * 1000);
    }
};
exports.WhatsappProcessor = WhatsappProcessor;
__decorate([
    (0, bull_1.Process)('process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappProcessor.prototype, "handleWhatsappEvent", null);
exports.WhatsappProcessor = WhatsappProcessor = WhatsappProcessor_1 = __decorate([
    (0, bull_1.Processor)('whatsapp-events'),
    __param(2, (0, bull_2.InjectQueue)('rollup')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService, Object])
], WhatsappProcessor);
//# sourceMappingURL=whatsapp.processor.js.map