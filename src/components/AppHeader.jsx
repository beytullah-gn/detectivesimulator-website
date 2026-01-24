export default function AppHeader({
  isLoggedIn,
  userEmail,
  onLogin,
  onRegister,
  onLogout,
}) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">DS</span>
        <div>
          <h1>Detective Simulator</h1>
          <p>Directus tabanlı interaktif soruşturma deneyimi</p>
        </div>
      </div>
      <div className="header-actions">
        {isLoggedIn ? (
          <>
            <div className="user-chip">
              <span className="user-dot" />
              <span>{userEmail || "Dedektif"}</span>
            </div>
            <button type="button" onClick={onLogout} className="ghost">
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onLogin}>
              Giriş
            </button>
            <button type="button" className="secondary" onClick={onRegister}>
              Kayıt Ol
            </button>
          </>
        )}
      </div>
    </header>
  );
}
