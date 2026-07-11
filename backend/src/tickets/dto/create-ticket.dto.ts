import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketType, TicketState } from '../../generated/prisma/enums';

export class CreateTicketDto {
  @IsUUID()
  teamId!: string;

  @IsOptional()
  @IsUUID()
  epicId?: string;

  @IsEnum(TicketType)
  type!: TicketType;

  @IsOptional()
  @IsEnum(TicketState)
  state?: TicketState;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  title!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  body!: string;
}
