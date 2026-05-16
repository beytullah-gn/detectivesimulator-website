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
    title: "Vaka dosyasını tara",
    description:
      "Olay raporlarını, kanıt notlarını ve şüpheliler arasındaki bağlantıları tek dosyada incele.",
  },
  {
    title: "Şüphelileri çapraz sorgula",
    description:
      "Her karaktere ayrı sorular sor, cevapları karşılaştır ve çelişkileri yakala.",
  },
  {
    title: "Nihai kararını savun",
    description:
      "Suçluyu seç, gerekçeni yaz ve dosyanın gerçek çözümüyle yüzleş.",
  },
];

const featureList = [
  "Her kategori farklı türde gizemler sunar.",
  "Vaka sayfaları oyuna başlamadan önce dosyayı tanıtır.",
  "Kapak görselleri ve dosya özetleri aynı atmosferi oyun içine taşır.",
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
          <Link href="/play" className={styles.inlineGhostLink}>
            Oyuna Başla
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [categories, popularScenarios, recentScenarios] = await Promise.all([
    getPublishedScenarioCategories(),
    getPublishedScenarios({ sort: "-popularity_score,title" }),
    getPublishedScenarios({ sort: "-date_created,title", limit: 3 }),
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
            <span>
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
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>İnteraktif dedektif dosyaları</span>
              <h1 className={styles.heroTitle}>
                Vakanı seç, delilleri oku, şüphelileri sorgula.
              </h1>
              <p className={styles.heroLead}>
                Detective Simulator her dosyada ayrı bir gizem kurar. Kurumsal sabotaj,
                sanat hırsızlığı ve liman operasyonları gibi farklı temalarda kanıtları
                incele, karakterleri sorgula ve son kararı ver.
              </p>
              <div className={styles.heroActions}>
                <Link href="/cases" className={styles.primaryButton}>
                  Vaka Kataloğu
                </Link>
                <Link href="/play" className={styles.secondaryButton}>
                  Oyuna Başla
                </Link>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statCard}>
                  <strong>{popularScenarios.length}</strong>
                  <span>Yayınlanan vaka</span>
                </div>
                <div className={styles.statCard}>
                  <strong>{categories.length}</strong>
                  <span>Gizem kategorisi</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Hazır</strong>
                  <span>Oynanabilir dosya akışı</span>
                </div>
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
                    <span>{featuredScenario.popularity_score || 0} oynama</span>
                  </div>
                  <h2>{featuredScenario.title}</h2>
                  <p>{featuredScenario.teaser || featuredScenario.description}</p>
                  <div className={styles.heroPanelLinks}>
                    <Link
                      href={`/cases/${featuredScenario.slug}`}
                      className={styles.inlineLink}
                    >
                      Dosyayı İncele
                    </Link>
                    {featuredScenario.category?.slug ? (
                      <Link
                        href={`/cases/category/${featuredScenario.category.slug}`}
                        className={styles.inlineGhostLink}
                      >
                        Kategoriye Git
                      </Link>
                    ) : null}
                  </div>
                </div>
              </aside>
            ) : null}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Gizem Kategorileri</span>
              <h2>Her tema farklı bir soruşturma hissi verir</h2>
              <p>
                Kategoriler yalnızca liste değildir; her biri farklı motivasyonlar,
                kanıt türleri ve şüpheli ilişkileriyle ayrı bir dosya atmosferi kurar.
              </p>
            </div>
            <div className={styles.intentGrid}>
              {categories.map((category) => {
                const leadScenario = categoryLeads[category.slug];

                return (
                  <article
                    key={category.id}
                    className={styles.intentCard}
                    style={{ "--accent-color": category.accent_color || "#BA7D2F" }}
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
                            Öne Çıkan Vaka
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.collectionSection}>
            <div className={styles.collectionColumn}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>En Çok Oynanan</span>
                <h2>Oyuncuların en çok girdiği dosyalar</h2>
              </div>
              <div className={styles.coverCaseGrid}>
                {popularScenarios.slice(0, 3).map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </div>

            <div className={styles.collectionColumn}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Yeni Eklenen</span>
                <h2>Kataloga son eklenen vakalar</h2>
              </div>
              <div className={styles.coverCaseGrid}>
                {recentScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Oyun Akışı</span>
              <h2>Dört adımda dosyayı çöz</h2>
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

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Dosya Deneyimi</span>
              <h2>Her vaka aynı ritimle ilerler</h2>
            </div>
            <div className={styles.featureGrid}>
              {featureList.map((item) => (
                <article key={item} className={styles.featureCard}>
                  <h3>{item}</h3>
                  <p>
                    Oyuncu önce dosyanın havasını alır, sonra aynı vaka içinde
                    kanıtları, şüphelileri ve final kararını takip eder.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.footerCallout}>
            <div>
              <span className={styles.sectionKicker}>Hazır</span>
              <h2>Yeni bir dosya aç ve soruşturmaya başla.</h2>
              <p>
                Katalogdan bir dosya seç, delilleri incele ve şüphelilerin verdiği
                cevapları final kararınla birleştir.
              </p>
            </div>
            <div className={styles.heroActions}>
              <Link href="/cases" className={styles.primaryButton}>
                Tüm Vakaları Gör
              </Link>
              <Link href="/play" className={styles.secondaryButton}>
                Oyuna Dön
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
