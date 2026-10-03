import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 4 — Printer Queue Simulation
// Linear queue print-job scheduler: add job, process job, waiting count,
// overflow / underflow.
//   curl /api/4          → prints the full source as plain text
//   curl "/api/4?dl=1"   → same source as program4-printer-queue.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["4"], download);
}
