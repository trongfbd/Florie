import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedCustomer } from '../types/customer-jwt-payload.type';

/** Requires CustomerJwtAuthGuard. For optional-auth routes, read request.customer directly. */
export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedCustomer => {
    const request = ctx.switchToHttp().getRequest();
    return request.customer;
  },
);
