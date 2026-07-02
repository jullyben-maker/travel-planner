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
let activePlaceId = null;

function createPlaceData(name) {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    name: name,
    duration: 60,
    note: ""
  };
}

function updateMap(placeName) {
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
}

function getPlacesFromCards() {
  return [...document.querySelectorAll(".place-card")].map((card) => {
    return {
      id: card.dataset.id,
      name: card.dataset.name,
      duration: Number(card.dataset.duration) || 60,
      note: card.dataset.note || ""
    };
  });
}

function savePlaces() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPlacesFromCards()));
}

function loadPlacesFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return createPlaceData(item);
        }

        return {
          id: item.id || Date.now().toString() + Math.random().toString(16).slice(2),
          name: item.name || "未命名景點",
          duration: Number(item.duration) || 60,
          note: item.note || ""
        };
      })
      .filter((item) => item.name.trim() !== "");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function createPlaceCard(place) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.draggable = true;
  card.dataset.id = place.id;
  card.dataset.name = place.name;
  card.dataset.duration = place.duration;
  card.dataset.note = place.note;

  card.innerHTML = `
    <div class="place-header">
      <div class="place-title">
        <strong>${place.name}</strong>
        <small>停留 ${place.duration} 分鐘</small>
        <div class="note-preview">${place.note ? "備註：" + place.note : "尚無備註"}</div>
      </div>
      <button class="delete-btn" type="button">×</button>
    </div>

    <div class="place-editor">
      <label>停留時間（分鐘）</label>
      <input class="duration-input" type="number" min="15" step="15" value="${place.duration}" />

      <label>備註</label>
      <textarea class="note-input" placeholder="例如：想拍照、吃午餐、買伴手禮">${place.note}</textarea>

      <button class="save-btn" type="button">儲存設定</button>
    </div>
  `;

  card.querySelector(".place-header").addEventListener("click", () => {
    setActivePlace(place.id);
  });

  card.querySelector(".delete-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    deletePlace(card);
  });

  card.querySelector(".save-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    saveCardSettings(card);
  });

  return card;
}

function addPlace(placeName) {
  const name = placeName.trim();

  if (!name) {
    alert("請先輸入景點名稱。");
    return;
  }

  const place = createPlaceData(name);
  const card = createPlaceCard(place);

  placeList.appendChild(card);
  placeInput.value = "";

  setActivePlace(place.id);
  updateSchedule();
  savePlaces();
}

function saveCardSettings(card) {
  const durationInput = card.querySelector(".duration-input");
  const noteInput = card.querySelector(".note-input");

  const duration = Math.max(15, Number(durationInput.value) || 60);
  const note = noteInput.value.trim();

  card.dataset.duration = duration;
  card.dataset.note = note;

  card.querySelector(".place-title small").textContent = `停留 ${duration} 分鐘`;
  card.querySelector(".note-preview").textContent = note ? `備註：${note}` : "尚無備註";

  updateInfo(card.dataset.name, duration, note);
  updateSchedule();
  savePlaces();
}

function deletePlace(card) {
  const deletedId = card.dataset.id;
  card.remove();

  const remaining = [...document.querySelectorAll(".place-card")];

  if (remaining.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    resetEmptyState();
    return;
  }

  if (activePlaceId === deletedId) {
    setActivePlace(remaining[0].dataset.id);
  }

  updateSchedule();
  savePlaces();
}

function clearAllPlaces() {
  if (document.querySelectorAll(".place-card").length === 0) return;

  if (!confirm("確定要清空全部景點嗎？")) return;

  placeList.innerHTML = "";
  localStorage.removeItem(STORAGE_KEY);
  resetEmptyState();
}

function setActivePlace(placeId) {
  activePlaceId = placeId;

  document.querySelectorAll(".place-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.id === placeId);
  });

  const activeCard = document.querySelector(`.place-card[data-id="${placeId}"]`);

  if (!activeCard) return;

  updateMap(activeCard.dataset.name);
  updateInfo(
    activeCard.dataset.name,
    Number(activeCard.dataset.duration) || 60,
    activeCard.dataset.note || ""
  );
}

function updateInfo(name, duration, note) {
  placeInfo.innerHTML = `
    <p><strong>景點名稱：</strong>${name}</p>
    <p><strong>停留時間：</strong>${duration} 分鐘</p>
    <p><strong>備註：</strong>${note || "尚無備註"}</p>
    <p><strong>目前版本：</strong>v1.4 停留時間與備註版。</p>
  `;
}

function updateSchedule() {
  const places = getPlacesFromCards();
  schedule.innerHTML = "";

  if (places.length === 0) {
    schedule.innerHTML = "<p>尚未加入景點。</p>";
    return;
  }

  let currentMinutes = 9 * 60;

  places.forEach((place, index) => {
    const startHour = Math.floor(currentMinutes / 60);
    const startMinute = currentMinutes % 60;
    const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;

    const item = document.createElement("div");
    item.className = "route-item";
    item.innerHTML = `
      <strong>${startTime}　${place.name}</strong><br>
      <small>停留 ${place.duration} 分鐘</small>
      ${place.note ? `<div class="note-preview">備註：${place.note}</div>` : ""}
    `;

    schedule.appendChild(item);

    currentMinutes += place.duration;
  });
}

function resetEmptyState() {
  activePlaceId = null;
  updateMap(DEFAULT_PLACE);
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

  places.forEach((place) => {
    placeList.appendChild(createPlaceCard(place));
  });

  setActivePlace(places[0].id);
  updateSchedule();
  savePlaces();
}

addPlaceBtn.addEventListener("click", () => {
  addPlace(placeInput.value);
});

clearAllBtn.addEventListener("click", clearAllPlaces);

placeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addPlace(placeInput.value);
  }
});

placeList.addEventListener("dragstart", (event) => {
  draggedCard = event.target.closest(".place-card");
  if (draggedCard) draggedCard.classList.add("dragging");
});

placeList.addEventListener("dragover", (event) => {
  event.preventDefault();

  const target = event.target.closest(".place-card");
  if (!target || target === draggedCard) return;

  const rect = target.getBoundingClientRect();
  const insertAfter = event.clientY > rect.top + rect.height / 2;

  placeList.insertBefore(
    draggedCard,
    insertAfter ? target.nextSibling : target
  );

  updateSchedule();
});

placeList.addEventListener("dragend", () => {
  if (draggedCard) draggedCard.classList.remove("dragging");

  draggedCard = null;
  updateSchedule();
  savePlaces();
});

loadInitialPlaces();
