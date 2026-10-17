"use client";

import { useEffect, useState } from "react";

const EMPTY_PROGRESS = { seen: [], pinned: [], suspicion: {}, notes: "" };

function storageKey(sessionId) {
  return `ds_case_progress_${sessionId}`;
}

function readProgress(sessionId) {
  if (!sessionId || typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    return raw ? { ...EMPTY_PROGRESS, ...JSON.parse(raw) } : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

// Per-session player notes kept on this device: seen/pinned evidence, suspicion marks, notebook.
export function useCaseProgress(sessionId) {
  const [state, setState] = useState(() => ({ sessionId, progress: readProgress(sessionId) }));
  const progress = state.sessionId === sessionId ? state.progress : readProgress(sessionId);

  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(storageKey(sessionId), JSON.stringify(progress));
    } catch (error) {
      console.error("Case progress save error:", error);
    }
  }, [sessionId, progress]);

  function update(updater) {
    setState((previous) => {
      const base = previous.sessionId === sessionId ? previous.progress : readProgress(sessionId);
      return { sessionId, progress: updater(base) };
    });
  }

  function toggleInList(listName, id) {
    update((current) => {
      const list = current[listName] || [];
      return {
        ...current,
        [listName]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
      };
    });
  }

  return {
    progress,
    markSeen: (id) =>
      update((current) =>
        current.seen.includes(id) ? current : { ...current, seen: [...current.seen, id] }
      ),
    togglePinned: (id) => toggleInList("pinned", id),
    setSuspicion: (characterId, level) =>
      update((current) => ({
        ...current,
        suspicion: { ...current.suspicion, [characterId]: level },
      })),
    setNotes: (notes) => update((current) => ({ ...current, notes })),
  };
}
