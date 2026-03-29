const internalBaseUrl = process.env.DIRECTUS_INTERNAL_URL?.replace(/\/$/, "");
const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const fallbackBaseUrl = "http://127.0.0.1:8057";

export const DIRECTUS_BASE_URL = internalBaseUrl || publicBaseUrl || fallbackBaseUrl;

const categoryFieldList = [
  "id",
  "title",
  "slug",
  "description",
  "theme_statement",
  "seo_title",
  "seo_description",
  "landing_narrative",
  "faq_items",
  "accent_color",
];

const scenarioFieldList = [
  "id",
  "date_created",
  "title",
  "slug",
  "teaser",
  "description",
  "estimated_duration",
  "difficulty",
  "popularity_score",
  "cover_image",
  "category.id",
  "category.title",
  "category.slug",
  "category.description",
  "category.theme_statement",
  "category.seo_title",
  "category.seo_description",
  "category.landing_narrative",
  "category.faq_items",
  "category.accent_color",
];

function createCollectionUrl(collection, query = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return `${DIRECTUS_BASE_URL}/items/${collection}?${searchParams.toString()}`;
}

async function fetchCollection(collection, query, { revalidate = 120 } = {}) {
  const response = await fetch(createCollectionUrl(collection, query), {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${collection}: ${response.status} ${response.statusText}`
    );
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getPublishedScenarioCategories() {
  return fetchCollection("scenario_categories", {
    "filter[status][_eq]": "published",
    fields: categoryFieldList.join(","),
    sort: "title",
    limit: 24,
  });
}

export async function getPublishedScenarios({
  categorySlug,
  excludeSlug,
  limit = 50,
  sort = "title",
} = {}) {
  return fetchCollection("scenarios", {
    "filter[status][_eq]": "published",
    ...(categorySlug ? { "filter[category][slug][_eq]": categorySlug } : {}),
    ...(excludeSlug ? { "filter[slug][_neq]": excludeSlug } : {}),
    fields: scenarioFieldList.join(","),
    sort,
    limit,
  });
}

export async function getScenarioCategoryBySlug(slug) {
  const categories = await fetchCollection("scenario_categories", {
    "filter[status][_eq]": "published",
    "filter[slug][_eq]": slug,
    fields: categoryFieldList.join(","),
    limit: 1,
  });

  return categories[0] || null;
}

export async function getScenarioDetailBySlug(slug) {
  const scenarios = await fetchCollection("scenarios", {
    "filter[status][_eq]": "published",
    "filter[slug][_eq]": slug,
    fields: scenarioFieldList.join(","),
    limit: 1,
  });

  const scenario = scenarios[0];

  if (!scenario) {
    return null;
  }

  const [characters, media] = await Promise.all([
    fetchCollection("characters", {
      "filter[related_scenario][_eq]": scenario.id,
      fields: [
        "id",
        "name",
        "surname",
        "role",
        "age",
        "description",
        "personality",
        "alibi",
      ].join(","),
      sort: "name",
      limit: 50,
    }),
    fetchCollection("scenario_media", {
      "filter[related_scenario][_eq]": scenario.id,
      fields: ["id", "type", "title", "description", "content"].join(","),
      sort: "title",
      limit: 50,
    }),
  ]);

  return {
    scenario,
    characters,
    media,
  };
}

export function getDirectusAssetUrl(assetId) {
  if (!assetId) {
    return null;
  }

  return `${DIRECTUS_BASE_URL}/assets/${assetId}`;
}

export function getScenarioCoverUrl(scenario) {
  const coverId = scenario?.cover_image?.id || scenario?.cover_image || null;

  return getDirectusAssetUrl(coverId) || `/case-covers/${scenario?.slug}.svg`;
}
