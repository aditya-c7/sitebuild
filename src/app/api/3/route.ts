import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 3 — Stack Operations (Array Implementation)
// MAX = 16 array stack demonstrating push, pop, overflow, underflow, display.
//   curl /api/3          → prints the full source as plain text
//   curl "/api/3?dl=1"   → same source as program3-stack-operations.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["3"], download);
}
