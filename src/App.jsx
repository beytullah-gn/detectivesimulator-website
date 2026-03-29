"use client";

import "./index.css";
import "./App.css";
import AppHeader from "./components/AppHeader";
import AlertMessage from "./components/AlertMessage";
import AuthPanel from "./components/AuthPanel";
import LandingHero from "./components/LandingHero";
import ScenarioPage from "./views/ScenarioPage";
import { VIEW, useDetectiveGame } from "./hooks/useDetectiveGame";

function App() {
  const {
    user,
    view,
    setView,
    authLoading,
    scenarioLoading,
    actionLoading,
    error,
    scenarios,
    selectedScenario,
    scenarioMedia,
    characters,
    relationsByCharacter,
    activeCharacter,
    conversations,
    question,
    hints,
    finalAnswer,
    finalResult,
    sessionHistory,
    isLoggedIn,
    isSessionActive,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleLogout,
    handleGoHome,
    handleLoadScenarios,
    handleScenarioSelect,
    handleStartSession,
    handleAskQuestion,
    handleUseHint,
    handleResetFlow,
    handleResumeSession,
    handleToggleGuilty,
    handleSubmitFinalAnswer,
    setActiveCharacterId,
    setQuestion,
    setFinalAnswer,
  } = useDetectiveGame();

  return (
    <div className="app">
      <AppHeader
        isLoggedIn={isLoggedIn}
        userEmail={user?.email}
        onLogin={() => setView(VIEW.LOGIN)}
        onRegister={() => setView(VIEW.REGISTER)}
        onLogout={handleLogout}
        onHome={handleGoHome}
      />

      <main className="app-main">
        <AlertMessage message={error} />

        {view === VIEW.LANDING && !isLoggedIn ? (
          <LandingHero
            onLogin={() => setView(VIEW.LOGIN)}
            onRegister={() => setView(VIEW.REGISTER)}
          />
        ) : null}

        {view === VIEW.LOGIN && !isLoggedIn ? (
          <AuthPanel
            title="Giriş Yap"
            submitLabel="Giriş Yap"
            footerLabel="Hesabın yok mu? Kayıt Ol"
            onSubmit={handleLoginSubmit}
            onFooterClick={() => setView(VIEW.REGISTER)}
            loading={authLoading}
          />
        ) : null}

        {view === VIEW.REGISTER && !isLoggedIn ? (
          <AuthPanel
            title="Kayıt Ol"
            submitLabel="Kayıt Ol"
            footerLabel="Zaten hesabın var mı? Giriş Yap"
            onSubmit={handleRegisterSubmit}
            onFooterClick={() => setView(VIEW.LOGIN)}
            loading={authLoading}
            showConfirmPassword
          />
        ) : null}

        {isLoggedIn && view === VIEW.SCENARIOS ? (
          <ScenarioPage
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            scenarioMedia={scenarioMedia}
            characters={characters}
            relationsByCharacter={relationsByCharacter}
            userKey={user?.id || user?.email || ""}
            onScenarioSelect={handleScenarioSelect}
            onRefreshScenarios={handleLoadScenarios}
            sessionHistory={sessionHistory}
            onResumeSession={handleResumeSession}
            onStartSession={handleStartSession}
            sessionActive={isSessionActive}
            onSelectCharacter={setActiveCharacterId}
            activeCharacter={activeCharacter}
            conversation={conversations[activeCharacter?.id] || []}
            question={question}
            onQuestionChange={setQuestion}
            onAskQuestion={handleAskQuestion}
            onUseHint={handleUseHint}
            hints={hints}
            onReset={handleResetFlow}
            scenarioLoading={scenarioLoading}
            actionLoading={actionLoading}
            finalAnswer={finalAnswer}
            onToggleGuilty={handleToggleGuilty}
            onExplanationChange={(value) =>
              setFinalAnswer((previous) => ({ ...previous, explanation: value }))
            }
            onSubmitFinalAnswer={handleSubmitFinalAnswer}
            finalResult={finalResult}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
