import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import AppHeader from "./components/AppHeader";
import AlertMessage from "./components/AlertMessage";
import AuthPanel from "./components/AuthPanel";
import LandingHero from "./components/LandingHero";
import ScenarioPage from "./pages/ScenarioPage";
import {
  clearToken,
  fetchUser,
  getStoredToken,
  login,
  register,
  storeToken,
} from "./services/authService";
import {
  fetchScenarioCharacters,
  fetchScenarioMedia,
  fetchScenarios,
  fetchScenarioRelations,
} from "./services/scenarioService";
import {
  interrogate,
  startSession,
  submitFinalAnswer,
  useHint,
  fetchMySessions,
  fetchSessionDetail,
} from "./services/gameService";

const VIEW = {
  LANDING: "landing",
  LOGIN: "login",
  REGISTER: "register",
  SCENARIOS: "scenarios",
};

const SESSION_STORAGE_KEY = "detective_simulator_session";

function App() {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [view, setView] = useState(token ? VIEW.SCENARIOS : VIEW.LANDING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioMedia, setScenarioMedia] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [relationsByCharacter, setRelationsByCharacter] = useState({});
  const [session, setSession] = useState(null);
  const [activeCharacterId, setActiveCharacterId] = useState("");
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState({});
  const [hints, setHints] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState({
    selected: [],
    explanation: "",
  });
  const [finalResult, setFinalResult] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const hasRestoredSession = useRef(false);

  const isLoggedIn = Boolean(token);
  const isSessionActive = Boolean(session?.sessionId);
  const isSessionCompleted = Boolean(finalResult);

  const activeCharacter = useMemo(() => {
    return characters.find((character) => character.id === activeCharacterId);
  }, [characters, activeCharacterId]);

  useEffect(() => {
    if (token) {
      handleFetchUser().catch(() => undefined);
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token || hasRestoredSession.current) return;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        hasRestoredSession.current = true;
        return;
      }
      const saved = JSON.parse(raw);
      const savedStatus = saved?.session?.status;
      if (saved?.session?.sessionId && savedStatus !== "completed") {
        setSession(saved.session || null);
        setSelectedScenario(saved.selectedScenario || null);
        setScenarioMedia(saved.scenarioMedia || []);
        setCharacters(saved.characters || []);
        setRelationsByCharacter(saved.relationsByCharacter || {});
        setActiveCharacterId(saved.activeCharacterId || "");
        setConversations(saved.conversations || {});
        setHints(saved.hints || []);
        setFinalAnswer(saved.finalAnswer || { selected: [], explanation: "" });
        setFinalResult(saved.finalResult || null);
        setView(VIEW.SCENARIOS);
      }
      hasRestoredSession.current = true;
    } catch (error) {
      console.error("Session restore error:", error);
      hasRestoredSession.current = true;
    }
  }, [token]);

  useEffect(() => {
    if (!token || !session?.sessionId) return;
    const payload = {
      session,
      selectedScenario,
      scenarioMedia,
      characters,
      relationsByCharacter,
      activeCharacterId,
      conversations,
      hints,
      finalAnswer,
      finalResult,
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Session save error:", error);
    }
  }, [
    token,
    session,
    selectedScenario,
    scenarioMedia,
    characters,
    relationsByCharacter,
    activeCharacterId,
    conversations,
    hints,
    finalAnswer,
    finalResult,
  ]);

  useEffect(() => {
    if (isLoggedIn) {
      handleLoadScenarios().catch(() => undefined);
      handleLoadSessionHistory().catch(() => undefined);
    }
  }, [isLoggedIn]);

  function setErrorMessage(message) {
    setError(message || "");
  }

  function resetSessionState() {
    setSession(null);
    setConversations({});
    setHints([]);
    setFinalAnswer({ selected: [], explanation: "" });
    setFinalResult(null);
    setQuestion("");
    setRelationsByCharacter({});
  }

  function handleLogout() {
    clearToken();
    setToken("");
    setUser(null);
    resetSessionState();
    setSelectedScenario(null);
    setView(VIEW.LANDING);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Session clear error:", error);
    }
  }

  async function handleFetchUser() {
    try {
      const response = await fetchUser(token);
      setUser(response);
    } catch (error) {
      console.error("User fetch error:", error);
      handleLogout();
    }
  }

  async function handleLoadScenarios() {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchScenarios(token);
      setScenarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Scenario fetch error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSessionHistory() {
    try {
      const data = await fetchMySessions(token);
      const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
      setSessionHistory(sessions);
    } catch (error) {
      console.error("Session history error:", error);
    }
  }

  async function handleLoadScenarioData(scenarioId) {
    setLoading(true);
    setErrorMessage("");
    try {
      const [charactersData, mediaData, relationsData] = await Promise.all([
        fetchScenarioCharacters(scenarioId, token),
        fetchScenarioMedia(scenarioId, token),
        fetchScenarioRelations(scenarioId, token),
      ]);

      const normalizedCharacters = Array.isArray(charactersData)
        ? charactersData
        : [];
      setCharacters(normalizedCharacters);
      setScenarioMedia(Array.isArray(mediaData) ? mediaData : []);
      setActiveCharacterId(normalizedCharacters[0]?.id || "");

      const normalizedRelations = Array.isArray(relationsData)
        ? relationsData
        : relationsData?.data || [];
      const relationMap = normalizedRelations.reduce((acc, item) => {
        const characterId = item?.character?.id || item?.character;
        if (!characterId) return acc;
        if (!acc[characterId]) acc[characterId] = [];
        acc[characterId].push(item);
        return acc;
      }, {});
      setRelationsByCharacter(relationMap);
    } catch (error) {
      console.error("Scenario data fetch error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoading(true);
    setErrorMessage("");

    try {
      const accessToken = await login({ email, password });
      storeToken(accessToken);
      setToken(accessToken);
      setView(VIEW.SCENARIOS);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirm = formData.get("passwordConfirm");

    if (password !== passwordConfirm) {
      setErrorMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await register({ email, password });
      setView(VIEW.LOGIN);
    } catch (error) {
      console.error("Register error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScenarioSelect(scenario) {
    setSelectedScenario(scenario);
    resetSessionState();
    await handleLoadScenarioData(scenario.id);
  }

  async function handleStartSession() {
    if (!selectedScenario) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await startSession(selectedScenario.id, token);
      setSession(data);
      setFinalResult(null);
      await handleLoadSessionHistory();
    } catch (error) {
      console.error("Session start error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAskQuestion(event, overrideCharacterId) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    const targetCharacterId = overrideCharacterId || activeCharacterId;

    if (!trimmedQuestion) {
      setErrorMessage("Lütfen bir soru yazın.");
      return;
    }

    if (!targetCharacterId) {
      setErrorMessage("Lütfen bir şüpheli seçin.");
      return;
    }

    if (!session?.sessionId) {
      setErrorMessage("Oturum bulunamadı. Önce soruşturmayı başlatın.");
      return;
    }

    if (isSessionCompleted) return;

    setLoading(true);
    setErrorMessage("");

    const userQuestion = trimmedQuestion;
    setQuestion("");

    try {
      const data = await interrogate({
        sessionId: session.sessionId,
        characterId: targetCharacterId,
        question: userQuestion,
        token,
      });

      setConversations((prev) => {
        const current = prev[targetCharacterId] || [];
        return {
          ...prev,
          [targetCharacterId]: [
            ...current,
            { role: "user", content: userQuestion },
            { role: "assistant", content: data?.answer || "" },
          ],
        };
      });
    } catch (error) {
      console.error("Interrogation error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUseHint() {
    if (!session?.sessionId || isSessionCompleted) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await useHint(session.sessionId, token);
      if (data?.hint) {
        setHints((prev) => [...prev, data.hint]);
      }
    } catch (error) {
      console.error("Hint error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitFinalAnswer(event) {
    event.preventDefault();
    if (!session?.sessionId) return;
    if (finalAnswer.selected.length === 0) {
      setErrorMessage("En az bir şüpheli seçmelisiniz.");
      return;
    }
    if (!finalAnswer.explanation.trim()) {
      setErrorMessage("Açıklama metni zorunludur.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const data = await submitFinalAnswer({
        sessionId: session.sessionId,
        selectedGuiltyPlayers: finalAnswer.selected,
        explanationText: finalAnswer.explanation.trim(),
        token,
      });
      setFinalResult(data);
      setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
      await handleLoadSessionHistory();
    } catch (error) {
      console.error("Final answer error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoHome() {
    handleResetFlow();
    setView(VIEW.SCENARIOS);
  }

  async function handleResumeSession(sessionId) {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchSessionDetail(sessionId, token);
      const scenario = data?.scenario;
      const sessionData = data?.session;
      const logs = Array.isArray(data?.logs) ? data.logs : [];
      const hintsData = Array.isArray(data?.hints) ? data.hints : [];
      const result = data?.result || null;

      if (!scenario || !sessionData?.sessionId) {
        throw new Error("Oturum bilgisi alınamadı.");
      }

      setSelectedScenario(scenario);
      setSession(sessionData);
      setHints(hintsData);
      setFinalResult(result);

      const conversationMap = logs.reduce((acc, log) => {
        const characterId = log?.character?.id;
        if (!characterId) return acc;
        if (!acc[characterId]) acc[characterId] = [];
        if (log?.question) {
          acc[characterId].push({ role: "user", content: log.question });
        }
        if (log?.answer) {
          acc[characterId].push({ role: "assistant", content: log.answer });
        }
        return acc;
      }, {});

      setConversations(conversationMap);

      await handleLoadScenarioData(scenario.id);

      setView(VIEW.SCENARIOS);
    } catch (error) {
      console.error("Session resume error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleGuilty(characterId) {
    setFinalAnswer((prev) => {
      const exists = prev.selected.includes(characterId);
      const updated = exists
        ? prev.selected.filter((id) => id !== characterId)
        : [...prev.selected, characterId];
      return { ...prev, selected: updated };
    });
  }

  function handleResetFlow() {
    resetSessionState();
    setSelectedScenario(null);
    setCharacters([]);
    setScenarioMedia([]);
    setActiveCharacterId("");
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Session clear error:", error);
    }
  }

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
            loading={loading}
          />
        ) : null}

        {view === VIEW.REGISTER && !isLoggedIn ? (
          <AuthPanel
            title="Kayıt Ol"
            submitLabel="Kayıt Ol"
            footerLabel="Zaten hesabın var mı? Giriş Yap"
            onSubmit={handleRegisterSubmit}
            onFooterClick={() => setView(VIEW.LOGIN)}
            loading={loading}
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
            onScenarioSelect={handleScenarioSelect}
            onRefreshScenarios={handleLoadScenarios}
            sessionHistory={sessionHistory}
            onResumeSession={handleResumeSession}
            onStartSession={handleStartSession}
            sessionActive={isSessionActive}
            onSelectCharacter={setActiveCharacterId}
            activeCharacter={activeCharacter}
            conversation={conversations[activeCharacterId] || []}
            question={question}
            onQuestionChange={setQuestion}
            onAskQuestion={handleAskQuestion}
            onUseHint={handleUseHint}
            hints={hints}
            onReset={handleResetFlow}
            loading={loading}
            finalAnswer={finalAnswer}
            onToggleGuilty={handleToggleGuilty}
            onExplanationChange={(value) =>
              setFinalAnswer((prev) => ({ ...prev, explanation: value }))
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
