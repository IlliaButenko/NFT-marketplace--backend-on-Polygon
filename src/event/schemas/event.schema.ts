import { prop } from '@typegoose/typegoose';
import { BaseModel } from '../../global/base.model';

export class Event extends BaseModel {
  @prop()
  address: string;

  @prop()
  transactionHash: string;

  @prop()
  chainId: number;

  @prop()
  topic: string;

  @prop()
  args: any;

  @prop()
  confirmed: boolean;

  @prop()
  name: string;

  @prop()
  index: number;
}
