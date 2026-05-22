import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { Prisma, TicketStatus, UserRole } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreateTicketMapDto } from "../dto/create-ticket-map.dto";

const ticketMapInclude = {
  category: {
    select: {
      id: true,
      eventId: true,
      name: true,
      usesDays: true
    }
  },
  eventDay: {
    select: {
      id: true,
      name: true,
      startsAt: true
    }
  },
  _count: {
    select: {
      ticketNumbers: true
    }
  }
} satisfies Prisma.TicketMapInclude;

const ticketNumberInclude = {
  ticketMap: {
    select: {
      eventId: true
    }
  }
} satisfies Prisma.TicketNumberInclude;

@Injectable()
export class TicketMapService {
  constructor(private readonly prisma: PrismaService) {}

  async list(categoryId: string, principal: AdminPrincipal) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw this.categoryNotFound();
    await this.assertEventAccess(category.eventId, principal);

    const maps = await this.prisma.ticketMap.findMany({
      where: { categoryId },
      orderBy: [{ createdAt: "asc" }],
      include: ticketMapInclude
    });

    return maps.map((map) => this.presentMap(map));
  }

  async create(categoryId: string, input: CreateTicketMapDto, principal: AdminPrincipal) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { event: true }
    });
    if (!category) throw this.categoryNotFound();
    await this.assertEventAccess(category.eventId, principal);
    this.assertInterval(input.firstNumber, input.lastNumber);

    if (category.usesDays && !input.eventDayId) {
      throw new UnprocessableEntityException({
        code: "EVENT_DAY_REQUIRED",
        message: "Esta categoria usa dias. Escolha um dia para criar o mapa."
      });
    }

    if (!category.usesDays && input.eventDayId) {
      throw new UnprocessableEntityException({
        code: "EVENT_DAY_NOT_ALLOWED",
        message: "Esta categoria nao usa dias. Crie um mapa direto da categoria."
      });
    }

    if (input.eventDayId) {
      const day = await this.prisma.eventDay.findFirst({
        where: {
          id: input.eventDayId,
          eventId: category.eventId
        }
      });

      if (!day) throw this.dayNotFound();
    }

    const map = await this.prisma.$transaction(async (tx) => {
      if (input.eventDayId) {
        await tx.categoryDay.upsert({
          where: {
            categoryId_eventDayId: {
              categoryId,
              eventDayId: input.eventDayId
            }
          },
          update: {},
          create: {
            categoryId,
            eventDayId: input.eventDayId
          }
        });
      }

      const data: Prisma.TicketMapUncheckedCreateInput = {
        eventId: category.eventId,
        categoryId,
        name: input.name.trim(),
        firstNumber: input.firstNumber,
        lastNumber: input.lastNumber,
        status: "ACTIVE",
        ticketNumbers: {
          createMany: {
            data: Array.from({ length: input.lastNumber - input.firstNumber + 1 }, (_, index) => ({
              number: input.firstNumber + index,
              status: TicketStatus.AVAILABLE
            }))
          }
        }
      };
      this.setOptional(data, "eventDayId", input.eventDayId);

      const created = await tx.ticketMap.create({ data });

      return tx.ticketMap.findUniqueOrThrow({
        where: { id: created.id },
        include: ticketMapInclude
      });
    });

    return this.presentMap(map);
  }

  async numbers(id: string, principal: AdminPrincipal) {
    const map = await this.prisma.ticketMap.findUnique({
      where: { id },
      include: {
        ...ticketMapInclude,
        ticketNumbers: {
          orderBy: { number: "asc" }
        }
      }
    });
    if (!map) throw this.mapNotFound();
    await this.assertEventAccess(map.eventId, principal);

    return {
      map: this.presentMap(map),
      numbers: map.ticketNumbers.map((ticketNumber) => this.presentNumber(ticketNumber))
    };
  }

  async blockNumber(id: string, principal: AdminPrincipal) {
    const current = await this.findTicketNumberWithAccess(id, principal);

    if (current.status !== TicketStatus.AVAILABLE) {
      throw new BadRequestException({
        code: "TICKET_NUMBER_CANNOT_BE_BLOCKED",
        message: "Apenas senhas disponiveis podem ser bloqueadas manualmente."
      });
    }

    const ticketNumber = await this.prisma.ticketNumber.update({
      where: { id },
      data: { status: TicketStatus.BLOCKED }
    });

    return this.presentNumber(ticketNumber);
  }

  async unblockNumber(id: string, principal: AdminPrincipal) {
    const current = await this.findTicketNumberWithAccess(id, principal);

    if (current.status !== TicketStatus.BLOCKED) {
      throw new BadRequestException({
        code: "TICKET_NUMBER_CANNOT_BE_UNBLOCKED",
        message: "Apenas senhas bloqueadas manualmente podem ser desbloqueadas."
      });
    }

    const ticketNumber = await this.prisma.ticketNumber.update({
      where: { id },
      data: { status: TicketStatus.AVAILABLE }
    });

    return this.presentNumber(ticketNumber);
  }

  private async findTicketNumberWithAccess(id: string, principal: AdminPrincipal) {
    const ticketNumber = await this.prisma.ticketNumber.findUnique({
      where: { id },
      include: ticketNumberInclude
    });
    if (!ticketNumber) throw this.numberNotFound();
    await this.assertEventAccess(ticketNumber.ticketMap.eventId, principal);

    return ticketNumber;
  }

  private async assertEventAccess(eventId: string, principal: AdminPrincipal) {
    if (principal.role === UserRole.SYSTEM_ADMIN) return;

    const link = await this.prisma.eventUser.findUnique({
      where: { eventId_userId: { eventId, userId: principal.id } }
    });

    if (!link) {
      throw new ForbiddenException({
        code: "EVENT_ACCESS_DENIED",
        message: "Voce nao tem acesso a esta vaquejada."
      });
    }
  }

  private assertInterval(firstNumber: number, lastNumber: number) {
    if (firstNumber > lastNumber) {
      throw new UnprocessableEntityException({
        code: "INVALID_TICKET_MAP_INTERVAL",
        message: "O numero final deve ser maior ou igual ao inicial."
      });
    }

    if (lastNumber - firstNumber + 1 > 1000) {
      throw new UnprocessableEntityException({
        code: "TICKET_MAP_TOO_LARGE",
        message: "Crie mapas com no maximo 1000 senhas por vez."
      });
    }
  }

  private presentMap(map: TicketMapWithInclude) {
    return {
      id: map.id,
      eventId: map.eventId,
      categoryId: map.categoryId,
      eventDayId: map.eventDayId,
      name: map.name,
      firstNumber: map.firstNumber,
      lastNumber: map.lastNumber,
      status: map.status,
      category: map.category,
      eventDay: map.eventDay
        ? {
            ...map.eventDay,
            startsAt: map.eventDay.startsAt.toISOString()
          }
        : null,
      counts: map._count,
      createdAt: map.createdAt.toISOString(),
      updatedAt: map.updatedAt.toISOString()
    };
  }

  private presentNumber(ticketNumber: TicketNumberLike) {
    return {
      id: ticketNumber.id,
      ticketMapId: ticketNumber.ticketMapId,
      number: ticketNumber.number,
      status: ticketNumber.status,
      reservedUntil: ticketNumber.reservedUntil?.toISOString() ?? null,
      currentOrderItemId: ticketNumber.currentOrderItemId,
      createdAt: ticketNumber.createdAt.toISOString(),
      updatedAt: ticketNumber.updatedAt.toISOString()
    };
  }

  private setOptional<T extends object, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | undefined
  ) {
    if (value !== undefined) target[key] = value;
  }

  private categoryNotFound() {
    return new NotFoundException({
      code: "CATEGORY_NOT_FOUND",
      message: "Categoria nao encontrada."
    });
  }

  private dayNotFound() {
    return new NotFoundException({
      code: "EVENT_DAY_NOT_FOUND",
      message: "Dia nao encontrado."
    });
  }

  private mapNotFound() {
    return new NotFoundException({
      code: "TICKET_MAP_NOT_FOUND",
      message: "Mapa de senhas nao encontrado."
    });
  }

  private numberNotFound() {
    return new NotFoundException({
      code: "TICKET_NUMBER_NOT_FOUND",
      message: "Senha nao encontrada."
    });
  }
}

type TicketMapWithInclude = Prisma.TicketMapGetPayload<{ include: typeof ticketMapInclude }>;
type TicketNumberLike = Prisma.TicketNumberGetPayload<Record<string, never>>;
