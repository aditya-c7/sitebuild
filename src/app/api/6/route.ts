import { C_PROGRAMS_BY_ID, cProgramResponse } from "@/lib/c-programs";

// Program 6 — Binary Tree Traversals
// Level-order tree creation from user input, then preorder / inorder / postorder.
//   curl /api/6          → prints the full source as plain text
//   curl "/api/6?dl=1"   → same source as program6-binary-tree-traversals.c
export function GET(request: Request): Response {
  const download = new URL(request.url).searchParams.get("dl") === "1";
  return cProgramResponse(C_PROGRAMS_BY_ID["6"], download);
}
