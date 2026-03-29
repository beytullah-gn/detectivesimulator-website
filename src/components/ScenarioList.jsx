function formatDifficulty(difficulty) {
  const labels = {
    easy: "Kolay",
    normal: "Orta",
    hard: "Zor",
  };

  return labels[difficulty] || "Standart";
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
            Kategori bazli katalogdan gelen yayinlanmis vakalari sec.
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
            <div className="scenario-card-meta">
              {scenario?.category?.title ? (
                <span className="scenario-category-chip">{scenario.category.title}</span>
              ) : null}
              <span>{formatDifficulty(scenario.difficulty)}</span>
            </div>
            <h3>{scenario.title}</h3>
            <p>{scenario.teaser || scenario.description}</p>
            <span>Tahmini Süre: {scenario.estimated_duration || "-"} dk</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
