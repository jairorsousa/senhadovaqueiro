import { Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

const publicEventInclude = {
  categories: {
    where: {
      status: "ACTIVE"
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      ticketPrice: true,
      prizeAmount: true,
      cattleCount: true,
      usesDays: true,
      status: true,
      ticketMaps: {
        where: {
          status: "ACTIVE"
        },
        select: {
          id: true,
          eventDayId: true,
          name: true,
          firstNumber: true,
          lastNumber: true,
          _count: {
            select: {
              ticketNumbers: true
            }
          }
        }
      }
    }
  },
  eventDays: {
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
    select: {
      id: true,
      name: true,
      startsAt: true,
      endsAt: true
    }
  }
} satisfies Prisma.EventInclude;

@Injectable()
export class PublicEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query?: string) {
    const search = query?.trim();
    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatus.ACTIVE,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: [{ startsAt: "asc" }],
      include: publicEventInclude
    });

    return events.map((event) => this.presentEvent(event));
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        slug,
        status: EventStatus.ACTIVE
      },
      include: publicEventInclude
    });

    if (!event) {
      throw new NotFoundException({
        code: "PUBLIC_EVENT_NOT_FOUND",
        message: "Vaquejada nao encontrada para compra."
      });
    }

    return this.presentEvent(event);
  }

  async categories(eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        status: EventStatus.ACTIVE
      },
      include: {
        categories: publicEventInclude.categories
      }
    });

    if (!event) {
      throw new NotFoundException({
        code: "PUBLIC_EVENT_NOT_FOUND",
        message: "Vaquejada nao encontrada para compra."
      });
    }

    return event.categories.map((category) => this.presentCategory(category));
  }

  private presentEvent(event: PublicEvent) {
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
      categories: event.categories.map((category) => this.presentCategory(category)),
      days: event.eventDays.map((day) => ({
        id: day.id,
        name: day.name,
        startsAt: day.startsAt.toISOString(),
        endsAt: day.endsAt?.toISOString() ?? null
      }))
    };
  }

  private presentCategory(category: PublicCategory) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      ticketPrice: category.ticketPrice.toString(),
      prizeAmount: category.prizeAmount?.toString() ?? null,
      cattleCount: category.cattleCount,
      usesDays: category.usesDays,
      status: category.status,
      ticketMaps: category.ticketMaps.map((ticketMap) => ({
        id: ticketMap.id,
        eventDayId: ticketMap.eventDayId,
        name: ticketMap.name,
        firstNumber: ticketMap.firstNumber,
        lastNumber: ticketMap.lastNumber,
        availableNumbers: ticketMap._count.ticketNumbers
      }))
    };
  }
}

type PublicEvent = Prisma.EventGetPayload<{ include: typeof publicEventInclude }>;
type PublicCategory = PublicEvent["categories"][number];
