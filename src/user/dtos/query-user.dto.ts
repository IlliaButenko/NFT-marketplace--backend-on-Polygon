import { QueryDto } from '../../global/dtos/query.dto';
import { UserFilter } from '../interfaces/userFilter.interface';
import { IsOptional } from 'class-validator';

export class QueryUserDto extends QueryDto implements UserFilter {
  @IsOptional()
  status: string;

  @IsOptional()
  search: string;
}
