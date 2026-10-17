// Brand mark: a fedora resting on a magnifying glass. Colors follow the accent token.
export function LogoMark({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`logo-mark ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="62" height="62" rx="14" className="logo-mark-bg" />
      <circle cx="27" cy="36" r="13.5" fill="none" className="logo-mark-ink" strokeWidth="5" />
      <circle cx="27" cy="36" r="8" className="logo-mark-glass" />
      <path d="M36.5 45.5 L47.5 56.5" className="logo-mark-ink" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M14 22.5c0-8.5 3.6-14 8.2-14 2.3 0 3.4 1.6 4.8 1.6s2.5-1.6 4.8-1.6c4.6 0 8.2 5.5 8.2 14z"
        className="logo-mark-fill"
      />
      <path d="M14.4 18.6h25.2v3.4H14.4z" className="logo-mark-band" />
      <ellipse cx="27" cy="23.2" rx="19" ry="3.6" className="logo-mark-fill" />
    </svg>
  );
}

export default function Logo({ size = 32 }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">
        <strong>Detective</strong>
        <small>Simulator</small>
      </span>
    </span>
  );
}
