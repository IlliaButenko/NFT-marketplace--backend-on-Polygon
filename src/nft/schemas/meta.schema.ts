import { prop } from '@typegoose/typegoose';
import { BaseModel } from '../../global/base.model';
import { AttributeInterface } from '../interfaces/attribute.interface';
import { MetaStatusEnum } from '../interfaces/metaStatus.enum';

export class Metadata extends BaseModel {
  @prop()
  status: MetaStatusEnum;

  @prop()
  hash: string;

  @prop()
  attributes: AttributeInterface[];

  @prop()
  ipfsFolderHash?: string;

  @prop()
  timestampUpdate?: number;

  @prop()
  uri?: string;
}
