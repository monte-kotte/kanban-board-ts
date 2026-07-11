import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketType, TicketState } from '../../generated/prisma/enums';

export class UpdateTicketDto {
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  epicId?: string | null;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsEnum(TicketState)
  state?: TicketState;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  body?: string;
}
