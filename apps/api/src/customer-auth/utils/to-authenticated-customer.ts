import { Customer } from '@prisma/client';
import { AuthenticatedCustomer } from '../types/customer-jwt-payload.type';

export function toAuthenticatedCustomer(customer: Customer): AuthenticatedCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    avatarUrl: customer.avatarUrl,
  };
}
