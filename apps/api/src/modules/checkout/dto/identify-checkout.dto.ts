import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class IdentifyCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @IsString()
  @IsNotEmpty()
  whatsapp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;
}
