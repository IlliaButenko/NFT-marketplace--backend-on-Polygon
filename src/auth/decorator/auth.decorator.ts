import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interface/authRequest.interface';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: AuthRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
