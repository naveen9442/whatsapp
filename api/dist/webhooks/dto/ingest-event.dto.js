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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestEventDto = exports.IngestEventType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var IngestEventType;
(function (IngestEventType) {
    IngestEventType["MESSAGE_SENT"] = "message_sent";
    IngestEventType["REPLY_RECEIVED"] = "reply_received";
    IngestEventType["PAYMENT_LINK_SHARED"] = "payment_link_shared";
    IngestEventType["PAYMENT_RECEIVED"] = "payment_received";
})(IngestEventType || (exports.IngestEventType = IngestEventType = {}));
class IngestEventDto {
}
exports.IngestEventDto = IngestEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: IngestEventType,
        example: IngestEventType.MESSAGE_SENT,
        description: 'Type of event',
    }),
    (0, class_validator_1.IsEnum)(IngestEventType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210', description: 'Contact phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Agent Smith', description: 'Agent identifier or name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "agent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-23T10:00:00.000Z', description: 'ISO timestamp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 499.0, description: 'Amount for payment/payment link events' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngestEventDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'INR', description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'wamid.HBgL...', description: 'Reference ID or transaction ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IngestEventDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { campaign: 'october_promo' },
        description: 'Arbitrary metadata payload',
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], IngestEventDto.prototype, "metadata", void 0);
//# sourceMappingURL=ingest-event.dto.js.map