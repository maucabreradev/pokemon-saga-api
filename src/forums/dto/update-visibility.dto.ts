import { IsIn } from 'class-validator';
import { FORUM_VISIBILITIES, ForumVisibility } from './forum-visibility';

export class UpdateVisibilityDto {
  @IsIn([...FORUM_VISIBILITIES])
  visibility: ForumVisibility;
}
