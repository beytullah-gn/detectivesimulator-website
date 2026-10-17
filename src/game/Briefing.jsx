"use client";

import CaseArtwork from "../components/marketing/CaseArtwork";
import { ArrowLeftIcon, ClockIcon, FileTextIcon, PlayIcon, StarIcon, UsersIcon } from "../components/icons";
import { formatDifficulty, formatDuration } from "../utils/formatters";
import { Mugshot } from "./pieces";

export default function Briefing({ scenario, characters, media, loading, locked, starting, onStart, onBack }) {
  return (
    <div className="briefing ds-container">
      <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm back-link" onClick={onBack}>
        <ArrowLeftIcon size={14} />
        Dosyalar
      </button>

      <div className="briefing-hero">
        <CaseArtwork scenario={scenario} className="briefing-dossier" />

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
          ) : (
            <button
              type="button"
              className="ds-btn ds-btn-primary ds-btn-lg start-btn"
              onClick={onStart}
              disabled={starting || loading}
            >
              <PlayIcon size={14} />
              {starting ? "Açılıyor..." : "Soruşturmayı başlat"}
            </button>
          )}
        </div>
      </div>

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
