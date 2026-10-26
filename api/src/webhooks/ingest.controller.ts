import {
  Controller,
  Post,
  Body,
  Headers,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';
import { randomUUID } from 'crypto';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';
import { IngestEventDto } from './dto/ingest-event.dto';

@ApiTags('ingest')
@ApiSecurity('ApiKey')
@Controller('api/ingest')
export class IngestController {
  private readonly logger = new Logger(IngestController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly webhookService: WebhookService,
    private readonly queueService: QueueService,
  ) {}

  private validateApiKey(apiKey: string): void {
    const expectedKey = this.config.get<string>('INGEST_API_KEY', 'default-ingest-api-key');
    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing x-api-key header');
    }
  }

  @Post('events')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ingest single or batch events via JSON' })
  @ApiBody({
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
  })
  async ingestEvents(
    @Headers('x-api-key') apiKey: string,
    @Body() body: IngestEventDto | IngestEventDto[],
  ) {
    this.validateApiKey(apiKey);

    const events: IngestEventDto[] = Array.isArray(body) ? body : [body];
    if (events.length === 0) {
      throw new BadRequestException('No events provided');
    }

    const processedEvents: any[] = [];
    for (const event of events) {
      const eventId = randomUUID();
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

  @Post('csv')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ingest events via CSV file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async ingestCsv(
    @Headers('x-api-key') apiKey: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.validateApiKey(apiKey);

    if (!file || !file.buffer) {
      throw new BadRequestException('No CSV file uploaded');
    }

    let records: any[];
    try {
      records = parse(file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err: any) {
      this.logger.error(`CSV parse error: ${err.message}`);
      throw new BadRequestException(`Malformed CSV: ${err.message}`);
    }

    if (!records || records.length === 0) {
      throw new BadRequestException('CSV file contains no records');
    }

    const processedEvents: any[] = [];
    for (const row of records) {
      const eventId = randomUUID();
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
}
