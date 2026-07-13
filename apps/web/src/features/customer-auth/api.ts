import { customerApiClient } from "@/lib/customer-api-client";
import type { CustomerAuthResponse, LoginCustomerInput, RegisterCustomerInput } from "./types";

export async function registerCustomer(input: RegisterCustomerInput): Promise<CustomerAuthResponse> {
  const { data } = await customerApiClient.post<CustomerAuthResponse>(
    "/api/v1/customer-auth/register",
    input,
  );
  return data;
}

export async function loginCustomer(input: LoginCustomerInput): Promise<CustomerAuthResponse> {
  const { data } = await customerApiClient.post<CustomerAuthResponse>(
    "/api/v1/customer-auth/login",
    input,
  );
  return data;
}

export async function logoutCustomer(): Promise<void> {
  await customerApiClient.post("/api/v1/customer-auth/logout");
}
