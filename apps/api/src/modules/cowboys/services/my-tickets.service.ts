import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { OrderStatus, PaymentStatus, Prisma, TicketStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type { UpdateMyTicketDto } from "../dto/update-my-ticket.dto";

const myTicketInclude = {
  ticketNumber: {
    include: {
      ticketMap: {
        include: {
          event: true,
          category: true,
          eventDay: true
        }
      }
    }
  },
  order: {
    include: {
      cowboy: {
        select: {
          id: true,
          name: true,
          cpf: true,
          whatsapp: true
        }
      },
      payments: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  }
} satisfies Prisma.OrderItemInclude;

@Injectable()
export class MyTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(cowboyId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          cowboyId
        }
      },
      include: myTicketInclude,
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      tickets: items.map((item) => this.presentTicket(item))
    };
  }

  async find(cowboyId: string, ticketId: string) {
    const item = await this.findOwnedTicket(cowboyId, ticketId);

    return this.presentTicket(item);
  }

  async update(cowboyId: string, ticketId: string, input: UpdateMyTicketDto) {
    const item = await this.findOwnedTicket(cowboyId, ticketId);

    if (item.order.status === OrderStatus.PAID || item.ticketNumber.status === TicketStatus.PAID) {
      throw new BadRequestException({
        code: "PAID_TICKET_NOT_EDITABLE",
        message: "Senhas pagas nao podem ter os dados do vaqueiro alterados por aqui."
      });
    }

    const data: { name?: string; whatsapp?: string } = {};

    if (input.name) data.name = input.name.trim();
    if (input.whatsapp) data.whatsapp = this.normalizeDigits(input.whatsapp);

    if (Object.keys(data).length === 0) {
      throw new UnprocessableEntityException({
        code: "NO_EDITABLE_FIELDS",
        message: "Informe ao menos um dado para atualizar."
      });
    }

    await this.prisma.cowboy.update({
      where: { id: cowboyId },
      data
    });

    const updated = await this.findOwnedTicket(cowboyId, ticketId);

    return this.presentTicket(updated);
  }

  async print(cowboyId: string, ticketId: string) {
    const item = await this.findOwnedTicket(cowboyId, ticketId);
    const ticket = this.presentTicket(item);
    const cowboy = ticket.cowboy;

    if (!cowboy) {
      throw new NotFoundException({
        code: "TICKET_NOT_FOUND",
        message: "Senha nao encontrada para este vaqueiro."
      });
    }

    return {
      ticket,
      printable: {
        title: `Senha ${ticket.number} - ${ticket.event.name}`,
        lines: [
          `Vaqueiro: ${cowboy.name}`,
          `CPF: ${cowboy.cpf}`,
          `Evento: ${ticket.event.name}`,
          `Categoria: ${ticket.category.name}`,
          `Dia: ${ticket.day?.name ?? "Unico"}`,
          `Numero: ${ticket.number}`,
          `Status: ${ticket.status}`
        ]
      }
    };
  }

  private async findOwnedTicket(cowboyId: string, ticketId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: ticketId,
        order: {
          cowboyId
        }
      },
      include: myTicketInclude
    });

    if (!item) {
      throw new NotFoundException({
        code: "TICKET_NOT_FOUND",
        message: "Senha nao encontrada para este vaqueiro."
      });
    }

    return item;
  }

  private presentTicket(item: MyTicketItem) {
    const latestPayment = item.order.payments[0] ?? null;
    const event = item.ticketNumber.ticketMap.event;
    const category = item.ticketNumber.ticketMap.category;
    const day = item.ticketNumber.ticketMap.eventDay;

    return {
      id: item.id,
      orderId: item.orderId,
      ticketNumberId: item.ticketNumberId,
      number: item.ticketNumber.number,
      status: item.ticketNumber.status,
      canEdit:
        item.order.status !== OrderStatus.PAID && item.ticketNumber.status !== TicketStatus.PAID,
      unitPrice: item.unitPrice.toString(),
      createdAt: item.createdAt.toISOString(),
      cowboy: item.order.cowboy,
      event: {
        id: event.id,
        name: event.name,
        slug: event.slug,
        city: event.city,
        state: event.state,
        startsAt: event.startsAt.toISOString()
      },
      category: {
        id: category.id,
        name: category.name
      },
      day: day
        ? {
            id: day.id,
            name: day.name,
            startsAt: day.startsAt.toISOString()
          }
        : null,
      order: {
        id: item.order.id,
        status: item.order.status,
        totalAmount: item.order.totalAmount.toString(),
        expiresAt: item.order.expiresAt?.toISOString() ?? null
      },
      payment: latestPayment
        ? {
            id: latestPayment.id,
            status: latestPayment.status,
            amount: latestPayment.amount.toString(),
            pixCopyPaste: latestPayment.pixCopyPaste,
            expiresAt: latestPayment.expiresAt?.toISOString() ?? null,
            paidAt: latestPayment.paidAt?.toISOString() ?? null
          }
        : null,
      paymentStatus: this.resolvePaymentStatus(
        latestPayment?.status ?? null,
        item.ticketNumber.status
      )
    };
  }

  private resolvePaymentStatus(paymentStatus: PaymentStatus | null, ticketStatus: TicketStatus) {
    if (ticketStatus === TicketStatus.PAID || paymentStatus === PaymentStatus.PAID) return "paid";
    if (paymentStatus === PaymentStatus.EXPIRED) return "expired";
    if (paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.CANCELLED) {
      return "refused";
    }

    return "waiting";
  }

  private normalizeDigits(value: string) {
    return value.replace(/\D/g, "");
  }
}

type MyTicketItem = Prisma.OrderItemGetPayload<{ include: typeof myTicketInclude }>;
