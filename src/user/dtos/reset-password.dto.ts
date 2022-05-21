import { IsEmail, IsMongoId, IsNotEmpty, Length } from 'class-validator';
import { ID } from '../../global/interfaces/id.interface';

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

  @IsMongoId()
  userId: ID;

  @IsNotEmpty()
  @Length(4, 30)
  password: string;
}
