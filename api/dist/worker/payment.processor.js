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
var PaymentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const bull_2 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentProcessor = PaymentProcessor_1 = class PaymentProcessor {
    constructor(prisma, rollupQueue) {
        this.prisma = prisma;
        this.rollupQueue = rollupQueue;
        this.logger = new common_1.Logger(PaymentProcessor_1.name);
    }
    async handlePaymentEvent(job) {
        const rawData = job.data;
        this.logger.log(`Processing payment event: job ID ${job.id}`);
        const provider = rawData.provider || 'razorpay';
        const eventType = rawData.event || rawData.payload?.event || '';
        const payload = rawData.payload || rawData;
        const eventId = rawData.eventId || rawData.id;
        let tenantId = rawData.tenantId;
        if (!tenantId) {
            const firstTenant = await this.prisma.tenant.findFirst();
            if (!firstTenant) {
                this.logger.error('No tenant found in database for payment event');
                return;
            }
            tenantId = firstTenant.id;
        }
        const affectedDates = new Set();
        const now = new Date();
        const plEntity = payload.payment_link?.entity;
        const payEntity = payload.payment?.entity;
        const plinkRef = plEntity?.id;
        const shortUrl = plEntity?.short_url;
        const findMatchingPaymentLink = async () => {
            if (!plinkRef && !shortUrl)
                return null;
            const conditions = [];
            if (plinkRef)
                conditions.push({ providerRef: plinkRef });
            if (shortUrl) {
                conditions.push({ providerRef: shortUrl });
                conditions.push({ providerRef: shortUrl.replace(/^https?:\/\//, '') });
                conditions.push({ providerRef: `https://${shortUrl.replace(/^https?:\/\//, '')}` });
            }
            return this.prisma.paymentLink.findFirst({
                where: {
                    tenantId,
                    OR: conditions,
                },
            });
        };
        if (eventType === 'payment_link.created') {
            if (plinkRef) {
                await this.prisma.paymentLink.upsert({
                    where: { providerRef: plinkRef },
                    create: {
                        tenantId,
                        providerRef: plinkRef,
                        provider,
                        amount: plEntity.amount ? Number(plEntity.amount) : 0,
                        currency: plEntity.currency || 'INR',
                        status: 'CREATED',
                        expiresAt: plEntity.expire_by ? new Date(plEntity.expire_by * 1000) : undefined,
                    },
                    update: {
                        amount: plEntity.amount ? Number(plEntity.amount) : undefined,
                        currency: plEntity.currency || undefined,
                        status: 'CREATED',
                        expiresAt: plEntity.expire_by ? new Date(plEntity.expire_by * 1000) : undefined,
                    },
                });
            }
            affectedDates.add(now.toISOString().slice(0, 10));
        }
        else if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
            let matchedLink = await findMatchingPaymentLink();
            const paidAt = payEntity?.created_at
                ? new Date(Number(payEntity.created_at) * 1000)
                : now;
            affectedDates.add(paidAt.toISOString().slice(0, 10));
            if (matchedLink) {
                matchedLink = await this.prisma.paymentLink.update({
                    where: { id: matchedLink.id },
                    data: {
                        status: 'PAID',
                        paidAt,
                        amount: plEntity?.amount ? Number(plEntity.amount) : matchedLink.amount,
                    },
                });
            }
            else if (plinkRef) {
                matchedLink = await this.prisma.paymentLink.create({
                    data: {
                        tenantId,
                        providerRef: plinkRef,
                        provider,
                        amount: plEntity?.amount ? Number(plEntity.amount) : (payEntity?.amount ? Number(payEntity.amount) : 0),
                        currency: plEntity?.currency || payEntity?.currency || 'INR',
                        status: 'PAID',
                        paidAt,
                    },
                });
            }
            const payRef = payEntity?.id || (plinkRef ? `pay_${plinkRef}` : `pay_${Date.now()}`);
            const paymentAmount = payEntity?.amount
                ? Number(payEntity.amount)
                : (plEntity?.amount ? Number(plEntity.amount) : 0);
            const paymentCurrency = payEntity?.currency || plEntity?.currency || 'INR';
            await this.prisma.payment.upsert({
                where: { providerRef: payRef },
                create: {
                    tenantId,
                    providerRef: payRef,
                    paymentLinkId: matchedLink?.id,
                    amount: paymentAmount,
                    currency: paymentCurrency,
                    status: payEntity?.status || 'captured',
                    paidAt,
                    rawPayload: payload,
                },
                update: {
                    paymentLinkId: matchedLink?.id || undefined,
                    amount: paymentAmount,
                    currency: paymentCurrency,
                    status: payEntity?.status || 'captured',
                    paidAt,
                    rawPayload: payload,
                },
            });
        }
        else if (eventType === 'payment_link.expired') {
            const matchedLink = await findMatchingPaymentLink();
            if (matchedLink) {
                await this.prisma.paymentLink.update({
                    where: { id: matchedLink.id },
                    data: { status: 'EXPIRED' },
                });
            }
            else if (plinkRef) {
                await this.prisma.paymentLink.upsert({
                    where: { providerRef: plinkRef },
                    create: {
                        tenantId,
                        providerRef: plinkRef,
                        provider,
                        amount: plEntity?.amount ? Number(plEntity.amount) : 0,
                        currency: plEntity?.currency || 'INR',
                        status: 'EXPIRED',
                    },
                    update: { status: 'EXPIRED' },
                });
            }
            affectedDates.add(now.toISOString().slice(0, 10));
        }
        else if (eventType === 'payment_link.cancelled') {
            const matchedLink = await findMatchingPaymentLink();
            if (matchedLink) {
                await this.prisma.paymentLink.update({
                    where: { id: matchedLink.id },
                    data: { status: 'CANCELLED' },
                });
            }
            else if (plinkRef) {
                await this.prisma.paymentLink.upsert({
                    where: { providerRef: plinkRef },
                    create: {
                        tenantId,
                        providerRef: plinkRef,
                        provider,
                        amount: plEntity?.amount ? Number(plEntity.amount) : 0,
                        currency: plEntity?.currency || 'INR',
                        status: 'CANCELLED',
                    },
                    update: { status: 'CANCELLED' },
                });
            }
            affectedDates.add(now.toISOString().slice(0, 10));
        }
        if (eventId) {
            await this.prisma.webhookEvent.updateMany({
                where: { eventId },
                data: { processedAt: new Date() },
            });
        }
        if (affectedDates.size === 0) {
            affectedDates.add(now.toISOString().slice(0, 10));
        }
        for (const date of affectedDates) {
            await this.rollupQueue.add('rollup', { tenantId, date }, { attempts: 3, removeOnComplete: true });
        }
    }
};
exports.PaymentProcessor = PaymentProcessor;
__decorate([
    (0, bull_1.Process)('process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProcessor.prototype, "handlePaymentEvent", null);
exports.PaymentProcessor = PaymentProcessor = PaymentProcessor_1 = __decorate([
    (0, bull_1.Processor)('payment-events'),
    __param(1, (0, bull_2.InjectQueue)('rollup')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], PaymentProcessor);
//# sourceMappingURL=payment.processor.js.map