import { index, prop, Ref } from '@typegoose/typegoose';
import { Collection } from 'src/collection/schemas/collection.schema';
import { User } from 'src/user/schemas/user.schema';
import { BaseModel } from '../../global/base.model';

export class NFT extends BaseModel {
  @prop()
  tokenId: number;

  @prop({ required: true })
  tokenAddress: string;

  @prop({ required: true })
  chainId: number;

  @prop({ required: true })
  supply: number;

  @prop()
  name: string;

  @prop()
  description: string;

  @prop({ default: true })
  activated: boolean;

  @prop()
  image: string;

  @prop()
  royalty: number;

  @prop({ ref: () => User, required: true })
  creator?: Ref<User>;

  @prop({ ref: () => Collection, required: true })
  collectionId?: Ref<Collection>;

  @prop()
  uri: string;

  @prop()
  mintedAt: Date;

  @prop()
  media: string;

  @prop({ default: 'image' })
  fileType: string;

  @prop()
  originType: string;

  @prop({ default: false })
  isLazy: boolean;

  @prop()
  signature: string;
}
