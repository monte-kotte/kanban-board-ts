import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.team.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async create(dto: CreateTeamDto) {
    const existing = await this.prisma.team.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('A team with this name already exists');
    }
    return this.prisma.team.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: CreateTeamDto) {
    await this.findOne(id);

    const existing = await this.prisma.team.findUnique({ where: { name: dto.name } });
    if (existing && existing.id !== id) {
      throw new ConflictException('A team with this name already exists');
    }

    return this.prisma.team.update({ where: { id }, data: { name: dto.name } });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [epicCount, ticketCount] = await Promise.all([
      this.prisma.epic.count({ where: { teamId: id } }),
      this.prisma.ticket.count({ where: { teamId: id } }),
    ]);

    if (epicCount > 0 || ticketCount > 0) {
      throw new ConflictException(
        'This team cannot be deleted because it still has epics or tickets',
      );
    }

    await this.prisma.team.delete({ where: { id } });
  }
}
