let map;
let geocoder;
let markers = [];

function initMap() {
  const taichung = { lat: 24.143171, lng: 120.663268 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: taichung,
    zoom: 14
  });

  geocoder = new google.maps.Geocoder();

  const defaultMarker = new google.maps.Marker({
    map: map,
    position: taichung,
    title: "國立臺灣美術館"
  });

  markers.push(defaultMarker);

  setupSearch();
  showInfo("地點搜尋已載入。請輸入景點名稱。");
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
    showInfo("請先輸入景點名稱。");
    return;
  }

  showInfo("正在搜尋：「" + keyword + "」...");

  geocoder.geocode(
    {
      address: keyword,
      region: "TW",
      language: "zh-TW"
    },
    function(results, status) {
      if (status !== "OK" || !results || results.length === 0) {
        showInfo("搜尋失敗，狀態：" + status);
        return;
      }

      const result = results[0];
      addPlace(result);
    }
  );
}

function addPlace(result) {
  const location = result.geometry.location;

  map.setCenter(location);
  map.setZoom(16);

  const marker = new google.maps.Marker({
    map: map,
    position: location,
    title: result.formatted_address
  });

  markers.push(marker);

  const placeName =
    result.address_components && result.address_components.length > 0
      ? result.address_components[0].long_name
      : result.formatted_address;

  const placeList = document.getElementById("placeList");

  const card = document.createElement("div");
  card.className = "place-card";
  card.innerHTML = `
    <strong>${placeName}</strong>
    <small>${result.formatted_address || "未提供地址"}</small>
  `;

  placeList.appendChild(card);

  showInfo(`
    <p><strong>名稱：</strong>${placeName}</p>
    <p><strong>地址：</strong>${result.formatted_address || "未提供地址"}</p>
    <p><strong>Place ID：</strong>${result.place_id || "未提供"}</p>
    <p><strong>目前狀態：</strong>已用 Geocoder 搜尋成功，評分功能下一階段再處理。</p>
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
