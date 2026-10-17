"use client";

import { useEffect, useState } from "react";
import { AppleIcon, EyeIcon, EyeOffIcon, GoogleIcon } from "./icons";
import { SOCIAL_PROVIDERS, oauthLoginUrl } from "../services/authService";
import GoogleSignInButton, { GOOGLE_CLIENT_ID } from "./GoogleSignInButton";

export default function AuthPanel({
  title,
  submitLabel,
  footerLabel,
  onSubmit,
  onFooterClick,
  loading,
  showConfirmPassword,
  selectedCaseTitle,
  onSocialLogin,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  useEffect(() => {
    function resetSocialLoading() {
      setSocialLoading("");
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", resetSocialLoading);
      window.addEventListener("focus", resetSocialLoading);
      return () => {
        window.removeEventListener("pageshow", resetSocialLoading);
        window.removeEventListener("focus", resetSocialLoading);
      };
    }
  }, []);

  function handleSocialLogin(provider) {
    setSocialLoading(provider);
    try {
      const targetUrl = oauthLoginUrl(provider);
      if (typeof window !== "undefined") {
        window.location.assign(targetUrl);
      }
    } catch (err) {
      console.error("Social login navigation error:", err);
      setSocialLoading("");
    }
  }

  const isBusy = loading || Boolean(socialLoading);

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
        </div>

        {SOCIAL_PROVIDERS.length ? (
          <div className="social-auth-section">
            <div className="social-auth-buttons">
              {SOCIAL_PROVIDERS.includes("google") && GOOGLE_CLIENT_ID ? (
                <GoogleSignInButton
                  disabled={isBusy}
                  onCredential={(credential) => onSocialLogin?.("google", credential)}
                />
              ) : null}
              {SOCIAL_PROVIDERS.includes("apple") ? (
                <button
                  type="button"
                  className="ds-btn social-auth-btn apple"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={isBusy}
                >
                  <AppleIcon size={18} />
                  <span>
                    {socialLoading === "apple"
                      ? "Yönlendiriliyor..."
                      : "Apple ile Devam Et"}
                  </span>
                </button>
              ) : null}
            </div>

            <p className="auth-privacy-note">
            Devam ederek <a href="/gizlilik">gizlilik politikasını</a> kabul edersin.
          </p>
          <div className="auth-divider" role="separator">
              <span>veya e-posta ile</span>
            </div>
          </div>
        ) : null}

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
                autoComplete={
                  showConfirmPassword ? "new-password" : "current-password"
                }
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
                {showPassword ? (
                  <EyeOffIcon size={16} />
                ) : (
                  <EyeIcon size={16} />
                )}
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
                  {showConfirm ? (
                    <EyeOffIcon size={16} />
                  ) : (
                    <EyeIcon size={16} />
                  )}
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
