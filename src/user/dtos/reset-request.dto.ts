import { IsEmail } from 'class-validator';

export class ResetRequestDto {
  @IsEmail()
  email: string;
}
