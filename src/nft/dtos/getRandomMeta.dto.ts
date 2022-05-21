import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetRandomMetaDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  total: number;
}
