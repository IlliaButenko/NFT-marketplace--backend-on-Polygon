import { prop } from '@typegoose/typegoose';
import { BaseModel } from '../../global/base.model';

export class Activity extends BaseModel {
  @prop()
  nft_name: string;

  @prop()
  nft_image: string;

  @prop()
  collection_name: string;

  @prop()
  collection_id: string;

  @prop()
  collection_image: string;

  @prop()
  time: number;

  @prop()
  owner: string;

  @prop()
  buyer: string;

  @prop()
  price: number;

  @prop()
  type: number;
}
