import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { FRIENDSHIP_STATUSES, FriendshipStatus } from './friendship-status';

export class ListFriendshipsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(FRIENDSHIP_STATUSES)
  status?: FriendshipStatus;
}
