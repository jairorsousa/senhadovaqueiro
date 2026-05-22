import { IsOptional, IsString, MaxLength } from "class-validator";

export class PublicEventsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
