import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpicDto } from './dto/create-epic.dto';
import { UpdateEpicDto } from './dto/update-epic.dto';

@Injectable()
export class EpicsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(teamId?: string) {
    return this.prisma.epic.findMany({
      where: teamId ? { teamId } : undefined,
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const epic = await this.prisma.epic.findUnique({ where: { id } });
    if (!epic) {
      throw new NotFoundException('Epic not found');
    }
    return epic;
  }

  async create(dto: CreateEpicDto) {
    const team = await this.prisma.team.findUnique({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return this.prisma.epic.create({
      data: { teamId: dto.teamId, title: dto.title, description: dto.description },
    });
  }

  async update(id: string, dto: UpdateEpicDto) {
    await this.findOne(id);
    return this.prisma.epic.update({
      where: { id },
      data: { title: dto.title, description: dto.description },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const ticketCount = await this.prisma.ticket.count({ where: { epicId: id } });
    if (ticketCount > 0) {
      throw new ConflictException(
        'This epic cannot be deleted because it still has tickets referencing it',
      );
    }

    await this.prisma.epic.delete({ where: { id } });
  }
}
