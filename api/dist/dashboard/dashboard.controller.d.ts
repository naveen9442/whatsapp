import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKPIs(user: any, query: DashboardQueryDto): Promise<{
        messagesSent: number;
        delivered: number;
        read: number;
        failed: number;
        replies: number;
        linksShared: number;
        paymentsReceived: number;
        amountReceived: number;
        replyRate: number;
        conversionRate: number;
        deliveryRate: number;
        readRate: number;
    }>;
    getTimeseries(user: any, query: DashboardQueryDto): Promise<{
        date: string;
        messagesSent: number;
        delivered: number;
        read: number;
        failed: number;
        replies: number;
        linksShared: number;
        paymentsReceived: number;
        amountReceived: number;
    }[]>;
    getFunnel(user: any, query: DashboardQueryDto): Promise<{
        sent: number;
        delivered: number;
        read: number;
        replied: number;
        linksShared: number;
        paid: number;
        conversionRate: number;
        replyRate: number;
    }>;
    getAgentPerformance(user: any, query: DashboardQueryDto): Promise<{
        agentId: string;
        agentName: string;
        phone: string;
        messagesSent: number;
        delivered: number;
        read: number;
        failed: number;
        replies: number;
        replyRate: number;
        linksShared: number;
        paymentsReceived: number;
        amountReceived: number;
        conversionRate: number;
    }[]>;
    getRecentPayments(user: any, query: DashboardQueryDto): Promise<{
        data: ({
            paymentLink: {
                id: string;
                tenantId: string;
                createdAt: Date;
                provider: string;
                amount: number;
                currency: string;
                providerRef: string;
                status: import(".prisma/client").$Enums.PaymentLinkStatus;
                paidAt: Date | null;
                messageId: string | null;
                sharedAt: Date | null;
                expiresAt: Date | null;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            rawPayload: import("@prisma/client/runtime/library").JsonValue | null;
            amount: number;
            currency: string;
            providerRef: string;
            paymentLinkId: string | null;
            status: string;
            paidAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPendingLinks(user: any, query: DashboardQueryDto): Promise<{
        data: ({
            message: {
                error: string | null;
                id: string;
                tenantId: string;
                createdAt: Date;
                rawPayload: import("@prisma/client/runtime/library").JsonValue | null;
                agentId: string | null;
                status: import(".prisma/client").$Enums.MessageStatus;
                waMessageId: string;
                direction: import(".prisma/client").$Enums.MessageDirection;
                contactId: string | null;
                body: string | null;
                sentAt: Date | null;
                deliveredAt: Date | null;
                readAt: Date | null;
                failedAt: Date | null;
            };
            payments: {
                id: string;
                tenantId: string;
                createdAt: Date;
                rawPayload: import("@prisma/client/runtime/library").JsonValue | null;
                amount: number;
                currency: string;
                providerRef: string;
                paymentLinkId: string | null;
                status: string;
                paidAt: Date | null;
            }[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            provider: string;
            amount: number;
            currency: string;
            providerRef: string;
            status: import(".prisma/client").$Enums.PaymentLinkStatus;
            paidAt: Date | null;
            messageId: string | null;
            sharedAt: Date | null;
            expiresAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReportsSummary(user: any, query: DashboardQueryDto): Promise<{
        period: string;
        kpis: {
            avgTicketSize: number;
            recoveryRate: number;
            messagesSent: number;
            delivered: number;
            read: number;
            failed: number;
            replies: number;
            linksShared: number;
            paymentsReceived: number;
            amountReceived: number;
            replyRate: number;
            conversionRate: number;
            deliveryRate: number;
            readRate: number;
        };
        agingBuckets: {
            bracket: string;
            amount: number;
            count: number;
            risk: string;
        }[];
        revenueTrend: {
            date: string;
            messagesSent: number;
            delivered: number;
            read: number;
            failed: number;
            replies: number;
            linksShared: number;
            paymentsReceived: number;
            amountReceived: number;
        }[];
        agentPerformance: {
            agentId: string;
            agentName: string;
            phone: string;
            messagesSent: number;
            delivered: number;
            read: number;
            failed: number;
            replies: number;
            replyRate: number;
            linksShared: number;
            paymentsReceived: number;
            amountReceived: number;
            conversionRate: number;
        }[];
        generatedAt: string;
    }>;
    exportCsv(user: any, type: 'payments' | 'links', query: DashboardQueryDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
