export default function AppHeader({
  isLoggedIn,
  userEmail,
  onLogin,
  onRegister,
  onLogout,
  onHome,
}) {
  return (
    <header className="app-header">
      <button type="button" className="brand" onClick={onHome}>
        <span className="brand-mark">DS</span>
        <div>
          <h1>Detective simulator</h1>
          <p>Interaktif sorusturma deneyimi</p>
        </div>
      </button>
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
