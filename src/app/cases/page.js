import Link from "next/link";
import styles from "../marketing.module.css";
import CaseGrid from "@/components/marketing/CaseGrid";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { createSocialImages, DEFAULT_SOCIAL_IMAGE } from "@/lib/content";
import {
  getPublishedScenarioCategories,
  getPublishedScenarios,
} from "@/lib/content-api";

export const revalidate = 120;

export const metadata = {
  title: "Vaka Kataloğu",
  description:
    "Detective Simulator içindeki tüm yayınlanmış vakaları, delil dosyalarını ve şüpheli listelerini inceleyin.",
  openGraph: {
    images: createSocialImages(
      DEFAULT_SOCIAL_IMAGE,
      "Detective Simulator vaka kataloğu"
    ),
  },
  twitter: {
    images: createSocialImages(
      DEFAULT_SOCIAL_IMAGE,
      "Detective Simulator vaka kataloğu"
    ),
  },
};

export default async function CasesIndexPage() {
  const [categories, scenarios] = await Promise.all([
    getPublishedScenarioCategories(),
    getPublishedScenarios({ sort: "-popularity_score,title" }),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <MarketingHeader active="cases" />

        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb} aria-label="Ekmek kırıntısı">
            <Link href="/">Anasayfa</Link>
            <span>/</span>
            <strong>Vakalar</strong>
          </nav>

          <header className={styles.catalogHeader}>
            <h1 className={styles.heroTitle}>Vakalar</h1>

            <nav className={styles.catalogFilterRow} aria-label="Kategori Filtresi">
              <span className={`${styles.filterChip} ${styles.filterChipActive}`}>
                Tümü ({scenarios.length})
              </span>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/cases/category/${category.slug}`}
                  className={styles.filterChip}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
          </header>

          <section className={styles.section}>
            <CaseGrid scenarios={scenarios} />
          </section>
        </main>
      </div>
    </div>
  );
}
