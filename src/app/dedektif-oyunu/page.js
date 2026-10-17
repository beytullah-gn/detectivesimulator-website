import Link from "next/link";
import styles from "../marketing.module.css";
import CaseGrid from "@/components/marketing/CaseGrid";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { getPublishedScenarios } from "@/lib/content-api";
import { JsonLd, OG_IMAGE, SITE_KEYWORDS, faqJsonLd, gameJsonLd } from "@/lib/seo";

export const revalidate = 600;

const title = "Online Dedektif Oyunu: Yapay Zekâ ile Şüpheli Sorgula";
const description =
  "Ücretsiz, Türkçe online dedektif oyunu. Vaka dosyasını oku, belgeleri ve ses kayıtlarını incele, şüphelileri yapay zekâyla sorgula, katili bul. İndirme yok, tarayıcıda oyna.";

export const metadata = {
  title,
  description,
  keywords: SITE_KEYWORDS,
  alternates: { canonical: "/dedektif-oyunu" },
  openGraph: { title, description, url: "/dedektif-oyunu", type: "website", images: [{ url: OG_IMAGE, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
};

const steps = [
  {
    title: "Vaka dosyasını aç",
    text: "Her vaka bir hikâyeyle başlar. Olay özetini oku ya da komiserin sesli brifingini dinle; kimlerin şüpheli olduğunu öğren.",
  },
  {
    title: "Delilleri incele",
    text: "Sistem dökümleri, sensör grafikleri, kamera kareleri, telefon ve telsiz kayıtları. Önemli olanları iğnele, saatleri not al.",
  },
  {
    title: "Şüphelileri sorgula",
    text: "Sorularını kendin yaz. Şüpheliler yapay zekâyla, karakterlerine uygun cevap verir. Suçlu yalan söyler; çelişkiyi yakalamak sana kalmış.",
  },
  {
    title: "Delili masaya koy",
    text: "Bir belgeyi ya da kaydı şüphelinin önüne koy, tepkisini izle. En güçlü itiraflar doğru delille gelir.",
  },
  {
    title: "Suçluyu göster",
    text: "Hazır olduğunda suçla ve gerekçeni yaz. Komiser değerlendirir; ipucusuz doğru çözüm üç yıldız ve rütbe kazandırır.",
  },
];

const features = [
  ["Yapay zekâ ile canlı sorgu", "Hazır diyalog yok; her şüpheliye istediğini sorarsın, cevaplar soruna göre şekillenir."],
  ["Gerçek gibi deliller", "Belgeler, fotoğraflar, kamera kareleri ve sesli kayıtlar; her vaka 6-9 delilden oluşur."],
  ["Türkçe ve ücretsiz", "Tamamen Türkçe; kayıt ücretsiz, indirme gerektirmez, mobilde de çalışır."],
  ["Puan, yıldız ve rütbe", "Az ipucuyla çöz, yıldız topla, Çaylak'tan Komiser'e yüksel."],
  ["Noir atmosfer", "Yağmurlu bir şehir gecesi, caz müziği ve her hamlede ses efektleri."],
  ["İstanbul'da geçen vakalar", "Liman kaçakçılığından sanat galerisi soygununa, kurumsal sabotajdan veri sızıntısına."],
];

const faq = [
  {
    question: "Detective Simulator nedir?",
    answer:
      "Detective Simulator, tarayıcıda oynanan Türkçe bir dedektif oyunudur. Vaka dosyasını okur, delilleri inceler, şüphelileri yapay zekâ ile sorgular ve suçluyu gerekçesiyle bulursun.",
  },
  {
    question: "Oyun ücretsiz mi?",
    answer: "Evet. Hesap açmak ve vakaları oynamak ücretsizdir. İndirme gerekmez; bilgisayarda ve telefonda tarayıcıdan oynanır.",
  },
  {
    question: "Şüphelileri nasıl sorguluyorum?",
    answer:
      "Sorgu odasında soruyu kendin yazarsın ya da önerilen sorulardan birini seçersin. İstersen bir delili şüphelinin önüne koyup açıklama isteyebilirsin. Şüpheliler yapay zekâ ile karakterlerine uygun cevap verir.",
  },
  {
    question: "Bir vaka ne kadar sürer?",
    answer: "Vakaların çoğu 10-35 dakika sürer. İlerlemen kaydedilir; istediğin zaman kaldığın yerden devam edebilir ya da baştan başlayabilirsin.",
  },
  {
    question: "Takılırsam ne olur?",
    answer:
      "Her vakada üç ipucu hakkın var; bazıları komiserin notu ya da sesli mesajı olarak gelir. İpucu kullanmak puanı ve yıldızı düşürür ama vakayı çözmeni kolaylaştırır.",
  },
  {
    question: "Nasıl kayıt olurum?",
    answer: "E-posta adresinle ya da Google hesabınla birkaç saniyede giriş yapabilirsin.",
  },
];

export default async function DetectiveGameLandingPage() {
  const scenarios = await getPublishedScenarios({ sort: "-popularity_score,title" }).catch(() => []);

  return (
    <div className={styles.page}>
      <JsonLd data={gameJsonLd()} />
      <JsonLd data={faqJsonLd(faq)} />
      <div className={styles.shell}>
        <MarketingHeader />

        <main className={styles.content}>
          <section className={styles.landingHero}>
            <div>
              <h1>Online dedektif oyunu: şüpheliyi sen sorgula</h1>
              <p>
                Detective Simulator, yapay zekâ ile şüphelileri canlı sorguladığın Türkçe ve ücretsiz bir gizem oyunu.
                Delilleri incele, yalanı yakala, katili bul.
              </p>
              <div className={styles.heroActions}>
                <Link href="/play" className={styles.primaryButton}>
                  Ücretsiz oyna
                </Link>
                <Link href="/cases" className={styles.secondaryButton}>
                  Vakalara göz at
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="nasil-oynanir">
            <div className={styles.sectionHeader}>
              <h2 id="nasil-oynanir">Nasıl oynanır?</h2>
            </div>
            <ol className={styles.seoSteps}>
              {steps.map((step, index) => (
                <li key={step.title}>
                  <b>{`0${index + 1}`}</b>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="ozellikler">
            <div className={styles.sectionHeader}>
              <h2 id="ozellikler">Neden farklı bir dedektif oyunu?</h2>
            </div>
            <div className={styles.seoFeatures}>
              {features.map(([featureTitle, text]) => (
                <article key={featureTitle}>
                  <h3>{featureTitle}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          {scenarios.length ? (
            <section className={styles.section} aria-labelledby="vakalar">
              <div className={styles.sectionHeader}>
                <h2 id="vakalar">Çözülmeyi bekleyen vakalar</h2>
              </div>
              <CaseGrid scenarios={scenarios} />
            </section>
          ) : null}

          <section className={styles.section} aria-labelledby="sss">
            <div className={styles.sectionHeader}>
              <h2 id="sss">Sık sorulan sorular</h2>
            </div>
            <div className={styles.seoFaq}>
              {faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.seoCta}>
            <h2>İlk vakan seni bekliyor</h2>
            <Link href="/play" className={styles.primaryButton}>
              Soruşturmaya başla
            </Link>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
