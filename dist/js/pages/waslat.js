import { requireAuth, isLead } from "../auth.js";
import {
  waslatApi,
  poemsApi,
  currentApi,
  poetsApi,
  maqamatApi
} from "../api.js";
import { showToast, showConfirm, showLoading, showEmpty } from "../ui.js";
import {
  escapeHtml,
  debounce,
  getMaqamColor,
  getPoemMaqamName,
  getPoemPoetName,
  CATEGORY_LABELS,
  buildPoemCard,
  promiseAllSettled
} from "../utils.js";
if (!requireAuth()) throw new Error("Not authenticated");
let waslat = [];
let selectedWaslaId = null;
const poetNameById = /* @__PURE__ */ new Map();
const maqamNameById = /* @__PURE__ */ new Map();
const shouldOpenCurrentWasla = new URLSearchParams(window.location.search).get("openCurrent") === "1";
function getNameFromMap(map, id) {
  if (id === null || id === void 0 || id === "") return "";
  return map.get(String(id)) || "";
}
function extractId(value) {
  var _a, _b;
  if (value === null || value === void 0) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") return (_b = (_a = value.id) != null ? _a : value.value) != null ? _b : null;
  return null;
}
function getItemPoemId(item) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  return (_i = (_h = (_f = (_d = (_b = (_a = item == null ? void 0 : item.poemId) != null ? _a : item == null ? void 0 : item.poemID) != null ? _b : item == null ? void 0 : item.poem_id) != null ? _d : (_c = item == null ? void 0 : item.poem) == null ? void 0 : _c.id) != null ? _f : (_e = item == null ? void 0 : item.poem) == null ? void 0 : _e.poemId) != null ? _h : (_g = item == null ? void 0 : item.poem) == null ? void 0 : _g.poem_id) != null ? _i : null;
}
async function enrichWaslaItems(items) {
  if (!items.length) return items;
  const enriched = await Promise.all(
    items.map(async (item) => {
      var _a, _b, _c, _d;
      const poemId = getItemPoemId(item);
      if (!poemId) return item;
      const existingPoet = getPoemPoetName({
        poetName: (item == null ? void 0 : item.poemPoetName) || (item == null ? void 0 : item.poetName) || ((_a = item == null ? void 0 : item.poem) == null ? void 0 : _a.poetName),
        poet: (item == null ? void 0 : item.poemPoet) || (item == null ? void 0 : item.poet) || ((_b = item == null ? void 0 : item.poem) == null ? void 0 : _b.poet)
      });
      const existingMaqam = getPoemMaqamName({
        maqamName: (item == null ? void 0 : item.poemMaqamName) || (item == null ? void 0 : item.maqamName) || ((_c = item == null ? void 0 : item.poem) == null ? void 0 : _c.maqamName),
        maqam: (item == null ? void 0 : item.poemMaqam) || (item == null ? void 0 : item.maqam) || ((_d = item == null ? void 0 : item.poem) == null ? void 0 : _d.maqam)
      });
      if (existingPoet && existingMaqam) return item;
      try {
        const poem = await poemsApi.getById(poemId);
        return {
          ...item,
          poem,
          poemTitle: (item == null ? void 0 : item.poemTitle) || poem.title,
          poemCategory: (item == null ? void 0 : item.poemCategory) || poem.category,
          poemPoetName: (item == null ? void 0 : item.poemPoetName) || poem.poetName,
          poemPoetId: (item == null ? void 0 : item.poemPoetId) || poem.poetId,
          poemMaqamName: (item == null ? void 0 : item.poemMaqamName) || poem.maqamName,
          poemMaqamId: (item == null ? void 0 : item.poemMaqamId) || poem.maqamId,
          poet: (item == null ? void 0 : item.poet) || poem.poet,
          maqam: (item == null ? void 0 : item.maqam) || poem.maqam
        };
      } catch {
        return item;
      }
    })
  );
  return enriched;
}
document.addEventListener("DOMContentLoaded", async () => {
  var _a;
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  (_a = document.getElementById("createWaslaBtn")) == null ? void 0 : _a.addEventListener("click", () => showCreateWaslaModal());
  await promiseAllSettled([loadPoets(), loadMaqamat()]);
  await loadWaslat();
  if (shouldOpenCurrentWasla) {
    await openCurrentWaslaFromQuery();
  }
});
async function openCurrentWaslaFromQuery() {
  var _a;
  clearOpenCurrentWaslaQueryParam();
  try {
    const state = await currentApi.getWasla();
    const currentWaslaId = (_a = state == null ? void 0 : state.wasla) == null ? void 0 : _a.id;
    if (!currentWaslaId) {
      showToast("\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0629 \u062D\u0627\u0644\u064A\u0629 \u0627\u0644\u0622\u0646", "info");
      return;
    }
    await openWaslaDetail(currentWaslaId);
  } catch {
    showToast("\u062A\u0639\u0630\u0631 \u0641\u062A\u062D \u0627\u0644\u0648\u0635\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", "error");
  }
}
function clearOpenCurrentWaslaQueryParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("openCurrent")) return;
  url.searchParams.delete("openCurrent");
  const nextUrl = "".concat(url.pathname).concat(url.search).concat(url.hash);
  window.history.replaceState({}, "", nextUrl);
}
async function loadPoets() {
  try {
    const poets = await poetsApi.getAll();
    poetNameById.clear();
    poets.forEach((p) => {
      const name = p.nameAr || p.nameEn || p.name || "";
      if (p.id !== null && p.id !== void 0 && name) {
        poetNameById.set(String(p.id), name);
      }
    });
  } catch {
  }
}
async function loadMaqamat() {
  try {
    const maqamat = await maqamatApi.getAll();
    maqamNameById.clear();
    maqamat.forEach((m) => {
      const name = m.nameAr || m.nameEn || m.name || "";
      if (m.id !== null && m.id !== void 0 && name) {
        maqamNameById.set(String(m.id), name);
      }
    });
  } catch {
  }
}
async function loadWaslat() {
  const container = document.getElementById("waslatContainer");
  if (!container) return;
  showLoading("waslatContainer", "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0627\u062A...");
  try {
    const result = await waslatApi.getAll();
    waslat = (result == null ? void 0 : result.items) || result || [];
    if (!waslat.length) {
      showEmpty(
        "waslatContainer",
        "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0628\u0639\u062F. \u0623\u0646\u0634\u0626 \u0648\u0635\u0644\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649!",
        "queue_music"
      );
      return;
    }
    renderWaslat(waslat);
  } catch (err) {
    container.innerHTML = '<div class="text-center py-12 text-red-400">'.concat(escapeHtml(err.message), "</div>");
  }
}
function renderWaslat(list) {
  const container = document.getElementById("waslatContainer");
  if (!container) return;
  container.innerHTML = list.map((w) => buildWaslaCard(w)).join("");
  container.querySelectorAll(".wasla-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openWaslaDetail(card.dataset.id);
    });
  });
  if (isLead()) {
    container.querySelectorAll(".share-wasla-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await currentApi.shareWasla(btn.dataset.id);
          showToast("\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0648\u0635\u0644\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
    container.querySelectorAll(".delete-wasla-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
          '\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 "'.concat(btn.dataset.name, '"\u061F'),
          "\u062D\u0630\u0641 \u0627\u0644\u0648\u0635\u0644\u0629"
        );
        if (!confirmed) return;
        try {
          await waslatApi.delete(btn.dataset.id);
          showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0648\u0635\u0644\u0629", "success");
          loadWaslat();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  }
}
function buildWaslaCard(w) {
  const lead = isLead();
  return '\n    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all\n      duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden wasla-card border border-white/5"\n      data-id="'.concat(w.id, '">\n      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent\n        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>\n      <div class="flex items-center gap-5">\n        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0\n          border border-primary/20 group-hover:bg-primary/20 transition-colors">\n          <span class="material-symbols-outlined text-primary-light text-3xl group-hover:scale-110 transition-transform">queue_music</span>\n        </div>\n        <div class="flex-1 min-w-0">\n          <div class="flex items-center gap-2 mb-1">\n             <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#9db8b6] text-[10px] font-bold uppercase tracking-wider">\n               \u0648\u0635\u0644\u0629 \u0625\u0646\u0634\u0627\u062F\u064A\u0629\n             </span>\n          </div>\n          <h3 class="text-white font-bold text-xl md:text-2xl truncate group-hover:text-primary-light transition-colors">\n            ').concat(escapeHtml(w.name), '\n          </h3>\n          <div class="flex items-center gap-4 mt-2">\n            <span class="flex items-center gap-1.5 text-[#9db8b6] text-sm">\n              <span class="material-symbols-outlined text-base opacity-70">auto_stories</span>\n              ').concat(w.itemCount || 0, " \u0642\u0635\u0627\u0626\u062F\n            </span>\n            ").concat(w.description ? '\n              <span class="flex items-center gap-1.5 text-[#9db8b6] text-sm truncate max-w-[200px]">\n                <span class="material-symbols-outlined text-base opacity-70">info</span>\n                '.concat(escapeHtml(w.description), "\n              </span>") : "", '\n          </div>\n        </div>\n        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">\n          ').concat(lead ? '\n            <button class="share-wasla-btn p-2.5 rounded-xl text-[#9db8b6] hover:text-primary-light\n              hover:bg-primary/10 transition-all" title="\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639"\n              data-id="'.concat(w.id, '" data-name="').concat(escapeHtml(w.name), '">\n              <span class="material-symbols-outlined text-xl">podcasts</span>\n            </button>\n            <button class="delete-wasla-btn p-2.5 rounded-xl text-[#9db8b6] hover:text-red-400\n              hover:bg-red-400/10 transition-all" title="\u062D\u0630\u0641"\n              data-id="').concat(w.id, '" data-name="').concat(escapeHtml(w.name), '">\n              <span class="material-symbols-outlined text-xl">delete</span>\n            </button>') : "", '\n          <div class="p-2.5 rounded-xl text-primary-light">\n            <span class="material-symbols-outlined rotate-180 text-2xl">arrow_right_alt</span>\n          </div>\n        </div>\n      </div>\n    </article>');
}
async function openWaslaDetail(waslaId) {
  selectedWaslaId = waslaId;
  const modal = document.getElementById("waslaDetailModal");
  const detailContainer = document.getElementById("waslaDetailContainer");
  if (!modal || !detailContainer) return;
  modal.classList.remove("hidden");
  showLoading("waslaDetailContainer", "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0629...");
  try {
    const wasla = await waslatApi.getById(waslaId);
    const items = await enrichWaslaItems(wasla.items || []);
    renderWaslaDetail({ ...wasla, items }, detailContainer);
  } catch (err) {
    detailContainer.innerHTML = '<div class="text-red-400 p-4">'.concat(escapeHtml(err.message), "</div>");
  }
  const closeBtn = document.getElementById("closeWaslaModal");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.add("hidden");
      selectedWaslaId = null;
    };
  }
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      selectedWaslaId = null;
    }
  };
}
function renderWaslaDetail(wasla, container) {
  var _a;
  const lead = isLead();
  const items = wasla.items || [];
  container.innerHTML = '\n    <div class="flex items-center justify-between mb-6">\n      <div>\n        <h2 class="text-white text-2xl font-bold font-serif">'.concat(escapeHtml(wasla.name), '</h2>\n        <p class="text-[#9db8b6] text-sm mt-1">').concat(items.length, " \u0642\u0635\u064A\u062F\u0629</p>\n      </div>\n      ").concat(lead ? '\n        <button id="addToPoemWaslaBtn" class="flex items-center gap-2 px-4 py-2 rounded-xl\n          bg-primary/20 border border-primary/30 text-primary-light hover:bg-primary/30 transition-all\n          text-sm font-bold">\n          <span class="material-symbols-outlined text-lg">playlist_add</span>\n          \u0625\u0636\u0627\u0641\u0629 \u0642\u0635\u064A\u062F\u0629\n        </button>' : "", '\n    </div>\n\n    <div id="waslaItemsList" class="flex flex-col gap-2">\n      ').concat(items.length ? items.map((item) => {
    var _a2, _b, _c, _d, _e;
    const poemId = getItemPoemId(item);
    const poemData = {
      id: poemId,
      title: (item == null ? void 0 : item.poemTitle) || ((_a2 = item == null ? void 0 : item.poem) == null ? void 0 : _a2.title) || "",
      category: (item == null ? void 0 : item.poemCategory) || (item == null ? void 0 : item.category) || ((_b = item == null ? void 0 : item.poem) == null ? void 0 : _b.category) || "",
      poetName: (item == null ? void 0 : item.poemPoetName) || ((_c = item == null ? void 0 : item.poem) == null ? void 0 : _c.poetName) || ((_d = item == null ? void 0 : item.poem) == null ? void 0 : _d.poet) || "",
      maqamName: (item == null ? void 0 : item.poemMaqamName) || (item == null ? void 0 : item.maqamName) || ((_e = item == null ? void 0 : item.poem) == null ? void 0 : _e.maqamName) || ""
    };
    return buildPoemCard(poemData, {
      showDelete: lead,
      viewMode: "list",
      basePath: "../pages/"
    });
  }).join("") : '<div class="text-center py-8 text-[#9db8b6]">\n            <span class="material-symbols-outlined text-4xl mb-2">queue_music</span>\n            <p>\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0648\u0635\u0644\u0629 \u0628\u0639\u062F</p>\n          </div>', "\n    </div>");
  if (lead) {
    (_a = container.querySelector("#addToPoemWaslaBtn")) == null ? void 0 : _a.addEventListener("click", () => {
      showAddPoemToWaslaModal(wasla.id);
    });
    container.querySelectorAll(".delete-poem-btn").forEach((btn, idx) => {
      const item = items[idx];
      btn.title = "\u062D\u0630\u0641 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629";
      btn.querySelector(".material-symbols-outlined").textContent = "remove_circle";
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
          "\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629\u061F"
        );
        if (!confirmed) return;
        try {
          await waslatApi.removeItem(wasla.id, item.id);
          showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0648\u0635\u0644\u0629", "success");
          const updated = await waslatApi.getById(wasla.id);
          const enriched = await enrichWaslaItems(updated.items || []);
          renderWaslaDetail({ ...updated, items: enriched }, container);
          loadWaslat();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  }
  container.querySelectorAll("article[data-id]").forEach((article) => {
    article.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      window.location.href = "view-poem.html?id=".concat(article.dataset.id);
    });
  });
}
async function showAddPoemToWaslaModal(waslaId) {
  var _a;
  const modal = document.getElementById("addPoemModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  const searchInput = modal.querySelector("#poemSearchInput");
  const resultsContainer = modal.querySelector("#poemSearchResults");
  let searchTimeout;
  const doSearch = async (q) => {
    if (!resultsContainer) return;
    showLoading("poemSearchResults");
    try {
      const result = await poemsApi.getAll({ query: q, pageSize: 10 });
      const items = (result == null ? void 0 : result.items) || result || [];
      if (!items.length) {
        showEmpty("poemSearchResults", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C", "search_off");
        return;
      }
      resultsContainer.innerHTML = items.map(
        (p) => '\n        <button class="add-to-wasla-item w-full flex items-center gap-3 p-3 rounded-xl\n          hover:bg-white/10 transition-all text-right border border-transparent\n          hover:border-primary/20" data-id="'.concat(p.id, '" data-title="').concat(escapeHtml(p.title), '">\n          <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">\n            <span class="material-symbols-outlined text-primary-light">book</span>\n          </div>\n          <div class="flex-1 min-w-0">\n            <p class="text-white font-medium truncate">').concat(escapeHtml(p.title), '</p>\n            <p class="text-[#9db8b6] text-xs">').concat(escapeHtml(p.poetName || ""), '</p>\n          </div>\n          <span class="material-symbols-outlined text-primary-light text-lg">add</span>\n        </button>')
      ).join("");
      resultsContainer.querySelectorAll(".add-to-wasla-item").forEach((btn) => {
        btn.addEventListener("click", async () => {
          try {
            await waslatApi.addItem(waslaId, { poemId: btn.dataset.id });
            showToast('\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 "'.concat(btn.dataset.title, '" \u0644\u0644\u0648\u0635\u0644\u0629'), "success");
            modal.classList.add("hidden");
            const updated = await waslatApi.getById(selectedWaslaId);
            const items2 = await enrichWaslaItems(updated.items || []);
            const detailContainer = document.getElementById(
              "waslaDetailContainer"
            );
            if (detailContainer)
              renderWaslaDetail({ ...updated, items: items2 }, detailContainer);
            loadWaslat();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
    } catch (err) {
      if (resultsContainer)
        resultsContainer.innerHTML = '<div class="text-red-400 p-4">'.concat(escapeHtml(err.message), "</div>");
    }
  };
  searchInput == null ? void 0 : searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => doSearch(searchInput.value.trim()), 300);
  });
  doSearch("");
  (_a = modal.querySelector("#closeAddPoemModal")) == null ? void 0 : _a.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}
function showCreateWaslaModal() {
  var _a;
  const modal = document.getElementById("createWaslaModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  const form = modal.querySelector("#createWaslaForm");
  form == null ? void 0 : form.addEventListener(
    "submit",
    async (e) => {
      var _a2, _b;
      e.preventDefault();
      const name = (_a2 = modal.querySelector("#waslaName")) == null ? void 0 : _a2.value.trim();
      const desc = (_b = modal.querySelector("#waslaDesc")) == null ? void 0 : _b.value.trim();
      if (!name) {
        showToast("\u0627\u0633\u0645 \u0627\u0644\u0648\u0635\u0644\u0629 \u0645\u0637\u0644\u0648\u0628", "error");
        return;
      }
      try {
        await waslatApi.create({ name, description: desc || null });
        showToast("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0648\u0635\u0644\u0629 \u0628\u0646\u062C\u0627\u062D", "success");
        modal.classList.add("hidden");
        loadWaslat();
      } catch (err) {
        showToast(err.message, "error");
      }
    },
    { once: true }
  );
  (_a = modal.querySelector("#closeCreateWaslaModal")) == null ? void 0 : _a.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}
