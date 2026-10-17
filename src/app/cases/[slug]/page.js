import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import CaseGrid from "@/components/marketing/CaseGrid";
import { Mugshot } from "@/game/pieces";
import { formatDifficulty, formatDuration, getDifficultyKey } from "@/utils/formatters";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import {
  createSocialImages,
  DEFAULT_SOCIAL_IMAGE,
  getScenarioCoverUrl,
} from "@/lib/content";
import {
  getPublishedScenarios,
  getScenarioDetailBySlug,
} from "@/lib/content-api";

export const revalidate = 120;

export async function generateStaticParams() {
  const scenarios = await getPublishedScenarios();

  return scenarios.map((scenario) => ({
    slug: scenario.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const payload = await getScenarioDetailBySlug(slug);

  if (!payload?.scenario) {
    return {
      title: "Vaka bulunamadı",
    };
  }

  const { scenario } = payload;
  const description = scenario.teaser || scenario.description;
  const socialImage = getScenarioCoverUrl(scenario) || DEFAULT_SOCIAL_IMAGE;

  return {
    title: `${scenario.title} — Dedektif Vakası`,
    description,
    alternates: { canonical: `/cases/${scenario.slug}` },
    openGraph: {
      title: scenario.title,
      description,
      type: "article",
      images: createSocialImages(socialImage, scenario.title),
    },
    twitter: {
      images: createSocialImages(socialImage, scenario.title),
    },
  };
}

export default async function CaseDetailPage({ params }) {
  const { slug } = await params;
  const payload = await getScenarioDetailBySlug(slug);

  if (!payload?.scenario) {
    notFound();
  }

  const { scenario, characters, media } = payload;
  const category = scenario.category || null;
  const relatedScenarios = category?.slug
    ? await getPublishedScenarios({
        categorySlug: category.slug,
        excludeSlug: scenario.slug,
        limit: 3,
        sort: "-popularity_score,title",
      })
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <MarketingHeader active="cases" />

        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb} aria-label="Ekmek kırıntısı">
            <Link href="/">Anasayfa</Link>
            <span>/</span>
            <Link href="/cases">Vakalar</Link>
            {category?.slug ? (
              <>
                <span>/</span>
                <Link href={`/cases/category/${category.slug}`}>{category.title}</Link>
              </>
            ) : null}
            <span>/</span>
            <strong>{scenario.title}</strong>
          </nav>

          <section className={styles.detailLayout}>
            <CaseArtwork scenario={scenario} />

            <div>
              <div className={styles.metaRow}>
                {category?.title ? <span>{category.title}</span> : null}
                <span className={`difficulty difficulty-${getDifficultyKey(scenario.difficulty)}`}>
                  {formatDifficulty(scenario.difficulty)}
                </span>
                <span>{formatDuration(scenario.estimated_duration)}</span>
              </div>
              <h1>{scenario.title}</h1>
              <p>{scenario.description || scenario.teaser}</p>
              <div className={styles.heroActions}>
                <Link href={`/play?scenario=${scenario.slug}`} className={styles.primaryButton}>
                  Soruşturmayı başlat
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Şüpheliler</h2>
            </div>
            <div className={styles.suspectRow}>
              {characters.map((character, index) => (
                <Mugshot key={character.id} character={character} index={index} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Deliller</h2>
            </div>
            <ul className={styles.evidenceTitles}>
              {media.map((item) => (
                <li key={item.id}>
                  <small>{item.type || "Belge"}</small>
                  {item.title}
                </li>
              ))}
            </ul>
          </section>

          {relatedScenarios.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Benzer dosyalar</h2>
              </div>
              <CaseGrid scenarios={relatedScenarios} />
            </section>
          ) : null}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
