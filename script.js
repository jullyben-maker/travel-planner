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
  showInfo("地圖已載入，可以搜尋景點。");
}

function setupSearch() {
  const input = document.getElementById("placeInput");
  const button = document.getElementById("addPlaceBtn");

  if (!input || !button) {
    showInfo("找不到搜尋框或加入按鈕，請檢查 index.html。");
    return;
  }

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
    showInfo("請先輸入景點名稱。");
    return;
  }

  showInfo("正在搜尋：「" + keyword + "」...");

  const request = {
    query: keyword,
    fields: ["name", "geometry", "formatted_address", "rating", "place_id"]
  };

  service.findPlaceFromQuery(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      showInfo("搜尋失敗，狀態：" + status);
      return;
    }

    if (!results || !results[0]) {
      showInfo("找不到景點，請換一個關鍵字。");
      return;
    }

    const place = results[0];
    addPlace(place);
  });
}

function addPlace(place) {
  if (!place.geometry || !place.geometry.location) {
    showInfo("這個景點沒有座標資料。");
    return;
  }

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

  showInfo(`
    <p><strong>名稱：</strong>${place.name}</p>
    <p><strong>地址：</strong>${place.formatted_address || "未提供地址"}</p>
    <p><strong>評分：</strong>${place.rating || "尚無評分"}</p>
    <p><strong>Place ID：</strong>${place.place_id}</p>
  `);
}

function showInfo(message) {
  const placeInfo = document.getElementById("placeInfo");

  if (!placeInfo) {
    console.log(message);
    return;
  }

  placeInfo.innerHTML = message;
}

window.initMap = initMap;
