import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { PaymentStatus, TicketStatus } from "@prisma/client";
import { Type } from "class-transformer";

export class AdminTicketsQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  eventDayId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  ticketStatus?: TicketStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
