import { IsString, MinLength } from "class-validator";

export class RegisterCowboyDto {
  @IsString({ message: "Informe o nome." })
  @MinLength(3, { message: "O nome deve ter pelo menos 3 caracteres." })
  name!: string;

  @IsString({ message: "Informe o CPF." })
  cpf!: string;

  @IsString({ message: "Informe o WhatsApp." })
  whatsapp!: string;

  @IsString({ message: "Informe a senha." })
  @MinLength(8, { message: "A senha deve ter pelo menos 8 caracteres." })
  password!: string;
}
