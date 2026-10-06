import type { MetadataRoute } from "next";
import { EXERCISES } from "@/lib/exercises";
import { DAY_KEYS } from "@/lib/plans";

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/plan", "/exercises", "/science", "/progress"].map((p) => ({ url: `${base}${p}` })),
    ...DAY_KEYS.map((d) => ({ url: `${base}/workout/${d}` })),
    ...EXERCISES.map((e) => ({ url: `${base}/exercises/${e.slug}` })),
  ];
}
