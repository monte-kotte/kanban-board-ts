import { IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  name!: string;
}
