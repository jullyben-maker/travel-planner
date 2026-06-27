const placeInput = document.getElementById("placeInput");
const addPlaceBtn = document.getElementById("addPlaceBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const placeList = document.getElementById("placeList");
const mapFrame = document.getElementById("mapFrame");
const schedule = document.getElementById("schedule");
const placeInfo = document.getElementById("placeInfo");

const STORAGE_KEY = "travelPlannerPlaces";
const DEFAULT_PLACE = "國立臺灣美術館";

let draggedCard = null;
let activePlace = null;

function updateMap(query) {
  const encodedQuery = encodeURIComponent(query);
  mapFrame.src = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
}

function getPlacesFromCards() {
  return [...document.querySelectorAll(".place-card")].map((card) => {
    return card.dataset.name;
  });
}

function savePlaces() {
  const places = getPlacesFromCards();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function loadPlaces() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    resetEmptyState();
    return;
  }

  try {
    const places = JSON.parse(saved);

    if (!Array.isArray(places) || places.length === 0) {
      resetEmptyState();
      return;
    }

    places.forEach((placeName) => {
      const card = createPlaceCard(placeName);
      placeList.appendChild(card);
    });

    setActivePlace(places[0]);
    updateSchedule();
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    resetEmptyState();
  }
}

function addPlace(name) {
  const placeName = name.trim();

  if (!placeName) {
    alert("請先輸入景點名稱。");
    return;
  }

  const card = createPlaceCard(placeName);
  placeList.appendChild(card);

  placeInput.value = "";

  setActivePlace(placeName);
  updateSchedule();
  savePlaces();
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

  card.addEventListener("click", () => {
    setActivePlace(placeName);
  });

  const deleteBtn = card.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    deletePlace(card);
  });

  return card;
}

function deletePlace(card) {
  const deletedName = card.dataset.name;
  card.remove();

  const remainingPlaces = getPlacesFromCards();

  if (remainingPlaces.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    resetEmptyState();
    return;
  }

  if (activePlace === deletedName) {
    setActivePlace(remainingPlaces[0]);
  }

  updateSchedule();
  savePlaces();
}

function clearAllPlaces() {
  const hasPlaces = document.querySelectorAll(".place-card").length > 0;

  if (!hasPlaces) {
    return;
  }

  const confirmed = confirm("確定要清空全部景點嗎？");

  if (!confirmed) {
    return;
  }

  placeList.innerHTML = "";
  localStorage.removeItem(STORAGE_KEY);
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

function resetEmptyState() {
  activePlace = null;
  updateMap(DEFAULT_PLACE);
  updateSchedule();

  placeInfo.innerHTML = `
    <p>尚未加入景點。</p>
    <p><strong>提示：</strong>請在左側輸入景點名稱，建立你的行程。</p>
  `;
}

function updateInfo(placeName) {
  placeInfo.innerHTML = `
    <p><strong>景點名稱：</strong>${placeName}</p>
    <p><strong>地圖狀態：</strong>已顯示 Google Maps 搜尋結果。</p>
    <p><strong>目前版本：</strong>v1.3 景點管理版。</p>
    <p><strong>新增功能：</strong>刪除景點、清空全部、目前景點高亮。</p>
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
    const name = card.dataset.name;
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
  const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;

  placeList.insertBefore(
    draggedCard,
    shouldInsertAfter ? target.nextSibling : target
  );

  updateSchedule();
});

placeList.addEventListener("dragend", () => {
  if (draggedCard) {
    draggedCard.classList.remove("dragging");
  }

  draggedCard = null;
  updateSchedule();
  savePlaces();
});

loadPlaces();
