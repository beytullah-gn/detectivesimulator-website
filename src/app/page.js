import Link from "next/link";
import styles from "./marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import { createSocialImages, getScenarioCoverUrl } from "@/lib/content";
import {
  getPublishedScenarioCategories,
  getPublishedScenarios,
} from "@/lib/content-api";

export const revalidate = 120;

const workflowSteps = [
  {
    title: "Vaka dosyasını incele",
    description:
      "Olay raporlarını, delil notlarını ve şüpheliler arasındaki bağlantıları tek dosyada incele.",
  },
  {
    title: "Şüphelileri sorgula",
    description:
      "Her karaktere ayrı sorular sor, alibileri karşılaştır ve tutarsızlıkları yakala.",
  },
  {
    title: "Kararını savun",
    description:
      "Suçluyu veya suçluları seç, gerekçeni yaz ve dosyanın resmi çözümüyle yüzleş.",
  },
];

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

function createCategoryLeadMap(scenarios) {
  return scenarios.reduce((accumulator, scenario) => {
    const slug = scenario?.category?.slug;
    if (!slug || accumulator[slug]) {
      return accumulator;
    }

    accumulator[slug] = scenario;
    return accumulator;
  }, {});
}

function ScenarioCard({ scenario }) {
  return (
    <article className={styles.coverCaseCard}>
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
            Dosyayı İncele
          </Link>
          <Link
            href={`/play?scenario=${scenario.slug}`}
            className={styles.inlineGhostLink}
          >
            Vakayı Başlat
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [categories, popularScenarios] = await Promise.all([
    getPublishedScenarioCategories(),
    getPublishedScenarios({ sort: "-popularity_score,title" }),
  ]);

  const featuredScenario = popularScenarios[0] || null;
  const categoryCounts = createCategoryCountMap(popularScenarios);
  const categoryLeads = createCategoryLeadMap(popularScenarios);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>DS</span>
            <span className={styles.brandText}>
              <strong>Detective Simulator</strong>
              <small>İnteraktif vaka dosyaları</small>
            </span>
          </Link>
          <nav className={styles.topbarActions}>
            <Link href="/cases" className={styles.navLink}>
              Vaka Kataloğu
            </Link>
            <Link href="/play" className={styles.primaryButton}>
              Oyunu Aç
            </Link>
          </nav>
        </header>

        <main className={styles.content}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>İnteraktif Soruşturma</span>
              <h1 className={styles.heroTitle}>
                Vakanı seç, delilleri oku, şüphelileri sorgula.
              </h1>
              <p className={styles.heroLead}>
                Detective Simulator her dosyada ayrı bir soruşturma atmosferi kurar.
                Kurumsal sabotajdan sanat hırsızlığına kadar kanıtları incele,
                şüphelilerle konuş ve çelişkileri çözerek kararını ver.
              </p>
              <div className={styles.heroActions}>
                <Link href="/cases" className={styles.primaryButton}>
                  Vaka Kataloğu
                </Link>
                <Link href="/play" className={styles.secondaryButton}>
                  Oyuna Başla
                </Link>
              </div>
            </div>

            {featuredScenario ? (
              <aside className={styles.heroVisual}>
                <CaseArtwork
                  scenario={featuredScenario}
                  className={styles.heroArtwork}
                  eyebrow={styles.coverCaseArtworkChip}
                />
                <div className={styles.heroVisualMeta}>
                  <div className={styles.caseMeta}>
                    {featuredScenario.category?.title ? (
                      <span>{featuredScenario.category.title}</span>
                    ) : null}
                    <span>{formatDifficulty(featuredScenario.difficulty)}</span>
                    <span>{formatDuration(featuredScenario.estimated_duration)}</span>
                  </div>
                  <h2>{featuredScenario.title}</h2>
                  <p>{featuredScenario.teaser || featuredScenario.description}</p>
                  <div className={styles.heroPanelLinks}>
                    <Link
                      href={`/play?scenario=${featuredScenario.slug}`}
                      className={styles.inlineLink}
                    >
                      Vakayı Başlat →
                    </Link>
                    <Link
                      href={`/cases/${featuredScenario.slug}`}
                      className={styles.inlineGhostLink}
                    >
                      Dosyayı İncele
                    </Link>
                  </div>
                </div>
              </aside>
            ) : null}
          </section>

          {/* Workflow Steps */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Oyun Akışı</span>
              <h2>Üç adımda soruşturmayı tamamla</h2>
              <p>Her vaka aynı net ritimle ilerler; ipuçlarını topla, sorgula ve kararını savun.</p>
            </div>
            <div className={styles.workflowGrid}>
              {workflowSteps.map((step, index) => (
                <article key={step.title} className={styles.workflowCard}>
                  <span className={styles.workflowIndex}>{`0${index + 1}`}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Mystery Categories */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Gizem Türleri</span>
              <h2>Farklı soruşturma dinamikleri</h2>
              <p>
                Her kategori farklı motivasyonlar, kanıt türleri ve şüpheli ilişkileri kurar.
              </p>
            </div>
            <div className={styles.intentGrid}>
              {categories.map((category) => {
                const leadScenario = categoryLeads[category.slug];

                return (
                  <article
                    key={category.id}
                    className={styles.intentCard}
                    style={{ "--accent-color": category.accent_color || "var(--ds-accent)" }}
                  >
                    {leadScenario ? (
                      <CaseArtwork
                        scenario={leadScenario}
                        className={styles.intentArtwork}
                        eyebrow={styles.coverCaseArtworkChip}
                      />
                    ) : null}
                    <div className={styles.intentBody}>
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
                      <div className={styles.caseActions}>
                        <Link
                          href={`/cases/category/${category.slug}`}
                          className={styles.inlineLink}
                        >
                          Kategori Dosyaları
                        </Link>
                        {leadScenario ? (
                          <Link
                            href={`/cases/${leadScenario.slug}`}
                            className={styles.inlineGhostLink}
                          >
                            Örnek Vaka
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Featured Cases (Single Clean List) */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Öne Çıkan Vakalar</span>
              <h2>Hemen çözebileceğin dosyalar</h2>
              <p>Gerçek kanıtlar, şüpheli alibileri ve doğrudan soruşturma başlangıcı.</p>
            </div>
            <div className={styles.coverCaseGrid}>
              {popularScenarios.slice(0, 3).map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          </section>

          {/* Footer Callout */}
          <section className={styles.footerCallout}>
            <div>
              <span className={styles.sectionKicker}>Soruşturmaya Hazır mısın?</span>
              <h2>Bir dosya seç ve hemen başla.</h2>
              <p>
                Katalogdan vakayı incele, belgeleri oku ve şüphelilerin çelişkilerini yakala.
              </p>
            </div>
            <div className={styles.heroActions}>
              <Link href="/cases" className={styles.primaryButton}>
                Tüm Vakaları Gör
              </Link>
              <Link href="/play" className={styles.secondaryButton}>
                Oyuna Başla
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
