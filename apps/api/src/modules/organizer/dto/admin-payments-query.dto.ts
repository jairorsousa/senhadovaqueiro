import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { PaymentStatus } from "@prisma/client";

export class AdminPaymentsQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  eventDayId?: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
