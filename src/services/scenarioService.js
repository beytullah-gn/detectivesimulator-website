import { apiFetch } from "./apiClient";

export async function fetchScenarios(token) {
  return apiFetch(
    "/items/scenarios?filter[status][_eq]=published&fields=id,title,description,estimated_duration",
    { token }
  );
}

export async function fetchScenarioCharacters(scenarioId, token) {
  return apiFetch(
    `/items/characters?filter[related_scenario][_eq]=${scenarioId}&fields=id,name,surname,description,personality,alibi,behavior_during_incident,avatar`,
    { token }
  );
}

export async function fetchScenarioMedia(scenarioId, token) {
  return apiFetch(
    `/items/scenario_media?filter[related_scenario][_eq]=${scenarioId}&fields=id,type,description,file`,
    { token }
  );
}

export async function fetchScenarioRelations(scenarioId, token) {
  return apiFetch(
    `/items/relations?filter[character][related_scenario][_eq]=${scenarioId}&fields=id,relation,character.id,related_character.id,related_character.name,related_character.surname,related_character.avatar`,
    { token }
  );
}
