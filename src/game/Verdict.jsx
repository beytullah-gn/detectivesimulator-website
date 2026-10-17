"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, PenIcon, PinIcon, TargetIcon } from "../components/icons";
import { playSfx } from "./audio/soundscape";
import { CareerBar } from "./Lobby";
import { Mugshot, SuspicionDots, Stars } from "./pieces";
import { useCaseProgress } from "./useCaseProgress";

export function Accusation({
  sessionId,
  characters,
  media,
  selected,
  explanation,
  onToggle,
  onExplanation,
  onSubmit,
  loading,
  onBack,
}) {
  const { progress } = useCaseProgress(sessionId);
  const pinnedItems = media.filter((item) => progress.pinned.includes(item.id));
  const canSubmit = selected.length > 0 && explanation.trim().length > 0 && !loading;

  function appendText(text) {
    const current = explanation.trim();
    onExplanation(current ? `${current}\n${text}` : text);
  }

  return (
    <div className="accusation ds-container">
      <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm back-link" onClick={onBack} disabled={loading}>
        <ArrowLeftIcon size={14} />
        Soruşturmaya dön
      </button>

      <h1 className="accusation-title">Kim yaptı?</h1>

      <div className="lineup lineup-accuse" role="group" aria-label="Şüpheliler">
        {characters.map((character, index) => {
          const isSelected = selected.includes(character.id);
          return (
            <button
              key={character.id}
              type="button"
              className={`lineup-btn ${isSelected ? "accused" : ""}`}
              onClick={() => onToggle(character.id)}
              aria-pressed={isSelected}
              disabled={loading}
            >
              <Mugshot character={character} index={index} suspicion={progress.suspicion[character.id] || 0} />
              <SuspicionDots level={progress.suspicion[character.id] || 0} />
              {isSelected ? <span className="accused-tag">Suçlu</span> : null}
            </button>
          );
        })}
      </div>

      <form
        className="accusation-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) onSubmit(event);
        }}
      >
        <label htmlFor="accusation-reason">Neden?</label>
        <textarea
          id="accusation-reason"
          value={explanation}
          onChange={(event) => onExplanation(event.target.value)}
          placeholder="Motif, fırsat ve seni ikna eden delil..."
          rows={5}
          maxLength={2000}
          disabled={loading}
        />

        {pinnedItems.length || progress.notes ? (
          <div className="pinned-list">
            {progress.notes ? (
              <button type="button" className="pinned-chip" onClick={() => appendText(progress.notes)} disabled={loading}>
                <PenIcon size={12} />
                Notlarım
              </button>
            ) : null}
            {pinnedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="pinned-chip"
                onClick={() => appendText(`${item.title}: ${item.description || ""}`.trim())}
                disabled={loading}
              >
                <PinIcon size={12} filled />
                {item.title}
              </button>
            ))}
          </div>
        ) : null}

        <button type="submit" className="ds-btn ds-btn-primary ds-btn-lg" disabled={!canSubmit}>
          <TargetIcon size={14} />
          {loading ? "Dosya değerlendiriliyor..." : "Suçla"}
        </button>
      </form>
    </div>
  );
}

// Renders the small markdown subset the feedback model returns: **bold** and "- " bullets.
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part
  );
}

function FeedbackText({ text }) {
  const blocks = [];
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const bullet = /^[-*•]\s+/.test(line);
      const content = line.replace(/^[-*•]\s+/, "").replace(/^#+\s*/, "");
      const last = blocks[blocks.length - 1];
      if (bullet && last?.type === "list") last.items.push(content);
      else if (bullet) blocks.push({ type: "list", items: [content] });
      else blocks.push({ type: "p", text: content });
    });

  return blocks.map((block, index) =>
    block.type === "list" ? (
      <ul key={index}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item)}</li>
        ))}
      </ul>
    ) : (
      <p key={index}>{renderInline(block.text)}</p>
    )
  );
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    function tick(now) {
      const ratio = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - ratio, 3))));
      if (ratio < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

export function Result({ result, characters, sessionHistory, hasNext, onNext, onLobby }) {
  const stars = Number(result?.stars || 0);
  const isCorrect = Boolean(result?.isCorrect);
  const culpritMatch = isCorrect || Boolean(result?.culpritMatch) || stars > 0;
  const score = useCountUp(Number(result?.score || 0));
  const culpritIds = (result?.correctGuiltyPlayers || []).map((item) => item.id);
  const culprits = characters.filter((character) => culpritIds.includes(character.id));

  useEffect(() => {
    playSfx("stamp");
    playSfx(culpritMatch ? "success" : "fail");
  }, [culpritMatch]);

  const verdict = isCorrect ? "Vaka çözüldü" : culpritMatch ? "Doğru kişi, zayıf gerekçe" : "Yanlış suçlama";
  const tone = isCorrect ? "win" : culpritMatch ? "partial" : "lose";

  return (
    <div className="result ds-container">
      <div className={`verdict verdict-${tone}`}>
        <span className="verdict-stamp">{verdict}</span>
        <Stars count={stars} size={28} className="verdict-stars" />
        <div className="verdict-score">
          <strong>+{score}</strong>
          <span>puan</span>
        </div>
      </div>

      {culprits.length ? (
        <section className="result-culprit">
          <div className="section-head">
            <h2>{culprits.length > 1 ? "Suçlular" : "Suçlu"}</h2>
          </div>
          <div className="lineup">
            {culprits.map((character) => (
              <Mugshot
                key={character.id}
                character={character}
                index={characters.findIndex((item) => item.id === character.id)}
                suspicion={2}
              />
            ))}
          </div>
        </section>
      ) : null}

      {result?.feedback ? (
        <section className="result-feedback">
          <div className="section-head">
            <h2>Komiserin değerlendirmesi</h2>
          </div>
          <FeedbackText text={result.feedback} />
        </section>
      ) : null}

      <CareerBar sessions={sessionHistory} />

      <div className="result-actions">
        <button type="button" className="ds-btn ds-btn-secondary ds-btn-lg" onClick={onLobby}>
          Dosyalar
        </button>
        {hasNext ? (
          <button type="button" className="ds-btn ds-btn-primary ds-btn-lg" onClick={onNext}>
            Sıradaki vaka
            <ArrowRightIcon size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
