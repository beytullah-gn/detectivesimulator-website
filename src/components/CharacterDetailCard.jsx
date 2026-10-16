"use client";

import { useState } from "react";
import { buildUrl } from "../services/apiClient";
import { formatCharacterName, getInitials } from "../utils/formatters";
import { MessageSquareIcon, UserIcon } from "./icons";

export default function CharacterDetailCard({
  character,
  relations = [],
  userKey = "",
  onInterrogate,
  isInterrogationDisabled,
}) {
  const storageKey = character?.id ? `ds_notes_${userKey || "guest"}_${character.id}` : "";
  const [notes, setNotes] = useState(() => {
    if (!storageKey || typeof window === "undefined") return "";
    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });

  const handleNotesChange = (event) => {
    const value = event.target.value;
    setNotes(value);
    if (!character?.id) return;
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) {
      console.error("Notes save error:", error);
    }
  };

  if (!character) return null;

  const characterName = formatCharacterName(character);

  return (
    <div className="character-detail-card character-detail-expanded">
      <header className="character-detail-header">
        <div className="character-detail-portrait-box">
          {character.avatar ? (
            <img
              src={buildUrl(`/assets/${character.avatar}`)}
              alt={characterName}
              className="character-detail-avatar"
            />
          ) : (
            <div className="avatar-neutral-fallback" aria-hidden="true">
              <span>{getInitials(character)}</span>
            </div>
          )}
        </div>

        <div className="character-detail-identity">
          <div className="character-meta-top">
            <span className="ds-badge">Şüpheli</span>
            {character.age ? (
              <span className="character-age-badge">{character.age} yaş</span>
            ) : null}
          </div>
          <h3 className="character-title">{characterName}</h3>
          <p className="character-role">{character.role || "İfade Sahibi"}</p>

          {onInterrogate ? (
            <div className="character-header-actions">
              <button
                type="button"
                className="ds-btn ds-btn-primary ds-btn-sm character-select-card"
                onClick={() => onInterrogate(character.id)}
                disabled={isInterrogationDisabled}
                aria-label="Sorgula"
              >
                <MessageSquareIcon size={14} />
                <span>Bu Kişiyi Sorgula</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="character-sections">
        {character.description && (
          <section className="character-detail-section">
            <h4>Genel Tanım</h4>
            <p>{character.description}</p>
          </section>
        )}

        {character.alibi && (
          <section className="character-detail-section">
            <h4>Olay Sırasındaki Alibi</h4>
            <p>{character.alibi}</p>
          </section>
        )}

        {character.behavior_during_incident && (
          <section className="character-detail-section">
            <h4>Olay Anındaki Davranışı</h4>
            <p>{character.behavior_during_incident}</p>
          </section>
        )}

        {character.personality && (
          <section className="character-detail-section">
            <h4>Kişilik Özellikleri</h4>
            <p>{character.personality}</p>
          </section>
        )}

        {character.background && (
          <section className="character-detail-section">
            <h4>Geçmiş ve Konum</h4>
            <p>{character.background}</p>
          </section>
        )}

        {relations.length > 0 && (
          <section className="character-detail-section">
            <h4>İlişkiler ve Bağlantılar</h4>
            <div className="character-relations-grid">
              {relations.map((item) => {
                const related = item?.related_character || {};
                const relatedName = formatCharacterName(related) || "Diğer Karakter";
                return (
                  <div key={item.id} className="relation-item-card">
                    <div className="relation-avatar-box">
                      {related.avatar ? (
                        <img
                          src={buildUrl(`/assets/${related.avatar}`)}
                          alt={relatedName}
                          className="relation-avatar"
                        />
                      ) : (
                        <div className="avatar-neutral-fallback small" aria-hidden="true">
                          <span>{getInitials(related)}</span>
                        </div>
                      )}
                    </div>
                    <div className="relation-copy">
                      <strong>{relatedName}</strong>
                      <p>{item.relation || "Bağlantı belirtilmedi"}</p>
                      {item.tension_level ? (
                        <span className="relation-tension">
                          Gerilim: {item.tension_level}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="character-detail-section notes-section">
          <h4>Dedektif Notları</h4>
          <textarea
            className="character-notes-input"
            rows={3}
            placeholder={`${characterName} hakkında kendi soruşturma notlarını yaz...`}
            value={notes}
            onChange={handleNotesChange}
          />
          <small className="notes-helper">Notlar bu cihazda otomatik kaydedilir.</small>
        </section>
      </div>
    </div>
  );
}
