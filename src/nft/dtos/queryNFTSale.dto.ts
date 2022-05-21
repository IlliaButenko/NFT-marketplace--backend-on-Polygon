/* eslint-disable prettier/prettier */
import { IsOptional } from 'class-validator';
import { TraitFilterInterface } from '../interfaces/traitFilter.interface';
import { QueryDto } from './../../global/dtos/query.dto';
export class QueryNFTSale extends QueryDto implements TraitFilterInterface {
    @IsOptional()
    search: string;

    @IsOptional()
    saleType: string;
}