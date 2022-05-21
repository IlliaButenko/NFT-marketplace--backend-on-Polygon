import { QueryDto } from '../../global/dtos/query.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { TraitFilterInterface } from '../interfaces/traitFilter.interface';
import { TraitType } from '../interfaces/traitType.enum';

export class QueryImageDto extends QueryDto implements TraitFilterInterface {
  @IsOptional()
  search: string;
}
