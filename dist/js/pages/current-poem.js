import { requireAuth, isLead } from "../auth.js";
import { currentApi } from "../api.js";
import { showToast } from "../ui.js";
import { escapeHtml, getPoemMaqamName, getPoemPoetName, parseDate } from "../utils.js";
import { startPolling, stopPolling, on } from "../signalr.js";
if (!requireAuth()) throw new Error("Not authenticated");
let currentPoem = null;
let lastPoemId = null;
let unsubscribePoemUpdates = () => {
};
document.addEventListener("DOMContentLoaded", async () => {
  var _a;
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  (_a = document.getElementById("backBtn")) == null ? void 0 : _a.addEventListener("click", () => history.back());
  await loadCurrentPoem();
  unsubscribePoemUpdates = on("currentPoemUpdated", (state) => {
    var _a2;
    if (((_a2 = state == null ? void 0 : state.poem) == null ? void 0 : _a2.id) !== lastPoemId) {
      loadCurrentPoem();
    }
  });
  startPolling(() => currentApi.getPoem(), null);
});
function cleanupLiveUpdates() {
  unsubscribePoemUpdates();
  unsubscribePoemUpdates = () => {
  };
  stopPolling();
}
window.addEventListener("pagehide", cleanupLiveUpdates);
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  unsubscribePoemUpdates = on("currentPoemUpdated", (state) => {
    var _a;
    if (((_a = state == null ? void 0 : state.poem) == null ? void 0 : _a.id) !== lastPoemId) loadCurrentPoem();
  });
  startPolling(() => currentApi.getPoem(), null);
});
async function loadCurrentPoem() {
  const container = document.getElementById("poemContainer");
  const noPoem = document.getElementById("noPoemMessage");
  try {
    const state = await currentApi.getPoem();
    if (!(state == null ? void 0 : state.poem)) {
      if (container) container.classList.add("hidden");
      if (noPoem) noPoem.classList.remove("hidden");
      return;
    }
    if (noPoem) noPoem.classList.add("hidden");
    if (container) container.classList.remove("hidden");
    if (state.poem.id !== lastPoemId) {
      lastPoemId = state.poem.id;
      currentPoem = state.poem;
      renderPoem(state);
    }
  } catch (err) {
    console.warn("Could not load current poem:", err.message);
  }
}
function renderPoem(state) {
  var _a, _b, _c, _d;
  const poem = state.poem;
  const titleEl = document.getElementById("poemTitle");
  const poetEl = document.getElementById("poemPoet");
  const maqamEl = document.getElementById("poemMaqam");
  const sharedByEl = document.getElementById("sharedBy");
  const sharedAtEl = document.getElementById("sharedAt");
  const poetName = getPoemPoetName(poem);
  const maqamName = getPoemMaqamName(poem);
  if (titleEl) titleEl.textContent = poem.title || "";
  if (poetEl) poetEl.textContent = poetName || "";
  if (maqamEl) {
    maqamEl.textContent = maqamName || "";
    (_a = maqamEl.closest(".maqam-pill")) == null ? void 0 : _a.classList.toggle("hidden", !maqamName);
  }
  if (sharedByEl) sharedByEl.textContent = state.sharedByName || "";
  if (sharedAtEl && state.sharedAt) {
    const sharedAt = parseDate(state.sharedAt);
    if (sharedAt) {
      sharedAtEl.textContent = sharedAt.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }
  const bodyEl = document.getElementById("poemBody");
  const bodyText = (_b = poem.body) != null ? _b : poem.content;
  if (bodyEl && bodyText) {
    const lines = bodyText.split("\n").filter((l) => l.trim());
    const verses = [];
    for (let i = 0; i < lines.length; i += 2) {
      verses.push({
        sadr: ((_c = lines[i]) == null ? void 0 : _c.trim()) || "",
        ajuz: ((_d = lines[i + 1]) == null ? void 0 : _d.trim()) || ""
      });
    }
    bodyEl.innerHTML = verses.map(
      (v) => '\n      <div class="group flex flex-col md:flex-row items-center justify-center\n        md:justify-between md:gap-8 hover:text-white transition-colors duration-500\n        relative py-3">\n        <div class="flex-1 text-center w-full md:text-left md:pl-8">\n          <span>'.concat(escapeHtml(v.sadr), "</span>\n          ").concat(v.ajuz ? '<div class="md:hidden text-primary/40 my-1 text-sm">\u06DE</div>' : "", "\n        </div>\n        ").concat(v.ajuz ? '\n          <div class="hidden md:flex items-center justify-center w-12 opacity-30 text-[#d4b068]">\n            <span class="text-xl">\u2724</span>\n          </div>\n          <div class="flex-1 text-center w-full md:text-right md:pr-8">\n            <span>'.concat(escapeHtml(v.ajuz), "</span>\n          </div>") : "", '\n        <div class="absolute inset-0 -mx-4 rounded-xl bg-white/[0.02] opacity-0\n          group-hover:opacity-100 transition-opacity pointer-events-none"></div>\n      </div>')
    ).join("");
  }
  const readLink = document.getElementById("readPoemLink");
  if (readLink) readLink.href = "../pages/view-poem.html?id=".concat(poem.id);
  const isEnglish = document.documentElement.getAttribute("lang") === "en";
  document.title = isEnglish ? "Current Poem: ".concat(poem.title, " - Sufi Diwan") : "\u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ".concat(poem.title, " - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629");
}
