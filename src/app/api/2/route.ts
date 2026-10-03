import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 2 — Sparse Matrix Operations
// Triplet (row, col, val) representation with sparse addition and transpose.
//   curl /api/2          → prints the full source as plain text
//   curl "/api/2?dl=1"   → same source as program2-sparse-matrix.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["2"], download);
}
