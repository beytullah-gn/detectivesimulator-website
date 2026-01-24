import { apiFetch } from "./apiClient";

export async function startSession(scenarioId, token) {
  return apiFetch("/game/session/start", {
    method: "POST",
    body: { scenarioId },
    token,
  });
}

export async function interrogate({ sessionId, characterId, question, token }) {
  return apiFetch("/game/interrogate", {
    method: "POST",
    body: { sessionId, characterId, question },
    token,
  });
}

export async function useHint(sessionId, token) {
  return apiFetch("/game/hints/use", {
    method: "POST",
    body: { sessionId },
    token,
  });
}

export async function submitFinalAnswer({
  sessionId,
  selectedGuiltyPlayers,
  explanationText,
  token,
}) {
  return apiFetch("/game/session/answer", {
    method: "POST",
    body: { sessionId, selectedGuiltyPlayers, explanationText },
    token,
  });
}
