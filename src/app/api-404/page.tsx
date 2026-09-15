import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "404 — Page not found | Aditya Chitragar",
};

// Hidden target for unknown /api/* URLs (see middleware.ts).
// Always renders the custom 404 page; never visited directly.
export default function ApiNotFoundPage() {
  notFound();
}
