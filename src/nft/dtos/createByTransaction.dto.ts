import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateByTransactionDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  chainId: number;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  transactionHash: string;
}
