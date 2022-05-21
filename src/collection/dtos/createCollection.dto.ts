import { IsBoolean, IsOptional, Length, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectionDto {
  @Length(2, 50)
  address: string;

  @IsOptional()
  image: string;

  @IsOptional()
  cover: string;

  @IsNumber()
  chainId: number;

  @IsOptional()
  name: string;

  @IsOptional()
  symbol: string;

  @IsOptional()
  uri: string;

  @IsOptional()
  owner: string;
}
