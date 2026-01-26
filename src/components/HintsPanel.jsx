const DEFAULT_MAX_HINTS = 3;

export default function HintsPanel({ hints, onUseHint, loading, maxHints = DEFAULT_MAX_HINTS }) {
  const remainingHints = Math.max(maxHints - hints.length, 0);
  const isLimitReached = remainingHints === 0;

  return (
    <section className="panel-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0 }}>Toplanan İpuçları ({hints.length})</h3>
          <p className="hint-meta">Kalan ipucu: {remainingHints}</p>
        </div>
        <button type="button" onClick={onUseHint} disabled={loading || isLimitReached}>
          {loading ? "İpucu alınıyor..." : "💡 İpucu Kullan"}
        </button>
      </div>
      {hints.length === 0 ? (
        <p style={{ color: "rgba(244, 234, 215, 0.6)" }}>
          Henüz ipucu kullanılmadı. Yukarıdaki butonu kullanarak ipucu alabilirsiniz.
        </p>
      ) : (
        <ul className="hint-list">
          {hints.map((hint, idx) => (
            <li key={hint.id || idx}>
              <div className="hint-header">
                <strong>{hint.title || "İpucu"}</strong>
                <span className="hint-badge">{hint.type || "Genel"}</span>
              </div>
              <p>{hint.content}</p>
            </li>
          ))}
        </ul>
      )}
      {isLimitReached ? (
        <p className="hint-limit">İpucu hakkın bitti. Yeni ipucu alamazsın.</p>
      ) : null}
    </section>
  );
}
