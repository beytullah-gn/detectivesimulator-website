import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
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
    title: scenario.title,
    description,
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
  const categoryNarrative = splitNarrative(category?.landing_narrative).slice(0, 2);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb}>
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

          <section className={styles.detailHero}>
            <div className={styles.detailHeroCopy}>
              <span className={styles.eyebrow}>Vaka Dosyası</span>
              <h1 className={styles.heroTitle}>{scenario.title}</h1>
              <p className={styles.heroLead}>
                {scenario.teaser || scenario.description}
              </p>
              <div className={styles.metaRow}>
                {category?.title ? <span>{category.title}</span> : null}
                <span>{formatDifficulty(scenario.difficulty)}</span>
                <span>{formatDuration(scenario.estimated_duration)}</span>
                <span>{characters.length} şüpheli</span>
                <span>{media.length} kanıt parçası</span>
              </div>
              <div className={styles.heroActions}>
                <Link href="/play" className={styles.primaryButton}>
                  Oyuna Başla
                </Link>
                <Link href="/cases" className={styles.secondaryButton}>
                  Vaka Kataloğu
                </Link>
              </div>
            </div>

            <aside className={styles.heroPanel}>
              <CaseArtwork
                scenario={scenario}
                className={styles.sidebarArtwork}
                eyebrow={styles.coverCaseArtworkChip}
              />
              <p className={styles.panelLabel}>Dosya Özeti</p>
              {category?.title ? (
                <span className={styles.categoryBadge}>{category.title}</span>
              ) : null}
              <h2>Ne oldu?</h2>
              <p>{scenario.description}</p>
              {category?.theme_statement ? (
                <blockquote className={styles.categoryQuote}>
                  {category.theme_statement}
                </blockquote>
              ) : null}
              <div className={styles.panelDivider} />
              <ul className={styles.featureBulletList}>
                <li>Dosyayı önce okuyabilir, sonra oyunda sorgulamaya geçebilirsin.</li>
                <li>Karakterler, kanıtlar ve ipuçları aynı soruşturmayı besler.</li>
                <li>Finalde suçluyu seçip gerekçeni savunursun.</li>
              </ul>
            </aside>
          </section>

          {categoryNarrative.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Kategori Bağlamı</span>
                <h2>{scenario.title} hangi tür gizeme ait?</h2>
              </div>
              <div className={styles.narrativeGrid}>
                {categoryNarrative.map((paragraph) => (
                  <article key={paragraph} className={styles.narrativeCard}>
                    <p>{paragraph}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.detailGrid}>
            <article className={styles.detailCard}>
              <span className={styles.sectionKicker}>Kanıtlar</span>
              <h2>Olay yeri notları ve dosya belgeleri</h2>
              <div className={styles.evidenceList}>
                {media.map((item) => (
                  <article key={item.id} className={styles.evidenceCard}>
                    <div className={styles.caseMeta}>
                      <span>{item.type || "Belge"}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    {item.content ? (
                      <p className={styles.evidenceContent}>{item.content}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>

            <article className={styles.detailCard}>
              <span className={styles.sectionKicker}>Şüpheliler</span>
              <h2>Dosyada adı geçen isimler</h2>
              <div className={styles.suspectGrid}>
                {characters.map((character) => (
                  <article key={character.id} className={styles.suspectCard}>
                    <div className={styles.suspectTopline}>
                      <h3>{`${character.name} ${character.surname || ""}`.trim()}</h3>
                      <span>{character.role || "Şüpheli"}</span>
                    </div>
                    <p>{character.description}</p>
                    <dl className={styles.suspectFacts}>
                      <div>
                        <dt>Yas</dt>
                        <dd>{character.age || "-"}</dd>
                      </div>
                      <div>
                        <dt>Kisilik</dt>
                        <dd>{character.personality || "-"}</dd>
                      </div>
                      <div>
                        <dt>Alibi</dt>
                        <dd>{character.alibi || "-"}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </article>
          </section>

          {relatedScenarios.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>Benzer Vakalar</span>
                <h2>{category?.title} icindeki diger dosyalar</h2>
                <p>
                  Bu vakayi begendiysen ayni tema altindaki diger senaryolara da gecis
                  yapabilirsin.
                </p>
              </div>
              <div className={styles.caseGrid}>
                {relatedScenarios.map((item) => (
                  <article key={item.id} className={styles.coverCaseCard}>
                    <CaseArtwork
                      scenario={item}
                      className={styles.coverCaseArtwork}
                      eyebrow={styles.coverCaseArtworkChip}
                    />
                    <div className={styles.coverCaseBody}>
                      <div className={styles.caseMeta}>
                        <span>{formatDifficulty(item.difficulty)}</span>
                        <span>{formatDuration(item.estimated_duration)}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.teaser || item.description}</p>
                      <div className={styles.caseActions}>
                        <Link href={`/cases/${item.slug}`} className={styles.inlineLink}>
                          Dosyayı İncele
                        </Link>
                        <Link
                          href={`/cases/category/${category.slug}`}
                          className={styles.inlineGhostLink}
                        >
                          Kategoriye Dön
                        </Link>
                      </div>
                    </div>
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
