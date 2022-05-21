import { QueryDto } from '../../global/dtos/query.dto';
import { CategoryFilter } from '../interfaces/categoryFilter.interface';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCategoryDto extends QueryDto implements CategoryFilter {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  activated: boolean;

  @IsOptional()
  search: string;
}
