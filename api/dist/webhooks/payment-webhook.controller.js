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
var PaymentWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const crypto = require("crypto");
const webhook_service_1 = require("./webhook.service");
const queue_service_1 = require("../queue/queue.service");
let PaymentWebhookController = PaymentWebhookController_1 = class PaymentWebhookController {
    constructor(config, webhookService, queueService) {
        this.config = config;
        this.webhookService = webhookService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(PaymentWebhookController_1.name);
    }
    async receive(provider, headers, body, req) {
        const rawBody = req.rawBody || JSON.stringify(body);
        const verified = this.verifySignature(provider, headers, rawBody);
        if (!verified) {
            this.logger.warn(`Invalid ${provider} webhook signature`);
            return { status: 'invalid_signature' };
        }
        const eventId = body.payload?.payment?.entity?.id ||
            body.id ||
            `pay_${provider}_${Date.now()}`;
        const { isNew } = await this.webhookService.storeRawEvent('payment', `${provider}_${eventId}`, body);
        if (isNew) {
            await this.queueService.enqueuePaymentEvent({ provider, ...body });
        }
        return { status: 'ok' };
    }
    verifySignature(provider, headers, rawBody) {
        switch (provider) {
            case 'razorpay': {
                const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
                if (!secret)
                    return true;
                const sig = headers['x-razorpay-signature'];
                if (!sig)
                    return false;
                const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
                return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
            }
            case 'stripe': {
                const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
                if (!secret)
                    return true;
                const sig = headers['stripe-signature'];
                return !!sig;
            }
            case 'cashfree': {
                const secret = this.config.get('CASHFREE_WEBHOOK_SECRET');
                if (!secret)
                    return true;
                const sig = headers['x-webhook-signature'];
                if (!sig)
                    return false;
                const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
                return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
            }
            default:
                return false;
        }
    }
};
exports.PaymentWebhookController = PaymentWebhookController;
__decorate([
    (0, common_1.Post)(':provider'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Receive payment provider webhook (razorpay, stripe, cashfree)' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "receive", null);
exports.PaymentWebhookController = PaymentWebhookController = PaymentWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('webhook/payment'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        webhook_service_1.WebhookService,
        queue_service_1.QueueService])
], PaymentWebhookController);
//# sourceMappingURL=payment-webhook.controller.js.map