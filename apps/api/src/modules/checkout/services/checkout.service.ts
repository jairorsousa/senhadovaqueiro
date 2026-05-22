import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { OrderStatus, Prisma, TicketStatus } from "@prisma/client";
import { PasswordService } from "../../auth/services/password.service";
import { PrismaService } from "../../../prisma/prisma.service";
import type { IdentifyCheckoutDto } from "../dto/identify-checkout.dto";
import type { ReserveCheckoutDto } from "../dto/reserve-checkout.dto";

const RESERVATION_MINUTES = 15;

const orderInclude = {
  cowboy: {
    select: {
      id: true,
      name: true,
      cpf: true,
      whatsapp: true
    }
  },
  event: {
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true
    }
  },
  items: {
    include: {
      ticketNumber: {
        include: {
          ticketMap: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  ticketPrice: true,
                  usesDays: true
                }
              },
              eventDay: {
                select: {
                  id: true,
                  name: true,
                  startsAt: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  }
} satisfies Prisma.OrderInclude;

type LockedTicket = {
  id: string;
  number: number;
  status: TicketStatus;
  ticketMapId: string;
  eventId: string;
  categoryId: string;
  eventDayId: string | null;
  ticketPrice: Prisma.Decimal;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  async reserve(input: ReserveCheckoutDto) {
    const uniqueTicketIds = [...new Set(input.ticketNumberIds)];

    if (uniqueTicketIds.length !== input.ticketNumberIds.length) {
      throw new UnprocessableEntityException({
        code: "DUPLICATED_TICKET_SELECTION",
        message: "Remova senhas repetidas da selecao."
      });
    }

    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60_000);

    const order = await this.prisma.$transaction(
      async (tx) => {
        const ticketIdSql = uniqueTicketIds.map((id) => Prisma.sql`${id}::uuid`);
        const tickets = await tx.$queryRaw<LockedTicket[]>`
          SELECT
            tn.id,
            tn.number,
            tn.status,
            tn.ticket_map_id AS "ticketMapId",
            tm.event_id AS "eventId",
            tm.category_id AS "categoryId",
            tm.event_day_id AS "eventDayId",
            c.ticket_price AS "ticketPrice"
          FROM ticket_numbers tn
          INNER JOIN ticket_maps tm ON tm.id = tn.ticket_map_id
          INNER JOIN categories c ON c.id = tm.category_id
          INNER JOIN events e ON e.id = tm.event_id
          WHERE tn.id IN (${Prisma.join(ticketIdSql)})
          FOR UPDATE
        `;

        if (tickets.length !== uniqueTicketIds.length) {
          throw this.unavailableTickets();
        }

        for (const ticket of tickets) {
          if (
            ticket.eventId !== input.eventId ||
            ticket.categoryId !== input.categoryId ||
            ticket.status !== TicketStatus.AVAILABLE
          ) {
            throw this.unavailableTickets();
          }

          if ((input.eventDayId ?? null) !== ticket.eventDayId) {
            throw new UnprocessableEntityException({
              code: "INVALID_TICKET_MAP_DAY",
              message: "As senhas selecionadas nao pertencem ao dia escolhido."
            });
          }
        }

        const total = tickets.reduce((sum, ticket) => sum + Number(ticket.ticketPrice), 0);
        const createdOrder = await tx.order.create({
          data: {
            eventId: input.eventId,
            status: OrderStatus.DRAFT,
            totalAmount: total.toFixed(2),
            expiresAt
          }
        });

        for (const ticket of tickets) {
          const item = await tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              ticketNumberId: ticket.id,
              unitPrice: ticket.ticketPrice
            }
          });

          await tx.ticketNumber.update({
            where: { id: ticket.id },
            data: {
              status: TicketStatus.RESERVED,
              reservedUntil: expiresAt,
              currentOrderItemId: item.id
            }
          });
        }

        return tx.order.findUniqueOrThrow({
          where: { id: createdOrder.id },
          include: orderInclude
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
      }
    );

    return this.presentOrder(order);
  }

  async find(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude
    });

    if (!order) {
      throw this.orderNotFound();
    }

    return this.presentOrder(order);
  }

  async identify(orderId: string, input: IdentifyCheckoutDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { ticketNumber: true } } }
    });

    if (!order) {
      throw this.orderNotFound();
    }

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException({
        code: "ORDER_CANNOT_BE_IDENTIFIED",
        message: "Este pedido nao pode mais ser identificado."
      });
    }

    if (order.expiresAt && order.expiresAt <= new Date()) {
      await this.cancel(orderId);
      throw new ConflictException({
        code: "ORDER_EXPIRED",
        message: "A reserva expirou. Escolha suas senhas novamente."
      });
    }

    const cowboy = await this.findOrCreateCowboy(input);

    const identified = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          cowboyId: cowboy.id,
          status: OrderStatus.WAITING_PAYMENT
        }
      });

      for (const item of order.items) {
        await tx.ticketNumber.update({
          where: { id: item.ticketNumberId },
          data: {
            status: TicketStatus.PENDING_PAYMENT
          }
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude
      });
    });

    return this.presentOrder(identified);
  }

  async cancel(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            ticketNumber: true
          }
        }
      }
    });

    if (!order) {
      throw this.orderNotFound();
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.PAID) {
      return this.find(orderId);
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED
        }
      });

      for (const item of order.items) {
        if (item.ticketNumber.currentOrderItemId === item.id) {
          await tx.ticketNumber.update({
            where: { id: item.ticketNumberId },
            data: {
              status: TicketStatus.AVAILABLE,
              reservedUntil: null,
              currentOrderItemId: null
            }
          });
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude
      });
    });

    return this.presentOrder(cancelled);
  }

  private async findOrCreateCowboy(input: IdentifyCheckoutDto) {
    const cpf = this.normalizeDigits(input.cpf);

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
      if (!this.passwordService.verify(input.password, existing.passwordHash)) {
        throw new UnauthorizedException({
          code: "INVALID_COWBOY_PASSWORD",
          message: "Senha invalida para o CPF informado."
        });
      }

      return existing;
    }

    return this.prisma.cowboy.create({
      data: {
        name: input.name.trim(),
        cpf,
        whatsapp: this.normalizeDigits(input.whatsapp),
        passwordHash: this.passwordService.hash(input.password)
      }
    });
  }

  private presentOrder(order: OrderWithIncludes) {
    return {
      id: order.id,
      eventId: order.eventId,
      cowboyId: order.cowboyId,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      expiresAt: order.expiresAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      cowboy: order.cowboy,
      event: order.event,
      items: order.items.map((item) => ({
        id: item.id,
        ticketNumberId: item.ticketNumberId,
        number: item.ticketNumber.number,
        status: item.ticketNumber.status,
        unitPrice: item.unitPrice.toString(),
        category: {
          id: item.ticketNumber.ticketMap.category.id,
          name: item.ticketNumber.ticketMap.category.name,
          usesDays: item.ticketNumber.ticketMap.category.usesDays
        },
        day: item.ticketNumber.ticketMap.eventDay
          ? {
              id: item.ticketNumber.ticketMap.eventDay.id,
              name: item.ticketNumber.ticketMap.eventDay.name,
              startsAt: item.ticketNumber.ticketMap.eventDay.startsAt.toISOString()
            }
          : null
      }))
    };
  }

  private unavailableTickets() {
    return new ConflictException({
      code: "TICKET_NUMBERS_UNAVAILABLE",
      message: "Essa senha acabou de ser selecionada por outra pessoa."
    });
  }

  private orderNotFound() {
    return new NotFoundException({
      code: "ORDER_NOT_FOUND",
      message: "Pedido nao encontrado."
    });
  }

  private normalizeDigits(value: string) {
    return value.replace(/\D/g, "");
  }
}

type OrderWithIncludes = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
