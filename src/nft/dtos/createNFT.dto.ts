import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNFTDto {
  @ApiProperty()
  @IsUrl()
  uri: string;

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
  supply: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  royalty: number;
}
