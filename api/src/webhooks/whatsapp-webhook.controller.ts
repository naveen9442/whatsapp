import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  Res,
  Req,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';

@ApiTags('webhooks')
@Controller('webhook/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private config: ConfigService,
    private webhookService: WebhookService,
    private queueService: QueueService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'WhatsApp webhook verification' })
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = this.config.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification failed');
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive WhatsApp events' })
  async receive(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    // Validate signature
    const appSecret = this.config.get<string>('WHATSAPP_APP_SECRET');
    if (appSecret) {
      const rawBody = (req as any).rawBody || JSON.stringify(body);
      const expected =
        'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      if (
        !signature ||
        signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ) {
        this.logger.warn('Invalid WhatsApp signature');
        return { status: 'invalid_signature' };
      }
    }

    // Store raw event and enqueue for processing
    const eventId = `wa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const { isNew } = await this.webhookService.storeRawEvent('whatsapp', eventId, body);
    if (isNew) {
      await this.queueService.enqueueWhatsappEvent(body);
    }
    return { status: 'ok' };
  }
}
