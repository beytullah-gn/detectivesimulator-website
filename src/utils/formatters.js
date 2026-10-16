export function getCharacterName(character) {
  if (!character) return "";
  const name = character.name || "";
  const surname = character.surname || "";
  return `${name} ${surname}`.trim() || character.title || "Şüpheli";
}

export function formatCharacterName(character) {
  return getCharacterName(character);
}

export function getInitials(name) {
  if (!name) return "DS";
  const fullName = typeof name === "string" ? name : getCharacterName(name);
  const parts = fullName.split(" ").filter(Boolean).slice(0, 2);
  if (!parts.length) return "DS";
  return parts
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function formatDifficulty(difficulty) {
  const labels = {
    easy: "Kolay",
    normal: "Orta",
    hard: "Zor",
  };
  return labels[difficulty] || "Standart";
}

export function formatDuration(minutes) {
  return minutes ? `${minutes} dk` : "Esnek süre";
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}
