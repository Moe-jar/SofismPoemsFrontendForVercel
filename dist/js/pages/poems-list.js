import { requireAuth, isLead } from "../auth.js";
import {
  poemsApi,
  poetsApi,
  maqamatApi,
  currentApi,
  waslatApi
} from "../api.js";
import { showToast, showLoading, showEmpty, showConfirm } from "../ui.js";
import {
  debounce,
  escapeHtml,
  getMaqamColor,
  getPoemMaqamName,
  getPoemPoetName,
  CATEGORY_LABELS,
  HADRA_SECTION_LABELS,
  buildPoemCard
} from "../utils.js";
if (!requireAuth()) throw new Error("Not authenticated");
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let viewMode = localStorage.getItem("divan_poems_view_mode") || "card";
let filters = {
  q: "",
  poetId: "",
  maqamId: "",
  category: "",
  hadraSection: ""
};
const poetNameById = /* @__PURE__ */ new Map();
const maqamNameById = /* @__PURE__ */ new Map();
let selectedPoemId = null;
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
function extractHadraSectionValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    return (value.code || value.key || value.value || value.name || value.label || value.title || "").toString().trim();
  }
  return String(value).trim();
}
function getHadraSectionLabel(poem) {
  var _a, _b, _c, _d, _e, _f;
  const raw = (_f = (_e = (_d = (_c = (_b = (_a = poem == null ? void 0 : poem.hadraSection) != null ? _a : poem == null ? void 0 : poem.hadra_section) != null ? _b : poem == null ? void 0 : poem.hadraSectionName) != null ? _c : poem == null ? void 0 : poem.hadraSectionLabel) != null ? _d : poem == null ? void 0 : poem.hadraSectionText) != null ? _e : poem == null ? void 0 : poem.section) != null ? _f : "";
  const value = extractHadraSectionValue(raw);
  if (!value) return "";
  const aliases = {
    Opening: "Matali",
    Main: "Qiyam",
    Closing: "Ruku",
    Matali: "Matali",
    Qiyam: "Qiyam",
    Ruku: "Ruku",
    matali: "Matali",
    qiyam: "Qiyam",
    ruku: "Ruku"
  };
  const normalized = aliases[value] || aliases[value.toLowerCase()] || value;
  return HADRA_SECTION_LABELS[normalized] || value;
}
function syncCategoryUI() {
  const activeCategory = filters.category;
  document.querySelectorAll("[data-category]").forEach((btn) => {
    const isActive = activeCategory && btn.dataset.category === activeCategory;
    btn.classList.toggle("active-category", Boolean(isActive));
  });
}
function syncHadraDropdownUI() {
  const btn = document.getElementById("hadraDropdownBtn");
  const labelEl = document.getElementById("hadraDropdownLabel");
  const isHadra = filters.category === "Hadra";
  if (btn) btn.classList.toggle("active-category", isHadra);
  const sectionLabel = filters.hadraSection && (HADRA_SECTION_LABELS[filters.hadraSection] || filters.hadraSection) || "";
  if (labelEl) {
    labelEl.textContent = sectionLabel ? "\u062D\u0636\u0631\u0629 - ".concat(sectionLabel) : "\u062D\u0636\u0631\u0629";
  }
  document.querySelectorAll("[data-hadra-section]").forEach((option) => {
    const section = option.dataset.hadraSection || "";
    const isActive = isHadra && (filters.hadraSection || "") === (section || "");
    option.classList.toggle("hadra-option-active", isActive);
  });
}
function closeHadraDropdown() {
  const menu = document.getElementById("hadraDropdownMenu");
  const btn = document.getElementById("hadraDropdownBtn");
  if (menu) menu.classList.add("hidden");
  if (btn) btn.setAttribute("aria-expanded", "false");
}
function setupHadraDropdown() {
  const btn = document.getElementById("hadraDropdownBtn");
  const menu = document.getElementById("hadraDropdownMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains("hidden");
    if (isOpen) {
      closeHadraDropdown();
      return;
    }
    menu.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  });
  menu.querySelectorAll("[data-hadra-section]").forEach((option) => {
    option.addEventListener("click", () => {
      const section = option.dataset.hadraSection || "";
      setCategory("Hadra", section);
      closeHadraDropdown();
    });
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeHadraDropdown();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHadraDropdown();
  });
}
function setCategory(category, hadraSection = "") {
  filters.category = category || "";
  filters.hadraSection = filters.category === "Hadra" ? hadraSection || "" : "";
  syncCategoryUI();
  syncHadraDropdownUI();
  closeHadraDropdown();
  currentPage = 1;
  loadPoems();
}
document.addEventListener("DOMContentLoaded", async () => {
  var _a, _b, _c, _d;
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  setupAddToWaslaModal();
  setupHadraDropdown();
  await Promise.allSettled([loadPoets(), loadMaqamat()]);
  const params = new URLSearchParams(window.location.search);
  filters.q = params.get("q") || "";
  filters.category = params.get("category") || "";
  filters.hadraSection = params.get("hadraSection") || "";
  if (filters.category !== "Hadra") {
    filters.hadraSection = "";
  }
  const searchInput = document.getElementById("searchInput");
  if (searchInput && filters.q) searchInput.value = filters.q;
  searchInput == null ? void 0 : searchInput.addEventListener(
    "input",
    debounce(() => {
      filters.q = searchInput.value.trim();
      currentPage = 1;
      loadPoems();
    }, 400)
  );
  (_a = document.getElementById("searchForm")) == null ? void 0 : _a.addEventListener("submit", (e) => {
    e.preventDefault();
    filters.q = (searchInput == null ? void 0 : searchInput.value.trim()) || "";
    currentPage = 1;
    loadPoems();
  });
  (_b = document.getElementById("maqamFilter")) == null ? void 0 : _b.addEventListener("change", (e) => {
    filters.maqamId = e.target.value;
    currentPage = 1;
    loadPoems();
  });
  (_c = document.getElementById("poetFilter")) == null ? void 0 : _c.addEventListener("change", (e) => {
    filters.poetId = e.target.value;
    currentPage = 1;
    loadPoems();
  });
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      const nextCategory = filters.category === cat ? "" : cat;
      setCategory(nextCategory, "");
    });
  });
  (_d = document.getElementById("addPoemBtn")) == null ? void 0 : _d.addEventListener("click", () => {
    window.location.href = "add-poem.html";
  });
  syncCategoryUI();
  syncHadraDropdownUI();
  setupViewToggle();
  await loadPoems();
});
function setupViewToggle() {
  const gridBtn = document.getElementById("viewGridBtn");
  const listBtn = document.getElementById("viewListBtn");
  const updateBtns = () => {
    if (gridBtn) {
      gridBtn.classList.toggle("bg-primary/20", viewMode === "card");
      gridBtn.classList.toggle("text-primary-light", viewMode === "card");
    }
    if (listBtn) {
      listBtn.classList.toggle("bg-primary/20", viewMode === "list");
      listBtn.classList.toggle("text-primary-light", viewMode === "list");
    }
  };
  gridBtn == null ? void 0 : gridBtn.addEventListener("click", () => {
    if (viewMode === "card") return;
    viewMode = "card";
    localStorage.setItem("divan_poems_view_mode", "card");
    updateBtns();
    renderPoemsList();
  });
  listBtn == null ? void 0 : listBtn.addEventListener("click", () => {
    if (viewMode === "list") return;
    viewMode = "list";
    localStorage.setItem("divan_poems_view_mode", "list");
    updateBtns();
    renderPoemsList();
  });
  updateBtns();
}
async function loadPoets() {
  const select = document.getElementById("poetFilter");
  if (!select) return;
  try {
    const poets = await poetsApi.getAll();
    poetNameById.clear();
    poets.forEach((p) => {
      const name = p.nameAr || p.nameEn || p.name || "";
      if (p.id !== null && p.id !== void 0 && name) {
        poetNameById.set(String(p.id), name);
      }
    });
    select.innerHTML = '<option value="">\u062C\u0645\u064A\u0639 \u0627\u0644\u0634\u0639\u0631\u0627\u0621</option>' + poets.map(
      (p) => '<option value="'.concat(p.id, '">').concat(escapeHtml(p.nameAr || p.nameEn || p.name || ""), "</option>")
    ).join("");
  } catch {
  }
}
async function loadMaqamat() {
  const select = document.getElementById("maqamFilter");
  if (!select) return;
  try {
    const maqamat = await maqamatApi.getAll();
    maqamNameById.clear();
    maqamat.forEach((m) => {
      const name = m.nameAr || m.nameEn || m.name || "";
      if (m.id !== null && m.id !== void 0 && name) {
        maqamNameById.set(String(m.id), name);
      }
    });
    select.innerHTML = '<option value="">\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0645\u0627\u062A</option>' + maqamat.map(
      (m) => '<option value="'.concat(m.id, '">').concat(escapeHtml(m.nameAr || m.nameEn || m.name || ""), "</option>")
    ).join("");
  } catch {
  }
}
let lastPoemsResult = [];
async function loadPoems() {
  const container = document.getElementById("poemsContainer");
  if (!container) return;
  showLoading("poemsContainer", "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0642\u0635\u0627\u0626\u062F...");
  try {
    const result = await poemsApi.getAll({
      page: currentPage,
      pageSize,
      query: filters.q || void 0,
      poetId: filters.poetId || void 0,
      maqamId: filters.maqamId || void 0,
      category: filters.category || void 0,
      hadraSection: filters.category === "Hadra" ? filters.hadraSection || void 0 : void 0
    });
    lastPoemsResult = (result == null ? void 0 : result.items) || result || [];
    const total = (result == null ? void 0 : result.totalCount) || lastPoemsResult.length;
    totalPages = (result == null ? void 0 : result.totalPages) || Math.max(1, Math.ceil(total / pageSize));
    const countEl = document.getElementById("poemsCount");
    if (countEl) countEl.textContent = "".concat(total, " \u0642\u0635\u064A\u062F\u0629");
    renderPoemsList();
    renderPagination();
  } catch (err) {
    container.innerHTML = '<div class="text-center py-12 text-red-400">'.concat(escapeHtml(err.message), "</div>");
  }
}
function renderPoemsList() {
  const container = document.getElementById("poemsContainer");
  if (!container) return;
  if (!lastPoemsResult.length) {
    showEmpty("poemsContainer", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u0635\u0627\u0626\u062F \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0628\u062D\u062B", "search_off");
    return;
  }
  const lead = isLead();
  container.className = viewMode === "list" ? "flex flex-col gap-2" : "flex flex-col gap-4";
  container.innerHTML = lastPoemsResult.map(
    (poem) => buildPoemCard(poem, {
      showShare: lead,
      showAddToWasla: lead,
      showEdit: lead,
      showDelete: lead,
      searchQuery: filters.q,
      viewMode
    })
  ).join("");
  setupCardActions(container);
}
function setupCardActions(container) {
  container.querySelectorAll("article[data-id]").forEach((article) => {
    article.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      window.location.href = "view-poem.html?id=".concat(article.dataset.id);
    });
  });
  const initialBookmarks = JSON.parse(
    localStorage.getItem("divan_bookmarks") || "[]"
  );
  container.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const id = btn.dataset.id;
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon)
      icon.textContent = initialBookmarks.includes(id) ? "bookmark" : "bookmark_border";
    if (initialBookmarks.includes(id)) btn.style.color = "#d4b068";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const saved = JSON.parse(localStorage.getItem("divan_bookmarks") || "[]");
      const idx = saved.indexOf(id);
      if (idx === -1) {
        saved.push(id);
        if (icon) icon.textContent = "bookmark";
        btn.style.color = "#d4b068";
        showToast("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0641\u064A \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629", "success");
      } else {
        saved.splice(idx, 1);
        if (icon) icon.textContent = "bookmark_border";
        btn.style.color = "";
        showToast("\u062A\u0645 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629", "info");
      }
      localStorage.setItem("divan_bookmarks", JSON.stringify(saved));
    });
  });
  container.querySelectorAll(".share-poem-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await currentApi.sharePoem(btn.dataset.id);
        showToast('\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 "'.concat(btn.dataset.title, '" \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639'), "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
  container.querySelectorAll(".add-to-wasla-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddToWaslaModal(btn.dataset.id, btn.dataset.title);
    });
  });
  container.querySelectorAll(".edit-poem-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = "add-poem.html?id=".concat(btn.dataset.id);
    });
  });
  container.querySelectorAll(".delete-poem-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const confirmed = await showConfirm(
        '\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 "'.concat(btn.dataset.title, '"\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.'),
        "\u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629"
      );
      if (!confirmed) return;
      try {
        await poemsApi.delete(btn.dataset.id);
        showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D", "success");
        loadPoems();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
}
function setupAddToWaslaModal() {
  var _a, _b;
  const modal = document.getElementById("addToWaslaModal");
  if (!modal) return;
  (_a = document.getElementById("closeAddToWaslaModal")) == null ? void 0 : _a.addEventListener("click", closeAddToWaslaModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddToWaslaModal();
  });
  (_b = document.getElementById("confirmAddToWaslaBtn")) == null ? void 0 : _b.addEventListener("click", async () => {
    const select = document.getElementById("waslaSelect");
    const waslaId = select == null ? void 0 : select.value;
    if (!selectedPoemId) {
      showToast("\u0627\u062E\u062A\u0631 \u0642\u0635\u064A\u062F\u0629 \u0623\u0648\u0644\u0627\u064B", "warning");
      return;
    }
    if (!waslaId) {
      showToast("\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0648\u0635\u0644\u0629", "warning");
      return;
    }
    try {
      await waslatApi.addItem(waslaId, { poemId: selectedPoemId });
      showToast("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0644\u0644\u0648\u0635\u0644\u0629", "success");
      closeAddToWaslaModal();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
function openAddToWaslaModal(poemId, poemTitle) {
  const modal = document.getElementById("addToWaslaModal");
  if (!modal) return;
  selectedPoemId = poemId;
  const titleEl = document.getElementById("addToWaslaPoemTitle");
  if (titleEl) {
    titleEl.textContent = poemTitle ? "\u0627\u0644\u0642\u0635\u064A\u062F\u0629: ".concat(poemTitle) : "";
  }
  modal.classList.remove("hidden");
  loadWaslatOptions();
}
function closeAddToWaslaModal() {
  const modal = document.getElementById("addToWaslaModal");
  if (!modal) return;
  modal.classList.add("hidden");
  selectedPoemId = null;
}
async function loadWaslatOptions() {
  const select = document.getElementById("waslaSelect");
  const hint = document.getElementById("waslaSelectHint");
  const confirmBtn = document.getElementById("confirmAddToWaslaBtn");
  if (!select) return;
  select.disabled = true;
  if (confirmBtn) confirmBtn.disabled = true;
  select.innerHTML = '<option value="">\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...</option>';
  if (hint) hint.textContent = "";
  try {
    const result = await waslatApi.getAll();
    const items = (result == null ? void 0 : result.items) || result || [];
    if (!items.length) {
      select.innerHTML = '<option value="">\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A</option>';
      if (hint) hint.textContent = "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0628\u0639\u062F";
      return;
    }
    select.innerHTML = '<option value="">\u0627\u062E\u062A\u0631 \u0627\u0644\u0648\u0635\u0644\u0629...</option>' + items.map((w) => '<option value="'.concat(w.id, '">').concat(escapeHtml(w.name), "</option>")).join("");
    select.disabled = false;
    if (confirmBtn) confirmBtn.disabled = false;
  } catch (err) {
    select.innerHTML = '<option value="">\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0627\u062A</option>';
    if (hint) hint.textContent = err.message || "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0648\u0635\u0644\u0627\u062A";
  }
}
function renderPagination() {
  var _a, _b;
  const container = document.getElementById("pagination");
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }
  const maxVisiblePages = 10;
  const firstVisiblePage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1
    )
  );
  const lastVisiblePage = Math.min(
    totalPages,
    firstVisiblePage + maxVisiblePages - 1
  );
  const pages = [];
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pages.push('\n      <button data-page="'.concat(i, '" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all\n        ').concat(i === currentPage ? "bg-primary text-white" : "bg-white/5 text-[#9db8b6] hover:bg-white/10 hover:text-white", '">\n        ').concat(i, "\n      </button>"));
  }
  container.innerHTML = '\n    <div class="flex items-center gap-2 flex-wrap justify-center">\n      <button id="prevPage" class="px-3 py-1.5 rounded-lg bg-white/5 text-[#9db8b6]\n        hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-30 disabled:pointer-events-none"\n        aria-label="\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629"\n        '.concat(currentPage === 1 ? "disabled" : "", '>\n        <span class="material-symbols-outlined text-lg">chevron_right</span>\n      </button>\n      ').concat(pages.join(""), '\n      <button id="nextPage" class="px-3 py-1.5 rounded-lg bg-white/5 text-[#9db8b6]\n        hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-30 disabled:pointer-events-none"\n        aria-label="\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629"\n        ').concat(currentPage === totalPages ? "disabled" : "", '>\n        <span class="material-symbols-outlined text-lg">chevron_left</span>\n      </button>\n    </div>');
  container.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  (_a = container.querySelector("#prevPage")) == null ? void 0 : _a.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  (_b = container.querySelector("#nextPage")) == null ? void 0 : _b.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}
