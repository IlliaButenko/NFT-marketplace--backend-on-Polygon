import { prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';
import { BaseModel } from '../../global/base.model';
import { NFT } from './nft.schema';
import { Sale } from './sale.schema';

export class Bid extends BaseModel {
  @prop({ ref: () => Sale, required: true })
  sale?: Ref<Sale>;

  @prop({ ref: () => NFT, required: true })
  nft?: Ref<NFT>;

  @prop({ ref: () => User, required: true })
  bidder?: Ref<User>;

  @prop()
  value: number;
}
