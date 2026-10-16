export default function ProgressTracker({ currentStage }) {
  const stages = [
    { id: 1, label: "Vaka Seç" },
    { id: 2, label: "Dosya İnceleme" },
    { id: 3, label: "Soruşturma" },
    { id: 4, label: "Final Karar" },
  ];

  return (
    <div className="progress-tracker" role="navigation" aria-label="Soruşturma Adımları">
      {stages.map((stage) => {
        const isActive = stage.id === currentStage;
        const isCompleted = stage.id < currentStage;

        return (
          <div
            key={stage.id}
            className={`progress-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
          >
            <span className="progress-step-circle">
              {isCompleted ? "✓" : stage.id}
            </span>
            <span className="progress-step-label">{stage.label}</span>
          </div>
        );
      })}
    </div>
  );
}
