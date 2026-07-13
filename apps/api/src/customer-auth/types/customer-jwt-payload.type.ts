export interface CustomerJwtPayload {
  sub: string;
  phone: string | null;
  type: 'customer';
}

export interface AuthenticatedCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
}
