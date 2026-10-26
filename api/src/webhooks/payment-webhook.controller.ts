import { Controller, Post, Body, Headers, Param, HttpCode, Logger, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';

@ApiTags('webhooks')
@Controller('webhook/payment')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private config: ConfigService,
    private webhookService: WebhookService,
    private queueService: QueueService,
  ) {}

  @Post(':provider')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive payment provider webhook (razorpay, stripe, cashfree)' })
  async receive(
    @Param('provider') provider: string,
    @Headers() headers: Record<string, string>,
    @Body() body: any,
    @Req() req: any,
  ) {
    const rawBody = req.rawBody || JSON.stringify(body);

    // Verify signature per provider
    const verified = this.verifySignature(provider, headers, rawBody);
    if (!verified) {
      this.logger.warn(`Invalid ${provider} webhook signature`);
      return { status: 'invalid_signature' };
    }

    const eventId =
      body.payload?.payment?.entity?.id ||
      body.id ||
      `pay_${provider}_${Date.now()}`;
    const { isNew } = await this.webhookService.storeRawEvent('payment', `${provider}_${eventId}`, body);
    if (isNew) {
      await this.queueService.enqueuePaymentEvent({ provider, ...body });
    }
    return { status: 'ok' };
  }

  private verifySignature(
    provider: string,
    headers: Record<string, string>,
    rawBody: string | Buffer,
  ): boolean {
    switch (provider) {
      case 'razorpay': {
        const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
        if (!secret) return true;
        const sig = headers['x-razorpay-signature'];
        if (!sig) return false;
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
      }
      case 'stripe': {
        const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!secret) return true;
        const sig = headers['stripe-signature'];
        return !!sig;
      }
      case 'cashfree': {
        const secret = this.config.get<string>('CASHFREE_WEBHOOK_SECRET');
        if (!secret) return true;
        const sig = headers['x-webhook-signature'];
        if (!sig) return false;
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
      }
      default:
        return false;
    }
  }
}
