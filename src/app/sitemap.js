import { getPublishedScenarioCategories, getPublishedScenarios } from "@/lib/content-api";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const [scenarios, categories] = await Promise.all([
    getPublishedScenarios({ sort: "-popularity_score,title" }).catch(() => []),
    getPublishedScenarioCategories().catch(() => []),
  ]);

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/dedektif-oyunu"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/cases"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...scenarios.map((scenario) => ({
      url: absoluteUrl(`/cases/${scenario.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/cases/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    })),
    { url: absoluteUrl("/play"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/gizlilik"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
