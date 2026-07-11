import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';

const TICKET_INCLUDE = {
  createdBy: { select: { id: true, email: true } },
  epic: { select: { id: true, title: true } },
} satisfies Prisma.TicketInclude;

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTicketsDto) {
    const where: Prisma.TicketWhereInput = { teamId: query.teamId };
    if (query.type) {
      where.type = query.type;
    }
    if (query.epicId) {
      where.epicId = query.epicId;
    }
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.ticket.findMany({
      where,
      include: TICKET_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: TICKET_INCLUDE,
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async create(dto: CreateTicketDto, createdById: string) {
    const team = await this.prisma.team.findUnique({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (dto.epicId) {
      await this.assertEpicBelongsToTeam(dto.epicId, dto.teamId);
    }

    return this.prisma.ticket.create({
      data: {
        teamId: dto.teamId,
        epicId: dto.epicId ?? null,
        type: dto.type,
        state: dto.state ?? 'new',
        title: dto.title,
        body: dto.body,
        createdById,
      },
      include: TICKET_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.findOne(id);

    const newTeamId = dto.teamId ?? existing.teamId;
    if (newTeamId !== existing.teamId) {
      const team = await this.prisma.team.findUnique({ where: { id: newTeamId } });
      if (!team) {
        throw new NotFoundException('Team not found');
      }
    }

    let newEpicId: string | null;
    if (dto.epicId === undefined) {
      newEpicId = newTeamId !== existing.teamId ? null : existing.epicId;
    } else {
      newEpicId = dto.epicId;
    }
    if (newEpicId) {
      await this.assertEpicBelongsToTeam(newEpicId, newTeamId);
    }

    const data: Prisma.TicketUpdateInput = {};
    if (newTeamId !== existing.teamId) {
      data.team = { connect: { id: newTeamId } };
    }
    if (newEpicId !== existing.epicId) {
      data.epic = newEpicId ? { connect: { id: newEpicId } } : { disconnect: true };
    }
    if (dto.type !== undefined && dto.type !== existing.type) {
      data.type = dto.type;
    }
    if (dto.state !== undefined && dto.state !== existing.state) {
      data.state = dto.state;
    }
    if (dto.title !== undefined && dto.title !== existing.title) {
      data.title = dto.title;
    }
    if (dto.body !== undefined && dto.body !== existing.body) {
      data.body = dto.body;
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    return this.prisma.ticket.update({
      where: { id },
      data,
      include: TICKET_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
  }

  private async assertEpicBelongsToTeam(epicId: string, teamId: string) {
    const epic = await this.prisma.epic.findUnique({ where: { id: epicId } });
    if (!epic) {
      throw new NotFoundException('Epic not found');
    }
    if (epic.teamId !== teamId) {
      throw new BadRequestException('Epic does not belong to the ticket\'s team');
    }
  }
}
