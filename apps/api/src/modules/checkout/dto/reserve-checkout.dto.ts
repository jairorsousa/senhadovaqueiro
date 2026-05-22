import { ArrayMaxSize, ArrayMinSize, IsOptional, IsUUID } from "class-validator";

export class ReserveCheckoutDto {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  eventDayId?: string;

  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID(undefined, { each: true })
  ticketNumberIds!: string[];
}
