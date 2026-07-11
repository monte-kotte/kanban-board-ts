import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForTicket(ticketId: string) {
    await this.assertTicketExists(ticketId);
    return this.prisma.comment.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(ticketId: string, dto: CreateCommentDto, authorId: string) {
    await this.assertTicketExists(ticketId);
    return this.prisma.comment.create({
      data: { ticketId, authorId, body: dto.body },
      include: { author: { select: { id: true, email: true } } },
    });
  }

  private async assertTicketExists(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
  }
}
