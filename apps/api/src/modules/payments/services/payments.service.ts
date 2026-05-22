import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrderStatus, PaymentStatus, Prisma, TicketStatus, type Payment } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { FakePixPaymentProvider } from "../providers/fake-pix-payment.provider";
import type { PaymentProvider, PaymentWebhookEvent } from "../providers/payment-provider";
import { RealPixPaymentProvider } from "../providers/real-pix-payment.provider";

const PAYMENT_MINUTES = 15;

@Injectable()
export class PaymentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsService.name);
  private expirationTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly fakeProvider: FakePixPaymentProvider
  ) {}

  onModuleInit() {
    if (this.config.get<string>("ENABLE_PAYMENT_EXPIRATION_WORKER") === "false") {
      return;
    }

    this.expirationTimer = setInterval(() => {
      void this.expirePendingPayments().catch((error: unknown) => {
        this.logger.error("Failed to expire pending payments", error);
      });
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.expirationTimer) {
      clearInterval(this.expirationTimer);
    }
  }

  async createCheckoutPayment(orderId: string) {
    await this.expirePendingPayments();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" }
        },
        event: true,
        items: true
      }
    });

    if (!order) {
      throw this.orderNotFound();
    }

    const existingPayment = order.payments.find(
      (payment) =>
        payment.status === PaymentStatus.WAITING_PAYMENT &&
        (!payment.expiresAt || payment.expiresAt > new Date())
    );

    if (existingPayment) {
      return this.presentPayment(existingPayment);
    }

    if (order.status === OrderStatus.PAID) {
      const paidPayment = order.payments.find((payment) => payment.status === PaymentStatus.PAID);
      if (paidPayment) return this.presentPayment(paidPayment);
    }

    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestException({
        code: "ORDER_NOT_WAITING_PAYMENT",
        message: "Identifique o vaqueiro antes de gerar o Pix."
      });
    }

    const expiresAt = this.resolvePaymentExpiration(order.expiresAt);

    if (expiresAt <= new Date()) {
      await this.expireOrderWithTickets(order.id, PaymentStatus.EXPIRED);
      throw new ConflictException({
        code: "ORDER_EXPIRED",
        message: "O tempo para pagamento expirou. Escolha suas senhas novamente."
      });
    }

    const provider = this.getProvider();
    const charge = await provider.createPixCharge({
      orderId: order.id,
      amount: order.totalAmount.toString(),
      expiresAt,
      description: `Senha do Vaqueiro - ${order.event.name}`
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: charge.provider,
        providerPaymentId: charge.providerPaymentId,
        amount: order.totalAmount,
        pixQrCode: charge.pixQrCode,
        pixCopyPaste: charge.pixCopyPaste,
        expiresAt: charge.expiresAt,
        status: PaymentStatus.WAITING_PAYMENT
      }
    });

    return this.presentPayment(payment);
  }

  async findCheckoutPayment(orderId: string) {
    await this.expirePendingPayments();

    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" }
    });

    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Pagamento ainda nao foi gerado para este pedido."
      });
    }

    return this.presentPayment(payment);
  }

  async handleWebhook(
    providerName: string,
    payload: Record<string, unknown>,
    webhookSecret?: string
  ) {
    this.validateWebhookSecret(payload, webhookSecret);

    const provider = this.getProvider(providerName);
    const event = provider.parseWebhook(payload);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: {
          provider_providerPaymentId: {
            provider: provider.name,
            providerPaymentId: event.providerPaymentId
          }
        }
      });

      const paymentEvent = await this.createPaymentEvent(tx, provider.name, event, payment?.id);

      if (paymentEvent.processedAt) {
        return {
          duplicated: true,
          payment: payment ? this.presentPayment(payment) : null
        };
      }

      if (!payment) {
        await tx.paymentEvent.update({
          where: { id: paymentEvent.id },
          data: { processedAt: new Date() }
        });

        return {
          duplicated: false,
          payment: null
        };
      }

      const updatedPayment = await this.applyPaymentStatus(tx, payment, event.status);

      await tx.paymentEvent.update({
        where: { id: paymentEvent.id },
        data: {
          paymentId: payment.id,
          processedAt: new Date()
        }
      });

      return {
        duplicated: false,
        payment: this.presentPayment(updatedPayment)
      };
    });
  }

  async expirePendingPayments() {
    const expiredPayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.WAITING_PAYMENT,
        expiresAt: {
          lte: new Date()
        }
      },
      take: 50
    });

    for (const payment of expiredPayments) {
      await this.prisma.$transaction(async (tx) => {
        await this.applyPaymentStatus(tx, payment, PaymentStatus.EXPIRED);
      });
    }
  }

  private async applyPaymentStatus(
    tx: Prisma.TransactionClient,
    payment: Payment,
    status: PaymentStatus
  ) {
    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    if (status === PaymentStatus.PAID) {
      return this.markPaymentAsPaid(tx, payment);
    }

    if (
      status === PaymentStatus.EXPIRED ||
      status === PaymentStatus.CANCELLED ||
      status === PaymentStatus.FAILED
    ) {
      return this.closePaymentAndReleaseTickets(tx, payment, status);
    }

    return tx.payment.update({
      where: { id: payment.id },
      data: { status }
    });
  }

  private async markPaymentAsPaid(tx: Prisma.TransactionClient, payment: Payment) {
    const paidAt = payment.paidAt ?? new Date();

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt
      }
    });

    const order = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.PAID
      },
      include: {
        items: true
      }
    });

    for (const item of order.items) {
      await tx.ticketNumber.update({
        where: { id: item.ticketNumberId },
        data: {
          status: TicketStatus.PAID,
          reservedUntil: null
        }
      });
    }

    return updatedPayment;
  }

  private async closePaymentAndReleaseTickets(
    tx: Prisma.TransactionClient,
    payment: Payment,
    status: PaymentStatus
  ) {
    const orderStatus =
      status === PaymentStatus.EXPIRED
        ? OrderStatus.EXPIRED
        : status === PaymentStatus.FAILED
          ? OrderStatus.PAYMENT_FAILED
          : OrderStatus.CANCELLED;

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status }
    });

    const order = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: orderStatus
      },
      include: {
        items: {
          include: {
            ticketNumber: true
          }
        }
      }
    });

    for (const item of order.items) {
      if (item.ticketNumber.currentOrderItemId !== item.id) continue;

      await tx.ticketNumber.update({
        where: { id: item.ticketNumberId },
        data: {
          status: TicketStatus.AVAILABLE,
          reservedUntil: null,
          currentOrderItemId: null
        }
      });
    }

    return updatedPayment;
  }

  private async expireOrderWithTickets(orderId: string, status: PaymentStatus) {
    const payments = await this.prisma.payment.findMany({
      where: {
        orderId,
        status: PaymentStatus.WAITING_PAYMENT
      }
    });

    await this.prisma.$transaction(async (tx) => {
      if (payments.length === 0) {
        const order = await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.EXPIRED },
          include: {
            items: {
              include: {
                ticketNumber: true
              }
            }
          }
        });

        for (const item of order.items) {
          if (item.ticketNumber.currentOrderItemId !== item.id) continue;
          await tx.ticketNumber.update({
            where: { id: item.ticketNumberId },
            data: {
              status: TicketStatus.AVAILABLE,
              reservedUntil: null,
              currentOrderItemId: null
            }
          });
        }

        return;
      }

      for (const payment of payments) {
        await this.applyPaymentStatus(tx, payment, status);
      }
    });
  }

  private async createPaymentEvent(
    tx: Prisma.TransactionClient,
    provider: string,
    event: PaymentWebhookEvent,
    paymentId?: string
  ) {
    const existing = await tx.paymentEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider,
          externalEventId: event.externalEventId
        }
      }
    });

    if (existing) {
      return existing;
    }

    return tx.paymentEvent.create({
      data: {
        ...(paymentId ? { payment: { connect: { id: paymentId } } } : {}),
        provider,
        externalEventId: event.externalEventId,
        eventType: event.eventType,
        payload: event.payload as Prisma.InputJsonObject
      }
    });
  }

  private getProvider(providerName?: string): PaymentProvider {
    const configured = this.normalizeProvider(
      providerName ?? this.config.get<string>("PIX_PROVIDER")
    );

    if (configured === "fake" || configured === "mock") {
      return this.fakeProvider;
    }

    return new RealPixPaymentProvider(configured);
  }

  private normalizeProvider(provider?: string) {
    return (provider ?? "fake").trim().toLowerCase();
  }

  private resolvePaymentExpiration(orderExpiresAt: Date | null) {
    if (orderExpiresAt) return orderExpiresAt;
    return new Date(Date.now() + PAYMENT_MINUTES * 60_000);
  }

  private validateWebhookSecret(payload: Record<string, unknown>, headerSecret?: string) {
    const expectedSecret = this.config.get<string>("PIX_WEBHOOK_SECRET");

    if (!expectedSecret) {
      return;
    }

    const bodySecret = typeof payload.secret === "string" ? payload.secret : undefined;

    if (headerSecret !== expectedSecret && bodySecret !== expectedSecret) {
      throw new UnauthorizedException({
        code: "INVALID_PAYMENT_WEBHOOK_SECRET",
        message: "Segredo do webhook Pix invalido."
      });
    }
  }

  private presentPayment(payment: Payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      amount: payment.amount.toString(),
      pixQrCode: payment.pixQrCode,
      pixCopyPaste: payment.pixCopyPaste,
      expiresAt: payment.expiresAt?.toISOString() ?? null,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    };
  }

  private orderNotFound() {
    return new NotFoundException({
      code: "ORDER_NOT_FOUND",
      message: "Pedido nao encontrado."
    });
  }
}
