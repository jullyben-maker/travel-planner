const placeInput = document.getElementById("placeInput");
const addPlaceBtn = document.getElementById("addPlaceBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const placeList = document.getElementById("placeList");
const schedule = document.getElementById("schedule");
const placeInfo = document.getElementById("placeInfo");

let draggedCard = null;
let activePlace = null;

function getPlacesFromCards() {
  return [...document.querySelectorAll(".place-card")].map((card) => card.dataset.name);
}

function saveCurrentPlaces() {
  savePlacesToStorage(getPlacesFromCards());
}

function createPlaceCard(placeName) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.draggable = true;
  card.dataset.name = placeName;

  card.innerHTML = `
    <div class="place-content">
      <strong>${placeName}</strong>
      <small>點擊查看地圖；拖曳調整順序</small>
    </div>
    <button class="delete-btn" type="button" aria-label="刪除 ${placeName}">×</button>
  `;

  const content = card.querySelector(".place-content");
  const deleteButton = card.querySelector(".delete-btn");

  content.addEventListener("click", () => {
    setActivePlace(placeName);
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    deletePlace(card);
  });

  return card;
}

function addPlace(placeName) {
  const name = placeName.trim();

  if (!name) {
    alert("請先輸入景點名稱。");
    return;
  }

  const card = createPlaceCard(name);
  placeList.appendChild(card);

  placeInput.value = "";

  setActivePlace(name);
  updateSchedule();
  saveCurrentPlaces();
}

function deletePlace(card) {
  const deletedName = card.dataset.name;
  card.remove();

  const remainingPlaces = getPlacesFromCards();

  if (remainingPlaces.length === 0) {
    clearPlacesStorage();
    resetEmptyState();
    return;
  }

  if (activePlace === deletedName) {
    setActivePlace(remainingPlaces[0]);
  }

  updateSchedule();
  saveCurrentPlaces();
}

function clearAllPlaces() {
  const places = getPlacesFromCards();

  if (places.length === 0) {
    return;
  }

  const confirmed = confirm("確定要清空全部景點嗎？");

  if (!confirmed) {
    return;
  }

  placeList.innerHTML = "";
  clearPlacesStorage();
  resetEmptyState();
}

function setActivePlace(placeName) {
  activePlace = placeName;

  document.querySelectorAll(".place-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.name === placeName);
  });

  updateMap(placeName);
  updateInfo(placeName);
}

function updateInfo(placeName) {
  placeInfo.innerHTML = `
    <p><strong>景點名稱：</strong>${placeName}</p>
    <p><strong>地圖狀態：</strong>已顯示 Google Maps 搜尋結果。</p>
    <p><strong>目前版本：</strong>v1.4 RC1 程式結構重整版。</p>
    <p><strong>功能：</strong>新增、刪除、清空、拖曳排序、自動儲存。</p>
  `;
}

function updateSchedule() {
  const places = getPlacesFromCards();
  schedule.innerHTML = "";

  if (places.length === 0) {
    schedule.innerHTML = "<p>尚未加入景點。</p>";
    return;
  }

  places.forEach((name, index) => {
    const time = `${String(9 + index).padStart(2, "0")}:00`;

    const item = document.createElement("div");
    item.className = "route-item";
    item.innerHTML = `
      <strong>${time}　${name}</strong><br>
      <small>${index === places.length - 1 ? "最後一站" : "前往下一站：待計算"}</small>
    `;

    schedule.appendChild(item);
  });
}

function resetEmptyState() {
  activePlace = null;
  resetMap();
  updateSchedule();

  placeInfo.innerHTML = `
    <p>尚未加入景點。</p>
    <p><strong>提示：</strong>請在左側輸入景點名稱，建立你的行程。</p>
  `;
}

function loadInitialPlaces() {
  const places = loadPlacesFromStorage();

  if (places.length === 0) {
    resetEmptyState();
    return;
  }

  places.forEach((placeName) => {
    const card = createPlaceCard(placeName);
    placeList.appendChild(card);
  });

  setActivePlace(places[0]);
  updateSchedule();
}

addPlaceBtn.addEventListener("click", () => {
  addPlace(placeInput.value);
});

clearAllBtn.addEventListener("click", () => {
  clearAllPlaces();
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
  const insertAfter = event.clientY > rect.top + rect.height / 2;

  placeList.insertBefore(
    draggedCard,
    insertAfter ? target.nextSibling : target
  );

  updateSchedule();
});

placeList.addEventListener("dragend", () => {
  if (draggedCard) {
    draggedCard.classList.remove("dragging");
  }

  draggedCard = null;
  updateSchedule();
  saveCurrentPlaces();
});

loadInitialPlaces();
