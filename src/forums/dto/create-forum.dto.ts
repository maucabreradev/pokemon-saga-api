import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { FORUM_VISIBILITIES, ForumVisibility } from './forum-visibility';

export class CreateForumDto {
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  parentForumId?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsIn([...FORUM_VISIBILITIES])
  visibility?: ForumVisibility;
}
