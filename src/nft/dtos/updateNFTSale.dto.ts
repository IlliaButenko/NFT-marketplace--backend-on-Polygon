import { SaleNFTDto } from './saleNFT.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateNFTSaleDto extends PartialType(SaleNFTDto) {}
