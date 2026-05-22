import { IsEmail, IsString, MinLength } from "class-validator";

export class AdminLoginDto {
  @IsEmail({}, { message: "Informe um e-mail valido." })
  email!: string;

  @IsString({ message: "Informe a senha." })
  @MinLength(8, { message: "A senha deve ter pelo menos 8 caracteres." })
  password!: string;
}
