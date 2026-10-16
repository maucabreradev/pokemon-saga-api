import { IsInt, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsInt()
  @Min(0)
  displayOrder: number;
}
