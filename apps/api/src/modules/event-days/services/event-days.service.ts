import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreateEventDayDto } from "../dto/create-event-day.dto";
import type { UpdateEventDayDto } from "../dto/update-event-day.dto";

const eventDayInclude = {
  _count: {
    select: {
      categories: true,
      ticketMaps: true
    }
  }
} satisfies Prisma.EventDayInclude;

@Injectable()
export class EventDaysService {
  constructor(private readonly prisma: PrismaService) {}

  async list(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const days = await this.prisma.eventDay.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
      include: eventDayInclude
    });

    return days.map((day) => this.present(day));
  }

  async create(eventId: string, input: CreateEventDayDto, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const startsAt = new Date(input.startsAt);
    const endsAt = input.endsAt ? new Date(input.endsAt) : null;
    this.assertDateRange(startsAt, endsAt);

    try {
      const day = await this.prisma.eventDay.create({
        data: {
          eventId,
          name: input.name.trim(),
          startsAt,
          endsAt,
          sortOrder: input.sortOrder ?? 0
        },
        include: eventDayInclude
      });

      return this.present(day);
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException({
          code: "EVENT_DAY_ALREADY_EXISTS",
          message: "Ja existe um dia cadastrado com este horario inicial."
        });
      }

      throw error;
    }
  }

  async update(id: string, input: UpdateEventDayDto, principal: AdminPrincipal) {
    const current = await this.prisma.eventDay.findUnique({ where: { id } });
    if (!current) throw this.notFound();
    await this.assertEventAccess(current.eventId, principal);

    const startsAt = input.startsAt ? new Date(input.startsAt) : current.startsAt;
    const endsAt = input.endsAt ? new Date(input.endsAt) : current.endsAt;
    this.assertDateRange(startsAt, endsAt);

    const data: Prisma.EventDayUpdateInput = { startsAt, endsAt };
    this.setOptional(data, "name", input.name?.trim());
    this.setOptional(data, "sortOrder", input.sortOrder);

    try {
      const day = await this.prisma.eventDay.update({
        where: { id },
        data,
        include: eventDayInclude
      });

      return this.present(day);
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException({
          code: "EVENT_DAY_ALREADY_EXISTS",
          message: "Ja existe um dia cadastrado com este horario inicial."
        });
      }

      throw error;
    }
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

  private assertDateRange(startsAt: Date, endsAt: Date | null) {
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      throw new UnprocessableEntityException({
        code: "INVALID_EVENT_DAY_DATES",
        message: "Informe datas validas."
      });
    }

    if (endsAt && startsAt >= endsAt) {
      throw new UnprocessableEntityException({
        code: "INVALID_EVENT_DAY_DATES",
        message: "A data final do dia deve ser posterior a inicial."
      });
    }
  }

  private present(day: EventDayWithInclude) {
    return {
      id: day.id,
      eventId: day.eventId,
      name: day.name,
      startsAt: day.startsAt.toISOString(),
      endsAt: day.endsAt?.toISOString() ?? null,
      sortOrder: day.sortOrder,
      counts: day._count,
      createdAt: day.createdAt.toISOString(),
      updatedAt: day.updatedAt.toISOString()
    };
  }

  private setOptional<T extends object, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | undefined
  ) {
    if (value !== undefined) target[key] = value;
  }

  private isUniqueConstraint(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private notFound() {
    return new NotFoundException({
      code: "EVENT_DAY_NOT_FOUND",
      message: "Dia nao encontrado."
    });
  }
}

type EventDayWithInclude = Prisma.EventDayGetPayload<{ include: typeof eventDayInclude }>;
