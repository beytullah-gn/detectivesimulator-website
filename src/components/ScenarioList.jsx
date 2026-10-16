import CaseArtwork from "./marketing/CaseArtwork";
import { ClockIcon, PlayIcon, RefreshIcon } from "./icons";
import { formatDifficulty, formatDuration } from "../utils/formatters";

export default function ScenarioList({
  scenarios = [],
  selectedScenarioId,
  onSelect,
  onRefresh,
  loading,
}) {
  return (
    <aside className="panel scenario-list">
      <div className="panel-header">
        <div>
          <h2>Senaryolar</h2>
          <p className="panel-subtitle">
            İncelemek istediğin vaka dosyasını seç.
          </p>
        </div>
        <button
          type="button"
          className="ds-btn ds-btn-ghost ds-btn-sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Vakaları Yenile"
        >
          <RefreshIcon size={14} className={loading ? "spin" : ""} />
          <span>Yenile</span>
        </button>
      </div>

      {loading && scenarios.length === 0 ? (
        <div className="loading-state">
          <p>Vaka dosyaları yükleniyor...</p>
        </div>
      ) : null}

      {!loading && scenarios.length === 0 ? (
        <div className="empty-state">
          <p>Şu anda yayınlanmış vaka bulunmuyor.</p>
        </div>
      ) : null}

      <div className="card-list">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarioId === scenario.id;
          return (
            <article
              key={scenario.id}
              className={`card ${isSelected ? "active" : ""}`}
              onClick={() => onSelect(scenario)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(scenario);
                }
              }}
              aria-pressed={isSelected}
            >
              <CaseArtwork
                scenario={scenario}
                className="scenario-card-artwork"
                eyebrow="scenario-card-artwork-chip"
              />
              <div className="scenario-card-body">
                <div className="scenario-card-meta">
                  {scenario?.category?.title ? (
                    <span className="scenario-category-chip">{scenario.category.title}</span>
                  ) : null}
                  <span className="meta-item">{formatDifficulty(scenario.difficulty)}</span>
                  <span className="meta-item">
                    <ClockIcon size={12} />
                    {formatDuration(scenario.estimated_duration)}
                  </span>
                </div>
                <h3>{scenario.title}</h3>
                <p>{scenario.teaser || scenario.description}</p>
                <div className="scenario-card-footer">
                  <span className="play-hint">
                    <PlayIcon size={12} /> Dosyayı Aç
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
