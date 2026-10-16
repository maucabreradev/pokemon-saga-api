import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const CATEGORY_VISIBILITIES = ['public', 'registered', 'characters_only'] as const;

export type CategoryVisibility = (typeof CATEGORY_VISIBILITIES)[number];

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
  @IsIn([...CATEGORY_VISIBILITIES])
  visibility?: CategoryVisibility;
}
