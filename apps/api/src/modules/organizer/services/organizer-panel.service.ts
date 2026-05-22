import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PaymentStatus, Prisma, TicketStatus, UserRole, type TicketNumber } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";
import type { AdminPaymentsQueryDto } from "../dto/admin-payments-query.dto";
import type { AdminTicketsQueryDto } from "../dto/admin-tickets-query.dto";
import type { UpdateAdminTicketDto } from "../dto/update-admin-ticket.dto";

type AuditContext = {
  userId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

const ticketInclude = {
  ticketMap: {
    include: {
      event: true,
      category: true,
      eventDay: true
    }
  },
  currentOrderItem: {
    include: {
      order: {
        include: {
          cowboy: true,
          payments: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      }
    }
  }
} satisfies Prisma.TicketNumberInclude;

const paymentInclude = {
  order: {
    include: {
      cowboy: true,
      event: true,
      items: {
        include: {
          ticketNumber: {
            include: {
              ticketMap: {
                include: {
                  category: true,
                  eventDay: true
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.PaymentInclude;

@Injectable()
export class OrganizerPanelService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const [tickets, payments] = await Promise.all([
      this.prisma.ticketNumber.findMany({
        where: { ticketMap: { eventId } },
        include: {
          ticketMap: {
            include: {
              category: true,
              eventDay: true
            }
          }
        }
      }),
      this.prisma.payment.findMany({
        where: { order: { eventId } },
        include: paymentInclude
      })
    ]);

    const ticketCounts = {
      sold: tickets.filter((ticket) => ticket.status === TicketStatus.PAID).length,
      available: tickets.filter((ticket) => ticket.status === TicketStatus.AVAILABLE).length,
      reserved: tickets.filter((ticket) => ticket.status === TicketStatus.RESERVED).length,
      pending: tickets.filter((ticket) => ticket.status === TicketStatus.PENDING_PAYMENT).length
    };
    const revenue = {
      confirmed: this.sumPayments(payments, PaymentStatus.PAID),
      pending: this.sumPayments(payments, PaymentStatus.WAITING_PAYMENT)
    };

    return {
      ticketCounts,
      revenue,
      salesByCategory: this.groupSalesByCategory(tickets),
      salesByDay: this.groupSalesByDay(tickets)
    };
  }

  async tickets(eventId: string, query: AdminTicketsQueryDto, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const where: Prisma.TicketNumberWhereInput = {
      ticketMap: {
        eventId
      }
    };

    if (query.ticketStatus) where.status = query.ticketStatus;
    if (query.number) where.number = query.number;
    if (query.categoryId || query.eventDayId) {
      where.ticketMap = {
        eventId,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.eventDayId ? { eventDayId: query.eventDayId } : {})
      };
    }
    if (query.name || query.cpf || query.paymentStatus) {
      where.currentOrderItem = {
        order: {
          ...(query.name || query.cpf
            ? {
                cowboy: {
                  ...(query.name
                    ? { name: { contains: query.name, mode: Prisma.QueryMode.insensitive } }
                    : {}),
                  ...(query.cpf ? { cpf: { contains: this.normalizeDigits(query.cpf) } } : {})
                }
              }
            : {}),
          ...(query.paymentStatus ? { payments: { some: { status: query.paymentStatus } } } : {})
        }
      };
    }

    const tickets = await this.prisma.ticketNumber.findMany({
      where,
      include: ticketInclude,
      orderBy: [{ ticketMap: { category: { sortOrder: "asc" } } }, { number: "asc" }],
      take: 500
    });

    return {
      tickets: tickets.map((ticket) => this.presentTicket(ticket))
    };
  }

  async payments(eventId: string, query: AdminPaymentsQueryDto, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const payments = await this.prisma.payment.findMany({
      where: {
        order: {
          eventId,
          ...(query.cpf ? { cowboy: { cpf: { contains: this.normalizeDigits(query.cpf) } } } : {}),
          ...(query.categoryId || query.eventDayId
            ? {
                items: {
                  some: {
                    ticketNumber: {
                      ticketMap: {
                        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
                        ...(query.eventDayId ? { eventDayId: query.eventDayId } : {})
                      }
                    }
                  }
                }
              }
            : {})
        },
        ...(query.status ? { status: query.status } : {})
      },
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
      take: 500
    });

    return {
      payments: payments.map((payment) => this.presentPayment(payment))
    };
  }

  async updateTicket(
    id: string,
    input: UpdateAdminTicketDto,
    principal: AdminPrincipal,
    audit: AuditContext
  ) {
    const current = await this.prisma.ticketNumber.findUnique({
      where: { id },
      include: ticketInclude
    });

    if (!current) throw this.ticketNotFound();
    await this.assertEventAccess(current.ticketMap.eventId, principal);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (input.cowboyName || input.cowboyWhatsapp) {
        const cowboy = current.currentOrderItem?.order.cowboy;

        if (!cowboy) {
          throw new BadRequestException({
            code: "TICKET_HAS_NO_COWBOY",
            message: "Esta senha ainda nao possui vaqueiro vinculado."
          });
        }

        if (current.status === TicketStatus.PAID) {
          throw new BadRequestException({
            code: "PAID_TICKET_NOT_EDITABLE",
            message: "Dados de senha paga nao podem ser editados por aqui."
          });
        }

        await tx.cowboy.update({
          where: { id: cowboy.id },
          data: {
            ...(input.cowboyName ? { name: input.cowboyName.trim() } : {}),
            ...(input.cowboyWhatsapp
              ? { whatsapp: this.normalizeDigits(input.cowboyWhatsapp) }
              : {})
          }
        });
      }

      if (input.status) {
        await this.applyTicketStatus(tx, current, input.status);
      }

      await tx.auditLog.create({
        data: {
          userId: audit.userId,
          action: "ADMIN_TICKET_UPDATED",
          entityType: "TICKET_NUMBER",
          entityId: current.id,
          metadata: {
            previousStatus: current.status,
            nextStatus: input.status ?? current.status,
            changedCowboyData: Boolean(input.cowboyName || input.cowboyWhatsapp)
          },
          ...(audit.ipAddress ? { ipAddress: audit.ipAddress } : {}),
          ...(audit.userAgent ? { userAgent: audit.userAgent } : {})
        }
      });

      return tx.ticketNumber.findUniqueOrThrow({
        where: { id },
        include: ticketInclude
      });
    });

    return this.presentTicket(updated);
  }

  async printTicket(id: string, principal: AdminPrincipal) {
    const ticket = await this.prisma.ticketNumber.findUnique({
      where: { id },
      include: ticketInclude
    });

    if (!ticket) throw this.ticketNotFound();
    await this.assertEventAccess(ticket.ticketMap.eventId, principal);

    const presented = this.presentTicket(ticket);

    return {
      ticket: presented,
      printable: {
        title: `Senha ${presented.number} - ${presented.event.name}`,
        lines: [
          `Vaqueiro: ${presented.cowboy?.name ?? "Nao identificado"}`,
          `CPF: ${presented.cowboy?.cpf ?? "-"}`,
          `Evento: ${presented.event.name}`,
          `Categoria: ${presented.category.name}`,
          `Dia: ${presented.day?.name ?? "Unico"}`,
          `Numero: ${presented.number}`,
          `Status: ${presented.status}`
        ]
      }
    };
  }

  private async applyTicketStatus(
    tx: Prisma.TransactionClient,
    current: TicketNumberWithInclude,
    nextStatus: TicketStatus
  ) {
    if (current.status === nextStatus) return;

    if (current.status === TicketStatus.PAID || nextStatus === TicketStatus.PAID) {
      throw new BadRequestException({
        code: "PAID_TICKET_STATUS_LOCKED",
        message: "Confirmacao de pagamento deve ocorrer pelo fluxo de pagamentos."
      });
    }

    if (current.currentOrderItemId && nextStatus !== TicketStatus.CANCELLED) {
      throw new BadRequestException({
        code: "ORDER_TICKET_STATUS_LOCKED",
        message: "Senhas vinculadas a pedidos so podem ser canceladas manualmente."
      });
    }

    if (nextStatus === TicketStatus.CANCELLED && current.currentOrderItem) {
      await tx.ticketNumber.update({
        where: { id: current.id },
        data: {
          status: TicketStatus.CANCELLED,
          reservedUntil: null,
          currentOrderItemId: null
        }
      });
      await tx.order.update({
        where: { id: current.currentOrderItem.orderId },
        data: { status: "CANCELLED" }
      });
      return;
    }

    if (
      nextStatus !== TicketStatus.AVAILABLE &&
      nextStatus !== TicketStatus.BLOCKED &&
      nextStatus !== TicketStatus.CANCELLED
    ) {
      throw new BadRequestException({
        code: "INVALID_MANUAL_TICKET_STATUS",
        message: "Use apenas disponivel, bloqueada ou cancelada para edicao manual."
      });
    }

    await tx.ticketNumber.update({
      where: { id: current.id },
      data: {
        status: nextStatus,
        reservedUntil: null,
        currentOrderItemId: null
      }
    });
  }

  private sumPayments(payments: PaymentWithInclude[], status: PaymentStatus) {
    return payments
      .filter((payment) => payment.status === status)
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
      .toFixed(2);
  }

  private groupSalesByCategory(tickets: DashboardTicket[]) {
    const grouped = new Map<string, { categoryId: string; categoryName: string; sold: number }>();

    for (const ticket of tickets) {
      const key = ticket.ticketMap.category.id;
      const current = grouped.get(key) ?? {
        categoryId: key,
        categoryName: ticket.ticketMap.category.name,
        sold: 0
      };
      if (ticket.status === TicketStatus.PAID) current.sold += 1;
      grouped.set(key, current);
    }

    return [...grouped.values()];
  }

  private groupSalesByDay(tickets: DashboardTicket[]) {
    const grouped = new Map<string, { eventDayId: string | null; dayName: string; sold: number }>();

    for (const ticket of tickets) {
      const day = ticket.ticketMap.eventDay;
      const key = day?.id ?? "single";
      const current = grouped.get(key) ?? {
        eventDayId: day?.id ?? null,
        dayName: day?.name ?? "Unico",
        sold: 0
      };
      if (ticket.status === TicketStatus.PAID) current.sold += 1;
      grouped.set(key, current);
    }

    return [...grouped.values()];
  }

  private presentTicket(ticket: TicketNumberWithInclude) {
    const order = ticket.currentOrderItem?.order ?? null;
    const payment = order?.payments[0] ?? null;

    return {
      id: ticket.id,
      ticketMapId: ticket.ticketMapId,
      number: ticket.number,
      status: ticket.status,
      reservedUntil: ticket.reservedUntil?.toISOString() ?? null,
      event: {
        id: ticket.ticketMap.event.id,
        name: ticket.ticketMap.event.name
      },
      category: {
        id: ticket.ticketMap.category.id,
        name: ticket.ticketMap.category.name
      },
      day: ticket.ticketMap.eventDay
        ? {
            id: ticket.ticketMap.eventDay.id,
            name: ticket.ticketMap.eventDay.name,
            startsAt: ticket.ticketMap.eventDay.startsAt.toISOString()
          }
        : null,
      order: order
        ? {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount.toString()
          }
        : null,
      cowboy: order?.cowboy
        ? {
            id: order.cowboy.id,
            name: order.cowboy.name,
            cpf: order.cowboy.cpf,
            whatsapp: order.cowboy.whatsapp
          }
        : null,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amount: payment.amount.toString(),
            expiresAt: payment.expiresAt?.toISOString() ?? null,
            paidAt: payment.paidAt?.toISOString() ?? null
          }
        : null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    };
  }

  private presentPayment(payment: PaymentWithInclude) {
    const firstItem = payment.order.items[0] ?? null;

    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      amount: payment.amount.toString(),
      expiresAt: payment.expiresAt?.toISOString() ?? null,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      cowboy: payment.order.cowboy
        ? {
            id: payment.order.cowboy.id,
            name: payment.order.cowboy.name,
            cpf: payment.order.cowboy.cpf,
            whatsapp: payment.order.cowboy.whatsapp
          }
        : null,
      category: firstItem
        ? {
            id: firstItem.ticketNumber.ticketMap.category.id,
            name: firstItem.ticketNumber.ticketMap.category.name
          }
        : null,
      day: firstItem?.ticketNumber.ticketMap.eventDay
        ? {
            id: firstItem.ticketNumber.ticketMap.eventDay.id,
            name: firstItem.ticketNumber.ticketMap.eventDay.name
          }
        : null,
      tickets: payment.order.items.map((item) => ({
        id: item.ticketNumber.id,
        number: item.ticketNumber.number,
        status: item.ticketNumber.status
      }))
    };
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

  private normalizeDigits(value: string) {
    return value.replace(/\D/g, "");
  }

  private ticketNotFound() {
    return new NotFoundException({
      code: "TICKET_NOT_FOUND",
      message: "Senha nao encontrada."
    });
  }
}

type TicketNumberWithInclude = Prisma.TicketNumberGetPayload<{ include: typeof ticketInclude }>;
type PaymentWithInclude = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;
type DashboardTicket = TicketNumber & {
  ticketMap: {
    category: { id: string; name: string };
    eventDay: { id: string; name: string } | null;
  };
};
