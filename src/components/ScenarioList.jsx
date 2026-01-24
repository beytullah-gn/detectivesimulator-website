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
        <h2>Senaryolar</h2>
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
          >
            <h3>{scenario.title}</h3>
            <p>{scenario.description}</p>
            <span>Tahmini Süre: {scenario.estimated_duration || "-"} dk</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
