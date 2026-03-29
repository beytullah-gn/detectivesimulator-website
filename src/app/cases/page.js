import Link from "next/link";
import styles from "../marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import {
  getPublishedScenarioCategories,
  getPublishedScenarios,
} from "@/lib/directus";

export const revalidate = 120;

export const metadata = {
  title: "Vaka Katalogu",
  description:
    "Detective Simulator icindeki tum yayinlanmis vakalari ve kategori bazli dedektif dosyalarini inceleyin.",
};

function formatDuration(minutes) {
  return minutes ? `${minutes} dk` : "Esnek sure";
}

function formatDifficulty(difficulty) {
  const labels = {
    easy: "Kolay",
    normal: "Orta",
    hard: "Zor",
  };

  return labels[difficulty] || "Standart";
}

function createCategoryCountMap(scenarios) {
  return scenarios.reduce((accumulator, scenario) => {
    const slug = scenario?.category?.slug;
    if (!slug) {
      return accumulator;
    }

    accumulator[slug] = (accumulator[slug] || 0) + 1;
    return accumulator;
  }, {});
}

export default async function CasesIndexPage() {
  const [categories, scenarios, popularScenarios] = await Promise.all([
    getPublishedScenarioCategories(),
    getPublishedScenarios(),
    getPublishedScenarios({ sort: "-popularity_score,title", limit: 3 }),
  ]);

  const categoryCounts = createCategoryCountMap(scenarios);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb}>
            <Link href="/">Anasayfa</Link>
            <span>/</span>
            <strong>Vakalar</strong>
          </nav>

          <section className={styles.catalogHero}>
            <div className={styles.detailHeroCopy}>
              <span className={styles.eyebrow}>Vaka Katalogu</span>
              <h1 className={styles.heroTitle}>Kapakli ve kategori bazli katalog</h1>
              <p className={styles.heroLead}>
                Katalog artik sadece slug listesi degil; kapak gorselleri, kategori
                niyetleri ve oyun davranisindan beslenen koleksiyonlar uzerinden ilerliyor.
              </p>
              <div className={styles.metaRow}>
                <span>{scenarios.length} yayinlanmis vaka</span>
                <span>{categories.length} kategori</span>
              </div>
              <div className={styles.heroActions}>
                <Link href="/play" className={styles.primaryButton}>
                  Oyunu Ac
                </Link>
                <Link href="/" className={styles.secondaryButton}>
                  Anasayfaya Don
                </Link>
              </div>
            </div>

            <aside className={styles.catalogSidebar}>
              <p className={styles.panelLabel}>En Cok Oynananlar</p>
              <div className={styles.featureBulletList}>
                {popularScenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/cases/${scenario.slug}`}
                    className={styles.catalogLinkCard}
                  >
                    <strong>{scenario.title}</strong>
                    <span>{scenario.popularity_score || 0} oynama</span>
                  </Link>
                ))}
              </div>
            </aside>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Kategoriler</span>
              <h2>Her tema ayri landing zemini uretir</h2>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <article
                  key={category.id}
                  className={styles.categoryCard}
                  style={{ "--accent-color": category.accent_color || "#BA7D2F" }}
                >
                  <div className={styles.categoryCardTop}>
                    <span className={styles.categoryBadge}>{category.title}</span>
                    <strong>{categoryCounts[category.slug] || 0} vaka</strong>
                  </div>
                  <p>{category.description}</p>
                  {category.theme_statement ? (
                    <blockquote className={styles.categoryQuote}>
                      {category.theme_statement}
                    </blockquote>
                  ) : null}
                  <Link
                    href={`/cases/category/${category.slug}`}
                    className={styles.inlineLink}
                  >
                    Kategori dosyalarina git
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Tum Vakalar</span>
              <h2>Oyuna bagli tekil case sayfalari</h2>
            </div>
            <div className={styles.coverCaseGrid}>
              {scenarios.map((scenario) => (
                <article key={scenario.id} className={styles.coverCaseCard}>
                  <CaseArtwork
                    scenario={scenario}
                    className={styles.coverCaseArtwork}
                    eyebrow={styles.coverCaseArtworkChip}
                  />
                  <div className={styles.coverCaseBody}>
                    <div className={styles.caseMeta}>
                      {scenario.category?.title ? <span>{scenario.category.title}</span> : null}
                      <span>{formatDifficulty(scenario.difficulty)}</span>
                      <span>{formatDuration(scenario.estimated_duration)}</span>
                    </div>
                    <h3>{scenario.title}</h3>
                    <p>{scenario.teaser || scenario.description}</p>
                    <div className={styles.caseActions}>
                      <Link href={`/cases/${scenario.slug}`} className={styles.inlineLink}>
                        Dosyayi Incele
                      </Link>
                      <Link href="/play" className={styles.inlineGhostLink}>
                        Oyuna Git
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
