import { useState } from "react";
import { buildUrl } from "../services/apiClient";
import { formatCharacterName, getInitials } from "../utils/formatters";

export default function CharacterDetailCard({ character, relations = [], userKey = "" }) {
  const storageKey = character?.id ? `ds_notes_${userKey || "guest"}_${character.id}` : "";
  const [notes, setNotes] = useState(() => {
    if (!storageKey) return "";

    try {
      return localStorage.getItem(storageKey) || "";
    } catch (error) {
      console.error("Notes load error:", error);
      return "";
    }
  });

  const handleNotesChange = (event) => {
    const value = event.target.value;
    setNotes(value);
    if (!character?.id) return;
    const storageKey = `ds_notes_${userKey || "guest"}_${character.id}`;
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) {
      console.error("Notes save error:", error);
    }
  };

  return (
    <div className="character-detail-card">
      <div className="character-detail-header">
        <div className="avatar-large">
          {character.avatar ? (
            <img src={buildUrl(`/assets/${character.avatar}`)} alt={formatCharacterName(character)} />
          ) : (
            <span>{getInitials(character)}</span>
          )}
        </div>
        <div className="character-detail-info">
          <h3>{formatCharacterName(character)}</h3>
          {character.role && <p className="character-role">{character.role}</p>}
          {character.age && <p className="character-meta">🎂 Yaş: {character.age}</p>}
        </div>
      </div>

      {character.description && (
        <div className="character-detail-section">
          <h4>📋 Genel Bilgi</h4>
          <p>{character.description}</p>
        </div>
      )}

      {character.background && (
        <div className="character-detail-section">
          <h4>📖 Geçmiş</h4>
          <p>{character.background}</p>
        </div>
      )}

      {character.personality && (
        <div className="character-detail-section">
          <h4>💭 Kişilik</h4>
          <p>{character.personality}</p>
        </div>
      )}

      {character.behavior_during_incident && (
        <div className="character-detail-section">
          <h4>📌 Olay Anındaki Davranış</h4>
          <p>{character.behavior_during_incident}</p>
        </div>
      )}

      {character.alibi && (
        <div className="character-detail-section">
          <h4>⏰ Mazeretleri</h4>
          <p>{character.alibi}</p>
        </div>
      )}

      {relations.length > 0 && (
        <div className="character-detail-section">
          <h4>🔗 İlişkiler</h4>
          <div className="character-relations">
            {relations.map((item) => {
              const related = item?.related_character || {};
              const relatedName = formatCharacterName(related) || "Bilinmeyen";
              return (
                <div key={item.id} className="relation-item">
                  <div className="avatar">
                    {related.avatar ? (
                      <img
                        src={buildUrl(`/assets/${related.avatar}`)}
                        alt={relatedName}
                      />
                    ) : (
                      <span>{getInitials(related)}</span>
                    )}
                  </div>
                  <div className="relation-info">
                    <h5>{relatedName}</h5>
                    <p>{item.relation}</p>
                    {item?.tension_level ? (
                      <span className="relation-tension">
                        Gerilim: {item.tension_level}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="character-detail-section">
        <h4>📝 Notlarım</h4>
        <textarea
          className="character-notes"
          rows={4}
          placeholder="Bu şüpheliyle ilgili notlarını yaz..."
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
}
