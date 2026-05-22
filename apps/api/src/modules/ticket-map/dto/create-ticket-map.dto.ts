import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateTicketMapDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsUUID()
  eventDayId?: string;

  @IsInt()
  @Min(1)
  firstNumber!: number;

  @IsInt()
  @Min(1)
  lastNumber!: number;
}
