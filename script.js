const placeInput = document.getElementById("placeInput");
const addPlaceBtn = document.getElementById("addPlaceBtn");
const placeList = document.getElementById("placeList");
const mapFrame = document.getElementById("mapFrame");
const schedule = document.getElementById("schedule");
const placeInfo = document.getElementById("placeInfo");

let draggedCard = null;

function updateMap(query) {
  const encodedQuery = encodeURIComponent(query);
  mapFrame.src = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
}

function addPlace(name) {
  const placeName = name.trim();

  if (!placeName) {
    alert("請先輸入景點名稱。");
    return;
  }

  const card = document.createElement("div");
  card.className = "place-card";
  card.draggable = true;
  card.innerHTML = `
    <strong>${placeName}</strong>
    <small>點擊可在地圖查看位置；拖曳可調整順序</small>
  `;

  card.addEventListener("click", () => {
    updateMap(placeName);
    updateInfo(placeName);
  });

  placeList.appendChild(card);
  placeInput.value = "";

  updateMap(placeName);
  updateInfo(placeName);
  updateSchedule();
}

function updateInfo(placeName) {
  placeInfo.innerHTML = `
    <p><strong>景點名稱：</strong>${placeName}</p>
    <p><strong>地圖狀態：</strong>已顯示 Google Maps 搜尋結果。</p>
    <p><strong>目前版本：</strong>v1.0 穩定版。</p>
    <p><strong>下一階段：</strong>加入交通距離與路線規劃。</p>
  `;
}

function updateSchedule() {
  const cards = [...document.querySelectorAll(".place-card")];
  schedule.innerHTML = "";

  if (cards.length === 0) {
    schedule.innerHTML = "<p>尚未加入景點。</p>";
    return;
  }

  cards.forEach((card, index) => {
    const name = card.querySelector("strong").textContent;
    const hour = 9 + index;
    const time = `${String(hour).padStart(2, "0")}:00`;

    const item = document.createElement("div");
    item.className = "route-item";
    item.innerHTML = `
      <strong>${time}　${name}</strong><br>
      <small>${index === cards.length - 1 ? "最後一站" : "前往下一站：待計算"}</small>
    `;

    schedule.appendChild(item);
  });
}

addPlaceBtn.addEventListener("click", () => {
  addPlace(placeInput.value);
});

placeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addPlace(placeInput.value);
  }
});

placeList.addEventListener("dragstart", (event) => {
  draggedCard = event.target.closest(".place-card");
  if (draggedCard) {
    draggedCard.classList.add("dragging");
  }
});

placeList.addEventListener("dragover", (event) => {
  event.preventDefault();

  const target = event.target.closest(".place-card");

  if (!target || target === draggedCard) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;

  placeList.insertBefore(
    draggedCard,
    shouldInsertAfter ? target.nextSibling : target
  );
});

placeList.addEventListener("dragend", () => {
  if (draggedCard) {
    draggedCard.classList.remove("dragging");
  }

  draggedCard = null;
  updateSchedule();
});

updateSchedule();
