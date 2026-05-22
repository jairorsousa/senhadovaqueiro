import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class PublicCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async days(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        status: "ACTIVE",
        event: {
          status: "ACTIVE"
        }
      },
      include: {
        days: {
          include: {
            eventDay: true
          },
          orderBy: {
            eventDay: {
              startsAt: "asc"
            }
          }
        },
        ticketMaps: {
          where: {
            status: "ACTIVE",
            eventDayId: {
              not: null
            }
          },
          select: {
            eventDayId: true
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundException({
        code: "PUBLIC_CATEGORY_NOT_FOUND",
        message: "Categoria nao encontrada para compra."
      });
    }

    const mapDayIds = new Set(category.ticketMaps.map((map) => map.eventDayId));

    return category.days
      .filter((day) => mapDayIds.has(day.eventDayId))
      .map((day) => ({
        id: day.eventDay.id,
        name: day.eventDay.name,
        startsAt: day.eventDay.startsAt.toISOString(),
        endsAt: day.eventDay.endsAt?.toISOString() ?? null
      }));
  }
}

export type PublicCategoryDay = Prisma.CategoryDayGetPayload<{
  include: { eventDay: true };
}>;
