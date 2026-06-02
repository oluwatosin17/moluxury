import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moluxury.vercel.app";

const SERVICE_SLUGS = [
  "wig-styling",
  "wig-revamping",
  "wig-installation",
  "wig-coloring",
  "wig-maintenance",
  "custom-consultation",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const serviceUrls = SERVICE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
    ...serviceUrls,
  ];
}
