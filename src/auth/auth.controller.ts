import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from 'src/user/dtos/register-user.dto';
import { LoginDto } from 'src/user/dtos/login-user.dto';
import { ResetRequestDto } from 'src/user/dtos/reset-request.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local.guard';
import { JwtAuthGuard } from './guard/jwt.guard';
import { JwtPayload } from './interface/jwtPayload.interface';
import { Auth } from './decorator/auth.decorator';
import { ResetPasswordDto } from '../user/dtos/reset-password.dto';
import { UpdateUserDto } from 'src/user/dtos/update-user.dto';
import { LoginWalletDto } from 'src/user/dtos/login-wallet.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.service.register(registerUser);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.service.genTokenFromUsername(loginDto.username);
  }

  @Post('wallet_login')
  async loginByWallet(@Body() loginDto: LoginWalletDto) {
    return await this.service.genTokenFromSign(loginDto.address, loginDto.sign);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async me(@Auth() auth: JwtPayload) {
    return await this.service.getUserFromJwtPayload(auth);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(
    @Auth() auth: JwtPayload,
    @Body() profile: UpdateUserDto,
  ) {
    return await this.service.updateProfile(auth.id, profile);
  }

  @Post('reset_request')
  async requestReset(@Body() payload: ResetRequestDto) {
    await this.service.resetRequest(payload.email);
    return 'Email was sent';
  }

  @Post('reset_password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.service.resetPassword(payload);
    return 'Reset password successfully';
  }
}
