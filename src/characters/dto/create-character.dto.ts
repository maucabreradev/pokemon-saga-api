import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  publicName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
