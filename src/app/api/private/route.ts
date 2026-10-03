import { NextResponse } from "next/server";

const BODY = `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello from AdityaHQ!");
    }
}`;

export function GET() {
  return new NextResponse(BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
