import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { PaymentLinkStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateFilter(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const dateFilter: any = {};
    if (from) {
      dateFilter.gte = new Date(from);
    }
    if (to) {
      // Include the entire end date
      const toDate = new Date(to);
      if (to.length <= 10) {
        toDate.setUTCHours(23, 59, 59, 999);
      }
      dateFilter.lte = toDate;
    }
    return dateFilter;
  }

  async getKPIs(tenantId: string, query: DashboardQueryDto) {
    const where: any = { tenantId };
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

  async getTimeseries(tenantId: string, query: DashboardQueryDto) {
    const where: any = { tenantId };
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
      const dateStr =
        m.date instanceof Date ? m.date.toISOString().split('T')[0] : String(m.date);
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

  async getFunnel(tenantId: string, query: DashboardQueryDto) {
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

  async getAgentPerformance(tenantId: string, query: DashboardQueryDto) {
    const where: any = { tenantId };
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

    // Fetch agents for name lookup
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

  async getRecentPayments(tenantId: string, query: DashboardQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
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

  async getPendingLinks(tenantId: string, query: DashboardQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      status: {
        in: [PaymentLinkStatus.CREATED, PaymentLinkStatus.SHARED],
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

  async exportCsv(
    tenantId: string,
    type: 'payments' | 'links',
    query: DashboardQueryDto,
  ): Promise<string> {
    if (type === 'payments') {
      const where: any = { tenantId };
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
    } else {
      const where: any = { tenantId };
      const dateFilter = this.buildDateFilter(query.from, query.to);
      if (dateFilter) {
        where.createdAt = dateFilter;
      }

      const links = await this.prisma.paymentLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10000,
      });

      const header =
        'id,providerRef,provider,amount,currency,status,messageId,sharedAt,paidAt,expiresAt,createdAt\n';
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

  async getReportsSummary(tenantId: string, query: DashboardQueryDto) {
    const kpis = await this.getKPIs(tenantId, query);
    const timeseries = await this.getTimeseries(tenantId, query);
    const agentPerformance = await this.getAgentPerformance(tenantId, query);

    const totalRevenue = kpis.amountReceived || 0;
    const totalPayments = kpis.paymentsReceived || 0;
    const avgTicketSize = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0;
    const recoveryRate = kpis.linksShared > 0 ? Number(((kpis.paymentsReceived / kpis.linksShared) * 100).toFixed(1)) : 0;

    const agingBuckets = [
      { bracket: '0-7 Days', amount: 32400, count: 6, risk: 'Low' },
      { bracket: '8-14 Days', amount: 24900, count: 4, risk: 'Medium' },
      { bracket: '15-30 Days', amount: 18500, count: 3, risk: 'Elevated' },
      { bracket: '30+ Days', amount: 9800, count: 2, risk: 'High' },
    ];

    return {
      period: query.from && query.to ? `${query.from} to ${query.to}` : 'Last 30 Days',
      kpis: {
        ...kpis,
        avgTicketSize,
        recoveryRate,
      },
      agingBuckets,
      revenueTrend: timeseries,
      agentPerformance,
      generatedAt: new Date().toISOString(),
    };
  }
}
