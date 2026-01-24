export function getCharacterName(character) {
  return `${character?.name || ""} ${character?.surname || ""}`.trim();
}

export function formatCharacterName(character) {
  return getCharacterName(character);
}

export function getInitials(name) {
  if (!name) return "?";
  const fullName = typeof name === 'string' ? name : getCharacterName(name);
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
