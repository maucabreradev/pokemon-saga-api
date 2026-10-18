import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsUUID()
  topicId!: string;

  @IsOptional()
  @IsUUID()
  parentPostId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}
