"use client";

import "./index.css";
import "./App.css";
import AppHeader from "./components/AppHeader";
import AlertMessage from "./components/AlertMessage";
import AuthPanel from "./components/AuthPanel";
import ScenarioPage from "./views/ScenarioPage";
import { useEffect } from "react";
import { getSoundscape, playSfx } from "./game/audio/soundscape";
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
    lockedScenarioIds,
    selectedScenario,
    scenarioMedia,
    characters,
    relationsByCharacter,
    conversations,
    session,
    question,
    hints,
    finalAnswer,
    finalResult,
    sessionHistory,
    pendingScenarioTitle,
    isLoggedIn,
    isSessionActive,
    handleLoginSubmit,
    handleSocialLogin,
    handleRegisterSubmit,
    handleLogout,
    handleGoHome,
    handleScenarioSelect,
    handleStartSession,
    handleAskQuestion,
    handleUseHint,
    handleResetFlow,
    handleToggleGuilty,
    handleSubmitFinalAnswer,
    setQuestion,
    setFinalAnswer,
  } = useDetectiveGame();

  const caseTitle = selectedScenario?.title || pendingScenarioTitle;

  useEffect(() => {
    if (error) playSfx("error");
  }, [error]);

  // Browsers only allow audio after a user gesture; start the soundscape on the first one.
  useEffect(() => {
    const unlock = () => getSoundscape().unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

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

        {(!isLoggedIn && (view === VIEW.LOGIN || view === VIEW.LANDING)) ? (
          <AuthPanel
            title="Giriş Yap"
            submitLabel="Giriş Yap"
            footerLabel="Hesabın yok mu? Kayıt Ol"
            selectedCaseTitle={caseTitle}
            onSubmit={handleLoginSubmit}
            onSocialLogin={handleSocialLogin}
            onFooterClick={() => setView(VIEW.REGISTER)}
            loading={authLoading}
          />
        ) : null}

        {!isLoggedIn && view === VIEW.REGISTER ? (
          <AuthPanel
            title="Kayıt Ol"
            submitLabel="Kayıt Ol"
            footerLabel="Zaten hesabın var mı? Giriş Yap"
            selectedCaseTitle={caseTitle}
            onSubmit={handleRegisterSubmit}
            onSocialLogin={handleSocialLogin}
            onFooterClick={() => setView(VIEW.LOGIN)}
            loading={authLoading}
            showConfirmPassword
          />
        ) : null}

        {isLoggedIn && view === VIEW.SCENARIOS ? (
          <ScenarioPage
            scenarios={scenarios}
            lockedScenarioIds={lockedScenarioIds}
            selectedScenario={selectedScenario}
            scenarioMedia={scenarioMedia}
            characters={characters}
            relationsByCharacter={relationsByCharacter}
            sessionId={session?.sessionId || ""}
            onScenarioSelect={handleScenarioSelect}
            sessionHistory={sessionHistory}
            onStartSession={handleStartSession}
            sessionActive={isSessionActive}
            conversations={conversations}
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
