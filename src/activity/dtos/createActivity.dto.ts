import { IsOptional } from 'class-validator';

export class CreateActivityDto {
  @IsOptional()
  nft_name: string;

  @IsOptional()
  nft_image: string;

  @IsOptional()
  collection_name: string;
  
  @IsOptional()
  collection_id: string;

  @IsOptional()
  collection_image: string;

  @IsOptional()
  owner: string;
  
  @IsOptional()
  buyer: string;
  
  @IsOptional()
  price: number;

  @IsOptional()
  type: number;
  
}
