"use client";

import { useMemo } from "react";
import CaseArtwork from "../components/marketing/CaseArtwork";
import { ClockIcon, PlayIcon } from "../components/icons";
import { formatDuration } from "../utils/formatters";
import { MAX_HINTS, summarizeCareer } from "./career";
import { playSfx } from "./audio/soundscape";
import { Stars } from "./pieces";

export function CareerBar({ sessions }) {
  const career = useMemo(() => summarizeCareer(sessions), [sessions]);
  const { current, next, progress } = career.rank;

  return (
    <section className="career-bar" aria-label="Dedektif kariyeri">
      <div className="career-rank">
        <span className="career-label">Rütbe</span>
        <strong>{current.title}</strong>
      </div>
      <div className="career-progress">
        <div className="career-progress-head">
          <span>{career.totalScore} puan</span>
          <span>{next ? `${next.title}: ${next.min}` : "En üst rütbe"}</span>
        </div>
        <div className="meter">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
      <div className="career-stats">
        <div>
          <strong>{career.solvedCount}</strong>
          <span>Çözülen</span>
        </div>
        <div>
          <strong>{career.starCount}</strong>
          <span>Yıldız</span>
        </div>
      </div>
    </section>
  );
}

export default function Lobby({
  scenarios,
  lockedScenarioIds = [],
  sessionHistory,
  onSelectScenario,
  loading,
}) {
  const career = useMemo(() => summarizeCareer(sessionHistory), [sessionHistory]);
  const activeSessions = (sessionHistory || []).filter((item) => item?.status === "continues");
  const activeByScenario = Object.fromEntries(
    activeSessions.map((item) => [item?.scenario?.id, item])
  );
  const resume = activeSessions[0] || null;

  return (
    <div className="lobby ds-container">
      <CareerBar sessions={sessionHistory} />

      {resume ? (
        <button
          type="button"
          className="resume-strip"
          onClick={() => {
            playSfx("open");
            onSelectScenario(scenarios.find((item) => item.id === resume?.scenario?.id) || resume.scenario);
          }}
          disabled={loading}
        >
          <span className="resume-pulse" aria-hidden="true" />
          <span className="resume-copy">
            <small>Açık soruşturma</small>
            <strong>{resume?.scenario?.title}</strong>
          </span>
          <span className="resume-meta">
            {Number(resume.question_count || 0)} soru · {Number(resume.hint_count || 0)}/{MAX_HINTS} ipucu
          </span>
          <span className="ds-btn ds-btn-primary">
            <PlayIcon size={14} />
            Aç
          </span>
        </button>
      ) : null}

      <div className="section-head">
        <h2>Dosyalar</h2>
        <span>{career.solvedCount}/{scenarios.length} çözüldü</span>
      </div>

      {loading && scenarios.length === 0 ? (
        <div className="case-grid">
          {[0, 1, 2].map((key) => (
            <div key={key} className="case-tile skeleton" />
          ))}
        </div>
      ) : scenarios.length === 0 ? (
        <p className="empty-line">Şu an açık dosya yok.</p>
      ) : (
        <div className="case-grid">
          {scenarios.map((scenario) => {
            const best = career.bestByScenario[scenario.id];
            const active = activeByScenario[scenario.id];
            const locked = lockedScenarioIds.includes(scenario.id);
            const stamp = best?.solved ? "Çözüldü" : active ? "Açık" : locked ? "Kilitli" : "Gizli";
            return (
              <button
                key={scenario.id}
                type="button"
                className={`case-tile ${best?.solved ? "is-solved" : ""} ${locked ? "is-locked" : ""}`}
                onClick={() => {
                  playSfx("open");
                  onSelectScenario(scenario);
                }}
              >
                <CaseArtwork scenario={scenario} stamp={stamp} />
                <div className="case-tile-foot">
                  <Stars count={best?.stars || 0} />
                  <span className="case-tile-time">
                    <ClockIcon size={12} />
                    {formatDuration(scenario.estimated_duration)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
