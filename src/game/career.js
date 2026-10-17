export const RANKS = [
  { min: 0, title: "Çaylak" },
  { min: 1000, title: "Memur" },
  { min: 2500, title: "Dedektif" },
  { min: 4500, title: "Başdedektif" },
  { min: 7000, title: "Komiser" },
];

export const MAX_HINTS = 3;

// Sessions finished before scoring existed have no stored score; give solved ones a minimum.
export function getSessionScore(session) {
  const score = Number(session?.score || 0);
  const stars = Number(session?.stars || 0);
  if (score > 0 || stars > 0 || !session?.is_correct) {
    return { score, stars };
  }
  return { score: 400, stars: 1 };
}

export function getRank(totalScore) {
  let index = 0;
  RANKS.forEach((rank, rankIndex) => {
    if (totalScore >= rank.min) index = rankIndex;
  });
  const current = RANKS[index];
  const next = RANKS[index + 1] || null;
  const progress = next ? (totalScore - current.min) / (next.min - current.min) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)) };
}

// Career totals count only the best result per case so replays cannot farm points.
export function summarizeCareer(sessions = []) {
  const bestByScenario = {};

  sessions
    .filter((session) => session?.status === "completed")
    .forEach((session) => {
      const scenarioId = session?.scenario?.id;
      if (!scenarioId) return;
      const result = getSessionScore(session);
      const previous = bestByScenario[scenarioId];
      if (!previous || result.score > previous.score) {
        bestByScenario[scenarioId] = { ...result, solved: Boolean(session.is_correct) };
      }
    });

  const results = Object.values(bestByScenario);
  const totalScore = results.reduce((sum, item) => sum + item.score, 0);

  return {
    totalScore,
    solvedCount: results.filter((item) => item.solved).length,
    starCount: results.reduce((sum, item) => sum + item.stars, 0),
    bestByScenario,
    rank: getRank(totalScore),
  };
}
