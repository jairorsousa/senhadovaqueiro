import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { PasswordService } from "./password.service";

const ACCESS_TOKEN_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  accessTokenTtl() {
    return ACCESS_TOKEN_SECONDS;
  }

  async validateAdmin(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        isActive: true,
        role: {
          in: [UserRole.SYSTEM_ADMIN, UserRole.ORGANIZER]
        }
      }
    });

    if (!user || !this.passwordService.verify(password, user.passwordHash)) {
      throw this.invalidCredentials();
    }

    return user;
  }

  async validateCowboy(cpf: string, password: string) {
    const cowboy = await this.prisma.cowboy.findFirst({
      where: {
        cpf: this.normalizeCpf(cpf),
        isActive: true
      }
    });

    if (!cowboy || !this.passwordService.verify(password, cowboy.passwordHash)) {
      throw this.invalidCredentials();
    }

    return cowboy;
  }

  async registerCowboy(input: { name: string; cpf: string; whatsapp: string; password: string }) {
    const cpf = this.normalizeCpf(input.cpf);

    if (cpf.length !== 11) {
      throw new UnprocessableEntityException({
        code: "INVALID_CPF",
        message: "Informe um CPF com 11 digitos."
      });
    }

    const existing = await this.prisma.cowboy.findUnique({
      where: { cpf }
    });

    if (existing) {
      throw new ConflictException({
        code: "CPF_ALREADY_REGISTERED",
        message: "Ja existe um vaqueiro cadastrado com este CPF."
      });
    }

    return this.prisma.cowboy.create({
      data: {
        name: input.name.trim(),
        cpf,
        whatsapp: this.normalizePhone(input.whatsapp),
        passwordHash: this.passwordService.hash(input.password)
      }
    });
  }

  normalizeCpf(cpf: string) {
    return cpf.replace(/\D/g, "");
  }

  private normalizePhone(phone: string) {
    return phone.replace(/\D/g, "");
  }

  private invalidCredentials() {
    return new UnauthorizedException({
      code: "INVALID_CREDENTIALS",
      message: "CPF/e-mail ou senha invalidos."
    });
  }
}
