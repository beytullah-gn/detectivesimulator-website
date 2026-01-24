import CharacterCard from "./CharacterCard";

export default function CharacterGrid({
  characters,
  onInterrogate,
  canInterrogate,
}) {
  if (!characters.length) {
    return <p>Şüpheli bulunamadı.</p>;
  }

  return (
    <div className="character-grid">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onInterrogate={onInterrogate}
          canInterrogate={canInterrogate}
        />
      ))}
    </div>
  );
}
