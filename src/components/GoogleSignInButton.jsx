"use client";

import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let scriptPromise = null;

function loadGoogleScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Google sign-in script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Google Identity Services button: returns an ID token that the backend verifies at /api/social-login.
export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let active = true;
    loadGoogleScript()
      .then(() => {
        if (!active || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) callbackRef.current?.(response.credential);
          },
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          locale: "tr",
          width: Math.min(containerRef.current.offsetWidth || 320, 400),
        });
      })
      .catch((error) => {
        console.error("Google sign-in setup error:", error);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return <p className="auth-privacy-note">Google ile giriş şu an yüklenemedi.</p>;
  }

  return (
    <div
      ref={containerRef}
      className={`google-signin ${disabled ? "is-disabled" : ""}`}
      aria-disabled={disabled}
    />
  );
}
