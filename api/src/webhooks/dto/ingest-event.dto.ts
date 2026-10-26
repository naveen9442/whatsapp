import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export enum IngestEventType {
  MESSAGE_SENT = 'message_sent',
  REPLY_RECEIVED = 'reply_received',
  PAYMENT_LINK_SHARED = 'payment_link_shared',
  PAYMENT_RECEIVED = 'payment_received',
}

export class IngestEventDto {
  @ApiProperty({
    enum: IngestEventType,
    example: IngestEventType.MESSAGE_SENT,
    description: 'Type of event',
  })
  @IsEnum(IngestEventType)
  @IsNotEmpty()
  type: 'message_sent' | 'reply_received' | 'payment_link_shared' | 'payment_received';

  @ApiPropertyOptional({ example: '+919876543210', description: 'Contact phone number' })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ example: 'Agent Smith', description: 'Agent identifier or name' })
  @IsString()
  @IsOptional()
  agent?: string;

  @ApiPropertyOptional({ example: '2026-10-23T10:00:00.000Z', description: 'ISO timestamp' })
  @IsString()
  @IsOptional()
  timestamp?: string;

  @ApiPropertyOptional({ example: 499.0, description: 'Amount for payment/payment link events' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'INR', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'wamid.HBgL...', description: 'Reference ID or transaction ID' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    example: { campaign: 'october_promo' },
    description: 'Arbitrary metadata payload',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
