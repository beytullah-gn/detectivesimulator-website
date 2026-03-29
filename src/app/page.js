import Link from "next/link";
import styles from "./marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import {
  getPublishedScenarioCategories,
  getPublishedScenarios,
} from "@/lib/directus";

export const revalidate = 120;

const workflowSteps = [
  {
    title: "Vaka dosyasini tara",
    description:
      "Kanit notlari, olay raporlari ve baglamsal medya kartlari server-rendered olarak yuklenir.",
  },
  {
    title: "Suphelileri capraz sorgula",
    description:
      "Canli oyuna gectiginde her karaktere ayri sorular sorar, cevap akisini session bazli takip edersin.",
  },
  {
    title: "Nihai karari savun",
    description:
      "Secilen supheliler ve gerekce metni AI geri bildirimiyle birlikte degerlendirilir.",
  },
];

const featureList = [
  "Kategori ve vaka sayfalari tek bir Directus veri modelinden uretilir.",
  "Public landing katmani indexlenebilir, oyun katmani ise session bazli akar.",
  "Kapak varliklari Directus file library uzerinden senaryolara baglanir.",
];

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
            Dosyayi Incele
          </Link>
          <Link href="/play" className={styles.inlineGhostLink}>
            Oyuna Git
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
              <small>AI destekli vaka dosyalari</small>
            </span>
          </Link>
          <nav className={styles.topbarActions}>
            <Link href="/cases" className={styles.navLink}>
              Vaka Katalogu
            </Link>
            <Link href="/play" className={styles.primaryButton}>
              Oyunu Ac
            </Link>
          </nav>
        </header>

        <main className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Kategori bazli landing katmani</span>
              <h1 className={styles.heroTitle}>
                Her vaka oynanabilir, her kategori ise SEO niyeti tasiyan ayri bir vitrin.
              </h1>
              <p className={styles.heroLead}>
                Detective Simulator artik duz vaka listesi gibi davranmiyor. Kurumsal
                sabotaj, sanat hirsizligi ve liman zinciri gibi farkli arama niyetleri icin
                ayri landing zemini, kapak gorselleri ve koleksiyon akislari uretir.
              </p>
              <div className={styles.heroActions}>
                <Link href="/cases" className={styles.primaryButton}>
                  Katalogu Incele
                </Link>
                <Link href="/play" className={styles.secondaryButton}>
                  Interaktif Oyuna Gir
                </Link>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statCard}>
                  <strong>{popularScenarios.length}</strong>
                  <span>Yayinlanan vaka</span>
                </div>
                <div className={styles.statCard}>
                  <strong>{categories.length}</strong>
                  <span>Kategori landing sayfasi</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Live</strong>
                  <span>Directus kapak varliklari</span>
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
                      Vaka dosyasini ac
                    </Link>
                    {featuredScenario.category?.slug ? (
                      <Link
                        href={`/cases/category/${featuredScenario.category.slug}`}
                        className={styles.inlineGhostLink}
                      >
                        Kategoriye git
                      </Link>
                    ) : null}
                  </div>
                </div>
              </aside>
            ) : null}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Kategori Intentleri</span>
              <h2>Her tema kendi arama niyetiyle ayrisiyor</h2>
              <p>
                Kategori kartlari artik yalnizca metin degil; o kategoriye ait one cikan
                senaryo kapagi ve anlatim tonu ile birlikte sunuluyor.
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
                          Kategori sayfasini ac
                        </Link>
                        {leadScenario ? (
                          <Link
                            href={`/cases/${leadScenario.slug}`}
                            className={styles.inlineGhostLink}
                          >
                            One cikan vaka
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
                <span className={styles.sectionKicker}>En Cok Oynanan</span>
                <h2>Oyuncularin en cok girdigi dosyalar</h2>
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
              <span className={styles.sectionKicker}>Akis</span>
              <h2>Landing ve oyun katmani birlikte calisiyor</h2>
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
              <span className={styles.sectionKicker}>Altyapi</span>
              <h2>Directus kaynakli icerik, vitrin seviyesinde sunum</h2>
            </div>
            <div className={styles.featureGrid}>
              {featureList.map((item) => (
                <article key={item} className={styles.featureCard}>
                  <h3>{item}</h3>
                  <p>
                    Yeni landing yapisi, vaka kapaklari ve koleksiyon mantigi ile birlikte
                    ayni veri setini hem SEO hem oyun deneyimi icin kullaniyor.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.footerCallout}>
            <div>
              <span className={styles.sectionKicker}>Hazir</span>
              <h2>Kapakli katalogu buyut, interaktif oyunu sabit tut.</h2>
              <p>
                Artik yeni vaka eklediginde sadece oyun degil, ayni zamanda kapakli ve
                kategori niyetli yeni bir landing parcasi da uretmis oluyorsun.
              </p>
            </div>
            <div className={styles.heroActions}>
              <Link href="/cases" className={styles.primaryButton}>
                Tum Vakalari Gor
              </Link>
              <Link href="/play" className={styles.secondaryButton}>
                Oyuna Don
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
