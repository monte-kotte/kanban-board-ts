import { IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  body!: string;
}
