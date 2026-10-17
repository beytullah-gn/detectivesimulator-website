"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { playSfx } from "./audio/soundscape";

const PAD = 6;

function measure(target) {
  const element = document.querySelector(`[data-tour="${target}"]`);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
}

// Spotlight walkthrough over elements marked with data-tour="<target>".
export default function CoachTour({ steps, onDone }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[index];

  const update = useCallback(() => {
    const next = measure(step.target);
    // A target scrolled out of view or collapsed to zero size gets a centered card instead.
    setRect(next && next.width > PAD * 2 && next.height > PAD * 2 ? next : null);
  }, [step.target]);

  useLayoutEffect(() => {
    const element = document.querySelector(`[data-tour="${step.target}"]`);
    // Skip steps whose target is not on screen so the spotlight never points at empty space.
    if (!element) {
      const frame = requestAnimationFrame(() =>
        index < steps.length - 1 ? setIndex(index + 1) : onDone()
      );
      return () => cancelAnimationFrame(frame);
    }
    element.scrollIntoView({ block: "center", behavior: "instant" });
    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [step.target, update, index, steps.length, onDone]);

  useEffect(() => {
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [update]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  const isLast = index === steps.length - 1;
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const placeBelow = !rect || rect.top + rect.height + 180 < viewportHeight;
  const cardStyle = rect
    ? placeBelow
      ? { top: Math.max(12, rect.top + rect.height + 10) }
      : { bottom: Math.max(12, viewportHeight - rect.top + 10) }
    : { top: "40%" };
  if (rect) {
    cardStyle.left = Math.min(Math.max(12, rect.left), window.innerWidth - 300);
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Nasıl oynanır">
      {rect ? <div className="tour-spot" style={rect} /> : <div className="tour-dim" />}
      <div className="tour-card" style={cardStyle}>
        <span className="tour-step">
          {index + 1}/{steps.length}
        </span>
        <strong>{step.title}</strong>
        <p>{step.text}</p>
        <div className="tour-actions">
          <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onDone}>
            Geç
          </button>
          {index > 0 ? (
            <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => {
                playSfx("click");
                setIndex(index - 1);
              }}>
              Geri
            </button>
          ) : null}
          <button
            type="button"
            className="ds-btn ds-btn-primary ds-btn-sm"
            onClick={() => {
              playSfx("click");
              if (isLast) onDone();
              else setIndex(index + 1);
            }}
            autoFocus
          >
            {isLast ? "Başla" : "İleri"}
          </button>
        </div>
      </div>
    </div>
  );
}
