import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { EventStatus, Prisma, UserRole } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreateEventDto } from "../dto/create-event.dto";
import type { UpdateEventDto } from "../dto/update-event.dto";

type AuditContext = {
  userId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

const eventInclude = {
  _count: {
    select: {
      categories: true,
      eventDays: true,
      ticketMaps: true,
      orders: true
    }
  },
  eventUsers: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  },
  categories: {
    select: {
      id: true,
      status: true
    }
  },
  eventDays: {
    select: {
      id: true,
      startsAt: true,
      endsAt: true
    }
  },
  ticketMaps: {
    select: {
      id: true,
      status: true
    }
  }
} satisfies Prisma.EventInclude;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: AdminPrincipal) {
    const where =
      principal.role === UserRole.SYSTEM_ADMIN
        ? {}
        : {
            eventUsers: {
              some: {
                userId: principal.id
              }
            }
          };

    const events = await this.prisma.event.findMany({
      where,
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      include: eventInclude
    });

    return events.map((event) => this.presentEvent(event));
  }

  async create(input: CreateEventDto, principal: AdminPrincipal, audit: AuditContext) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    this.assertValidDateRange(startsAt, endsAt);

    const slug = await this.uniqueSlug(input.name);

    const event = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.EventCreateInput = {
        name: input.name.trim(),
        slug,
        city: input.city.trim(),
        state: input.state.trim().toUpperCase(),
        location: input.location.trim(),
        startsAt,
        endsAt,
        status: EventStatus.DRAFT
      };

      this.setOptional(data, "description", this.optionalText(input.description));
      this.setOptional(data, "rules", this.optionalText(input.rules));
      this.setOptional(data, "bannerUrl", this.optionalText(input.bannerUrl));

      if (principal.role === UserRole.ORGANIZER) {
        data.eventUsers = {
          create: {
            user: {
              connect: {
                id: principal.id
              }
            },
            role: UserRole.ORGANIZER
          }
        };
      }

      const created = await tx.event.create({
        data: {
          ...data
        },
        include: eventInclude
      });

      await this.writeAudit(tx, {
        ...audit,
        action: "EVENT_CREATED",
        entityId: created.id,
        metadata: {
          status: created.status,
          slug: created.slug
        }
      });

      return created;
    });

    return this.presentEvent(event);
  }

  async findOne(id: string, principal: AdminPrincipal) {
    await this.assertEventAccess(id, principal);

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventInclude
    });

    if (!event) {
      throw this.notFound();
    }

    return this.presentEvent(event);
  }

  async update(id: string, input: UpdateEventDto, principal: AdminPrincipal, audit: AuditContext) {
    await this.assertEventAccess(id, principal);

    const current = await this.prisma.event.findUnique({
      where: { id }
    });

    if (!current) {
      throw this.notFound();
    }

    if (input.status && input.status !== EventStatus.CANCELLED) {
      throw new BadRequestException({
        code: "INVALID_EVENT_STATUS_CHANGE",
        message: "Use as acoes de publicar ou encerrar para alterar este status."
      });
    }

    const startsAt = input.startsAt ? new Date(input.startsAt) : current.startsAt;
    const endsAt = input.endsAt ? new Date(input.endsAt) : current.endsAt;
    this.assertValidDateRange(startsAt, endsAt);

    const data: Prisma.EventUpdateInput = {
      startsAt,
      endsAt
    };

    this.setOptional(data, "name", input.name?.trim());
    this.setOptional(data, "city", input.city?.trim());
    this.setOptional(data, "state", input.state?.trim().toUpperCase());
    this.setOptional(data, "location", input.location?.trim());
    this.setOptional(data, "description", this.optionalText(input.description));
    this.setOptional(data, "rules", this.optionalText(input.rules));
    this.setOptional(data, "bannerUrl", this.optionalText(input.bannerUrl));
    this.setOptional(data, "status", input.status);

    const event = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id },
        data,
        include: eventInclude
      });

      await this.writeAudit(tx, {
        ...audit,
        action: input.status === EventStatus.CANCELLED ? "EVENT_CANCELLED" : "EVENT_UPDATED",
        entityId: updated.id,
        metadata: {
          previousStatus: current.status,
          status: updated.status
        }
      });

      return updated;
    });

    return this.presentEvent(event);
  }

  async publish(id: string, principal: AdminPrincipal, audit: AuditContext) {
    await this.assertEventAccess(id, principal);

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventInclude
    });

    if (!event) {
      throw this.notFound();
    }

    const errors = this.validatePublish(event);

    if (errors.length > 0) {
      throw new UnprocessableEntityException({
        code: "EVENT_PUBLICATION_BLOCKED",
        message: "A vaquejada ainda nao pode ser publicada.",
        details: errors
      });
    }

    const published = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id },
        data: {
          status: EventStatus.ACTIVE
        },
        include: eventInclude
      });

      await this.writeAudit(tx, {
        ...audit,
        action: "EVENT_PUBLISHED",
        entityId: id,
        metadata: {
          previousStatus: event.status,
          status: updated.status
        }
      });

      return updated;
    });

    return this.presentEvent(published);
  }

  async archive(id: string, principal: AdminPrincipal, audit: AuditContext) {
    await this.assertEventAccess(id, principal);

    const current = await this.prisma.event.findUnique({
      where: { id }
    });

    if (!current) {
      throw this.notFound();
    }

    const archived = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id },
        data: {
          status: EventStatus.CLOSED
        },
        include: eventInclude
      });

      await this.writeAudit(tx, {
        ...audit,
        action: "EVENT_ARCHIVED",
        entityId: id,
        metadata: {
          previousStatus: current.status,
          status: updated.status
        }
      });

      return updated;
    });

    return this.presentEvent(archived);
  }

  private async assertEventAccess(id: string, principal: AdminPrincipal) {
    if (principal.role === UserRole.SYSTEM_ADMIN) {
      return;
    }

    const link = await this.prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: principal.id
        }
      }
    });

    if (!link) {
      throw new ForbiddenException({
        code: "EVENT_ACCESS_DENIED",
        message: "Voce nao tem acesso a esta vaquejada."
      });
    }
  }

  private validatePublish(event: EventWithIncludes) {
    const errors: Array<{ field: string; message: string }> = [];

    if (!event.name.trim()) errors.push({ field: "name", message: "Informe o nome." });
    if (!event.city.trim()) errors.push({ field: "city", message: "Informe a cidade." });
    if (!event.state.trim()) errors.push({ field: "state", message: "Informe o estado." });
    if (!event.location.trim()) errors.push({ field: "location", message: "Informe o local." });

    if (event.startsAt >= event.endsAt) {
      errors.push({ field: "endsAt", message: "A data final deve ser posterior a inicial." });
    }

    if (
      !event.eventDays.some((day) => day.startsAt >= event.startsAt && day.startsAt <= event.endsAt)
    ) {
      errors.push({
        field: "eventDays",
        message: "Cadastre pelo menos uma data dentro do periodo da vaquejada."
      });
    }

    if (!event.categories.some((category) => category.status === "ACTIVE")) {
      errors.push({
        field: "categories",
        message: "Cadastre pelo menos uma categoria ativa."
      });
    }

    if (!event.ticketMaps.some((ticketMap) => ticketMap.status === "ACTIVE")) {
      errors.push({
        field: "ticketMaps",
        message: "Cadastre pelo menos um mapa de senhas ativo."
      });
    }

    return errors;
  }

  private async uniqueSlug(name: string) {
    const base = this.slugify(name);
    let candidate = base;
    let suffix = 2;

    while (await this.prisma.event.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private slugify(value: string) {
    const slug = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "vaquejada";
  }

  private assertValidDateRange(startsAt: Date, endsAt: Date) {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new UnprocessableEntityException({
        code: "INVALID_EVENT_DATES",
        message: "A data final deve ser posterior a data inicial."
      });
    }
  }

  private optionalText(value: string | undefined) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private setOptional<T extends object, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | undefined
  ) {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  private presentEvent(event: EventWithIncludes) {
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      city: event.city,
      state: event.state,
      location: event.location,
      description: event.description,
      rules: event.rules,
      bannerUrl: event.bannerUrl,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      status: event.status,
      counts: event._count,
      organizers: event.eventUsers.map((eventUser) => eventUser.user),
      publicationChecklist: {
        hasMainInfo: Boolean(event.name && event.city && event.state && event.location),
        hasActiveCategory: event.categories.some((category) => category.status === "ACTIVE"),
        hasTicketMap: event.ticketMaps.some((ticketMap) => ticketMap.status === "ACTIVE"),
        hasValidDates:
          event.startsAt < event.endsAt &&
          event.eventDays.some(
            (day) => day.startsAt >= event.startsAt && day.startsAt <= event.endsAt
          )
      },
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    };
  }

  private async writeAudit(
    tx: Prisma.TransactionClient,
    input: AuditContext & {
      action: string;
      entityId: string;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      userId: input.userId,
      action: input.action,
      entityType: "EVENT",
      entityId: input.entityId
    };

    this.setOptional(data, "metadata", input.metadata);
    this.setOptional(data, "ipAddress", input.ipAddress);
    this.setOptional(data, "userAgent", input.userAgent);

    await tx.auditLog.create({ data });
  }

  private notFound() {
    return new NotFoundException({
      code: "EVENT_NOT_FOUND",
      message: "Vaquejada nao encontrada."
    });
  }
}

type EventWithIncludes = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;
