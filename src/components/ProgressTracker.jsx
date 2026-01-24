export default function ProgressTracker({ currentStage }) {
  const stages = [
    { id: 1, label: "Senaryo Seç" },
    { id: 2, label: "Şüpheliler" },
    { id: 3, label: "Sorgulama" },
    { id: 4, label: "Karar Ver" },
  ];

  return (
    <div className="progress-tracker">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={`progress-step ${
            stage.id === currentStage
              ? "active"
              : stage.id < currentStage
              ? "completed"
              : ""
          }`}
        >
          <div className="progress-step-circle">
            {stage.id < currentStage ? "✓" : stage.id}
          </div>
          <div className="progress-step-label">{stage.label}</div>
        </div>
      ))}
    </div>
  );
}
