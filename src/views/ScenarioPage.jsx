"use client";

import { useMemo, useState } from "react";
import Briefing from "../game/Briefing";
import Investigation from "../game/Investigation";
import Lobby from "../game/Lobby";
import { summarizeCareer } from "../game/career";
import { Accusation, Result } from "../game/Verdict";
import "../game/game.css";

export default function ScenarioPage({
  scenarios = [],
  lockedScenarioIds = [],
  selectedScenario = null,
  scenarioMedia = [],
  characters = [],
  relationsByCharacter = {},
  sessionId = "",
  onScenarioSelect,
  sessionHistory = [],
  onResumeSession,
  onStartSession,
  sessionActive = false,
  conversations = {},
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
  const [accusing, setAccusing] = useState(false);

  const nextScenario = useMemo(() => {
    const { bestByScenario } = summarizeCareer(sessionHistory);
    return (
      scenarios.find(
        (item) =>
          item.id !== selectedScenario?.id &&
          !bestByScenario[item.id]?.solved &&
          !lockedScenarioIds.includes(item.id)
      ) || null
    );
  }, [scenarios, sessionHistory, selectedScenario, lockedScenarioIds]);

  function goLobby() {
    setAccusing(false);
    onReset();
  }

  if (!selectedScenario) {
    return (
      <Lobby
        scenarios={scenarios}
        lockedScenarioIds={lockedScenarioIds}
        sessionHistory={sessionHistory}
        onSelectScenario={onScenarioSelect}
        onResumeSession={onResumeSession}
        loading={scenarioLoading}
      />
    );
  }

  if (finalResult) {
    return (
      <Result
        result={finalResult}
        characters={characters}
        sessionHistory={sessionHistory}
        hasNext={Boolean(nextScenario)}
        onNext={() => {
          setAccusing(false);
          onScenarioSelect(nextScenario);
        }}
        onLobby={goLobby}
      />
    );
  }

  if (!sessionActive) {
    return (
      <Briefing
        scenario={selectedScenario}
        characters={characters}
        media={scenarioMedia}
        loading={scenarioLoading}
        locked={lockedScenarioIds.includes(selectedScenario.id)}
        starting={actionLoading}
        onStart={onStartSession}
        onBack={goLobby}
      />
    );
  }

  if (accusing) {
    return (
      <Accusation
        sessionId={sessionId}
        characters={characters}
        media={scenarioMedia}
        selected={finalAnswer.selected}
        explanation={finalAnswer.explanation}
        onToggle={onToggleGuilty}
        onExplanation={onExplanationChange}
        onSubmit={onSubmitFinalAnswer}
        loading={actionLoading}
        onBack={() => setAccusing(false)}
      />
    );
  }

  return (
    <Investigation
      sessionId={sessionId}
      scenario={selectedScenario}
      characters={characters}
      media={scenarioMedia}
      relationsByCharacter={relationsByCharacter}
      conversations={conversations}
      question={question}
      onQuestionChange={onQuestionChange}
      onAsk={onAskQuestion}
      hints={hints}
      onUseHint={onUseHint}
      loading={actionLoading}
      onAccuse={() => setAccusing(true)}
      onExit={goLobby}
    />
  );
}
