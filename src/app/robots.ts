import type { MetadataRoute } from "next";

// Allow every legitimate crawler on public portfolio pages.
// Disallow JSON/text API endpoints and the hidden API-404 rewrite target —
// they are not content pages and should never appear in search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api-404"],
      },
    ],
    sitemap: "https://adityahq.me/sitemap.xml",
  };
}
