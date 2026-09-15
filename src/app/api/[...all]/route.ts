import { notFound } from "next/navigation";

// Fallback only: middleware.ts rewrites unknown /api/* paths to a page that
// renders the custom 404. This catch-all guarantees a 404 status if middleware
// is ever bypassed (route handlers can't render not-found.tsx, hence the pair).
async function handler(): Promise<never> {
  notFound();
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
