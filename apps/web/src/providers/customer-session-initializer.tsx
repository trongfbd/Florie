"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/customer-api-client";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";

/** Attempts a silent session restore (via the httpOnly refresh cookie) once on app load. */
export function CustomerSessionInitializer() {
  const setHydrated = useCustomerAuthStore((state) => state.setHydrated);

  useEffect(() => {
    refreshSession().finally(() => setHydrated());
  }, [setHydrated]);

  return null;
}
