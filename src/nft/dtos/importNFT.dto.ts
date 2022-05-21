import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ImportNFTDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  tokenId: number;

  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  chainId: number;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}
