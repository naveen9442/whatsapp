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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = class QueueService {
    constructor(waQueue, payQueue, ingestQueue, rollupQueue) {
        this.waQueue = waQueue;
        this.payQueue = payQueue;
        this.ingestQueue = ingestQueue;
        this.rollupQueue = rollupQueue;
    }
    async enqueueWhatsappEvent(payload) {
        await this.waQueue.add('process', payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async enqueuePaymentEvent(payload) {
        await this.payQueue.add('process', payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async enqueueIngestEvent(events) {
        const jobs = events.map(e => ({ name: 'process', data: e, opts: { attempts: 3 } }));
        await this.ingestQueue.addBulk(jobs);
    }
    async triggerRollup(tenantId, date) {
        await this.rollupQueue.add('rollup', { tenantId, date }, { attempts: 3 });
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('whatsapp-events')),
    __param(1, (0, bull_1.InjectQueue)('payment-events')),
    __param(2, (0, bull_1.InjectQueue)('ingest-events')),
    __param(3, (0, bull_1.InjectQueue)('rollup')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map