import type { Metadata } from "next";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Signing in | Aditya Chitragar",
  robots: { index: false, follow: false },
};

// Completes the GitHub/Google OAuth handshake and lands on /dashboard.
// Without this route, OAuth logins stall on /auth/sso-callback.
export default function SSOCallbackPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col items-center justify-center px-5 pt-14 md:min-h-[calc(100dvh-4rem)] md:max-w-[832px] md:px-6 md:pt-16">
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
