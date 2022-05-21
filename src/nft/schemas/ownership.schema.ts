import { index, prop, Ref } from '@typegoose/typegoose';
import { User } from 'src/user/schemas/user.schema';
import { BaseModel } from '../../global/base.model';
import { NFT } from './nft.schema';

export class Ownership extends BaseModel {
  @prop({ ref: () => User, required: true })
  owner?: Ref<User>;

  @prop({ ref: () => NFT, required: true })
  nft?: Ref<NFT>;

  @prop({ required: true })
  amount: number;
}
