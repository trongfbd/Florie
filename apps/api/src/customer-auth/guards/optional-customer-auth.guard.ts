import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../../customers/customers.service';
import { CustomerJwtPayload } from '../types/customer-jwt-payload.type';
import { toAuthenticatedCustomer } from '../utils/to-authenticated-customer';

/**
 * Never blocks the request. If a valid customer Bearer token is present,
 * attaches `request.customer`; otherwise the route proceeds as a guest.
 * Used by checkout, which must work for both logged-in and guest customers.
 */
@Injectable()
export class OptionalCustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly customersService: CustomersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync<CustomerJwtPayload>(
          authHeader.slice('Bearer '.length),
          { secret: this.configService.getOrThrow<string>('JWT_CUSTOMER_ACCESS_SECRET') },
        );
        const customer = await this.customersService.findById(payload.sub);
        if (customer) {
          request.customer = toAuthenticatedCustomer(customer);
        }
      } catch {
        // Invalid/expired token on an optional-auth route just means "treat as guest".
      }
    }

    return true;
  }
}
