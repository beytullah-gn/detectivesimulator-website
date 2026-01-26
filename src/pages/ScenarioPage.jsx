import { useEffect, useState } from "react";
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
  sessionHistory,
  onResumeSession,
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
  const [expandedCharacterId, setExpandedCharacterId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeSessions = (sessionHistory || []).filter(
    (item) => item?.status === "continues"
  );
  const completedSessions = (sessionHistory || []).filter(
    (item) => item?.status === "completed"
  );

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

  useEffect(() => {
    if (!selectedScenario) return;
    if (finalResult) {
      setCurrentStage(4);
      return;
    }
    if (sessionActive) {
      setCurrentStage((prev) => (prev < 3 ? 3 : prev));
      return;
    }
    setCurrentStage((prev) => (prev === 1 ? 2 : prev));
  }, [selectedScenario, sessionActive, finalResult]);

  return (
    <>
      {/* Show scenario list only when no scenario is selected */}
      {!selectedScenario ? (
        <section style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gap: "1.5rem" }}>
          <ScenarioList
            scenarios={scenarios}
            selectedScenarioId={selectedScenario?.id}
            onSelect={handleScenarioSelect}
            onRefresh={onRefreshScenarios}
            loading={loading}
          />
          <div className="panel how-to-panel">
            <h2>Nasıl Oynanır?</h2>
            <ol className="how-to-steps">
              <li>Bir senaryo seç ve “Soruşturmayı Başlat” butonuna bas.</li>
              <li>Belgeleri incele, şüphelileri gözden geçir.</li>
              <li>Şüphelilere sorular sorarak ipuçlarını topla.</li>
              <li>İpuçlarını kullan, notlarını değerlendir.</li>
              <li>Finalde suçluyu seç ve gerekçeni yaz.</li>
            </ol>
            <p className="how-to-note">İpucu kullanımı sınırlı olabilir; dikkatli harca.</p>
          </div>
          {(activeSessions.length > 0 || completedSessions.length > 0) && (
            <div className="panel session-list-panel">
              <div className="session-panel-header">
                <h2>Eski Oturumlar</h2>
                <button type="button" className="ghost" onClick={() => setIsHistoryOpen((prev) => !prev)}>
                  {isHistoryOpen ? "Gizle" : "Göster"}
                </button>
              </div>
              {isHistoryOpen && (
                <>
                  {activeSessions.length > 0 && (
                    <div className="session-group">
                      <h3>Devam Edenler</h3>
                      <ul className="session-list">
                        {activeSessions.map((item) => (
                          <li key={item.id} className="session-item">
                            <div>
                              <strong>{item?.scenario?.title || "Senaryo"}</strong>
                              <p>{item?.scenario?.description || "Açıklama yok"}</p>
                            </div>
                            <button type="button" onClick={() => onResumeSession?.(item.id)}>
                              Devam Et
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {completedSessions.length > 0 && (
                    <div className="session-group">
                      <h3>Tamamlananlar</h3>
                      <ul className="session-list">
                        {completedSessions.map((item) => (
                          <li key={item.id} className="session-item">
                            <div>
                              <strong>{item?.scenario?.title || "Senaryo"}</strong>
                              <p>{item?.scenario?.description || "Açıklama yok"}</p>
                            </div>
                            <button type="button" className="ghost" onClick={() => onResumeSession?.(item.id)}>
                              Sonucu Gör
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {characters.map((character) => (
                        <div key={character.id} className="character-expandable">
                          <div
                            className="character-summary-card"
                            onClick={() =>
                              setExpandedCharacterId(
                                expandedCharacterId === character.id ? null : character.id
                              )
                            }
                          >
                            <div className="avatar">
                              {getInitials(character)}
                            </div>
                            <div className="character-summary-info">
                              <h4>{formatCharacterName(character)}</h4>
                              <p>{character.personality || "Şüpheli"}</p>
                            </div>
                            <div className="expand-icon">
                              {expandedCharacterId === character.id ? "▼" : "▶"}
                            </div>
                          </div>
                          {expandedCharacterId === character.id && (
                            <div className="character-detail-expanded">
                              <CharacterDetailCard
                                character={character}
                                relations={relationsByCharacter?.[character.id] || []}
                              />
                            </div>
                          )}
                        </div>
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
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {characters.map((character) => (
                        <div key={character.id} className="character-expandable">
                          <div
                            className="character-summary-card"
                            onClick={() =>
                              setExpandedCharacterId(
                                expandedCharacterId === character.id ? null : character.id
                              )
                            }
                          >
                            <div className="avatar">
                              {getInitials(character)}
                            </div>
                            <div className="character-summary-info">
                              <h4>{formatCharacterName(character)}</h4>
                              <p>{character.personality || "Şüpheli"}</p>
                            </div>
                            <div className="expand-icon">
                              {expandedCharacterId === character.id ? "▼" : "▶"}
                            </div>
                          </div>
                          {expandedCharacterId === character.id && (
                            <div className="character-detail-expanded">
                              <CharacterDetailCard
                                character={character}
                                relations={relationsByCharacter?.[character.id] || []}
                              />
                            </div>
                          )}
                        </div>
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
