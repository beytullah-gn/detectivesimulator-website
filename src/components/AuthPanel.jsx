"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

export default function AuthPanel({
  title,
  submitLabel,
  footerLabel,
  onSubmit,
  onFooterClick,
  loading,
  showConfirmPassword,
  selectedCaseTitle,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="auth-shell">
      <div className="panel auth">
        {selectedCaseTitle ? (
          <div className="auth-context-note">
            <span>Seçilen vaka:</span>
            <strong>{selectedCaseTitle}</strong>
          </div>
        ) : null}

        <div className="auth-header">
          <h2>{title}</h2>
          <p className="auth-subtitle">
            {showConfirmPassword
              ? "Soruşturmaya başlamak için yeni bir dedektif hesabı aç."
              : "Dosyalarına ve soruşturma geçmişine erişmek için giriş yap."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="form auth-form">
          <label className="form-field">
            <span className="field-label">E-posta adresi</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="dedektif@ornek.com"
              className="field-input"
              disabled={loading}
            />
          </label>

          <label className="form-field">
            <span className="field-label">Şifre</span>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete={showConfirmPassword ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="field-input password-input"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </label>

          {showConfirmPassword ? (
            <label className="form-field">
              <span className="field-label">Şifre Tekrar</span>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="passwordConfirm"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="field-input password-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </label>
          ) : null}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="ds-btn ds-btn-primary ds-btn-lg auth-submit-btn"
            >
              {loading ? "İşlem sürüyor..." : submitLabel}
            </button>
            <button
              type="button"
              className="ds-btn ds-btn-ghost auth-switch-btn"
              onClick={onFooterClick}
              disabled={loading}
            >
              {footerLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
