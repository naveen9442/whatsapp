import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DailyMetricResult {
  messagesSent: number;
  delivered: number;
  read: number;
  failed: number;
  replies: number;
  linksShared: number;
  paymentsReceived: number;
  amountReceived: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Computes aggregated metrics for messages and payments for a given tenant and date,
   * then upserts into daily_metrics on @@unique([tenantId, date, agentId]).
   */
  async computeDailyMetrics(tenantId: string, date: Date | string): Promise<any[]> {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    const startOfDay = new Date(
      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0),
    );
    const startOfNextDay = new Date(
      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + 1, 0, 0, 0, 0),
    );

    this.logger.log(
      `Computing daily metrics for tenant ${tenantId} on ${startOfDay.toISOString().slice(0, 10)}`,
    );

    // 1. Fetch messages for the day
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

    // 2. Fetch payment links shared/paid for the day
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

    // 3. Fetch payments received on the day
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

    // Grouping by agentId (including null)
    const statsByAgent = new Map<string | null, DailyMetricResult>();

    const getOrCreate = (agentId: string | null): DailyMetricResult => {
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

    // Aggregate messages
    for (const msg of messages) {
      const stats = getOrCreate(msg.agentId ?? null);
      if (msg.direction === 'OUTBOUND') {
        stats.messagesSent += 1;
        if (msg.status === 'DELIVERED') {
          stats.delivered += 1;
        } else if (msg.status === 'READ') {
          stats.read += 1;
        } else if (msg.status === 'FAILED') {
          stats.failed += 1;
        }
      } else if (msg.direction === 'INBOUND') {
        stats.replies += 1;
      }
    }

    // Determine fallback agent if only one distinct agent exists in messages
    const distinctAgents = Array.from(statsByAgent.keys()).filter((id) => id !== null);
    const fallbackAgentId = distinctAgents.length === 1 ? distinctAgents[0] : null;

    // Aggregate payment links
    for (const link of paymentLinks) {
      const agentId = (link as any).message?.agentId ?? (link as any).agentId ?? fallbackAgentId;
      const stats = getOrCreate(agentId);
      stats.linksShared += 1;
    }

    // Aggregate payments
    for (const payment of payments) {
      const agentId =
        (payment as any).paymentLink?.message?.agentId ??
        (payment as any).agentId ??
        fallbackAgentId;
      const stats = getOrCreate(agentId);
      stats.paymentsReceived += 1;
      const amt = typeof payment.amount === 'number' ? payment.amount : 0;
      stats.amountReceived += amt / 100;
    }

    // Ensure at least one entry if empty
    if (statsByAgent.size === 0) {
      getOrCreate(null);
    }

    // Upsert into DailyMetric
    const results: any[] = [];
    for (const [agentId, stat] of statsByAgent.entries()) {
      const upserted = await this.prisma.dailyMetric.upsert({
        where: {
          tenantId_date_agentId: {
            tenantId,
            date: startOfDay,
            agentId: agentId as any,
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
          agentId: agentId as any,
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

    this.logger.log(
      `Finished daily metrics rollup for tenant ${tenantId} on ${startOfDay.toISOString().slice(0, 10)}: ${results.length} record(s)`,
    );
    return results;
  }
}

export { MetricsService as RollupService };
