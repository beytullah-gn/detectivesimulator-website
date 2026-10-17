import styles from "../marketing.module.css";
import MarketingHeader from "@/components/marketing/MarketingHeader";

export const metadata = {
  title: "Gizlilik Politikası",
  description: "Detective Simulator'ın hangi verileri topladığı ve nasıl kullandığı.",
};

const sections = [
  {
    title: "Topladığımız bilgiler",
    items: [
      "Hesap bilgileri: e-posta adresin. Google ile giriş yaparsan Google'ın bizimle paylaştığı ad, e-posta adresi ve profil kimliği.",
      "Oyun verileri: başlattığın vakalar, şüphelilere sorduğun sorular ve aldığın cevaplar, kullandığın ipuçları, final kararın, puanın ve yıldızların.",
      "Cihazında tutulanlar: oturum anahtarı, tema ve ses tercihleri, vaka notların ve işaretlediğin deliller tarayıcının yerel depolamasında saklanır.",
    ],
  },
  {
    title: "Bilgileri nasıl kullanıyoruz",
    items: [
      "Hesabını açmak, oturumunu sürdürmek ve oyun ilerlemeni kaydetmek için.",
      "Şüpheli cevaplarını ve final değerlendirmesini üretmek için: soruların ve vaka bağlamı yapay zekâ sağlayıcılarına (Google Gemini, OpenRouter) gönderilir. Bu isteklere e-posta adresin eklenmez.",
      "Bilgilerini satmayız ve reklam amacıyla kullanmayız.",
    ],
  },
  {
    title: "Google ile giriş",
    items: [
      "Google'dan yalnızca temel profil bilgilerini (ad, e-posta) isteriz. Google hesabındaki başka verilere erişmeyiz.",
      "Google erişimini dilediğin zaman myaccount.google.com adresindeki güvenlik ayarlarından kaldırabilirsin.",
    ],
  },
  {
    title: "Çerezler",
    items: [
      "Yalnızca oturumunu açık tutmak için gerekli bir oturum çerezi kullanırız. Reklam veya takip çerezi kullanmayız.",
    ],
  },
  {
    title: "Haklarını kullanmak",
    items: [
      "Hesabının ve oyun verilerinin silinmesini veya bir kopyasını istemek için beytullah.developer@gmail.com adresine yazabilirsin.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <MarketingHeader />
        <main className={styles.content}>
          <section className={styles.section}>
            <h1 className={styles.heroTitle}>Gizlilik Politikası</h1>
            <p className={styles.heroLead}>Son güncelleme: 17 Ekim 2026</p>
          </section>
          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>{section.title}</h2>
              </div>
              <ul className={styles.policyList}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
