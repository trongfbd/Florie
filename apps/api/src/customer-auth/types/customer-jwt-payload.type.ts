export interface CustomerJwtPayload {
  sub: string;
  phone: string;
  type: 'customer';
}

export interface AuthenticatedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}
