import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";
import type { CreateCategoryDto } from "../dto/create-category.dto";
import type { UpdateCategoryDto } from "../dto/update-category.dto";

const categoryInclude = {
  _count: {
    select: {
      days: true,
      ticketMaps: true
    }
  }
} satisfies Prisma.CategoryInclude;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const categories = await this.prisma.category.findMany({
      where: { eventId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: categoryInclude
    });

    return categories.map((category) => this.present(category));
  }

  async create(eventId: string, input: CreateCategoryDto, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    try {
      const data: Prisma.CategoryUncheckedCreateInput = {
        eventId,
        name: input.name.trim(),
        ticketPrice: input.ticketPrice,
        usesDays: input.usesDays,
        status: input.status ?? "DRAFT",
        sortOrder: input.sortOrder ?? 0
      };
      this.setOptional(data, "description", this.optionalText(input.description));
      this.setOptional(data, "prizeAmount", this.optionalText(input.prizeAmount));
      this.setOptional(data, "cattleCount", input.cattleCount);

      const created = await this.prisma.category.create({
        data
      });
      const category = await this.findWithInclude(created.id);

      return this.present(category);
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException({
          code: "CATEGORY_ALREADY_EXISTS",
          message: "Ja existe uma categoria com este nome nesta vaquejada."
        });
      }

      throw error;
    }
  }

  async update(id: string, input: UpdateCategoryDto, principal: AdminPrincipal) {
    const current = await this.prisma.category.findUnique({ where: { id } });
    if (!current) throw this.notFound();
    await this.assertEventAccess(current.eventId, principal);

    const data: Prisma.CategoryUpdateInput = {};
    this.setOptional(data, "name", input.name?.trim());
    this.setOptional(data, "description", this.optionalText(input.description));
    this.setOptional(data, "ticketPrice", input.ticketPrice);
    this.setOptional(data, "prizeAmount", this.optionalText(input.prizeAmount));
    this.setOptional(data, "cattleCount", input.cattleCount);
    this.setOptional(data, "usesDays", input.usesDays);
    this.setOptional(data, "status", input.status);
    this.setOptional(data, "sortOrder", input.sortOrder);

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data,
        include: categoryInclude
      });

      return this.present(category);
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException({
          code: "CATEGORY_ALREADY_EXISTS",
          message: "Ja existe uma categoria com este nome nesta vaquejada."
        });
      }

      throw error;
    }
  }

  private async findWithInclude(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude
    });

    if (!category) throw this.notFound();

    return category;
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

  private present(category: CategoryWithInclude) {
    return {
      id: category.id,
      eventId: category.eventId,
      name: category.name,
      description: category.description,
      ticketPrice: category.ticketPrice.toString(),
      prizeAmount: category.prizeAmount?.toString() ?? null,
      cattleCount: category.cattleCount,
      usesDays: category.usesDays,
      status: category.status,
      sortOrder: category.sortOrder,
      counts: category._count,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    };
  }

  private optionalText(value: string | undefined) {
    if (value === undefined) return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
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
      code: "CATEGORY_NOT_FOUND",
      message: "Categoria nao encontrada."
    });
  }
}

type CategoryWithInclude = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;
