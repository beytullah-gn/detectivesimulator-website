export default function LandingHero({ onLogin, onRegister }) {
  return (
    <section className="landing">
      <div>
        <h2>Vakanı seç, delilleri topla, doğru katili ortaya çıkar.</h2>
        <p>
          Directus içerik yönetimi ile beslenen senaryoları keşfet, şüphelileri
          sorgula ve nihai kararını ver.
        </p>
        <div className="cta-row">
          <button type="button" onClick={onLogin}>
            Giriş Yap
          </button>
          <button type="button" className="secondary" onClick={onRegister}>
            Kayıt Ol
          </button>
        </div>
      </div>
      <div className="panel preview">
        <h3>Öne Çıkan Akış</h3>
        <ul>
          <li>Senaryo ve karakter kartları</li>
          <li>Gerçek zamanlı sorgu paneli</li>
          <li>AI destekli final değerlendirmesi</li>
        </ul>
      </div>
    </section>
  );
}
