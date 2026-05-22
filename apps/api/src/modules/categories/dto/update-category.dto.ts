import { CategoryStatus } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from "class-validator";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumberString()
  ticketPrice?: string;

  @IsOptional()
  @IsNumberString()
  prizeAmount?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cattleCount?: number;

  @IsOptional()
  @IsBoolean()
  usesDays?: boolean;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
