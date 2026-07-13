import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomersModule } from '../customers/customers.module';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { OptionalCustomerAuthGuard } from './guards/optional-customer-auth.guard';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';

@Module({
  imports: [
    CustomersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_CUSTOMER_ACCESS_EXPIRES_IN', '30m');
        return {
          secret: configService.getOrThrow<string>('JWT_CUSTOMER_ACCESS_SECRET'),
          signOptions: {
            expiresIn: expiresIn as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy, OptionalCustomerAuthGuard, CustomerJwtAuthGuard],
  exports: [CustomerAuthService, OptionalCustomerAuthGuard, CustomerJwtAuthGuard, JwtModule, CustomersModule],
})
export class CustomerAuthModule {}
