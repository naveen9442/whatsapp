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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getKPIs(user, query) {
        return this.dashboardService.getKPIs(user.tenantId, query);
    }
    async getTimeseries(user, query) {
        return this.dashboardService.getTimeseries(user.tenantId, query);
    }
    async getFunnel(user, query) {
        return this.dashboardService.getFunnel(user.tenantId, query);
    }
    async getAgentPerformance(user, query) {
        return this.dashboardService.getAgentPerformance(user.tenantId, query);
    }
    async getRecentPayments(user, query) {
        return this.dashboardService.getRecentPayments(user.tenantId, query);
    }
    async getPendingLinks(user, query) {
        return this.dashboardService.getPendingLinks(user.tenantId, query);
    }
    async getReportsSummary(user, query) {
        return this.dashboardService.getReportsSummary(user.tenantId, query);
    }
    async exportCsv(user, type, query, res) {
        if (!type || !['payments', 'links'].includes(type)) {
            throw new common_1.BadRequestException('Type must be either "payments" or "links"');
        }
        const csvData = await this.dashboardService.exportCsv(user.tenantId, type, query);
        const filename = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvData);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get summary KPI metrics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getKPIs", null);
__decorate([
    (0, common_1.Get)('timeseries'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily time-series metrics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTimeseries", null);
__decorate([
    (0, common_1.Get)('funnel'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversion funnel metrics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getFunnel", null);
__decorate([
    (0, common_1.Get)('agents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent performance breakdown' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAgentPerformance", null);
__decorate([
    (0, common_1.Get)('payments/recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent payments (paginated)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentPayments", null);
__decorate([
    (0, common_1.Get)('links/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending payment links (paginated)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPendingLinks", null);
__decorate([
    (0, common_1.Get)('reports/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get executive reporting summary and analytics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReportsSummary", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export payments or payment links as CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: ['payments', 'links'], required: true }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dashboard_query_dto_1.DashboardQueryDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "exportCsv", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map