import { getCharacterName } from "../utils/formatters";

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
  characters,
  selected,
  selectedGuilty,
  explanation,
  onToggle,
  onToggleGuilty,
  onExplanationChange,
  onSubmit,
  loading,
  disabled,
  result,
}) {
  const resolvedSelected = Array.isArray(selectedGuilty)
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
        return (
          <strong key={key}>
            {content}
          </strong>
        );
      }
      return <span key={key}>{content}</span>;
    });
  };

  return (
    <section className="panel-section final-panel">
      <h3>Final Karar</h3>
      <div className="final-criteria">
        <p className="final-helper">Değerlendirme kriterleri:</p>
        <ul>
          <li>Seçtiğin şüpheliler senaryoyla tutarlı olmalı.</li>
          <li>Gerekçende motivasyon ve kanıt bağlantısı net olmalı.</li>
          <li>Varsa alibi çelişkilerini açıklamalısın.</li>
        </ul>
      </div>
      <form onSubmit={onSubmit} className="form">
        <div className="checkbox-grid">
          {characters.map((character) => (
            <label key={character.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={resolvedSelected.includes(character.id)}
                onChange={() => handleToggle?.(character.id)}
                disabled={disabled}
              />
              <span>{getCharacterName(character)}</span>
            </label>
          ))}
        </div>
        <label>
          Gerekçen
          <textarea
            value={explanation}
            onChange={(event) => onExplanationChange(event.target.value)}
            rows={4}
            placeholder="Kanıtları ve motivasyonu açıklayın..."
            disabled={disabled}
          />
          <span className="char-count">{explanation.length}/2000</span>
        </label>
        <button type="submit" disabled={loading || disabled}>
          {loading ? "Değerlendiriliyor..." : "Kararı Gönder"}
        </button>
      </form>

      {result ? (
        <div className="result">
          <h4>{result.isCorrect ? "Doğru Tahmin!" : "Yanlış Tahmin"}</h4>
          {feedbackItems.length ? (
            <ul className="result-summary">
              {feedbackItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {result.correctGuiltyPlayers?.length ? (
            <div>
              <strong>Doğru Katil(ler):</strong>
              <ul>
                {result.correctGuiltyPlayers.map((player) => (
                  <li key={player.id}>{player.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.feedback ? (
            <details className="result-details">
              <summary>Tüm değerlendirmeyi göster</summary>
              <div className="result-details-body">{renderFeedback(result.feedback)}</div>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
