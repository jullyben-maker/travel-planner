let map;
let service;
let markers = [];

function initMap() {
  const taichung = { lat: 24.143171, lng: 120.663268 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: taichung,
    zoom: 14
  });

  service = new google.maps.places.PlacesService(map);

  const defaultMarker = new google.maps.Marker({
    position: taichung,
    map: map,
    title: "國立臺灣美術館"
  });

  markers.push(defaultMarker);

  setupSearch();
}

function setupSearch() {
  const input = document.getElementById("placeInput");
  const button = document.getElementById("addPlaceBtn");

  button.addEventListener("click", () => {
    searchPlace(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchPlace(input.value);
    }
  });
}

function searchPlace(query) {
  const keyword = query.trim();

  if (!keyword) {
    alert("請輸入景點名稱");
    return;
  }

  const request = {
    query: keyword,
    fields: ["name", "geometry", "formatted_address", "rating", "place_id"]
  };

  service.findPlaceFromQuery(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results[0]) {
      alert("找不到景點，請換一個關鍵字");
      return;
    }

    const place = results[0];
    addPlace(place);
  });
}

function addPlace(place) {
  const location = place.geometry.location;

  map.setCenter(location);
  map.setZoom(15);

  const marker = new google.maps.Marker({
    map: map,
    position: location,
    title: place.name
  });

  markers.push(marker);

  const placeList = document.getElementById("placeList");
  const card = document.createElement("div");
  card.className = "place-card";
  card.innerHTML = `
    <strong>${place.name}</strong>
    <small>${place.formatted_address || "未提供地址"}</small>
  `;
  placeList.appendChild(card);

  const placeInfo = document.getElementById("placeInfo");
  placeInfo.innerHTML = `
    <p><strong>名稱：</strong>${place.name}</p>
    <p><strong>地址：</strong>${place.formatted_address || "未提供地址"}</p>
    <p><strong>評分：</strong>${place.rating || "尚無評分"}</p>
    <p><strong>Place ID：</strong>${place.place_id}</p>
  `;
}

window.initMap = initMap;
