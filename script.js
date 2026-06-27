let map;
let Place;
let AdvancedMarkerElement;
let markers = [];

async function initMap() {
  const taichung = { lat: 24.143171, lng: 120.663268 };

  const { Map } = await google.maps.importLibrary("maps");
  const markerLibrary = await google.maps.importLibrary("marker");
  const placesLibrary = await google.maps.importLibrary("places");

  AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  Place = placesLibrary.Place;

  map = new Map(document.getElementById("map"), {
    center: taichung,
    zoom: 14
  });

  const defaultMarker = new AdvancedMarkerElement({
    map,
    position: taichung,
    title: "國立臺灣美術館"
  });

  markers.push(defaultMarker);

  setupSearch();
  showInfo("新版搜尋模組已載入。請輸入景點名稱。");
}

function setupSearch() {
  const input = document.getElementById("placeInput");
  const button = document.getElementById("addPlaceBtn");

  if (!input || !button) {
    showInfo("找不到搜尋框或加入按鈕。請檢查 index.html。");
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

async function searchPlace(query) {
  const keyword = query.trim();

  if (!keyword) {
    showInfo("請先輸入景點名稱。");
    return;
  }

  showInfo("正在搜尋：「" + keyword + "」...");

  try {
    const { places } = await Place.searchByText({
      textQuery: keyword,
      fields: ["displayName", "formattedAddress", "location", "rating", "id"],
      maxResultCount: 1
    });

    if (!places || places.length === 0) {
      showInfo("找不到景點，請換一個關鍵字。");
      return;
    }

    addPlace(places[0]);
  } catch (error) {
    console.error(error);
    showInfo("搜尋失敗：" + (error.message || String(error)));
  }
}

function addPlace(place) {
  if (!place.location) {
    showInfo("這個景點沒有座標資料。");
    return;
  }

  const location = place.location;

  map.setCenter(location);
  map.setZoom(15);

  const marker = new AdvancedMarkerElement({
    map,
    position: location,
    title: place.displayName
  });

  markers.push(marker);

  const placeList = document.getElementById("placeList");

  const card = document.createElement("div");
  card.className = "place-card";
  card.innerHTML = `
    <strong>${place.displayName || "未命名景點"}</strong>
    <small>${place.formattedAddress || "未提供地址"}</small>
  `;

  placeList.appendChild(card);

  showInfo(`
    <p><strong>名稱：</strong>${place.displayName || "未命名景點"}</p>
    <p><strong>地址：</strong>${place.formattedAddress || "未提供地址"}</p>
    <p><strong>評分：</strong>${place.rating || "尚無評分"}</p>
    <p><strong>Place ID：</strong>${place.id || "未提供"}</p>
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
