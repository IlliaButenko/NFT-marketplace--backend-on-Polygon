import { BaseModel } from '../../global/base.model';
import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export class ResetToken extends BaseModel {
  @prop()
  userId: Schema.Types.ObjectId;

  @prop()
  token: string;
}
