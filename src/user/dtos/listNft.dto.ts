import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NftTypeEnum } from 'src/nft/interfaces/nftType.enum';

export class ListNftDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(NftTypeEnum)
  @ApiProperty({ enum: NftTypeEnum })
  type: NftTypeEnum;
}
