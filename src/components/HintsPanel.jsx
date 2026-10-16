import { LightbulbIcon } from "./icons";

const DEFAULT_MAX_HINTS = 3;

export default function HintsPanel({
  hints = [],
  onUseHint,
  loading = false,
  maxHints = DEFAULT_MAX_HINTS,
  disabled = false,
}) {
  const remainingHints = Math.max(maxHints - hints.length, 0);
  const isLimitReached = remainingHints === 0;

  return (
    <section className="panel-section hints-panel" aria-label="İpuçları Bölümü">
      <header className="hints-header">
        <div>
          <h3 className="hints-title">
            Toplanan İpuçları ({hints.length})
          </h3>
          <p className="hint-meta">
            Kalan ipucu hakkı: <strong>{remainingHints}</strong> / {maxHints}
          </p>
        </div>

        <button
          type="button"
          onClick={onUseHint}
          disabled={loading || isLimitReached || disabled}
          className="ds-btn ds-btn-primary ds-btn-sm"
        >
          <LightbulbIcon size={14} />
          <span>{loading ? "İpucu alınıyor..." : "İpucu Kullan"}</span>
        </button>
      </header>

      {hints.length === 0 ? (
        <div className="empty-state hints-empty">
          <LightbulbIcon size={24} className="hints-empty-icon" />
          <p className="empty-title">Henüz ipucu kullanılmadı</p>
          <p className="empty-sub">
            Soruşturmada takıldığın anlarda yukarıdaki butonu kullanarak vaka dosyasına dair kritik bir ipucu açabilirsin.
          </p>
        </div>
      ) : (
        <ul className="hint-list">
          {hints.map((hint, idx) => (
            <li key={hint.id || idx} className="hint-item">
              <div className="hint-header">
                <strong>{hint.title || `İpucu #${idx + 1}`}</strong>
                <span className="hint-badge">{hint.type || "Genel"}</span>
              </div>
              <p className="hint-content">{hint.content}</p>
            </li>
          ))}
        </ul>
      )}

      {isLimitReached ? (
        <div className="hint-limit-banner">
          <p className="hint-limit">Bu vaka için tanımlı tüm ipucu haklarını kullandın.</p>
        </div>
      ) : null}

      {disabled ? (
        <p className="hint-limit-notice">Soruşturma tamamlandığı için yeni ipucu kullanılamaz.</p>
      ) : null}
    </section>
  );
}
