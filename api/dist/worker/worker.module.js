"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const prisma_module_1 = require("../prisma/prisma.module");
const whatsapp_processor_1 = require("./whatsapp.processor");
const payment_processor_1 = require("./payment.processor");
const ingest_processor_1 = require("./ingest.processor");
const rollup_processor_1 = require("./rollup.processor");
const metrics_module_1 = require("../metrics/metrics.module");
let WorkerModule = class WorkerModule {
};
exports.WorkerModule = WorkerModule;
exports.WorkerModule = WorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bull_1.BullModule.forRoot({
                redis: process.env.REDIS_URL || 'redis://localhost:6379',
            }),
            bull_1.BullModule.registerQueue({ name: 'whatsapp-events' }, { name: 'payment-events' }, { name: 'ingest-events' }, { name: 'rollup' }),
            prisma_module_1.PrismaModule,
            metrics_module_1.MetricsModule,
        ],
        providers: [whatsapp_processor_1.WhatsappProcessor, payment_processor_1.PaymentProcessor, ingest_processor_1.IngestProcessor, rollup_processor_1.RollupProcessor],
    })
], WorkerModule);
//# sourceMappingURL=worker.module.js.map