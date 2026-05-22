import { Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class PublicTicketMapService {
  constructor(private readonly prisma: PrismaService) {}

  async numbers(id: string) {
    const map = await this.prisma.ticketMap.findFirst({
      where: {
        id,
        status: "ACTIVE",
        event: {
          status: "ACTIVE"
        },
        category: {
          status: "ACTIVE"
        }
      },
      include: {
        ticketNumbers: {
          orderBy: {
            number: "asc"
          }
        }
      }
    });

    if (!map) {
      throw new NotFoundException({
        code: "PUBLIC_TICKET_MAP_NOT_FOUND",
        message: "Mapa de senhas nao encontrado para compra."
      });
    }

    return map.ticketNumbers.map((ticketNumber) => ({
      id: ticketNumber.id,
      number: ticketNumber.number,
      status: this.publicStatus(ticketNumber.status)
    }));
  }

  private publicStatus(status: TicketStatus) {
    if (status === TicketStatus.AVAILABLE) return "AVAILABLE";
    if (status === TicketStatus.BLOCKED) return "BLOCKED";
    if (status === TicketStatus.PAID || status === TicketStatus.CANCELLED) return "SOLD";
    return "RESERVED";
  }
}
