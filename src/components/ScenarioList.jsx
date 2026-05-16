import CaseArtwork from "./marketing/CaseArtwork";

function formatDifficulty(difficulty) {
  const labels = {
    easy: "Kolay",
    normal: "Orta",
    hard: "Zor",
  };

  return labels[difficulty] || "Standart";
}

function formatDuration(minutes) {
  return minutes ? `${minutes} dk` : "Esnek süre";
}

export default function ScenarioList({
  scenarios,
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
            Oynamak istediğin vaka dosyasını seç.
          </p>
        </div>
        <button type="button" className="ghost" onClick={onRefresh}>
          Yenile
        </button>
      </div>
      {loading && scenarios.length === 0 ? <p>Senaryolar yükleniyor...</p> : null}
      <div className="card-list">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={`card ${selectedScenarioId === scenario.id ? "active" : ""}`}
            onClick={() => onSelect(scenario)}
            style={{
              borderLeftColor: scenario?.category?.accent_color || undefined,
            }}
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
                <span>{formatDifficulty(scenario.difficulty)}</span>
              </div>
              <h3>{scenario.title}</h3>
              <p>{scenario.teaser || scenario.description}</p>
              <div className="scenario-card-footer">
                <span>Tahmini Süre: {formatDuration(scenario.estimated_duration)}</span>
                <span>{Number(scenario.popularity_score || 0)} oynama</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
