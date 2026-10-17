import Link from "next/link";
import styles from "./marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import CaseGrid from "@/components/marketing/CaseGrid";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { createSocialImages, getScenarioCoverUrl } from "@/lib/content";
import { getPublishedScenarios } from "@/lib/content-api";

export const revalidate = 120;

const steps = ["Delilleri oku", "Şüphelileri sorgula", "Suçluyu göster"];

export async function generateMetadata() {
  const [featuredScenario] = await getPublishedScenarios({
    sort: "-popularity_score,title",
    limit: 1,
  });
  const socialImage = getScenarioCoverUrl(featuredScenario);

  return {
    description:
      "Vaka seçtiğin, delilleri incelediğin, şüphelileri sorguladığın ve final kararını verdiğin interaktif dedektif oyunu.",
    openGraph: {
      images: createSocialImages(
        socialImage,
        featuredScenario?.title || "Detective Simulator"
      ),
    },
    twitter: {
      images: createSocialImages(
        socialImage,
        featuredScenario?.title || "Detective Simulator"
      ),
    },
  };
}

export default async function HomePage() {
  const scenarios = await getPublishedScenarios({
    sort: "-popularity_score,title",
  });

  const featuredScenario = scenarios[0] || null;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <MarketingHeader active="home" />

        <main className={styles.content}>
          <section className={styles.landingHero}>
            <div>
              <h1>Vakayı sen çöz.</h1>
              <p>Delilleri oku, şüphelileri sorgula, yalanı yakala.</p>
              <div className={styles.heroActions}>
                <Link href="/play" className={styles.primaryButton}>
                  Oyna
                </Link>
                <Link href="/cases" className={styles.secondaryButton}>
                  Vakalar
                </Link>
              </div>
            </div>

            {featuredScenario ? (
              <Link href={`/cases/${featuredScenario.slug}`} className={styles.dossierLink}>
                <CaseArtwork scenario={featuredScenario} />
              </Link>
            ) : null}
          </section>

          <ol className={styles.stepsRow}>
            {steps.map((step, index) => (
              <li key={step}>
                <b>{`0${index + 1}`}</b>
                {step}
              </li>
            ))}
          </ol>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Dosyalar</h2>
            </div>
            <CaseGrid scenarios={scenarios} />
          </section>
        </main>
      </div>
    </div>
  );
}
