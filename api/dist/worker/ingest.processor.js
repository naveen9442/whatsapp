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
var IngestProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const bull_2 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IngestProcessor = IngestProcessor_1 = class IngestProcessor {
    constructor(prisma, rollupQueue) {
        this.prisma = prisma;
        this.rollupQueue = rollupQueue;
        this.logger = new common_1.Logger(IngestProcessor_1.name);
    }
    async handleIngestEvent(job) {
        const data = job.data;
        this.logger.log(`Processing ingest event: ${data.type} (event ID: ${data.eventId})`);
        let tenantId = data.tenantId;
        if (!tenantId) {
            const firstTenant = await this.prisma.tenant.findFirst();
            if (!firstTenant) {
                this.logger.error('No tenant found in database for ingest event');
                return;
            }
            tenantId = firstTenant.id;
        }
        const ts = data.timestamp ? new Date(data.timestamp) : new Date();
        let agentId;
        if (data.agent) {
            const agent = await this.prisma.agent.upsert({
                where: {
                    tenantId_name: {
                        tenantId,
                        name: data.agent,
                    },
                },
                create: {
                    tenantId,
                    name: data.agent,
                },
                update: {},
            });
            agentId = agent.id;
        }
        let contactId;
        if (data.contact) {
            const contact = await this.prisma.contact.upsert({
                where: {
                    tenantId_phone: {
                        tenantId,
                        phone: data.contact,
                    },
                },
                create: {
                    tenantId,
                    phone: data.contact,
                    name: data.contact,
                },
                update: {},
            });
            contactId = contact.id;
        }
        const ref = data.reference || data.eventId;
        const body = data.metadata?.body || null;
        switch (data.type) {
            case 'message_sent': {
                await this.prisma.message.upsert({
                    where: { waMessageId: data.eventId },
                    create: {
                        tenantId,
                        waMessageId: data.eventId,
                        direction: 'OUTBOUND',
                        status: 'SENT',
                        agentId,
                        contactId,
                        body,
                        sentAt: ts,
                        createdAt: ts,
                        rawPayload: data.metadata || data,
                    },
                    update: {
                        direction: 'OUTBOUND',
                        agentId: agentId || undefined,
                        contactId: contactId || undefined,
                        sentAt: ts,
                        body: body || undefined,
                    },
                });
                break;
            }
            case 'reply_received': {
                await this.prisma.message.upsert({
                    where: { waMessageId: data.eventId },
                    create: {
                        tenantId,
                        waMessageId: data.eventId,
                        direction: 'INBOUND',
                        status: 'SENT',
                        agentId,
                        contactId,
                        body,
                        sentAt: ts,
                        createdAt: ts,
                        rawPayload: data.metadata || data,
                    },
                    update: {
                        direction: 'INBOUND',
                        agentId: agentId || undefined,
                        contactId: contactId || undefined,
                        body: body || undefined,
                    },
                });
                break;
            }
            case 'payment_link_shared': {
                await this.prisma.paymentLink.upsert({
                    where: { providerRef: ref },
                    create: {
                        tenantId,
                        providerRef: ref,
                        provider: 'generic',
                        amount: data.amount ? Number(data.amount) : 0,
                        currency: data.currency || 'INR',
                        status: 'SHARED',
                        sharedAt: ts,
                        createdAt: ts,
                        messageId: data.metadata?.messageId || undefined,
                    },
                    update: {
                        status: 'SHARED',
                        amount: data.amount ? Number(data.amount) : undefined,
                        currency: data.currency || undefined,
                        sharedAt: ts,
                        messageId: data.metadata?.messageId || undefined,
                    },
                });
                break;
            }
            case 'payment_received': {
                const existingLink = await this.prisma.paymentLink.findFirst({
                    where: {
                        tenantId,
                        providerRef: ref,
                    },
                });
                if (existingLink) {
                    await this.prisma.paymentLink.update({
                        where: { id: existingLink.id },
                        data: {
                            status: 'PAID',
                            paidAt: ts,
                        },
                    });
                }
                await this.prisma.payment.upsert({
                    where: { providerRef: ref },
                    create: {
                        tenantId,
                        providerRef: ref,
                        paymentLinkId: existingLink?.id,
                        amount: data.amount ? Number(data.amount) : (existingLink?.amount || 0),
                        currency: data.currency || existingLink?.currency || 'INR',
                        status: 'captured',
                        paidAt: ts,
                        createdAt: ts,
                        rawPayload: data.metadata || data,
                    },
                    update: {
                        paymentLinkId: existingLink?.id || undefined,
                        amount: data.amount ? Number(data.amount) : undefined,
                        currency: data.currency || undefined,
                        status: 'captured',
                        paidAt: ts,
                        rawPayload: data.metadata || data,
                    },
                });
                break;
            }
            default:
                this.logger.warn(`Unknown ingest event type: ${data.type}`);
        }
        if (data.eventId) {
            await this.prisma.webhookEvent.updateMany({
                where: { eventId: data.eventId },
                data: { processedAt: new Date() },
            });
        }
        const dateStr = ts.toISOString().slice(0, 10);
        await this.rollupQueue.add('rollup', { tenantId, date: dateStr }, { attempts: 3, removeOnComplete: true });
    }
};
exports.IngestProcessor = IngestProcessor;
__decorate([
    (0, bull_1.Process)('process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IngestProcessor.prototype, "handleIngestEvent", null);
exports.IngestProcessor = IngestProcessor = IngestProcessor_1 = __decorate([
    (0, bull_1.Processor)('ingest-events'),
    __param(1, (0, bull_2.InjectQueue)('rollup')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], IngestProcessor);
//# sourceMappingURL=ingest.processor.js.map