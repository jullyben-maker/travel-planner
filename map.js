const DEFAULT_PLACE = "國立臺灣美術館";

function updateMap(placeName) {
  const mapFrame = document.getElementById("mapFrame");
  const encodedPlace = encodeURIComponent(placeName || DEFAULT_PLACE);

  mapFrame.src = `https://www.google.com/maps?q=${encodedPlace}&output=embed`;
}

function resetMap() {
  updateMap(DEFAULT_PLACE);
}
