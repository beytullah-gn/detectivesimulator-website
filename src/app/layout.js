import { Cormorant_Garamond, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const monoFont = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://detectivesimulator.com"
    : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Detective Simulator",
    template: "%s | Detective Simulator",
  },
  description:
    "Directus tabanli senaryolari Next.js landing sayfalari ve interaktif sorgulama akisiyla birlestiren dedektif oyunu.",
  keywords: [
    "detective simulator",
    "dedektif oyunu",
    "directus",
    "next.js seo",
    "interaktif sorgulama",
  ],
  openGraph: {
    title: "Detective Simulator",
    description:
      "AI destekli sorgulama, ipuclari ve final degerlendirme akisiyla vaka cozduren dedektif oyunu.",
    url: siteUrl,
    siteName: "Detective Simulator",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detective Simulator",
    description:
      "Next.js ve Directus ile kurulan AI destekli dedektif oyunu deneyimi.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
