import { IsString, Matches } from 'class-validator';
import { READABLE_ID_PATTERN } from '../../common/utils/readable-id-generator';

export class UpdateReadableIdDto {
  @IsString()
  @Matches(READABLE_ID_PATTERN, {
    message:
      'readableId must start with a letter and contain only letters, numbers and underscores (3-32 characters)',
  })
  readableId: string;
}
