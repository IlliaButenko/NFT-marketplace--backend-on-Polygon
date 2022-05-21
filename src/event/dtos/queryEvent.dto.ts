import { QueryDto } from '../../global/dtos/query.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionFilterInterface } from '../interfaces/transactionFilter.interface';

export class QueryWalletDto
  extends QueryDto
  implements TransactionFilterInterface
{
  // @IsOptional()
  // @IsBoolean()
  // @Transform(({ value }) => {
  //   return [true, 'enabled', 'true'].indexOf(value) > -1;
  // })
  // activated: boolean;
  @IsOptional()
  search: string;

  // @IsOptional()
  // creator: string;
}
