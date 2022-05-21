import { QueryDto } from '../../global/dtos/query.dto';
import { CollectionFilter } from '../interfaces/collectionFilter.interface';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCollectionDto extends QueryDto implements CollectionFilter {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  activated: boolean;

  @IsOptional()
  search: string;

  @IsOptional()
  status: string;
}
