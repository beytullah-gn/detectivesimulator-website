import { useState } from "react";
import ScenarioList from "../components/ScenarioList";
import ScenarioMediaList from "../components/ScenarioMediaList";
import HintsPanel from "../components/HintsPanel";
import FinalDecisionPanel from "../components/FinalDecisionPanel";
import ProgressTracker from "../components/ProgressTracker";
import InterrogationModal from "../components/InterrogationModal";
import TabNavigation from "../components/TabNavigation";
import CharacterDetailCard from "../components/CharacterDetailCard";
import { formatCharacterName, getInitials } from "../utils/formatters";

export default function ScenarioPage({
  scenarios,
  selectedScenario,
  scenarioMedia,
  characters,
  relationsByCharacter,
  onScenarioSelect,
  onRefreshScenarios,
  onStartSession,
  sessionActive,
  onSelectCharacter,
  activeCharacter,
  conversation,
  question,
  onQuestionChange,
  onAskQuestion,
  onUseHint,
  hints,
  onReset,
  loading,
  finalAnswer,
  onToggleGuilty,
  onExplanationChange,
  onSubmitFinalAnswer,
  finalResult,
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [interrogationModalOpen, setInterrogationModalOpen] = useState(false);
  const [selectedCharacterForModal, setSelectedCharacterForModal] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");

  const tabs = [
    { id: "documents", label: "Belgeler", icon: "📄" },
    { id: "suspects", label: "Şüpheliler", icon: "👥" },
    { id: "interrogation", label: "Sorgulama", icon: "🔍" },
    { id: "hints", label: "İpuçları", icon: "💡" },
  ];

  const handleScenarioSelect = (scenario) => {
    onScenarioSelect(scenario);
    setCurrentStage(2);
    setActiveTab("documents");
  };

  const handleStartSession = () => {
    onStartSession();
    setCurrentStage(3);
    setActiveTab("suspects");
  };

  const handleOpenInterrogation = (characterId) => {
    const character = characters.find((c) => c.id === characterId);
    if (character) {
      setSelectedCharacterForModal(character);
      onSelectCharacter(characterId);
      setInterrogationModalOpen(true);
    }
  };

  const handleCloseInterrogation = () => {
    setInterrogationModalOpen(false);
  };

  const handleMoveToFinalDecision = () => {
    setCurrentStage(4);
  };

  const handleReset = () => {
    onReset();
    setCurrentStage(1);
    setInterrogationModalOpen(false);
    setSelectedCharacterForModal(null);
    setActiveTab("documents");
  };

  return (
    <>
      {/* Show scenario list only when no scenario is selected */}
      {!selectedScenario ? (
        <section style={{ maxWidth: "800px", margin: "0 auto" }}>
          <ScenarioList
            scenarios={scenarios}
            selectedScenarioId={selectedScenario?.id}
            onSelect={handleScenarioSelect}
            onRefresh={onRefreshScenarios}
            loading={loading}
          />
        </section>
      ) : (
        <section className="panel scenario-detail" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {sessionActive && <ProgressTracker currentStage={currentStage} />}

          <div className="panel-header">
            <div>
              <h2>{selectedScenario.title}</h2>
              <p>{selectedScenario.description}</p>
            </div>
            <div className="header-actions">
              {currentStage === 2 && !sessionActive && (
                <button type="button" onClick={handleStartSession} disabled={loading}>
                  {loading ? "Başlatılıyor..." : "Soruşturmayı Başlat"}
                </button>
              )}
              <button type="button" className="secondary" onClick={handleReset}>
                Yeni Vaka Seç
              </button>
            </div>
          </div>

          {/* Stage 2: Tab-based Information View */}
          {currentStage === 2 && (
            <div className="stage-container">
              <TabNavigation tabs={tabs.slice(0, 2)} activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="tab-content">
                {activeTab === "documents" && (
                  <div className="panel-section">
                    <h3>Olay Yeri Dosyaları ve Kanıtlar</h3>
                    <ScenarioMediaList media={scenarioMedia} />
                  </div>
                )}

                {activeTab === "suspects" && (
                  <div className="panel-section">
                    <h3>Şüpheliler ({characters.length})</h3>
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                      {characters.map((character) => (
                        <CharacterDetailCard
                          key={character.id}
                          character={character}
                          relations={relationsByCharacter?.[character.id] || []}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage 3: Interrogation with Tabs */}
          {currentStage === 3 && sessionActive && (
            <div className="stage-container">
              <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="tab-content">
                {activeTab === "documents" && (
                  <div className="panel-section">
                    <h3>Olay Yeri Dosyaları ve Kanıtlar</h3>
                    <ScenarioMediaList media={scenarioMedia} />
                  </div>
                )}

                {activeTab === "suspects" && (
                  <div className="panel-section">
                    <h3>Şüpheliler ({characters.length})</h3>
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                      {characters.map((character) => (
                        <CharacterDetailCard
                          key={character.id}
                          character={character}
                          relations={relationsByCharacter?.[character.id] || []}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "interrogation" && (
                  <div className="panel-section">
                    <div className="stage-header">
                      <h3>Şüphelileri Sorgulayın</h3>
                      <p>Her karaktere tıklayarak sorular sorun ve delilleri toplayın</p>
                    </div>

                    <div className="character-selection-grid">
                      {characters.map((character) => (
                        <div
                          key={character.id}
                          className="character-select-card"
                          onClick={() => handleOpenInterrogation(character.id)}
                        >
                          <div className="avatar">
                            {getInitials(character)}
                          </div>
                          <h4>{formatCharacterName(character)}</h4>
                          <p>{character.role || "Şüpheli"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "hints" && (
                  <HintsPanel hints={hints} onUseHint={onUseHint} loading={loading} />
                )}
              </div>

              <div className="stage-actions">
                <button type="button" onClick={handleMoveToFinalDecision}>
                  Final Kararına Geç →
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Final Decision */}
          {currentStage === 4 && sessionActive && (
                <div className="stage-container">
                  <div className="stage-header">
                    <h3>Final Kararınızı Verin</h3>
                    <p>Suçluları seçin ve gerekçenizi açıklayın</p>
                  </div>

                  <FinalDecisionPanel
                    characters={characters}
                    selectedGuilty={finalAnswer.selected}
                    explanation={finalAnswer.explanation}
                    onToggleGuilty={onToggleGuilty}
                    onExplanationChange={onExplanationChange}
                    onSubmit={onSubmitFinalAnswer}
                    loading={loading}
                    result={finalResult}
                  />
                </div>
              )}
          </section>
        )}

      {/* Interrogation Modal */}
      <InterrogationModal
        isOpen={interrogationModalOpen}
        onClose={handleCloseInterrogation}
        character={selectedCharacterForModal}
        conversation={conversation}
        question={question}
        onQuestionChange={onQuestionChange}
        onAsk={onAskQuestion}
        loading={loading}
        disabled={Boolean(finalResult)}
      />
    </>
  );
}
