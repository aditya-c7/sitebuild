import type { MetadataRoute } from "next";

// Only real, canonical, public HTML pages. API routes, the /chat redirect
// source, and the hidden /api-404 target are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://adityahq.me/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://adityahq.me/ai",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
