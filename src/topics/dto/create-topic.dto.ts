import { IsString, IsUUID, Length, MaxLength, MinLength } from 'class-validator';

export class CreateTopicDto {
  @IsUUID()
  forumId!: string;

  @IsString()
  @Length(3, 128)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  body!: string;
}
