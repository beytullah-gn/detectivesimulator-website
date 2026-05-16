import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import {
  createSocialImages,
  DEFAULT_SOCIAL_IMAGE,
  getScenarioCoverUrl,
} from "@/lib/content";
import {
  getPublishedScenarioCategories,
  getPublishedScenarios,
  getScenarioCategoryBySlug,
} from "@/lib/content-api";

export const revalidate = 120;

function formatDuration(minutes) {
  return minutes ? `${minutes} dk` : "Esnek süre";
}

function formatDifficulty(difficulty) {
  const labels = {
    easy: "Kolay",
    normal: "Orta",
    hard: "Zor",
  };

  return labels[difficulty] || "Standart";
}

function splitNarrative(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFaqItems(items) {
  return Array.isArray(items)
    ? items.filter((item) => item?.question && item?.answer)
    : [];
}

export async function generateStaticParams() {
  const categories = await getPublishedScenarioCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [category, featuredScenarios] = await Promise.all([
    getScenarioCategoryBySlug(slug),
    getPublishedScenarios({
      categorySlug: slug,
      sort: "-popularity_score,title",
      limit: 1,
    }),
  ]);

  if (!category) {
    return {
      title: "Kategori bulunamadı",
    };
  }

  const title = category.seo_title || `${category.title} Vakaları`;
  const description = category.seo_description || category.description;
  const socialImage =
    getScenarioCoverUrl(featuredScenarios[0]) || DEFAULT_SOCIAL_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: createSocialImages(socialImage, `${category.title} kategorisi`),
    },
    twitter: {
      images: createSocialImages(socialImage, `${category.title} kategorisi`),
    },
  };
}

export default async function CaseCategoryPage({ params }) {
  const { slug } = await params;
  const [category, scenarios] = await Promise.all([
    getScenarioCategoryBySlug(slug),
    getPublishedScenarios({ categorySlug: slug, sort: "-popularity_score,title" }),
  ]);

  if (!category) {
    notFound();
  }

  const narrativeParagraphs = splitNarrative(category.landing_narrative);
  const faqItems = normalizeFaqItems(category.faq_items);
  const featuredScenario = scenarios[0] || null;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb}>
            <Link href="/">Anasayfa</Link>
            <span>/</span>
            <Link href="/cases">Vakalar</Link>
            <span>/</span>
            <strong>{category.title}</strong>
          </nav>

          <section
            className={styles.categoryHero}
            style={{ "--accent-color": category.accent_color || "#BA7D2F" }}
          >
            <div className={styles.detailHeroCopy}>
              <span className={styles.eyebrow}>Kategori</span>
              <h1 className={styles.heroTitle}>{category.title}</h1>
              <p className={styles.heroLead}>{category.description}</p>
              {category.theme_statement ? (
                <blockquote className={styles.categoryQuoteLarge}>
                  {category.theme_statement}
                </blockquote>
              ) : null}
              <div className={styles.metaRow}>
                <span>{scenarios.length} yayınlanmış vaka</span>
                <span>Tematik soruşturma akışı</span>
              </div>
              <div className={styles.heroActions}>
                <Link href="/cases" className={styles.secondaryButton}>
                  Vaka Kataloğu
                </Link>
                <Link href="/play" className={styles.primaryButton}>
                  Oyuna Başla
                </Link>
              </div>
            </div>

            <aside className={styles.heroPanel}>
              <p className={styles.panelLabel}>Öne Çıkan Dosya</p>
              {featuredScenario ? (
                <>
                  <CaseArtwork
                    scenario={featuredScenario}
                    className={styles.sidebarArtwork}
                    eyebrow={styles.coverCaseArtworkChip}
                  />
                  <h2>{featuredScenario.title}</h2>
                  <p>{featuredScenario.teaser || featuredScenario.description}</p>
                  <div className={styles.metaRow}>
                    <span>{formatDifficulty(featuredScenario.difficulty)}</span>
                    <span>{formatDuration(featuredScenario.estimated_duration)}</span>
                  </div>
                  <div className={styles.heroPanelLinks}>
                    <Link
                      href={`/cases/${featuredScenario.slug}`}
                      className={styles.inlineLink}
                    >
                      Dosyayı İncele
                    </Link>
                    <Link href="/play" className={styles.inlineGhostLink}>
                      Oyuna Başla
                    </Link>
                  </div>
                </>
              ) : (
                <p>Bu kategoride henüz yayınlanmış vaka bulunmuyor.</p>
              )}
            </aside>
          </section>

          {narrativeParagraphs.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Kategori Bağlamı</span>
                <h2>{category.title} dosyalarında ne aramalısın?</h2>
              </div>
              <div className={styles.narrativeGrid}>
                {narrativeParagraphs.map((paragraph) => (
                  <article key={paragraph} className={styles.narrativeCard}>
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Vakalar</span>
              <h2>{category.title} altındaki oynanabilir dosyalar</h2>
            </div>
            <div className={styles.caseGrid}>
              {scenarios.map((scenario) => (
                <article key={scenario.id} className={styles.coverCaseCard}>
                  <CaseArtwork
                    scenario={scenario}
                    className={styles.coverCaseArtwork}
                    eyebrow={styles.coverCaseArtworkChip}
                  />
                  <div className={styles.coverCaseBody}>
                    <div className={styles.caseMeta}>
                      <span>{formatDifficulty(scenario.difficulty)}</span>
                      <span>{formatDuration(scenario.estimated_duration)}</span>
                    </div>
                    <h3>{scenario.title}</h3>
                    <p>{scenario.teaser || scenario.description}</p>
                    <div className={styles.caseActions}>
                      <Link href={`/cases/${scenario.slug}`} className={styles.inlineLink}>
                        Dosyayı İncele
                      </Link>
                      <Link href="/play" className={styles.inlineGhostLink}>
                        Oyuna Başla
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {faqItems.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>SSS</span>
                <h2>{category.title} hakkinda sik sorulan sorular</h2>
              </div>
              <div className={styles.faqGrid}>
                {faqItems.map((item) => (
                  <article key={item.question} className={styles.faqCard}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
