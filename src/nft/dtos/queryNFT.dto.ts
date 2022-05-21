import { QueryDto } from '../../global/dtos/query.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { NftStatusEnum } from '../interfaces/nftStatus.enum';
import { NftFilterInterface } from '../interfaces/nftFilter.interface';

export class QueryNFTDto extends QueryDto implements NftFilterInterface {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  activated: boolean;

  @IsOptional()
  search: string;

  @IsOptional()
  creator: string;

  @IsOptional()
  fileType: string;

  @IsOptional()
  status: NftStatusEnum;
}
