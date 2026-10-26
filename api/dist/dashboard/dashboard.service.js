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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildDateFilter(from, to) {
        if (!from && !to)
            return undefined;
        const dateFilter = {};
        if (from) {
            dateFilter.gte = new Date(from);
        }
        if (to) {
            const toDate = new Date(to);
            if (to.length <= 10) {
                toDate.setUTCHours(23, 59, 59, 999);
            }
            dateFilter.lte = toDate;
        }
        return dateFilter;
    }
    async getKPIs(tenantId, query) {
        const where = { tenantId };
        if (query.agentId) {
            where.agentId = query.agentId;
        }
        const dateFilter = this.buildDateFilter(query.from, query.to);
        if (dateFilter) {
            where.date = dateFilter;
        }
        const aggregations = await this.prisma.dailyMetric.aggregate({
            where,
            _sum: {
                messagesSent: true,
                delivered: true,
                read: true,
                failed: true,
                replies: true,
                linksShared: true,
                paymentsReceived: true,
                amountReceived: true,
            },
        });
        const messagesSent = aggregations._sum.messagesSent || 0;
        const delivered = aggregations._sum.delivered || 0;
        const read = aggregations._sum.read || 0;
        const failed = aggregations._sum.failed || 0;
        const replies = aggregations._sum.replies || 0;
        const linksShared = aggregations._sum.linksShared || 0;
        const paymentsReceived = aggregations._sum.paymentsReceived || 0;
        const amountReceived = aggregations._sum.amountReceived || 0;
        const replyRate = messagesSent > 0 ? Number((replies / messagesSent).toFixed(4)) : 0;
        const conversionRate = linksShared > 0 ? Number((paymentsReceived / linksShared).toFixed(4)) : 0;
        const deliveryRate = messagesSent > 0 ? Number((delivered / messagesSent).toFixed(4)) : 0;
        const readRate = delivered > 0 ? Number((read / delivered).toFixed(4)) : 0;
        return {
            messagesSent,
            delivered,
            read,
            failed,
            replies,
            linksShared,
            paymentsReceived,
            amountReceived,
            replyRate,
            conversionRate,
            deliveryRate,
            readRate,
        };
    }
    async getTimeseries(tenantId, query) {
        const where = { tenantId };
        if (query.agentId) {
            where.agentId = query.agentId;
        }
        const dateFilter = this.buildDateFilter(query.from, query.to);
        if (dateFilter) {
            where.date = dateFilter;
        }
        const metrics = await this.prisma.dailyMetric.groupBy({
            by: ['date'],
            where,
            _sum: {
                messagesSent: true,
                delivered: true,
                read: true,
                failed: true,
                replies: true,
                linksShared: true,
                paymentsReceived: true,
                amountReceived: true,
            },
            orderBy: {
                date: 'asc',
            },
        });
        return metrics.map((m) => {
            const dateStr = m.date instanceof Date ? m.date.toISOString().split('T')[0] : String(m.date);
            return {
                date: dateStr,
                messagesSent: m._sum.messagesSent || 0,
                delivered: m._sum.delivered || 0,
                read: m._sum.read || 0,
                failed: m._sum.failed || 0,
                replies: m._sum.replies || 0,
                linksShared: m._sum.linksShared || 0,
                paymentsReceived: m._sum.paymentsReceived || 0,
                amountReceived: m._sum.amountReceived || 0,
            };
        });
    }
    async getFunnel(tenantId, query) {
        const kpis = await this.getKPIs(tenantId, query);
        return {
            sent: kpis.messagesSent,
            delivered: kpis.delivered,
            read: kpis.read,
            replied: kpis.replies,
            linksShared: kpis.linksShared,
            paid: kpis.paymentsReceived,
            conversionRate: kpis.conversionRate,
            replyRate: kpis.replyRate,
        };
    }
    async getAgentPerformance(tenantId, query) {
        const where = { tenantId };
        if (query.agentId) {
            where.agentId = query.agentId;
        }
        const dateFilter = this.buildDateFilter(query.from, query.to);
        if (dateFilter) {
            where.date = dateFilter;
        }
        const metrics = await this.prisma.dailyMetric.groupBy({
            by: ['agentId'],
            where,
            _sum: {
                messagesSent: true,
                delivered: true,
                read: true,
                failed: true,
                replies: true,
                linksShared: true,
                paymentsReceived: true,
                amountReceived: true,
            },
        });
        const agents = await this.prisma.agent.findMany({
            where: { tenantId },
            select: { id: true, name: true, phone: true },
        });
        const agentMap = new Map(agents.map((a) => [a.id, a]));
        return metrics.map((m) => {
            const agent = m.agentId ? agentMap.get(m.agentId) : null;
            const sent = m._sum.messagesSent || 0;
            const replies = m._sum.replies || 0;
            const linksShared = m._sum.linksShared || 0;
            const paid = m._sum.paymentsReceived || 0;
            const amountReceived = m._sum.amountReceived || 0;
            return {
                agentId: m.agentId || 'unassigned',
                agentName: agent ? agent.name : 'Unassigned / System',
                phone: agent?.phone || null,
                messagesSent: sent,
                delivered: m._sum.delivered || 0,
                read: m._sum.read || 0,
                failed: m._sum.failed || 0,
                replies,
                replyRate: sent > 0 ? Number((replies / sent).toFixed(4)) : 0,
                linksShared,
                paymentsReceived: paid,
                amountReceived,
                conversionRate: linksShared > 0 ? Number((paid / linksShared).toFixed(4)) : 0,
            };
        });
    }
    async getRecentPayments(tenantId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Number(query.limit) || 20);
        const skip = (page - 1) * limit;
        const where = { tenantId };
        const dateFilter = this.buildDateFilter(query.from, query.to);
        if (dateFilter) {
            where.createdAt = dateFilter;
        }
        const [total, data] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    paymentLink: true,
                },
            }),
        ]);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPendingLinks(tenantId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Number(query.limit) || 20);
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            status: {
                in: [client_1.PaymentLinkStatus.CREATED, client_1.PaymentLinkStatus.SHARED],
            },
        };
        const dateFilter = this.buildDateFilter(query.from, query.to);
        if (dateFilter) {
            where.createdAt = dateFilter;
        }
        const [total, data] = await Promise.all([
            this.prisma.paymentLink.count({ where }),
            this.prisma.paymentLink.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    message: true,
                    payments: true,
                },
            }),
        ]);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async exportCsv(tenantId, type, query) {
        if (type === 'payments') {
            const where = { tenantId };
            const dateFilter = this.buildDateFilter(query.from, query.to);
            if (dateFilter) {
                where.createdAt = dateFilter;
            }
            const payments = await this.prisma.payment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { paymentLink: true },
                take: 10000,
            });
            const header = 'id,providerRef,amount,currency,status,paidAt,createdAt,paymentLinkId\n';
            const rows = payments.map((p) => {
                return [
                    p.id,
                    p.providerRef,
                    p.amount,
                    p.currency,
                    p.status,
                    p.paidAt ? p.paidAt.toISOString() : '',
                    p.createdAt.toISOString(),
                    p.paymentLinkId || '',
                ]
                    .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                    .join(',');
            });
            return header + rows.join('\n');
        }
        else {
            const where = { tenantId };
            const dateFilter = this.buildDateFilter(query.from, query.to);
            if (dateFilter) {
                where.createdAt = dateFilter;
            }
            const links = await this.prisma.paymentLink.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 10000,
            });
            const header = 'id,providerRef,provider,amount,currency,status,messageId,sharedAt,paidAt,expiresAt,createdAt\n';
            const rows = links.map((l) => {
                return [
                    l.id,
                    l.providerRef,
                    l.provider,
                    l.amount,
                    l.currency,
                    l.status,
                    l.messageId || '',
                    l.sharedAt ? l.sharedAt.toISOString() : '',
                    l.paidAt ? l.paidAt.toISOString() : '',
                    l.expiresAt ? l.expiresAt.toISOString() : '',
                    l.createdAt.toISOString(),
                ]
                    .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                    .join(',');
            });
            return header + rows.join('\n');
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map