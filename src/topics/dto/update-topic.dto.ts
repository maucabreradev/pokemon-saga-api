import { IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  @Length(3, 128)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  body?: string;
}
