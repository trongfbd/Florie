"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AppGoogleOAuthProvider({ children }: { children: ReactNode }) {
  // Renders children unwrapped if no client ID is configured yet, instead of
  // crashing — Google Sign-In buttons just won't render (see GoogleLoginButton).
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
