"use client";

import { useState } from "react";
import CaseArtwork from "../components/marketing/CaseArtwork";
import { ArrowLeftIcon, ClockIcon, FileTextIcon, PlayIcon, RotateIcon, StarIcon, UsersIcon } from "../components/icons";
import { formatDifficulty, formatDuration } from "../utils/formatters";
import { AudioPlayer } from "./media";
import { Mugshot } from "./pieces";

export default function Briefing({
  scenario,
  characters,
  media,
  loading,
  locked,
  starting,
  activeSession,
  onStart,
  onBack,
}) {
  const [confirmRestart, setConfirmRestart] = useState(false);
  const story = (scenario.story || scenario.description || "").split(/\n+/).filter(Boolean);

  return (
    <div className="briefing ds-container">
      <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm back-link" onClick={onBack}>
        <ArrowLeftIcon size={14} />
        Dosyalar
      </button>

      <div className="briefing-hero">
        <CaseArtwork scenario={scenario} className="briefing-dossier" stamp={activeSession ? "Açık" : ""} />

        <div className="briefing-copy">
          <div className="chip-row">
            {scenario.category?.title ? <span className="chip">{scenario.category.title}</span> : null}
            <span className="chip">{formatDifficulty(scenario.difficulty)}</span>
            <span className="chip">
              <ClockIcon size={12} />
              {formatDuration(scenario.estimated_duration)}
            </span>
          </div>

          <h1>{scenario.title}</h1>
          <p className="briefing-lead">{scenario.teaser || scenario.description}</p>

          {scenario.briefing_audio_url ? (
            <AudioPlayer src={scenario.briefing_audio_url} label="Komiserin brifingini dinle" />
          ) : null}

          <ol className="mission-list">
            <li>
              <FileTextIcon size={14} />
              <span>{media.length || "–"} delili incele</span>
            </li>
            <li>
              <UsersIcon size={14} />
              <span>{characters.length || "–"} şüpheliyi sorgula</span>
            </li>
            <li>
              <StarIcon size={14} />
              <span>İpucusuz çöz, 3 yıldız al</span>
            </li>
          </ol>

          {locked ? (
            <p className="locked-note">Bu dosya şimdilik kilitli.</p>
          ) : activeSession ? (
            <div className="start-choice">
              <p className="start-choice-note">
                Bu dosyada açık bir soruşturman var · {Number(activeSession.question_count || 0)} soru,{" "}
                {Number(activeSession.hint_count || 0)} ipucu
              </p>
              {confirmRestart ? (
                <div className="start-actions">
                  <span className="restart-warning">Sorgular, ipuçları ve notların silinecek.</span>
                  <button
                    type="button"
                    className="ds-btn ds-btn-primary"
                    onClick={() => onStart({ restart: true })}
                    disabled={starting || loading}
                  >
                    <RotateIcon size={14} />
                    Evet, baştan başla
                  </button>
                  <button type="button" className="ds-btn ds-btn-ghost" onClick={() => setConfirmRestart(false)}>
                    Vazgeç
                  </button>
                </div>
              ) : (
                <div className="start-actions">
                  <button
                    type="button"
                    className="ds-btn ds-btn-primary ds-btn-lg"
                    onClick={() => onStart({ restart: false })}
                    disabled={starting || loading}
                  >
                    <PlayIcon size={14} />
                    {starting ? "Açılıyor..." : "Devam et"}
                  </button>
                  <button
                    type="button"
                    className="ds-btn ds-btn-secondary ds-btn-lg"
                    onClick={() => setConfirmRestart(true)}
                    disabled={starting || loading}
                  >
                    <RotateIcon size={14} />
                    Baştan başla
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="ds-btn ds-btn-primary ds-btn-lg start-btn"
              onClick={() => onStart({ restart: false })}
              disabled={starting || loading}
            >
              <PlayIcon size={14} />
              {starting ? "Açılıyor..." : "Soruşturmayı başlat"}
            </button>
          )}
        </div>
      </div>

      {story.length ? (
        <section className="briefing-story" aria-label="Olay">
          <div className="section-head">
            <h2>Olay</h2>
          </div>
          <article className="paper paper-story">
            {story.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        </section>
      ) : null}

      {characters.length ? (
        <section className="briefing-lineup" aria-label="Şüpheliler">
          <div className="section-head">
            <h2>Şüpheliler</h2>
          </div>
          <div className="lineup">
            {characters.map((character, index) => (
              <Mugshot key={character.id} character={character} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
