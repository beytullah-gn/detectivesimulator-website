const publicBaseUrl =
  process.env.NEXT_PUBLIC_CONTENT_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8057";

export const PUBLIC_CONTENT_BASE_URL = publicBaseUrl;
// Real case photos live in public/case-photos/<slug>.jpg; list a slug here once its photo is added.
const CASE_PHOTO_SLUGS = new Set([]);

export const DEFAULT_SOCIAL_IMAGE = "/og.jpg";

export function getCasePhotoUrl(scenario) {
  return scenario?.slug && CASE_PHOTO_SLUGS.has(scenario.slug)
    ? `/case-photos/${scenario.slug}.jpg`
    : null;
}

export function getScenarioCoverUrl(scenario) {
  return getCasePhotoUrl(scenario) || DEFAULT_SOCIAL_IMAGE;
}

export function getCaseNumber(scenario) {
  const source = scenario?.slug || scenario?.id || "";
  let hash = 0;
  for (const char of source) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9000;
  }
  return `No. ${String(1000 + hash)}`;
}

export function createSocialImages(url, alt) {
  if (!url) {
    return undefined;
  }

  return [
    {
      url,
      alt,
    },
  ];
}
