import { IsBoolean, IsOptional, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @Length(2, 50)
  title: string;

  @IsOptional()
  @Length(4, 30)
  description: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activated = true;
}
