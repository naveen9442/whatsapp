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
var RollupProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("../metrics/metrics.service");
let RollupProcessor = RollupProcessor_1 = class RollupProcessor {
    constructor(metricsService) {
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(RollupProcessor_1.name);
    }
    async handleRollup(job) {
        const { tenantId, date } = job.data;
        this.logger.log(`Processing rollup job for tenant ${tenantId}, date ${date}`);
        try {
            const targetDate = typeof date === 'string' ? new Date(date) : date;
            const results = await this.metricsService.computeDailyMetrics(tenantId, targetDate);
            this.logger.log(`Rollup completed for tenant ${tenantId}, date ${date}. Aggregated ${results.length} record(s).`);
            return results;
        }
        catch (error) {
            this.logger.error(`Rollup failed for tenant ${tenantId}, date ${date}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RollupProcessor = RollupProcessor;
__decorate([
    (0, bull_1.Process)('rollup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RollupProcessor.prototype, "handleRollup", null);
exports.RollupProcessor = RollupProcessor = RollupProcessor_1 = __decorate([
    (0, bull_1.Processor)('rollup'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], RollupProcessor);
//# sourceMappingURL=rollup.processor.js.map