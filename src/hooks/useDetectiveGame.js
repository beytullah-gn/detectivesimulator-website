"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function readSavedSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useDetectiveGame() {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [view, setView] = useState(() => (getStoredToken() ? VIEW.SCENARIOS : VIEW.LANDING));
  const [authLoading, setAuthLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenarios, setScenarios] = useState([]);

  // Lazy restore from session storage to prevent React 19 render-in-effect warnings
  const savedData = useRef(readSavedSession());
  const initialSession = savedData.current?.session?.sessionId ? savedData.current : null;

  const [selectedScenario, setSelectedScenario] = useState(() => initialSession?.selectedScenario || null);
  const [scenarioMedia, setScenarioMedia] = useState(() => initialSession?.scenarioMedia || []);
  const [characters, setCharacters] = useState(() => initialSession?.characters || []);
  const [relationsByCharacter, setRelationsByCharacter] = useState(() => initialSession?.relationsByCharacter || {});
  const [session, setSession] = useState(() => initialSession?.session || null);
  const [activeCharacterId, setActiveCharacterIdState] = useState(() => initialSession?.activeCharacterId || "");
  const [question, setQuestion] = useState("");
  const [draftsByCharacter, setDraftsByCharacter] = useState({});
  const [conversations, setConversations] = useState(() => initialSession?.conversations || {});
  const [hints, setHints] = useState(() => initialSession?.hints || []);
  const [finalAnswer, setFinalAnswer] = useState(
    () => initialSession?.finalAnswer || { selected: [], explanation: "" }
  );
  const [finalResult, setFinalResult] = useState(() => initialSession?.finalResult || null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [pendingScenarioSlug] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("scenario") || params.get("case") || "";
    } catch {
      return "";
    }
  });

  const isLoggedIn = Boolean(token);
  const isSessionActive = Boolean(session?.sessionId);
  const isSessionCompleted = Boolean(finalResult);

  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeCharacterId) || characters[0] || null,
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
      message.includes("yetkisiz") ||
      message.includes("jwt expired")
    );
  }

  function resetSessionState() {
    setSession(null);
    setConversations({});
    setHints([]);
    setFinalAnswer({ selected: [], explanation: "" });
    setFinalResult(null);
    setQuestion("");
    setDraftsByCharacter({});
    setRelationsByCharacter({});
  }

  function handleLogout() {
    clearToken();
    setToken("");
    setUser(null);
    resetSessionState();
    setSelectedScenario(null);
    setCharacters([]);
    setScenarioMedia([]);
    setSessionHistory([]);
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

  // Switch active character while preserving drafts
  function handleSelectCharacter(newId) {
    if (!newId || newId === activeCharacterId) return;

    setDraftsByCharacter((prev) => ({
      ...prev,
      [activeCharacterId]: question,
    }));

    setQuestion(draftsByCharacter[newId] || "");
    setActiveCharacterIdState(newId);
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
      setActiveCharacterIdState(normalizedCharacters[0]?.id || "");

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

  async function handleLoadScenarios() {
    setScenarioLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchScenarios(token);
      const list = Array.isArray(data) ? data : [];
      setScenarios(list);
      return list;
    } catch (currentError) {
      handleApiError(currentError, "Scenario fetch error");
      return [];
    } finally {
      setScenarioLoading(false);
    }
  }

  async function handleLoadSessionHistory() {
    try {
      const data = await fetchMySessions(token);
      const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
      setSessionHistory(sessions);
      return sessions;
    } catch (currentError) {
      handleApiError(currentError, "Session history error");
      return [];
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
    if (event?.preventDefault) event.preventDefault();
    const trimmedQuestion = question.trim();
    const targetCharacterId = overrideCharacterId || activeCharacterId || activeCharacter?.id;

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

    try {
      const data = await interrogate({
        sessionId: session.sessionId,
        characterId: targetCharacterId,
        question: trimmedQuestion,
        token,
      });

      // Clear draft on successful response
      setQuestion("");
      setDraftsByCharacter((prev) => ({ ...prev, [targetCharacterId]: "" }));

      setConversations((previous) => {
        const currentConversation = previous[targetCharacterId] || [];
        return {
          ...previous,
          [targetCharacterId]: [
            ...currentConversation,
            { role: "user", content: trimmedQuestion },
            { role: "assistant", content: data?.answer || "" },
          ],
        };
      });
    } catch (currentError) {
      // Keep question in state on error so player does not lose their typed question
      setQuestion(trimmedQuestion);
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
    if (event?.preventDefault) event.preventDefault();

    if (!session?.sessionId) return;

    if (finalAnswer.selected.length === 0) {
      setErrorMessage("En az bir suçlu şüpheli seçmelisiniz.");
      return;
    }

    if (!finalAnswer.explanation.trim()) {
      setErrorMessage("Gerekçe metni zorunludur.");
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
    setActiveCharacterIdState("");

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

  // Fetch user info when token changes
  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    fetchUser(token)
      .then((userData) => {
        if (active) setUser(userData);
      })
      .catch((err) => {
        if (active) handleApiError(err, "User fetch error");
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load scenarios and session history on login
  useEffect(() => {
    if (!token) return;
    let active = true;

    Promise.resolve().then(() => {
      if (active) setScenarioLoading(true);
    });

    Promise.all([
      fetchScenarios(token).catch((err) => {
        handleApiError(err, "Scenario fetch error");
        return [];
      }),
      fetchMySessions(token).catch((err) => {
        handleApiError(err, "Session history error");
        return { sessions: [] };
      }),
    ]).then(([scenarioList, sessionsData]) => {
      if (!active) return;
      const normalizedScenarios = Array.isArray(scenarioList) ? scenarioList : [];
      setScenarios(normalizedScenarios);
      setSessionHistory(Array.isArray(sessionsData?.sessions) ? sessionsData.sessions : []);
      setScenarioLoading(false);

      // Auto-select pending scenario if player came from case briefing
      if (pendingScenarioSlug && !session?.sessionId) {
        const matched = normalizedScenarios.find(
          (s) => s.slug === pendingScenarioSlug || s.id === pendingScenarioSlug
        );
        if (matched) {
          handleScenarioSelect(matched);
        }
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pendingScenarioSlug]);

  // Save session state to localStorage
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
    setActiveCharacterId: handleSelectCharacter,
    setQuestion,
    setFinalAnswer,
  };
}
