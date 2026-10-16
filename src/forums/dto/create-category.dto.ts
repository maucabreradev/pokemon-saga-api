import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FORUM_VISIBILITIES, ForumVisibility } from './forum-visibility';

export const CATEGORY_VISIBILITIES = FORUM_VISIBILITIES;

export type CategoryVisibility = ForumVisibility;

export class CreateCategoryDto {
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
  visibility?: CategoryVisibility;
}
