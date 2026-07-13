import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedCustomer } from '../types/customer-jwt-payload.type';

/** Requires a valid customer access token. Use on account/wishlist/review routes. */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('customer-jwt') {
  // Passport's default AuthGuard attaches the validated user to
  // request.user. We deliberately use request.customer instead (kept
  // fully distinct from admin/staff's request.user) so the two identity
  // domains can never be confused by a decorator reading the wrong field.
  handleRequest<TCustomer = AuthenticatedCustomer>(
    err: unknown,
    customer: TCustomer | false,
    _info: unknown,
    context: ExecutionContext,
  ): TCustomer {
    if (err || !customer) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    request.customer = customer;
    return customer;
  }
}
