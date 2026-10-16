"use client";

import { useMemo, useState } from "react";
import CaseArtwork from "../components/marketing/CaseArtwork";
import CharacterDetailCard from "../components/CharacterDetailCard";
import FinalDecisionPanel from "../components/FinalDecisionPanel";
import HintsPanel from "../components/HintsPanel";
import InterrogationModal from "../components/InterrogationModal";
import InterrogationPanel from "../components/InterrogationPanel";
import ScenarioList from "../components/ScenarioList";
import ScenarioMediaList from "../components/ScenarioMediaList";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  LightbulbIcon,
  MessageSquareIcon,
  PlayIcon,
  UsersIcon,
} from "../components/icons";
import {
  formatCharacterName,
  formatDateTime,
  formatDifficulty,
  formatDuration,
  getInitials,
} from "../utils/formatters";

export default function ScenarioPage({
  scenarios = [],
  selectedScenario = null,
  scenarioMedia = [],
  characters = [],
  relationsByCharacter = {},
  userKey = "",
  onScenarioSelect,
  onRefreshScenarios,
  sessionHistory = [],
  onResumeSession,
  onStartSession,
  sessionActive = false,
  onSelectCharacter,
  activeCharacter = null,
  conversation = [],
  question = "",
  onQuestionChange,
  onAskQuestion,
  onUseHint,
  hints = [],
  onReset,
  scenarioLoading = false,
  actionLoading = false,
  finalAnswer = { selected: [], explanation: "" },
  onToggleGuilty,
  onExplanationChange,
  onSubmitFinalAnswer,
  finalResult = null,
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedCharacterForModal, setSelectedCharacterForModal] = useState(null);
  const [interrogationModalOpen, setInterrogationModalOpen] = useState(false);
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(false);

  // Active view stage: 1 = lobby, 2 = case briefing, 3 = investigation, 4 = decision/result
  const currentStageView = !selectedScenario
    ? 1
    : finalResult
    ? 4
    : currentStage === 4
    ? 4
    : sessionActive
    ? 3
    : 2;

  // Active sessions & completed sessions
  const activeSessions = useMemo(
    () => (sessionHistory || []).filter((item) => item?.status === "continues"),
    [sessionHistory]
  );
  const completedSessions = useMemo(
    () => (sessionHistory || []).filter((item) => item?.status === "completed"),
    [sessionHistory]
  );

  // Most recent active session for "Kaldığın Yerden Devam Et"
  const latestActiveSession = activeSessions[0] || null;
  const otherActiveSessions = activeSessions.slice(1);

  const selectedDocument = useMemo(() => {
    if (!scenarioMedia.length) return null;
    return (
      scenarioMedia.find((item) => item.id === selectedMediaId) ||
      scenarioMedia[0]
    );
  }, [scenarioMedia, selectedMediaId]);

  const handleScenarioSelect = (scenario) => {
    onScenarioSelect(scenario);
    setCurrentStage(2);
    setActiveTab("documents");
  };

  const handleStartSession = async () => {
    const started = await onStartSession();
    if (!started) return;
    setCurrentStage(3);
    setActiveTab("documents");
    if (characters[0]?.id && onSelectCharacter) {
      onSelectCharacter(characters[0].id);
    }
  };

  const handleOpenInterrogation = (characterId) => {
    if (onSelectCharacter) {
      onSelectCharacter(characterId);
    }
    const targetChar = characters.find((c) => c.id === characterId);
    if (targetChar) {
      setSelectedCharacterForModal(targetChar);
    }
    // On mobile, switch to interrogation tab
    setActiveTab("interrogation");
  };

  const handleBackToInvestigation = () => {
    setCurrentStage(3);
  };

  const handleReset = () => {
    onReset();
    setCurrentStage(1);
    setActiveTab("documents");
    setSelectedCharacterForModal(null);
    setInterrogationModalOpen(false);
  };

  /* =======================================================================
   * VIEW 1: PLAYER LOBBY (When no scenario is selected)
   * ======================================================================= */
  if (currentStageView === 1) {
    return (
      <div className="lobby-layout ds-container">
        {/* Kaldığın Yerden Devam Et Hero Card */}
        {latestActiveSession ? (
          <section className="ds-card lobby-resume-card" aria-label="Devam Eden Vaka">
            <div className="resume-artwork-wrapper">
              <CaseArtwork
                scenario={latestActiveSession?.scenario}
                className="resume-artwork"
                eyebrow="resume-artwork-chip"
              />
            </div>

            <div className="resume-content">
              <div className="resume-header">
                <span className="ds-badge ds-badge-accent">Kaldığın Yerden Devam Et</span>
                {latestActiveSession?.last_activity_at ? (
                  <span className="resume-date">
                    <ClockIcon size={12} />
                    {formatDateTime(latestActiveSession.last_activity_at)}
                  </span>
                ) : null}
              </div>

              <h2 className="resume-title">
                {latestActiveSession?.scenario?.title || "Aktif Vaka"}
              </h2>
              <p className="resume-teaser">
                {latestActiveSession?.scenario?.teaser ||
                  latestActiveSession?.scenario?.description ||
                  "Soruşturma devam ediyor."}
              </p>

              <div className="resume-meta-row">
                <span className="resume-meta-badge">
                  {Number(latestActiveSession?.question_count || 0)} soru soruldu
                </span>
                <span className="resume-meta-badge">
                  {Number(latestActiveSession?.hint_count || 0)} / 3 ipucu
                </span>
                {latestActiveSession?.scenario?.difficulty ? (
                  <span className="resume-meta-badge">
                    {formatDifficulty(latestActiveSession.scenario.difficulty)}
                  </span>
                ) : null}
              </div>

              <div className="resume-actions">
                <button
                  type="button"
                  className="ds-btn ds-btn-primary ds-btn-lg"
                  onClick={() => onResumeSession?.(latestActiveSession.id)}
                  disabled={scenarioLoading}
                >
                  <PlayIcon size={16} />
                  <span>Vakaya Devam Et</span>
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Other active sessions if multiple exist */}
        {otherActiveSessions.length > 0 ? (
          <section className="lobby-secondary-section" aria-label="Diğer Devam Eden Oturumlar">
            <h3 className="section-title">Diğer Devam Eden Oturumlar</h3>
            <div className="session-grid">
              {otherActiveSessions.map((item) => (
                <article key={item.id} className="ds-card session-resume-mini-card">
                  <div className="session-mini-copy">
                    <h4>{item?.scenario?.title || "Vaka"}</h4>
                    <p className="session-mini-meta">
                      {Number(item?.question_count || 0)} soru • {Number(item?.hint_count || 0)} ipucu
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ds-btn ds-btn-secondary ds-btn-sm"
                    onClick={() => onResumeSession?.(item.id)}
                  >
                    <span>Devam Et</span>
                    <ArrowRightIcon size={13} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* Published Case Selection Grid */}
        <section className="lobby-catalog-section" aria-label="Tüm Vakalar">
          <ScenarioList
            scenarios={scenarios}
            selectedScenarioId={selectedScenario?.id}
            onSelect={handleScenarioSelect}
            onRefresh={onRefreshScenarios}
            loading={scenarioLoading}
          />
        </section>

        {/* Collapsible Short How-to-play Guide */}
        <section className="ds-card lobby-guide-card">
          <button
            type="button"
            className="guide-header-toggle"
            onClick={() => setIsHelpOpen((prev) => !prev)}
            aria-expanded={isHelpOpen}
          >
            <div className="guide-title-box">
              <FileTextIcon size={16} className="guide-icon" />
              <strong>Dedektif Rehberi: Nasıl Oynanır?</strong>
            </div>
            <ChevronDownIcon
              size={16}
              className={`guide-toggle-icon ${isHelpOpen ? "open" : ""}`}
            />
          </button>

          {isHelpOpen ? (
            <div className="guide-body">
              <ol className="guide-steps">
                <li>
                  <strong>1. Dosyayı Seç:</strong> Bir vaka belirleyerek brifingi oku ve soruşturmayı başlat.
                </li>
                <li>
                  <strong>2. Kanıtları Oku:</strong> Olay yeri notları, resmi evraklar ve delil fotoğraflarını incele.
                </li>
                <li>
                  <strong>3. Şüphelileri Sorgula:</strong> Karakterlere kendi sorularını yönelt, alibilerini ve çelişkilerini test et.
                </li>
                <li>
                  <strong>4. Kararını Savun:</strong> Suçlu veya suçluları seçip gerekçeni yazarak vaka dosyasını tamamla.
                </li>
              </ol>
              <p className="guide-note">
                İpucu hakları sınırlıdır; yalnızca kritik anlarda başvurman önerilir.
              </p>
            </div>
          ) : null}
        </section>

        {/* Completed Sessions History */}
        {completedSessions.length > 0 ? (
          <section className="ds-card lobby-history-card" aria-label="Tamamlanan Vakalar">
            <div className="history-header">
              <div>
                <h3>Tamamlanan Vakalar ({completedSessions.length})</h3>
                <p className="history-subtitle">Daha önce çözdüğün vakaların sonuçlarını salt okunur incele.</p>
              </div>
              <button
                type="button"
                className="ds-btn ds-btn-ghost ds-btn-sm"
                onClick={() => setIsHistoryOpen((prev) => !prev)}
              >
                <span>{isHistoryOpen ? "Gizle" : "Listeyi Aç"}</span>
              </button>
            </div>

            {isHistoryOpen ? (
              <ul className="history-list">
                {completedSessions.map((item) => {
                  const isCorrect = Boolean(item?.is_correct);
                  return (
                    <li key={item.id} className="history-item">
                      <div className="history-item-copy">
                        <div className="history-item-top">
                          <span className={`ds-badge ${isCorrect ? "ds-badge-accent" : ""}`}>
                            {isCorrect ? "Doğru Çözüm" : "Eksik Değerlendirme"}
                          </span>
                          {item.date_end ? (
                            <span className="history-date">
                              {formatDateTime(item.date_end)}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="history-case-title">
                          {item?.scenario?.title || "Vaka"}
                        </h4>
                        <p className="history-meta">
                          {Number(item?.question_count || 0)} soru soruldu • {Number(item?.hint_count || 0)} ipucu kullanıldı
                        </p>
                      </div>

                      <button
                        type="button"
                        className="ds-btn ds-btn-secondary ds-btn-sm"
                        onClick={() => onResumeSession?.(item.id)}
                      >
                        <span>Sonucu İncele</span>
                        <ChevronRightIcon size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>
    );
  }

  /* =======================================================================
   * VIEW 2: CASE BRIEFING / PRE-GAME (When scenario is selected but not started)
   * ======================================================================= */
  if (currentStageView === 2 && selectedScenario) {
    return (
      <div className="briefing-layout ds-container">
        <nav className="briefing-breadcrumb" aria-label="Erişim Yolu">
          <button type="button" onClick={handleReset} className="breadcrumb-btn">
            <ArrowLeftIcon size={14} />
            <span>Vaka Kataloğuna Dön</span>
          </button>
        </nav>

        <article className="ds-card briefing-card">
          <div className="briefing-grid">
            <div className="briefing-copy-col">
              <div className="briefing-meta-row">
                {selectedScenario.category?.title ? (
                  <span className="ds-badge ds-badge-accent">
                    {selectedScenario.category.title}
                  </span>
                ) : null}
                <span className="ds-badge">
                  {formatDifficulty(selectedScenario.difficulty)}
                </span>
                <span className="ds-badge">
                  <ClockIcon size={12} />
                  {formatDuration(selectedScenario.estimated_duration)}
                </span>
              </div>

              <h1 className="briefing-title">{selectedScenario.title}</h1>
              <p className="briefing-lead">
                {selectedScenario.teaser || selectedScenario.description}
              </p>

              {selectedScenario.description && selectedScenario.teaser ? (
                <div className="briefing-description-box">
                  <h4>Olay Özeti</h4>
                  <p>{selectedScenario.description}</p>
                </div>
              ) : null}

              <div className="briefing-stats-row">
                <div className="briefing-stat">
                  <strong>{characters.length}</strong>
                  <span>Şüpheli Şahıs</span>
                </div>
                <div className="briefing-stat">
                  <strong>{scenarioMedia.length}</strong>
                  <span>Delil Parçası</span>
                </div>
                <div className="briefing-stat">
                  <strong>3</strong>
                  <span>Maksimum İpucu</span>
                </div>
              </div>

              <div className="briefing-actions">
                <button
                  type="button"
                  className="ds-btn ds-btn-primary ds-btn-lg briefing-start-btn"
                  onClick={handleStartSession}
                  disabled={actionLoading}
                >
                  <PlayIcon size={16} />
                  <span>{actionLoading ? "Oturum Açılıyor..." : "Soruşturmayı Başlat"}</span>
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-secondary ds-btn-lg"
                  onClick={handleReset}
                >
                  Farklı Vaka Seç
                </button>
              </div>
            </div>

            <div className="briefing-artwork-col">
              <CaseArtwork
                scenario={selectedScenario}
                className="briefing-artwork"
                eyebrow="briefing-artwork-chip"
              />
            </div>
          </div>
        </article>

        {/* Pre-game preview of suspects & media */}
        <div className="briefing-preview-grid">
          <section className="ds-card briefing-sub-panel">
            <div className="sub-panel-header">
              <UsersIcon size={16} />
              <h3>Şüpheliler ({characters.length})</h3>
            </div>
            <div className="briefing-character-preview-list">
              {characters.map((char) => (
                <div key={char.id} className="character-preview-item">
                  <div className="avatar-neutral-fallback mini" aria-hidden="true">
                    <span>{getInitials(char)}</span>
                  </div>
                  <div className="preview-copy">
                    <strong>{formatCharacterName(char)}</strong>
                    <small>{char.role || "Şüpheli"}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ds-card briefing-sub-panel">
            <div className="sub-panel-header">
              <FileTextIcon size={16} />
              <h3>Delil Belgeleri ({scenarioMedia.length})</h3>
            </div>
            <div className="briefing-media-preview-list">
              {scenarioMedia.map((item) => (
                <div key={item.id} className="media-preview-item">
                  <span className="media-preview-type">{item.type || "Belge"}</span>
                  <span className="media-preview-title">{item.title}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =======================================================================
   * VIEW 4: FINAL DECISION OR RESULT VIEW
   * ======================================================================= */
  if (currentStageView === 4 && selectedScenario) {
    return (
      <div className="investigation-shell">
        <header className="investigation-top-bar" aria-label="Soruşturma Üst Çubuğu">
          <div className="top-bar-left">
            <button
              type="button"
              className="ds-btn ds-btn-ghost ds-btn-sm"
              onClick={handleBackToInvestigation}
            >
              <ArrowLeftIcon size={14} />
              <span>Soruşturmaya Dön</span>
            </button>
            <span className="top-bar-case-title">{selectedScenario.title}</span>
          </div>
          <div className="top-bar-right">
            <button
              type="button"
              className="ds-btn ds-btn-ghost ds-btn-sm"
              onClick={handleReset}
            >
              Vakalara Dön
            </button>
          </div>
        </header>

        <main className="investigation-main-container ds-container">
          <FinalDecisionPanel
            characters={characters}
            selectedGuilty={finalAnswer.selected}
            explanation={finalAnswer.explanation}
            onToggleGuilty={onToggleGuilty}
            onExplanationChange={onExplanationChange}
            onSubmit={onSubmitFinalAnswer}
            loading={actionLoading}
            disabled={Boolean(finalResult)}
            result={finalResult}
            onBackToInvestigation={handleBackToInvestigation}
            onNewCase={handleReset}
          />
        </main>
      </div>
    );
  }

  /* =======================================================================
   * VIEW 3: ACTIVE INVESTIGATION WORKSPACE
   * ======================================================================= */
  const activeChar = activeCharacter || characters[0] || null;

  return (
    <div className="investigation-workspace">
      {/* 1. Compact Top Bar (~54px) */}
      <header className="investigation-top-bar" aria-label="Soruşturma Başlığı">
        <div className="top-bar-left">
          <button
            type="button"
            className="ds-btn ds-btn-ghost ds-btn-sm top-bar-back-btn"
            onClick={handleReset}
            aria-label="Vaka Listesine Dön"
          >
            <ArrowLeftIcon size={14} />
            <span className="hide-mobile">Vakalar</span>
          </button>
          <div className="top-bar-title-box">
            <h2 className="top-bar-case-heading">{selectedScenario.title}</h2>
            {selectedScenario.category?.title ? (
              <span className="top-bar-category-tag hide-mobile">
                {selectedScenario.category.title}
              </span>
            ) : null}
          </div>
        </div>

        <div className="top-bar-right">
          <div className="top-bar-hints-indicator" title="Kullanılan İpucu">
            <LightbulbIcon size={14} />
            <span>İpucu: {hints.length} / 3</span>
          </div>

          <button
            type="button"
            className="ds-btn ds-btn-primary ds-btn-sm top-bar-decision-btn"
            onClick={() => setCurrentStage(4)}
            aria-label="Final Kararına Geç"
          >
            <CheckSquareIcon size={14} />
            <span>Kararını Ver</span>
          </button>
        </div>
      </header>

      {/* 2. Responsive Core Investigation Container */}
      <div className="investigation-core-grid">
        {/* Left Column (230px on desktop): File / Suspect switch & list */}
        <aside
          className={`investigation-sidebar ${leftNavCollapsed ? "collapsed" : ""}`}
          aria-label="Dosya Gezinmesi"
        >
          <div className="sidebar-segment-control" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "documents"}
              className={`sidebar-tab-btn ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
              aria-label="Belgeler"
            >
              <FileTextIcon size={14} />
              <span>Belgeler ({scenarioMedia.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "suspects"}
              className={`sidebar-tab-btn ${activeTab === "suspects" ? "active" : ""}`}
              onClick={() => setActiveTab("suspects")}
              aria-label="Şüpheliler"
            >
              <UsersIcon size={14} />
              <span>Şüpheliler ({characters.length})</span>
            </button>
          </div>

          <div className="sidebar-items-scroll">
            {activeTab === "documents" ? (
              <ul className="sidebar-item-list media-list" role="list">
                {scenarioMedia.map((item) => {
                  const isSelected = item.id === (selectedDocument?.id || "");
                  return (
                    <li
                      key={item.id}
                      className={`sidebar-nav-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedMediaId(item.id);
                        setActiveTab("documents");
                      }}
                      tabIndex={0}
                    >
                      <FileTextIcon size={14} className="nav-item-icon" />
                      <div className="nav-item-copy">
                        <strong className="nav-item-title">{item.title}</strong>
                        <small className="nav-item-type">{item.type || "Belge"}</small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="sidebar-item-list character-list" role="list">
                {characters.map((char) => {
                  const isSelected = char.id === activeChar?.id;
                  const charName = formatCharacterName(char);
                  return (
                    <li
                      key={char.id}
                      className={`sidebar-nav-item character-summary-card ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        if (onSelectCharacter) onSelectCharacter(char.id);
                        setActiveTab("suspects");
                      }}
                      tabIndex={0}
                    >
                      <div className="avatar-neutral-fallback mini" aria-hidden="true">
                        <span>{getInitials(char)}</span>
                      </div>
                      <div className="nav-item-copy">
                        <strong className="nav-item-title">{charName}</strong>
                        <small className="nav-item-type">{char.role || "Şüpheli"}</small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="sidebar-footer-hint">
            <button
              type="button"
              className="sidebar-hint-action-btn"
              onClick={() => setActiveTab("hints")}
              aria-label="İpuçları"
            >
              <LightbulbIcon size={14} />
              <span>İpuçları ({hints.length}/3)</span>
            </button>
          </div>
        </aside>

        {/* Middle Column (minmax(320px, 1fr)): Reading Pane */}
        <main className="investigation-middle-pane" aria-label="Okuma ve İnceleme Alanı">
          {activeTab === "documents" ? (
            <div className="reader-pane-wrapper">
              {selectedDocument ? (
                <article className="document-reading-card ds-card">
                  <header className="document-header">
                    <span className="ds-badge ds-badge-accent">
                      <FileTextIcon size={13} />
                      {selectedDocument.type || "Resmi Belge"}
                    </span>
                    <h3 className="document-title">{selectedDocument.title}</h3>
                    {selectedDocument.description ? (
                      <p className="document-subtitle">{selectedDocument.description}</p>
                    ) : null}
                  </header>

                  <div className="document-body">
                    {selectedDocument.content ? (
                      <div className="document-text-content">
                        {selectedDocument.content.split("\n\n").map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="document-empty-note">Belge metin içeriği bulunmuyor.</p>
                    )}
                  </div>
                </article>
              ) : (
                <div className="empty-state">
                  <p>İncelemek için sol menüden bir belge seçin.</p>
                </div>
              )}
            </div>
          ) : activeTab === "suspects" ? (
            <div className="suspect-pane-wrapper">
              {activeChar ? (
                <CharacterDetailCard
                  character={activeChar}
                  relations={relationsByCharacter[activeChar.id] || []}
                  userKey={userKey}
                  onInterrogate={handleOpenInterrogation}
                  isInterrogationDisabled={Boolean(finalResult)}
                />
              ) : (
                <div className="empty-state">
                  <p>İncelemek için bir şüpheli seçin.</p>
                </div>
              )}
            </div>
          ) : activeTab === "hints" ? (
            <div className="hints-pane-wrapper ds-card">
              <HintsPanel
                hints={hints}
                onUseHint={onUseHint}
                loading={actionLoading}
                disabled={Boolean(finalResult)}
              />
            </div>
          ) : (
            /* Active tab is interrogation on mobile/tablet */
            <div className="mobile-interrogation-wrapper">
              <InterrogationPanel
                characters={characters}
                activeCharacter={activeChar}
                onSelectCharacter={onSelectCharacter}
                conversation={conversation}
                question={question}
                onQuestionChange={onQuestionChange}
                onAsk={onAskQuestion}
                loading={actionLoading}
                disabled={Boolean(finalResult)}
              />
            </div>
          )}
        </main>

        {/* Right Column (360px on desktop): Persistent Interrogation Panel */}
        <div className="investigation-chat-col hide-on-tablet">
          <InterrogationPanel
            characters={characters}
            activeCharacter={activeChar}
            onSelectCharacter={onSelectCharacter}
            conversation={conversation}
            question={question}
            onQuestionChange={onQuestionChange}
            onAsk={onAskQuestion}
            loading={actionLoading}
            disabled={Boolean(finalResult)}
          />
        </div>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Visible only on mobile/tablet) */}
      <nav className="mobile-bottom-nav" aria-label="Mobil Soruşturma Gezinmesi">
        <button
          type="button"
          className={`mobile-nav-item ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          <FileTextIcon size={18} />
          <span>Dosya</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activeTab === "suspects" ? "active" : ""}`}
          onClick={() => setActiveTab("suspects")}
        >
          <UsersIcon size={18} />
          <span>Şüpheliler</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${activeTab === "interrogation" ? "active" : ""}`}
          onClick={() => setActiveTab("interrogation")}
        >
          <MessageSquareIcon size={18} />
          <span>Sorgu</span>
        </button>

        <button
          type="button"
          className="mobile-nav-item decision-nav-item"
          onClick={() => setCurrentStage(4)}
        >
          <CheckSquareIcon size={18} />
          <span>Karar</span>
        </button>
      </nav>

      {/* Optional Interrogation Modal for legacy/overlay workflows */}
      <InterrogationModal
        isOpen={interrogationModalOpen}
        onClose={() => setInterrogationModalOpen(false)}
        character={selectedCharacterForModal || activeChar}
        conversation={conversation}
        question={question}
        onQuestionChange={onQuestionChange}
        onAsk={onAskQuestion}
        loading={actionLoading}
        disabled={Boolean(finalResult)}
      />
    </div>
  );
}
