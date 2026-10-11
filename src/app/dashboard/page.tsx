import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Dashboard | Aditya Chitragar",
  description: "Private dashboard.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect("/auth");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col items-center justify-center px-5 pt-14 text-center md:min-h-[calc(100dvh-4rem)] md:max-w-[832px] md:px-6 md:pt-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
        Welcome!
      </h1>
    </div>
  );
}
