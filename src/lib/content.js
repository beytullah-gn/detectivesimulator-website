const publicBaseUrl =
  process.env.NEXT_PUBLIC_CONTENT_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8057";

export const PUBLIC_CONTENT_BASE_URL = publicBaseUrl;
export const DEFAULT_SOCIAL_IMAGE = "/case-covers/galata-patent-dosyasi.svg";

export function getContentAssetUrl(assetId) {
  if (!assetId) {
    return null;
  }

  return `${PUBLIC_CONTENT_BASE_URL}/assets/${assetId}`;
}

export function getScenarioCoverUrl(scenario) {
  const coverId = scenario?.cover_image?.id || scenario?.cover_image || null;
  const localCover = scenario?.slug
    ? `/case-covers/${scenario.slug}.svg`
    : null;

  return localCover || getContentAssetUrl(coverId) || DEFAULT_SOCIAL_IMAGE;
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
