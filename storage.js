const STORAGE_KEY = "travelPlannerPlaces";

function savePlacesToStorage(places) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function loadPlacesFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const places = JSON.parse(saved);

    if (!Array.isArray(places)) {
      return [];
    }

    return places.filter((place) => typeof place === "string" && place.trim() !== "");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function clearPlacesStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
