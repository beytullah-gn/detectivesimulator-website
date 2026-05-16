import { apiFetch } from "./apiClient";

export async function fetchScenarios(token) {
  return apiFetch(
    "/items/scenarios?filter[status][_eq]=published&fields=id,title,slug,teaser,description,estimated_duration,difficulty,popularity_score,cover_image,category.id,category.title,category.slug,category.accent_color&sort=sort,title&limit=50",
    { token }
  );
}

export async function fetchScenarioCharacters(scenarioId, token) {
  return apiFetch(
    `/items/characters?filter[related_scenario][_eq]=${scenarioId}&fields=id,name,surname,role,age,description,background,personality,alibi,question_prompts,behavior_during_incident,avatar&sort=sort,name&limit=50`,
    { token }
  );
}

export async function fetchScenarioMedia(scenarioId, token) {
  return apiFetch(
    `/items/scenario_media?filter[related_scenario][_eq]=${scenarioId}&fields=id,type,title,description,content,file&sort=sort,title&limit=50`,
    { token }
  );
}

export async function fetchScenarioRelations(scenarioId, token) {
  return apiFetch(
    `/items/relations?filter[related_scenario][_eq]=${scenarioId}&fields=id,relation,tension_level,character.id,related_character.id,related_character.name,related_character.surname,related_character.avatar&limit=100`,
    { token }
  );
}
