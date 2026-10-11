import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Sign up | Aditya Chitragar",
  description: "Create an account to access the dashboard.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col items-center justify-center px-5 pt-14 md:min-h-[calc(100dvh-4rem)] md:max-w-[832px] md:px-6 md:pt-16">
      <SignUp forceRedirectUrl="/dashboard" appearance={{ theme: dark }} />
    </div>
  );
}
