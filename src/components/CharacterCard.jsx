import { buildUrl } from "../services/apiClient";
import { getCharacterName, getInitials } from "../utils/formatters";
import { MessageSquareIcon } from "./icons";

export default function CharacterCard({ character, onInterrogate, canInterrogate }) {
  const characterName = getCharacterName(character);

  return (
    <div className="character-card">
      <div className="character-card-avatar-box">
        {character.avatar ? (
          <img
            src={buildUrl(`/assets/${character.avatar}`)}
            alt={characterName}
            className="character-card-avatar"
          />
        ) : (
          <div className="avatar-neutral-fallback small" aria-hidden="true">
            <span>{getInitials(character)}</span>
          </div>
        )}
      </div>
      <div className="character-card-content">
        <h4>{characterName}</h4>
        <p className="character-card-role">{character.role || character.description || "Şüpheli"}</p>
        <button
          type="button"
          className="ds-btn ds-btn-secondary ds-btn-sm character-card-btn"
          onClick={() => onInterrogate(character.id)}
          disabled={!canInterrogate}
        >
          <MessageSquareIcon size={13} />
          <span>{canInterrogate ? "Sorgula" : "Oturum Gerekli"}</span>
        </button>
      </div>
    </div>
  );
}
