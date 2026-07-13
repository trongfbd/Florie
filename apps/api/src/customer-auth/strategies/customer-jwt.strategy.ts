import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from '../../customers/customers.service';
import { AuthenticatedCustomer, CustomerJwtPayload } from '../types/customer-jwt-payload.type';
import { toAuthenticatedCustomer } from '../utils/to-authenticated-customer';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(
    configService: ConfigService,
    private readonly customersService: CustomersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_CUSTOMER_ACCESS_SECRET'),
    });
  }

  async validate(payload: CustomerJwtPayload): Promise<AuthenticatedCustomer> {
    const customer = await this.customersService.findById(payload.sub);

    if (!customer) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return toAuthenticatedCustomer(customer);
  }
}
