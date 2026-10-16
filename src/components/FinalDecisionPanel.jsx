"use client";

import { buildUrl } from "../services/apiClient";
import { formatCharacterName, getInitials } from "../utils/formatters";
import { ArrowLeftIcon, CheckIcon, CheckSquareIcon, FileTextIcon, RefreshIcon, ShieldAlertIcon } from "./icons";

function getFeedbackItems(feedback) {
  if (!feedback) return [];

  const normalized = String(feedback)
    .replace(/\*\*/g, "")
    .split(/\n+/)
    .flatMap((line) => {
      const cleanLine = line.replace(/^[-*\d.)\s]+/, "").trim();
      if (cleanLine.length <= 160) return [cleanLine];
      return cleanLine.split(/(?<=[.!?])\s+/);
    })
    .map((line) => line.trim())
    .filter((line) => !/^Kaçırdığın/i.test(line))
    .filter((line) => !/^Doğru Katil/i.test(line))
    .filter((line) => !/^Doğru Suçlu/i.test(line))
    .filter(Boolean);

  if (normalized.length > 1) return normalized.slice(0, 4);

  return String(feedback)
    .replace(/\*\*/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export default function FinalDecisionPanel({
  characters = [],
  selected = [],
  selectedGuilty = [],
  explanation = "",
  onToggle,
  onToggleGuilty,
  onExplanationChange,
  onSubmit,
  loading = false,
  disabled = false,
  result = null,
  onBackToInvestigation,
  onNewCase,
}) {
  const resolvedSelected = Array.isArray(selectedGuilty) && selectedGuilty.length > 0
    ? selectedGuilty
    : Array.isArray(selected)
    ? selected
    : [];

  const handleToggle = onToggleGuilty || onToggle;
  const feedbackItems = getFeedbackItems(result?.feedback);

  const renderFeedback = (text) => {
    if (!text) return null;
    const parts = String(text).split("**");
    return parts.map((part, index) => {
      const key = `${index}-${part.slice(0, 10)}`;
      const content = part.split("\n").reduce((acc, line, lineIndex) => {
        if (lineIndex === 0) return [line];
        return [...acc, <br key={`${key}-br-${lineIndex}`} />, line];
      }, []);

      if (index % 2 === 1) {
        return <strong key={key}>{content}</strong>;
      }
      return <span key={key}>{content}</span>;
    });
  };

  // If a result exists, show the dedicated focused result view!
  if (result) {
    const isCorrect = Boolean(result.isCorrect);

    return (
      <section className="panel-section result-view-section" aria-label="Soruşturma Sonucu">
        <div className="result">
          <header className={`result-banner ${isCorrect ? "result-banner-success" : "result-banner-failure"}`}>
            <div className="result-banner-icon-box">
              {isCorrect ? <CheckIcon size={24} /> : <ShieldAlertIcon size={24} />}
            </div>
            <div>
              <span className="result-badge">
                {isCorrect ? "Vaka Tamamlandı" : "Soruşturma Kapandı"}
              </span>
              <h3 className="result-title">
                {isCorrect ? "Tebrikler, Vaka Doğru Çözüldü!" : "Soruşturma Sonuçlandı — Eksik Değerlendirme"}
              </h3>
              <p className="result-lead">
                {isCorrect
                  ? "Sunduğun kanıtlar, motivasyon ve şüpheli tespiti vakanın çözümüyle tam olarak örtüşüyor."
                  : "Seçtiğin şüpheli veya sunduğun gerekçedeki kanıt bağlantıları vakanın asıl failini kanıtlamaya yetmedi."}
              </p>
            </div>
          </header>

          <div className="result-body">
            {feedbackItems.length > 0 ? (
              <div className="result-summary-box">
                <h4>Değerlendirme Özeti</h4>
                <ul className="result-summary">
                  {feedbackItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.correctGuiltyPlayers?.length ? (
              <div className="result-culprits-box">
                <span className="culprits-label">Doğru Suçlu(lar):</span>
                <ul className="result-culprits-list">
                  {result.correctGuiltyPlayers.map((player) => (
                    <li key={player.id} className="culprit-pill">
                      <span>{player.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.feedback ? (
              <details className="result-details">
                <summary className="result-details-summary">
                  Tüm değerlendirmeyi göster
                </summary>
                <div className="result-details-body">
                  {renderFeedback(result.feedback)}
                </div>
              </details>
            ) : null}
          </div>

          <footer className="result-actions">
            {onNewCase ? (
              <button
                type="button"
                className="ds-btn ds-btn-primary ds-btn-lg"
                onClick={onNewCase}
              >
                <RefreshIcon size={16} />
                <span>Başka Vaka Seç</span>
              </button>
            ) : null}
            {onBackToInvestigation ? (
              <button
                type="button"
                className="ds-btn ds-btn-secondary ds-btn-lg"
                onClick={onBackToInvestigation}
              >
                <FileTextIcon size={16} />
                <span>Dosyayı Yeniden İncele (Salt Okunur)</span>
              </button>
            ) : null}
          </footer>
        </div>
      </section>
    );
  }

  // Active Final Decision Form
  return (
    <section className="panel-section final-panel" aria-label="Final Karar Formu">
      <header className="final-panel-header">
        <div className="final-header-copy">
          <span className="ds-badge ds-badge-accent">Son Aşama</span>
          <h3>Final Kararını Ver</h3>
          <p className="final-panel-lead">
            Vaka dosyasındaki kanıtları, alibileri ve şüpheli ifadelerini birleştirerek suçluyu veya suçluları belirle.
          </p>
        </div>

        {onBackToInvestigation ? (
          <button
            type="button"
            className="ds-btn ds-btn-secondary ds-btn-sm"
            onClick={onBackToInvestigation}
            disabled={loading}
          >
            <ArrowLeftIcon size={14} />
            <span>Sorgulamaya Dön</span>
          </button>
        ) : null}
      </header>

      <form onSubmit={onSubmit} className="form final-form">
        <fieldset className="final-fieldset">
          <legend className="final-legend">
            1. Suçlu olduğunu düşündüğün şüphelileri seç (birden çok kişi seçilebilir)
          </legend>

          <div className="checkbox-grid">
            {characters.map((character) => {
              const isChecked = resolvedSelected.includes(character.id);
              const charName = formatCharacterName(character);

              return (
                <label
                  key={character.id}
                  className={`checkbox-item ${isChecked ? "checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle?.(character.id)}
                    disabled={disabled || loading}
                    className="checkbox-input"
                  />
                  <div className="checkbox-avatar-box">
                    {character.avatar ? (
                      <img
                        src={buildUrl(`/assets/${character.avatar}`)}
                        alt={charName}
                        className="checkbox-avatar"
                      />
                    ) : (
                      <div className="avatar-neutral-fallback mini" aria-hidden="true">
                        <span>{getInitials(character)}</span>
                      </div>
                    )}
                  </div>
                  <div className="checkbox-copy">
                    <strong className="checkbox-name">{charName}</strong>
                    <span className="checkbox-role">{character.role || "Şüpheli"}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="form-field explanation-field">
          <span className="field-label">
            2. Gerekçeni açıkla (kanıtları, motivasyonu ve çelişkileri belirt)
          </span>
          <textarea
            value={explanation}
            onChange={(event) => onExplanationChange(event.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Şüphelinin motivasyonunu, olay yerindeki kanıtlarla olan bağlantısını ve sorguda yakaladığın çelişkileri yazın..."
            disabled={disabled || loading}
            className="field-textarea"
            required
          />
          <div className="explanation-footer">
            <small className="field-hint">
              Kapsamlı ve tutarlı bir gerekçe vaka puanını ve değerlendirme kalitesini belirler.
            </small>
            <span className="char-count">{explanation.length} / 2000</span>
          </div>
        </label>

        <div className="final-submit-box">
          <div className="final-warning-note">
            <CheckSquareIcon size={16} />
            <span>Bu kararı gönderdiğinde vaka dosyası tamamlanacak ve yapay zeka hakemi gerekçeni değerlendirecektir.</span>
          </div>

          <button
            type="submit"
            disabled={loading || disabled || resolvedSelected.length === 0 || !explanation.trim()}
            className="ds-btn ds-btn-primary ds-btn-lg final-submit-btn"
          >
            {loading ? "Karar Değerlendiriliyor..." : "Kararımı Onayla ve Gönder"}
          </button>
        </div>
      </form>
    </section>
  );
}
