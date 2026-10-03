import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 1 — Library Book Management System
// Structures + malloc/free book records, menu-driven create / display /
// search / issue / return.
//   curl /api/1          → prints the full source as plain text
//   curl "/api/1?dl=1"   → same source as program1-library-management.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["1"], download);
}
