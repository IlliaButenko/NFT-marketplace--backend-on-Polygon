import { prop, Ref } from '@typegoose/typegoose';
import { BaseModel } from '../../global/base.model';
import { User } from 'src/user/schemas/user.schema';

export class Collection extends BaseModel {
  @prop()
  name: string;

  @prop()
  symbol: string;

  @prop()
  address: string;

  @prop()
  owner: string;

  @prop()
  uri: string;

  @prop()
  image: string;

  @prop()
  cover: string;

  @prop({ ref: () => User })
  creator?: Ref<User>;

  @prop()
  activated: boolean;

  @prop({ default: false })
  public: boolean;

  @prop()
  chainId: number;

  @prop({default: false})
  isTop: boolean

  @prop({default: false})
  isHot: boolean
}
