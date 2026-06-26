function initMap() {
  const taichung = { lat: 24.143171, lng: 120.663268 };

  const map = new google.maps.Map(document.getElementById("map"), {
    center: taichung,
    zoom: 14,
    mapId: "DEMO_MAP_ID"
  });

  new google.maps.Marker({
    position: taichung,
    map: map,
    title: "國立臺灣美術館"
  });
}

window.initMap = initMap;
