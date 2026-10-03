import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 5 — Polynomial Addition using SCLL
// Singly circular linked list with a header node; POLY1 + POLY2 = POLYSUM.
//   curl /api/5          → prints the full source as plain text
//   curl "/api/5?dl=1"   → same source as program5-polynomial-addition-scll.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["5"], download);
}
