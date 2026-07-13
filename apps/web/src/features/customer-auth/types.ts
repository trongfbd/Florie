export interface CustomerAuthResponse {
  accessToken: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
}

export interface RegisterCustomerInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginCustomerInput {
  phone: string;
  password: string;
}
