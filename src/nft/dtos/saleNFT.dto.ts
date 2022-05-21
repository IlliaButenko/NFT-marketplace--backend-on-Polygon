import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SaleType } from "../interfaces/saleType.enum";

export class SaleNFTDto {
  @ApiProperty()
  nftId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  chainId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  minBid?: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  endTime?: number;

  @ApiProperty()
  @IsEnum(SaleType)
  saleType: SaleType;

  @ApiProperty()
  @IsBoolean()
  @Type(() => Boolean)
  feature?: boolean;

  @ApiProperty()
  @IsBoolean()
  @Type(() => Boolean)
  isDenied?: boolean;
}
