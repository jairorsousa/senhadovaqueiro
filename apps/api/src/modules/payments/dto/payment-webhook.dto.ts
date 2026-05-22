import { IsObject, IsOptional, IsString } from "class-validator";

export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  secret?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
