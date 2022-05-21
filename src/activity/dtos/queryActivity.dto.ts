import { QueryDto } from '../../global/dtos/query.dto';
import { ActivityFilter } from '../interfaces/activityFilter.interface';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryActivityDto extends QueryDto implements ActivityFilter {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  activated: boolean;

  @IsOptional()
  search: string;

  @IsOptional()
  time: number;
}
