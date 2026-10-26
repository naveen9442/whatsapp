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
var IngestController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const sync_1 = require("csv-parse/sync");
const crypto_1 = require("crypto");
const webhook_service_1 = require("./webhook.service");
const queue_service_1 = require("../queue/queue.service");
let IngestController = IngestController_1 = class IngestController {
    constructor(config, webhookService, queueService) {
        this.config = config;
        this.webhookService = webhookService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(IngestController_1.name);
    }
    validateApiKey(apiKey) {
        const expectedKey = this.config.get('INGEST_API_KEY', 'default-ingest-api-key');
        if (!apiKey || apiKey !== expectedKey) {
            throw new common_1.UnauthorizedException('Invalid or missing x-api-key header');
        }
    }
    async ingestEvents(apiKey, body) {
        this.validateApiKey(apiKey);
        const events = Array.isArray(body) ? body : [body];
        if (events.length === 0) {
            throw new common_1.BadRequestException('No events provided');
        }
        const processedEvents = [];
        for (const event of events) {
            const eventId = (0, crypto_1.randomUUID)();
            const enrichedEvent = {
                ...event,
                eventId,
                receivedAt: new Date().toISOString(),
            };
            const { isNew } = await this.webhookService.storeRawEvent('ingest', eventId, enrichedEvent);
            if (isNew) {
                processedEvents.push(enrichedEvent);
            }
        }
        if (processedEvents.length > 0) {
            await this.queueService.enqueueIngestEvent(processedEvents);
        }
        return {
            status: 'ok',
            received: events.length,
            enqueued: processedEvents.length,
        };
    }
    async ingestCsv(apiKey, file) {
        this.validateApiKey(apiKey);
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No CSV file uploaded');
        }
        let records;
        try {
            records = (0, sync_1.parse)(file.buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
        }
        catch (err) {
            this.logger.error(`CSV parse error: ${err.message}`);
            throw new common_1.BadRequestException(`Malformed CSV: ${err.message}`);
        }
        if (!records || records.length === 0) {
            throw new common_1.BadRequestException('CSV file contains no records');
        }
        const processedEvents = [];
        for (const row of records) {
            const eventId = (0, crypto_1.randomUUID)();
            const eventPayload = {
                type: row.type || 'message_sent',
                contact: row.contact || row.phone,
                agent: row.agent || row.agentName,
                timestamp: row.timestamp || new Date().toISOString(),
                amount: row.amount ? parseFloat(row.amount) : undefined,
                currency: row.currency || 'INR',
                reference: row.reference || row.id || eventId,
                metadata: row,
                eventId,
            };
            const { isNew } = await this.webhookService.storeRawEvent('csv_ingest', eventId, eventPayload);
            if (isNew) {
                processedEvents.push(eventPayload);
            }
        }
        if (processedEvents.length > 0) {
            await this.queueService.enqueueIngestEvent(processedEvents);
        }
        return {
            status: 'ok',
            totalRows: records.length,
            enqueued: processedEvents.length,
        };
    }
};
exports.IngestController = IngestController;
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Ingest single or batch events via JSON' }),
    (0, swagger_1.ApiBody)({
        description: 'A single IngestEventDto or an array of IngestEventDto',
        schema: {
            oneOf: [
                { $ref: '#/components/schemas/IngestEventDto' },
                {
                    type: 'array',
                    items: { $ref: '#/components/schemas/IngestEventDto' },
                },
            ],
        },
    }),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "ingestEvents", null);
__decorate([
    (0, common_1.Post)('csv'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Ingest events via CSV file upload' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IngestController.prototype, "ingestCsv", null);
exports.IngestController = IngestController = IngestController_1 = __decorate([
    (0, swagger_1.ApiTags)('ingest'),
    (0, swagger_1.ApiSecurity)('ApiKey'),
    (0, common_1.Controller)('api/ingest'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        webhook_service_1.WebhookService,
        queue_service_1.QueueService])
], IngestController);
//# sourceMappingURL=ingest.controller.js.map