import { ArrowRightIcon, CheckSquareIcon, FileTextIcon, MessageSquareIcon } from "./icons";

export default function LandingHero({ onLogin, onRegister }) {
  return (
    <section className="landing">
      <div className="landing-copy">
        <span className="ds-badge ds-badge-accent landing-badge">
          İnteraktif Soruşturma
        </span>
        <h2>Vakanı seç, delilleri topla, suçluyu ortaya çıkar.</h2>
        <p>
          Gerçek olay yeri raporlarını incele, şüphelilere kendi sorularını sor
          ve çelişkileri yakalayarak vaka dosyasını çöz.
        </p>
        <div className="cta-row">
          <button
            type="button"
            onClick={onLogin}
            className="ds-btn ds-btn-primary ds-btn-lg"
          >
            Giriş Yap <ArrowRightIcon size={16} />
          </button>
          <button
            type="button"
            className="ds-btn ds-btn-secondary ds-btn-lg"
            onClick={onRegister}
          >
            Kayıt Ol
          </button>
        </div>
      </div>

      <div className="panel preview landing-preview-card">
        <h3>Nasıl Oynanır?</h3>
        <ul className="landing-steps-list">
          <li>
            <FileTextIcon size={16} className="step-icon" />
            <div>
              <strong>1. Belgeleri İncele</strong>
              <p>Olay yeri notları, raporlar ve delil fotoğraflarını oku.</p>
            </div>
          </li>
          <li>
            <MessageSquareIcon size={16} className="step-icon" />
            <div>
              <strong>2. Şüphelileri Sorgula</strong>
              <p>Her şüpheliye kendi sorularını yazarak alibilerini sına.</p>
            </div>
          </li>
          <li>
            <CheckSquareIcon size={16} className="step-icon" />
            <div>
              <strong>3. Kararını Ver</strong>
              <p>Suçlu veya suçluları seç, gerekçeni yaz ve vakanın sonucunu gör.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
