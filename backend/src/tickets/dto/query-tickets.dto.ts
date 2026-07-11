import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TicketType } from '../../generated/prisma/enums';

export class QueryTicketsDto {
  @IsUUID()
  teamId!: string;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsUUID()
  epicId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
