"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CustomerSessionInitializer } from "./customer-session-initializer";
import { AppGoogleOAuthProvider } from "./google-oauth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppGoogleOAuthProvider>
        <CustomerSessionInitializer />
        {children}
      </AppGoogleOAuthProvider>
    </QueryClientProvider>
  );
}
