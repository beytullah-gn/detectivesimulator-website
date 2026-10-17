// Shared site facts for metadata, structured data, sitemap and llms.txt.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://detectivesimulator.com").replace(/\/$/, "");
export const SITE_NAME = "Detective Simulator";
export const SITE_DESCRIPTION =
  "Yapay zekâ destekli, Türkçe ve ücretsiz online dedektif oyunu. Delilleri incele, şüphelileri sorgula, yalanı yakala ve suçluyu bul.";
export const OG_IMAGE = "/og.jpg";
export const SITE_KEYWORDS = [
  "dedektif oyunu",
  "online dedektif oyunu",
  "yapay zeka dedektif oyunu",
  "türkçe dedektif oyunu",
  "katil kim oyunu",
  "gizem oyunu",
  "suç çözme oyunu",
  "sorgu oyunu",
  "ücretsiz tarayıcı oyunu",
  "detective simulator",
];

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function gameJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: SITE_NAME,
    alternateName: ["Dedektif Simülatörü", "Detective Simulator Türkçe"],
    url: SITE_URL,
    image: absoluteUrl(OG_IMAGE),
    description: SITE_DESCRIPTION,
    inLanguage: "tr",
    genre: ["Dedektif", "Gizem", "Bulmaca", "Interaktif hikâye"],
    gamePlatform: ["Web tarayıcısı", "Mobil tarayıcı"],
    applicationCategory: "Game",
    operatingSystem: "Web",
    playMode: "SinglePlayer",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY", availability: "https://schema.org/InStock" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "tr",
    description: SITE_DESCRIPTION,
  };
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
