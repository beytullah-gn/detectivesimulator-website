import { SITE_URL } from "@/lib/seo";

// Search engines and AI assistants may read every public page; sign-in callbacks stay out of the index.
export default function robots() {
  const disallow = ["/auth/", "/giris/"];
  const aiAgents = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }, ...aiAgents.map((userAgent) => ({ userAgent, allow: "/", disallow }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
