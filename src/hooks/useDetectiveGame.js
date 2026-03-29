"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import {
  clearToken,
  fetchUser,
  getStoredToken,
  login,
  register,
  storeToken,
} from "../services/authService";
import {
  fetchScenarioCharacters,
  fetchScenarioMedia,
  fetchScenarios,
  fetchScenarioRelations,
} from "../services/scenarioService";
import {
  fetchMySessions,
  fetchSessionDetail,
  interrogate,
  startSession,
  submitFinalAnswer,
  useHint as requestHint,
} from "../services/gameService";

export const VIEW = {
  LANDING: "landing",
  LOGIN: "login",
  REGISTER: "register",
  SCENARIOS: "scenarios",
};

const SESSION_STORAGE_KEY = "detective_simulator_session";

export function useDetectiveGame() {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [view, setView] = useState(token ? VIEW.SCENARIOS : VIEW.LANDING);
  const [authLoading, setAuthLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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

  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeCharacterId),
    [characters, activeCharacterId]
  );

  function setErrorMessage(message) {
    setError(message || "");
  }

  function isAuthError(currentError) {
    const message = String(currentError?.message || "").toLowerCase();
    return (
      message.includes("token expired") ||
      message.includes("unauthorized") ||
      message.includes("yetkisiz")
    );
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
    } catch (storageError) {
      console.error("Session clear error:", storageError);
    }
  }

  function handleApiError(currentError, fallbackMessage) {
    console.error(fallbackMessage || "API error:", currentError);

    if (isAuthError(currentError)) {
      setErrorMessage("Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.");
      handleLogout();
      return;
    }

    setErrorMessage(
      currentError?.message || fallbackMessage || "Beklenmeyen bir hata oluştu."
    );
  }

  async function handleFetchUser() {
    try {
      const response = await fetchUser(token);
      setUser(response);
    } catch (currentError) {
      handleApiError(currentError, "User fetch error");
    }
  }

  async function handleLoadScenarios() {
    setScenarioLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchScenarios(token);
      setScenarios(Array.isArray(data) ? data : []);
    } catch (currentError) {
      handleApiError(currentError, "Scenario fetch error");
    } finally {
      setScenarioLoading(false);
    }
  }

  async function handleLoadSessionHistory() {
    try {
      const data = await fetchMySessions(token);
      const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
      setSessionHistory(sessions);
    } catch (currentError) {
      handleApiError(currentError, "Session history error");
    }
  }

  async function handleLoadScenarioData(scenarioId) {
    setScenarioLoading(true);
    setErrorMessage("");

    try {
      const [charactersData, mediaData, relationsData] = await Promise.all([
        fetchScenarioCharacters(scenarioId, token),
        fetchScenarioMedia(scenarioId, token),
        fetchScenarioRelations(scenarioId, token),
      ]);

      const normalizedCharacters = Array.isArray(charactersData) ? charactersData : [];
      setCharacters(normalizedCharacters);
      setScenarioMedia(Array.isArray(mediaData) ? mediaData : []);
      setActiveCharacterId(normalizedCharacters[0]?.id || "");

      const normalizedRelations = Array.isArray(relationsData)
        ? relationsData
        : relationsData?.data || [];

      const relationMap = normalizedRelations.reduce((accumulator, item) => {
        const characterId = item?.character?.id || item?.character;
        if (!characterId) return accumulator;
        if (!accumulator[characterId]) accumulator[characterId] = [];
        accumulator[characterId].push(item);
        return accumulator;
      }, {});

      setRelationsByCharacter(relationMap);
    } catch (currentError) {
      handleApiError(currentError, "Scenario data fetch error");
    } finally {
      setScenarioLoading(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setAuthLoading(true);
    setErrorMessage("");

    try {
      const accessToken = await login({ email, password });
      storeToken(accessToken);
      setToken(accessToken);
      setView(VIEW.SCENARIOS);
    } catch (currentError) {
      handleApiError(currentError, "Login error");
    } finally {
      setAuthLoading(false);
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

    setAuthLoading(true);
    setErrorMessage("");

    try {
      await register({ email, password });
      setView(VIEW.LOGIN);
    } catch (currentError) {
      handleApiError(currentError, "Register error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleScenarioSelect(scenario) {
    setSelectedScenario(scenario);
    resetSessionState();
    await handleLoadScenarioData(scenario.id);
  }

  async function handleStartSession() {
    if (!selectedScenario) return false;

    setActionLoading(true);
    setErrorMessage("");

    try {
      const data = await startSession(selectedScenario.id, token);
      if (data?.resumed && data?.sessionId) {
        await handleResumeSession(data.sessionId);
      } else {
        setSession(data);
        setFinalResult(null);
      }
      await handleLoadSessionHistory();
      return true;
    } catch (currentError) {
      handleApiError(currentError, "Session start error");
      return false;
    } finally {
      setActionLoading(false);
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

    setActionLoading(true);
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

      setConversations((previous) => {
        const currentConversation = previous[targetCharacterId] || [];
        return {
          ...previous,
          [targetCharacterId]: [
            ...currentConversation,
            { role: "user", content: userQuestion },
            { role: "assistant", content: data?.answer || "" },
          ],
        };
      });
    } catch (currentError) {
      handleApiError(currentError, "Interrogation error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUseHint() {
    if (!session?.sessionId || isSessionCompleted) return;

    setActionLoading(true);
    setErrorMessage("");

    try {
      const data = await requestHint(session.sessionId, token);
      if (data?.hint) {
        setHints((previous) => [...previous, data.hint]);
      }
    } catch (currentError) {
      handleApiError(currentError, "Hint error");
    } finally {
      setActionLoading(false);
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

    setActionLoading(true);
    setErrorMessage("");

    try {
      const data = await submitFinalAnswer({
        sessionId: session.sessionId,
        selectedGuiltyPlayers: finalAnswer.selected,
        explanationText: finalAnswer.explanation.trim(),
        token,
      });

      setFinalResult(data);
      setSession((previous) => (previous ? { ...previous, status: "completed" } : previous));
      await handleLoadSessionHistory();
    } catch (currentError) {
      handleApiError(currentError, "Final answer error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResumeSession(sessionId) {
    setScenarioLoading(true);
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

      const conversationMap = logs.reduce((accumulator, log) => {
        const characterId = log?.character?.id;
        if (!characterId) return accumulator;
        if (!accumulator[characterId]) accumulator[characterId] = [];
        if (log?.question) {
          accumulator[characterId].push({ role: "user", content: log.question });
        }
        if (log?.answer) {
          accumulator[characterId].push({ role: "assistant", content: log.answer });
        }
        return accumulator;
      }, {});

      setConversations(conversationMap);

      await handleLoadScenarioData(scenario.id);
      setView(VIEW.SCENARIOS);
    } catch (currentError) {
      handleApiError(currentError, "Session resume error");
    } finally {
      setScenarioLoading(false);
    }
  }

  function handleToggleGuilty(characterId) {
    setFinalAnswer((previous) => {
      const exists = previous.selected.includes(characterId);
      const updated = exists
        ? previous.selected.filter((id) => id !== characterId)
        : [...previous.selected, characterId];

      return {
        ...previous,
        selected: updated,
      };
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
    } catch (storageError) {
      console.error("Session clear error:", storageError);
    }
  }

  function handleGoHome() {
    handleResetFlow();
    setView(isLoggedIn ? VIEW.SCENARIOS : VIEW.LANDING);
  }

  const syncUserFromToken = useEffectEvent(() => {
    handleFetchUser().catch(() => undefined);
  });

  const loadInitialScenarioData = useEffectEvent(() => {
    handleLoadScenarios().catch(() => undefined);
    handleLoadSessionHistory().catch(() => undefined);
  });

  useEffect(() => {
    if (token) {
      syncUserFromToken();
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
      if (saved?.session?.sessionId) {
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
    } catch (storageError) {
      console.error("Session restore error:", storageError);
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
    } catch (storageError) {
      console.error("Session save error:", storageError);
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
      loadInitialScenarioData();
    }
  }, [isLoggedIn]);

  return {
    VIEW,
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
  };
}
