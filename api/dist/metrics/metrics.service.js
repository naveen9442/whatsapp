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
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupService = exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MetricsService = MetricsService_1 = class MetricsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MetricsService_1.name);
    }
    async computeDailyMetrics(tenantId, date) {
        const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
        const startOfNextDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + 1, 0, 0, 0, 0));
        this.logger.log(`Computing daily metrics for tenant ${tenantId} on ${startOfDay.toISOString().slice(0, 10)}`);
        const messages = await this.prisma.message.findMany({
            where: {
                tenantId,
                createdAt: { gte: startOfDay, lt: startOfNextDay },
            },
            select: {
                agentId: true,
                direction: true,
                status: true,
            },
        });
        const paymentLinks = await this.prisma.paymentLink.findMany({
            where: {
                tenantId,
                createdAt: { gte: startOfDay, lt: startOfNextDay },
                status: { in: ['SHARED', 'PAID'] },
            },
            select: {
                id: true,
                status: true,
                message: {
                    select: { agentId: true },
                },
            },
        });
        const payments = await this.prisma.payment.findMany({
            where: {
                tenantId,
                paidAt: { gte: startOfDay, lt: startOfNextDay },
            },
            select: {
                id: true,
                amount: true,
                paymentLink: {
                    select: {
                        message: { select: { agentId: true } },
                    },
                },
            },
        });
        const statsByAgent = new Map();
        const getOrCreate = (agentId) => {
            let stats = statsByAgent.get(agentId);
            if (!stats) {
                stats = {
                    messagesSent: 0,
                    delivered: 0,
                    read: 0,
                    failed: 0,
                    replies: 0,
                    linksShared: 0,
                    paymentsReceived: 0,
                    amountReceived: 0,
                };
                statsByAgent.set(agentId, stats);
            }
            return stats;
        };
        for (const msg of messages) {
            const stats = getOrCreate(msg.agentId ?? null);
            if (msg.direction === 'OUTBOUND') {
                stats.messagesSent += 1;
                if (msg.status === 'DELIVERED') {
                    stats.delivered += 1;
                }
                else if (msg.status === 'READ') {
                    stats.read += 1;
                }
                else if (msg.status === 'FAILED') {
                    stats.failed += 1;
                }
            }
            else if (msg.direction === 'INBOUND') {
                stats.replies += 1;
            }
        }
        const distinctAgents = Array.from(statsByAgent.keys()).filter((id) => id !== null);
        const fallbackAgentId = distinctAgents.length === 1 ? distinctAgents[0] : null;
        for (const link of paymentLinks) {
            const agentId = link.message?.agentId ?? link.agentId ?? fallbackAgentId;
            const stats = getOrCreate(agentId);
            stats.linksShared += 1;
        }
        for (const payment of payments) {
            const agentId = payment.paymentLink?.message?.agentId ??
                payment.agentId ??
                fallbackAgentId;
            const stats = getOrCreate(agentId);
            stats.paymentsReceived += 1;
            const amt = typeof payment.amount === 'number' ? payment.amount : 0;
            stats.amountReceived += amt / 100;
        }
        if (statsByAgent.size === 0) {
            getOrCreate(null);
        }
        const results = [];
        for (const [agentId, stat] of statsByAgent.entries()) {
            const upserted = await this.prisma.dailyMetric.upsert({
                where: {
                    tenantId_date_agentId: {
                        tenantId,
                        date: startOfDay,
                        agentId: agentId,
                    },
                },
                update: {
                    messagesSent: stat.messagesSent,
                    delivered: stat.delivered,
                    read: stat.read,
                    failed: stat.failed,
                    replies: stat.replies,
                    linksShared: stat.linksShared,
                    paymentsReceived: stat.paymentsReceived,
                    amountReceived: stat.amountReceived,
                },
                create: {
                    tenantId,
                    date: startOfDay,
                    agentId: agentId,
                    messagesSent: stat.messagesSent,
                    delivered: stat.delivered,
                    read: stat.read,
                    failed: stat.failed,
                    replies: stat.replies,
                    linksShared: stat.linksShared,
                    paymentsReceived: stat.paymentsReceived,
                    amountReceived: stat.amountReceived,
                },
            });
            results.push(upserted);
        }
        this.logger.log(`Finished daily metrics rollup for tenant ${tenantId} on ${startOfDay.toISOString().slice(0, 10)}: ${results.length} record(s)`);
        return results;
    }
};
exports.MetricsService = MetricsService;
exports.RollupService = MetricsService;
exports.RollupService = exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map