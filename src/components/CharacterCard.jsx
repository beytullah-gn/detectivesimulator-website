import { buildUrl } from "../services/apiClient";
import { getCharacterName, getInitials } from "../utils/formatters";

export default function CharacterCard({ character, onInterrogate, canInterrogate }) {
  return (
    <div className="character-card">
      <div className="avatar">
        {character.avatar ? (
          <img src={buildUrl(`/assets/${character.avatar}`)} alt={getCharacterName(character)} />
        ) : (
          <span>{getInitials(character)}</span>
        )}
      </div>
      <div>
        <h4>{getCharacterName(character)}</h4>
        <p>{character.description}</p>
        <button
          type="button"
          className="ghost"
          onClick={() => onInterrogate(character.id)}
          disabled={!canInterrogate}
        >
          {canInterrogate ? "Sorguya Al" : "Önce oturum başlat"}
        </button>
      </div>
    </div>
  );
}
