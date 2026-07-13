"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useLoginWithGoogle } from "../hooks";

export function GoogleLoginButton({ onSuccess }: { onSuccess: () => void }) {
  const googleLoginMutation = useLoginWithGoogle();
  const [error, setError] = useState(false);

  // Renders nothing at all (including the "hoặc" divider, owned by the
  // caller) until a real Google OAuth Client ID is configured.
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-secondary" />
        hoặc
        <span className="h-px flex-1 bg-secondary" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              setError(false);
              if (!credentialResponse.credential) {
                setError(true);
                return;
              }
              googleLoginMutation.mutate(credentialResponse.credential, { onSuccess });
            }}
            onError={() => setError(true)}
            text="continue_with"
            shape="pill"
            width="320"
          />
        </div>
        {(error || googleLoginMutation.isError) && (
          <p className="text-center text-xs text-destructive">
            Đăng nhập bằng Google thất bại, vui lòng thử lại.
          </p>
        )}
      </div>
    </>
  );
}
