import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, Length } from 'class-validator';
import { UserRoleEnum } from '../interfaces/userRole.enum';
import { UserStatusEnum } from '../interfaces/userStatus.enum';

export class RegisterUserDto {
  @Length(2, 100)
  username: string;

  @Length(4, 30)
  password: string;

  @IsOptional()
  @Length(4, 30)
  title: string;

  @IsOptional()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum = UserStatusEnum.ACTIVE;

  @IsOptional()
  avatar: string;

  @IsOptional()
  cover: string;

  @IsOptional()
  address: string;
  @IsOptional()
  twitter: string;
  @IsOptional()
  instagram: string;
  @IsOptional()
  discordii: string;

  @IsOptional()
  bio: string;

  @IsOptional()
  links: unknown;

  @IsEnum(UserRoleEnum)
  role = UserRoleEnum.USER;

  @IsBoolean()
  @Type(() => Boolean)
  isCreator = false;
}
