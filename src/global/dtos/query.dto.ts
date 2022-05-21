import { IsNumber } from 'class-validator';
import { IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsNumber()
  @Type(() => Number)
  size = 20;

  @IsNumber()
  @Type(() => Number)
  page = 0;

  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  @IsIn(['desc', 'asc'])
  sortType = 'desc';
}
