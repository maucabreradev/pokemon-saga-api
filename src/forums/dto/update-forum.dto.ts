import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateForumDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
