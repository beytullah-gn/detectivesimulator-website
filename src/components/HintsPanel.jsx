export default function HintsPanel({ hints, onUseHint, loading }) {
  return (
    <section className="panel-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>Toplanan İpuçları ({hints.length})</h3>
        <button type="button" onClick={onUseHint} disabled={loading}>
          {loading ? "İpucu alınıyor..." : "💡 İpucu Kullan"}
        </button>
      </div>
      {hints.length === 0 ? (
        <p style={{ color: "rgba(244, 234, 215, 0.6)" }}>Henüz ipucu kullanılmadı. Yukarıdaki butonu kullanarak ipucu alabilirsiniz.</p>
      ) : (
        <ul className="hint-list">
          {hints.map((hint, idx) => (
            <li key={hint.id || idx}>
              <strong>{hint.title || "İpucu"}</strong>
              <p>{hint.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
