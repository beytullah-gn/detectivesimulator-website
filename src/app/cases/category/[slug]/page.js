import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../marketing.module.css";
import CaseGrid from "@/components/marketing/CaseGrid";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
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
    alternates: { canonical: `/cases/category/${category.slug}` },
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

  const faqItems = normalizeFaqItems(category.faq_items);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <MarketingHeader active="cases" />

        <main className={styles.detailPage}>
          <nav className={styles.breadcrumb} aria-label="Ekmek kırıntısı">
            <Link href="/">Anasayfa</Link>
            <span>/</span>
            <Link href="/cases">Vakalar</Link>
            <span>/</span>
            <strong>{category.title}</strong>
          </nav>

          <header className={styles.catalogHeader}>
            <h1 className={styles.heroTitle}>{category.title}</h1>
            <p className={styles.heroLead}>{category.description}</p>
          </header>

          <section className={styles.section}>
            <CaseGrid scenarios={scenarios} />
          </section>

          {faqItems.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionKicker}>SSS</span>
                <h2>Sık sorulan sorular</h2>
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

        <SiteFooter />
      </div>
    </div>
  );
}
