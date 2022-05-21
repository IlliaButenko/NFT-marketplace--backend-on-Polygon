import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SaleType } from "../interfaces/saleType.enum";

export class CreateLazyNFTDto {
  @ApiProperty()
  @IsUrl()
  uri: string;

  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  chainId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  supply: number;

  @ApiProperty()
  @IsString()
  creatorAddress: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  endTime: number;

  @ApiProperty()
  @IsEnum(SaleType)
  saleType: SaleType;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  royalty: number;

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  auctionId: number;
}
