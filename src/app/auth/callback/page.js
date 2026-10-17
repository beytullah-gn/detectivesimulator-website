"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SESSION_TOKEN, storeToken } from "../../../services/authService";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || searchParams.get("message") || "";
  const token = searchParams.get("access_token") || searchParams.get("token") || "";

  useEffect(() => {
    let resolvedToken = token;
    if (!resolvedToken && typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      resolvedToken = hashParams.get("access_token") || hashParams.get("token") || "";
    }

    if (resolvedToken) {
      storeToken(resolvedToken);
      router.replace("/play");
      return;
    }

    if (!error) {
      storeToken(SESSION_TOKEN);
      router.replace("/play");
    }
  }, [router, token, error]);

  if (error) {
    return (
      <main className="auth-shell">
        <div className="panel auth" style={{ maxWidth: 420, textAlign: "center" }}>
          <div className="auth-header">
            <h2>Giriş Yapılamadı</h2>
          </div>
          <div style={{ marginTop: 16 }}>
            <p className="auth-error-msg" style={{ marginBottom: 20 }}>
              {error}
            </p>
            <Link href="/play" className="ds-btn ds-btn-primary ds-btn-lg" style={{ display: "inline-flex" }}>
              Giriş Ekranına Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <div className="panel auth" style={{ maxWidth: 420, textAlign: "center" }}>
        <div className="auth-header">
          <h2>Oturum Açılıyor</h2>
        </div>
        <p style={{ marginTop: 16, color: "var(--ds-muted, #7c8e87)" }}>
          Dedektif kimliğiniz doğrulanıyor, lütfen bekleyin...
        </p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
