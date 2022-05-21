import { index, prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';
import { BaseModel } from '../../global/base.model';
import { SaleType } from '../interfaces/saleType.enum';
import { NFT } from './nft.schema';
import { Ownership } from './ownership.schema';

export class Sale extends BaseModel {
  @prop({ ref: () => Ownership, required: true })
  ownership?: Ref<Ownership>;

  @prop({ ref: () => User, required: true })
  seller?: Ref<User>;

  @prop({ ref: () => NFT, required: true })
  nft?: Ref<NFT>;

  @prop({ required: true })
  quantity: number;

  @prop()
  unitPrice: number;

  @prop({ default: SaleType.FIXED })
  saleType: SaleType;

  @prop()
  endTime: number;

  @prop()
  minBid: number;

  @prop()
  auctionId: number; // for lazy mint

  @prop({ default: false })
  feature: boolean;

  @prop({ default: false })
  isDenied: boolean;  
}
