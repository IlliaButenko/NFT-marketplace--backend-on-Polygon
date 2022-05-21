import {IsEnum, IsNumber, IsString} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SaleByTransaction {
  @ApiProperty()
  chainId?: number;

  @ApiProperty()
  @IsString()
  transactionHash: string;
}
