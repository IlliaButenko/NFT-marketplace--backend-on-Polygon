import { prop, Ref } from '@typegoose/typegoose';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../global/base.model';
import { UserRoleEnum } from '../interfaces/userRole.enum';
import { UserStatusEnum } from '../interfaces/userStatus.enum';

export class User extends BaseModel {
  @prop()
  username: string;

  @prop()
  @Exclude()
  password: string;

  @prop()
  email: string;

  @prop()
  title: string;

  @prop()
  status: UserStatusEnum;

  @prop()
  address: string;

  @prop()
  avatar: string;

  @prop()
  cover: string;

  @prop()
  bio: string;

  @prop()
  links: unknown;

  @prop({ default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @prop({ default: true })
  isCreator: boolean;

  @prop({ ref: () => User })
  followeds: Ref<User>[];

  @prop({ ref: () => User })
  followers: Ref<User>[];

  @prop({ type: String })
  nonce: string;

  @prop({ type: String })
  twitter: string;
  @prop({ type: String })
  instagram: string;
  @prop({ type: String })
  discord: string;


}
