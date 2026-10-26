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
var WhatsappWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const crypto = require("crypto");
const webhook_service_1 = require("./webhook.service");
const queue_service_1 = require("../queue/queue.service");
let WhatsappWebhookController = WhatsappWebhookController_1 = class WhatsappWebhookController {
    constructor(config, webhookService, queueService) {
        this.config = config;
        this.webhookService = webhookService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(WhatsappWebhookController_1.name);
    }
    verify(mode, token, challenge, res) {
        const verifyToken = this.config.get('WHATSAPP_VERIFY_TOKEN');
        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('WhatsApp webhook verified');
            return res.status(200).send(challenge);
        }
        return res.status(403).send('Verification failed');
    }
    async receive(signature, body, req) {
        const appSecret = this.config.get('WHATSAPP_APP_SECRET');
        if (appSecret) {
            const rawBody = req.rawBody || JSON.stringify(body);
            const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
            if (!signature ||
                signature.length !== expected.length ||
                !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
                this.logger.warn('Invalid WhatsApp signature');
                return { status: 'invalid_signature' };
            }
        }
        const eventId = `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const { isNew } = await this.webhookService.storeRawEvent('whatsapp', eventId, body);
        if (isNew) {
            await this.queueService.enqueueWhatsappEvent(body);
        }
        return { status: 'ok' };
    }
};
exports.WhatsappWebhookController = WhatsappWebhookController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'WhatsApp webhook verification' }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WhatsappWebhookController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Receive WhatsApp events' }),
    __param(0, (0, common_1.Headers)('x-hub-signature-256')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappWebhookController.prototype, "receive", null);
exports.WhatsappWebhookController = WhatsappWebhookController = WhatsappWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('webhook/whatsapp'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        webhook_service_1.WebhookService,
        queue_service_1.QueueService])
], WhatsappWebhookController);
//# sourceMappingURL=whatsapp-webhook.controller.js.map