import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export type TopicSort = 'newest' | 'replies' | 'views';

export class ListTopicsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  forumId?: string;

  @IsOptional()
  @IsUUID()
  authorCharacterId?: string;

  @IsOptional()
  @IsIn(['newest', 'replies', 'views'])
  sort?: TopicSort = 'newest';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  override limit = 20;
}
