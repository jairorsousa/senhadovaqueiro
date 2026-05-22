import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { TicketStatus } from "@prisma/client";

export class UpdateAdminTicketDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  cowboyName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  cowboyWhatsapp?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
