import { IsOptional, IsString, Length } from "class-validator";

export class UpdateMyTicketDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  whatsapp?: string;
}
