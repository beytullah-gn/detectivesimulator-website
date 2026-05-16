import PlayClient from "./play-client";
import { createSocialImages, DEFAULT_SOCIAL_IMAGE } from "@/lib/content";

export const metadata = {
  title: "Oyunu Oyna",
  description:
    "Detective Simulator içinde senaryoyu seç, şüphelileri sorgula ve final kararını ver.",
  openGraph: {
    images: createSocialImages(
      DEFAULT_SOCIAL_IMAGE,
      "Detective Simulator oyun ekranı"
    ),
  },
  twitter: {
    images: createSocialImages(
      DEFAULT_SOCIAL_IMAGE,
      "Detective Simulator oyun ekranı"
    ),
  },
};

export default function PlayPage() {
  return <PlayClient />;
}
