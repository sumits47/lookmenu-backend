import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from 'src/types/auth0';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const user: UserPayload = ctx.getRequest().user;
    return user;
  },
);
