"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { LogOutIcon, UserIcon } from "./icons";

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
      <div className="header-left">
        <button type="button" className="brand" onClick={onHome} aria-label="Ana Sayfaya Git">
          <span className="brand-mark">DS</span>
          <div className="brand-copy">
            <span className="brand-title">Detective Simulator</span>
            <span className="brand-subtitle">Soruşturma Dosyası</span>
          </div>
        </button>
      </div>

      <nav className="header-nav" aria-label="Ana Navigasyon">
        <Link href="/cases" className="header-link">
          Vakalar
        </Link>
        <Link href="/play" className="header-link active">
          Oyun Alanı
        </Link>
      </nav>

      <div className="header-actions">
        <ThemeToggle />

        {isLoggedIn ? (
          <div className="user-area">
            <div className="user-chip" title={userEmail || "Oyuncu"}>
              <UserIcon size={14} className="user-icon" />
              <span className="user-name">{userEmail ? userEmail.split("@")[0] : "Dedektif"}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="ds-btn ds-btn-ghost ds-btn-sm"
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
            >
              <LogOutIcon size={15} />
              <span className="hide-mobile">Çıkış</span>
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button
              type="button"
              onClick={onLogin}
              className="ds-btn ds-btn-secondary ds-btn-sm"
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="ds-btn ds-btn-primary ds-btn-sm"
            >
              Kayıt Ol
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
