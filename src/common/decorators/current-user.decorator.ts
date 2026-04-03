import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtAccessPayload } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtAccessPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtAccessPayload }>();
    return request.user;
  },
);
