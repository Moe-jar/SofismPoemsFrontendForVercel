import { requireAuth, isLead } from "../auth.js";
import { currentApi } from "../api.js";
import { showToast, showEmpty } from "../ui.js";
import { escapeHtml } from "../utils.js";
import { startPolling, stopPolling, on } from "../signalr.js";
if (!requireAuth()) throw new Error("Not authenticated");
let lastWaslaId = null;
let unsubscribeWaslaUpdates = () => {
};
document.addEventListener("DOMContentLoaded", async () => {
  var _a;
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  (_a = document.getElementById("backBtn")) == null ? void 0 : _a.addEventListener("click", () => history.back());
  await loadCurrentWasla();
  unsubscribeWaslaUpdates = on("currentWaslaUpdated", (state) => {
    var _a2;
    if (((_a2 = state == null ? void 0 : state.wasla) == null ? void 0 : _a2.id) !== lastWaslaId) loadCurrentWasla();
  });
  startPolling(null, () => currentApi.getWasla());
});
function cleanupLiveUpdates() {
  unsubscribeWaslaUpdates();
  unsubscribeWaslaUpdates = () => {
  };
  stopPolling();
}
window.addEventListener("pagehide", cleanupLiveUpdates);
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  unsubscribeWaslaUpdates = on("currentWaslaUpdated", (state) => {
    var _a;
    if (((_a = state == null ? void 0 : state.wasla) == null ? void 0 : _a.id) !== lastWaslaId) loadCurrentWasla();
  });
  startPolling(null, () => currentApi.getWasla());
});
async function loadCurrentWasla() {
  const container = document.getElementById("waslaContainer");
  const noWasla = document.getElementById("noWaslaMessage");
  try {
    const state = await currentApi.getWasla();
    if (!(state == null ? void 0 : state.wasla)) {
      if (container) container.classList.add("hidden");
      if (noWasla) noWasla.classList.remove("hidden");
      return;
    }
    if (noWasla) noWasla.classList.add("hidden");
    if (container) container.classList.remove("hidden");
    if (state.wasla.id !== lastWaslaId) {
      lastWaslaId = state.wasla.id;
      renderWasla(state);
    }
  } catch (err) {
    console.warn("Could not load current wasla:", err.message);
  }
}
function renderWasla(state) {
  const wasla = state.wasla;
  const items = wasla.items || [];
  const nameEl = document.getElementById("waslaName");
  const sharedByEl = document.getElementById("sharedBy");
  const itemsListEl = document.getElementById("waslaItemsList");
  const countEl = document.getElementById("waslaItemCount");
  if (nameEl) nameEl.textContent = wasla.name || "";
  if (sharedByEl) sharedByEl.textContent = state.sharedByName || "";
  if (countEl) countEl.textContent = "".concat(items.length, " \u0642\u0635\u064A\u062F\u0629");
  const isEnglish = document.documentElement.getAttribute("lang") === "en";
  document.title = isEnglish ? "Current Wasla: ".concat(wasla.name, " - Sufi Diwan") : "\u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ".concat(wasla.name, " - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629");
  if (!itemsListEl) return;
  if (!items.length) {
    showEmpty("waslaItemsList", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0648\u0635\u0644\u0629", "queue_music");
    return;
  }
  itemsListEl.innerHTML = items.map((item, idx) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const poemId = (_i = (_h = (_f = (_d = (_b = (_a = item == null ? void 0 : item.poemId) != null ? _a : item == null ? void 0 : item.poemID) != null ? _b : item == null ? void 0 : item.poem_id) != null ? _d : (_c = item == null ? void 0 : item.poem) == null ? void 0 : _c.id) != null ? _f : (_e = item == null ? void 0 : item.poem) == null ? void 0 : _e.poemId) != null ? _h : (_g = item == null ? void 0 : item.poem) == null ? void 0 : _g.poem_id) != null ? _i : null;
    const href = poemId ? "view-poem.html?id=".concat(poemId) : "#";
    const disabled = poemId ? "" : "pointer-events-none opacity-60";
    return '\n      <a href="'.concat(href, '"\n        class="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-white/10\n          transition-all group cursor-pointer ').concat(disabled, '">\n        <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0\n          text-primary-light font-bold border border-primary/30">\n          ').concat(idx + 1, '\n        </div>\n        <div class="flex-1 min-w-0">\n          <h4 class="text-white font-serif font-bold text-lg group-hover:text-primary-light\n            transition-colors truncate">').concat(escapeHtml(item.poemTitle || ""), '</h4>\n          <p class="text-[#9db8b6] text-sm truncate">').concat(escapeHtml(item.poemPoetName || ""), '</p>\n        </div>\n        <span class="material-symbols-outlined text-[#9db8b6] group-hover:text-white\n          transition-colors rotate-180">chevron_right</span>\n      </a>');
  }).join("");
}
