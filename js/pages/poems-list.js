// Poems list page logic for ديوان الصوفية
import { requireAuth, isLead } from "../auth.js";
import {
  poemsApi,
  poetsApi,
  maqamatApi,
  currentApi,
  waslatApi,
} from "../api.js";
import { showToast, showLoading, showEmpty, showConfirm } from "../ui.js";
import {
  debounce,
  escapeHtml,
  getMaqamColor,
  getPoemMaqamName,
  getPoemPoetName,
  normalizeArabic,
  CATEGORY_LABELS,
  HADRA_SECTION_LABELS,
} from "../utils.js";

if (!requireAuth()) throw new Error("Not authenticated");

let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let filters = {
  q: "",
  poetId: "",
  maqamId: "",
  category: "",
  hadraSection: "",
};
const poetNameById = new Map();
const maqamNameById = new Map();
let selectedPoemId = null;
let bookmarkedPoemIds = new Set();
let poemsRequestController = null;
let waslatOptionsRequestController = null;
const POEMS_DB_NAME = "divan-poems-cache";
const POEMS_STORE_NAME = "poems";
const POEMS_CACHE_HYDRATED_KEY = "divan_poems_cache_hydrated_v1";
const POEMS_HYDRATE_PAGE_SIZE = 200;
const POEMS_HYDRATE_MAX_PAGES = 500;
let poemsDbPromise = null;
let poemsCacheLoaded = false;
let poemsCache = [];
const HADRA_SECTION_ALIASES = {
  Opening: "Matali",
  Main: "Qiyam",
  Closing: "Ruku",
  Matali: "Matali",
  Qiyam: "Qiyam",
  Ruku: "Ruku",
  matali: "Matali",
  qiyam: "Qiyam",
  ruku: "Ruku",
};

function getNameFromMap(map, id) {
  if (id === null || id === undefined || id === "") return "";
  return map.get(String(id)) || "";
}

function extractId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") return value.id ?? value.value ?? null;
  return null;
}

function extractHadraSectionValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    return (
      value.code ||
      value.key ||
      value.value ||
      value.name ||
      value.label ||
      value.title ||
      ""
    )
      .toString()
      .trim();
  }
  return String(value).trim();
}

function getHadraSectionLabel(poem) {
  const raw =
    poem?.hadraSection ??
    poem?.hadra_section ??
    poem?.hadraSectionName ??
    poem?.hadraSectionLabel ??
    poem?.hadraSectionText ??
    poem?.section ??
    "";
  const value = extractHadraSectionValue(raw);
  if (!value) return "";

  const normalized =
    HADRA_SECTION_ALIASES[value] ||
    HADRA_SECTION_ALIASES[value.toLowerCase()] ||
    value;
  return HADRA_SECTION_LABELS[normalized] || value;
}

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openPoemsDb() {
  if (!canUseIndexedDb()) return Promise.resolve(null);
  if (poemsDbPromise) return poemsDbPromise;

  poemsDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(POEMS_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(POEMS_STORE_NAME)) {
        db.createObjectStore(POEMS_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("تعذر فتح قاعدة IndexedDB"));
  }).catch((err) => {
    console.warn("IndexedDB unavailable:", err);
    poemsDbPromise = null;
    return null;
  });

  return poemsDbPromise;
}

function getPoemCacheKey(poemId) {
  if (poemId === null || poemId === undefined || poemId === "") return null;
  if (typeof poemId === "number") return poemId;

  const value = String(poemId).trim();
  if (!value) return null;

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && String(numeric) === value) return numeric;
  return value;
}

async function readCachedPoemsFromDb() {
  const db = await openPoemsDb();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(POEMS_STORE_NAME, "readonly");
    const store = tx.objectStore(POEMS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () =>
      resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () =>
      reject(request.error || new Error("تعذر قراءة القصائد من IndexedDB"));
  });
}

async function upsertCachedPoemsInDb(poems) {
  if (!Array.isArray(poems) || !poems.length) return;

  const db = await openPoemsDb();
  if (!db) return;

  await new Promise((resolve, reject) => {
    const tx = db.transaction(POEMS_STORE_NAME, "readwrite");
    const store = tx.objectStore(POEMS_STORE_NAME);

    poems.forEach((poem) => {
      if (!poem || poem.id === null || poem.id === undefined) return;
      store.put(poem);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("تعذر حفظ القصائد في IndexedDB"));
    tx.onabort = () =>
      reject(tx.error || new Error("تم إلغاء حفظ القصائد في IndexedDB"));
  });
}

async function deleteCachedPoemFromDb(poemId) {
  const key = getPoemCacheKey(poemId);
  if (key === null) return;

  const db = await openPoemsDb();
  if (!db) return;

  await new Promise((resolve, reject) => {
    const tx = db.transaction(POEMS_STORE_NAME, "readwrite");
    const store = tx.objectStore(POEMS_STORE_NAME);
    store.delete(key);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("تعذر تحديث IndexedDB"));
    tx.onabort = () =>
      reject(tx.error || new Error("تم إلغاء تحديث IndexedDB"));
  });
}

async function ensurePoemsCacheLoaded() {
  if (poemsCacheLoaded) return poemsCache;

  try {
    poemsCache = await readCachedPoemsFromDb();
  } catch (err) {
    console.warn("Could not load poems cache:", err);
    poemsCache = [];
  }

  poemsCacheLoaded = true;
  return poemsCache;
}

function mergePoemsInMemory(poems) {
  if (!Array.isArray(poems) || !poems.length) return;

  const byId = new Map(
    poemsCache
      .filter((poem) => poem && poem.id !== null && poem.id !== undefined)
      .map((poem) => [String(poem.id), poem]),
  );

  poems.forEach((poem) => {
    if (!poem || poem.id === null || poem.id === undefined) return;
    byId.set(String(poem.id), poem);
  });

  poemsCache = Array.from(byId.values());
  poemsCacheLoaded = true;
}

function normalizePoemsResponse(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

function isPoemsCacheHydrated() {
  try {
    return localStorage.getItem(POEMS_CACHE_HYDRATED_KEY) === "1";
  } catch {
    return false;
  }
}

function markPoemsCacheHydrated() {
  try {
    localStorage.setItem(POEMS_CACHE_HYDRATED_KEY, "1");
  } catch {}
}

function getPoemPoetId(poem) {
  return poem?.poetId ?? poem?.poetID ?? poem?.poet_id ?? extractId(poem?.poet);
}

function getPoemMaqamId(poem) {
  return (
    poem?.maqamId ?? poem?.maqamID ?? poem?.maqam_id ?? extractId(poem?.maqam)
  );
}

function getPoemCategoryCode(poem) {
  return String(
    poem?.category ?? poem?.poemCategory ?? poem?.categoryCode ?? "",
  ).trim();
}

function getPoemHadraSectionCode(poem) {
  const raw =
    poem?.hadraSection ??
    poem?.hadra_section ??
    poem?.hadraSectionName ??
    poem?.hadraSectionLabel ??
    poem?.hadraSectionText ??
    poem?.section ??
    "";
  const value = extractHadraSectionValue(raw);
  if (!value) return "";

  return (
    HADRA_SECTION_ALIASES[value] ||
    HADRA_SECTION_ALIASES[value.toLowerCase()] ||
    value
  );
}

function normalizeSearchText(text) {
  return normalizeArabic(String(text || "")).toLowerCase();
}

function poemMatchesFilters(poem, activeFilters) {
  const selectedPoetId = String(activeFilters.poetId || "");
  if (selectedPoetId) {
    const poemPoetId = String(getPoemPoetId(poem) || "");
    if (poemPoetId !== selectedPoetId) return false;
  }

  const selectedMaqamId = String(activeFilters.maqamId || "");
  if (selectedMaqamId) {
    const poemMaqamId = String(getPoemMaqamId(poem) || "");
    if (poemMaqamId !== selectedMaqamId) return false;
  }

  const selectedCategory = String(activeFilters.category || "").toLowerCase();
  if (selectedCategory) {
    const poemCategory = getPoemCategoryCode(poem).toLowerCase();
    if (poemCategory !== selectedCategory) return false;
  }

  if (selectedCategory === "hadra") {
    const selectedHadraSection = String(
      activeFilters.hadraSection || "",
    ).toLowerCase();
    if (selectedHadraSection) {
      const poemHadraSection = getPoemHadraSectionCode(poem).toLowerCase();
      if (poemHadraSection !== selectedHadraSection) return false;
    }
  }

  const query = normalizeSearchText(activeFilters.q || "");
  if (!query) return true;

  const poemPoetName =
    getPoemPoetName(poem) || getNameFromMap(poetNameById, getPoemPoetId(poem));
  const poemMaqamName =
    getPoemMaqamName(poem) ||
    getNameFromMap(maqamNameById, getPoemMaqamId(poem));

  const searchableText = normalizeSearchText(
    [
      poem?.title,
      poem?.body,
      poem?.content,
      poemPoetName,
      poemMaqamName,
      getPoemCategoryCode(poem),
      getPoemHadraSectionCode(poem),
    ].join(" "),
  );

  return searchableText.includes(query);
}

function filterPoemsLocally(poems, activeFilters) {
  if (!Array.isArray(poems) || !poems.length) return [];
  return poems.filter((poem) => poemMatchesFilters(poem, activeFilters));
}

function toPoemsQueryParams(activeFilters) {
  return {
    query: activeFilters.q || undefined,
    poetId: activeFilters.poetId || undefined,
    maqamId: activeFilters.maqamId || undefined,
    category: activeFilters.category || undefined,
    hadraSection:
      activeFilters.category === "Hadra"
        ? activeFilters.hadraSection || undefined
        : undefined,
  };
}

function paginatePoems(filteredPoems) {
  const total = filteredPoems.length;
  totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const items = filteredPoems.slice(start, start + pageSize);
  return { total, items };
}

function renderPoemsFromFilteredList(filteredPoems) {
  const container = document.getElementById("poemsContainer");
  if (!container) return;

  const { total, items } = paginatePoems(filteredPoems);

  const countEl = document.getElementById("poemsCount");
  if (countEl) countEl.textContent = `${total} قصيدة`;

  if (!items.length) {
    showEmpty("poemsContainer", "لا توجد قصائد تطابق البحث", "search_off");
    renderPagination();
    return;
  }

  container.innerHTML = items.map((poem) => buildPoemCard(poem)).join("");
  syncBookmarkButtons(container);
  renderPagination();
}

async function fetchAndCachePoems(params, signal) {
  const result = await poemsApi.getAll(params, { signal });
  const fetchedPoems = normalizePoemsResponse(result);
  if (!fetchedPoems.length) return [];

  mergePoemsInMemory(fetchedPoems);

  try {
    await upsertCachedPoemsInDb(fetchedPoems);
  } catch (err) {
    console.warn("Could not persist poems cache:", err);
  }

  return fetchedPoems;
}

async function hydrateAllPoemsCache(signal) {
  const collected = new Map();
  let page = 1;
  let fetchedPages = 0;
  let hasMore = true;

  while (hasMore && fetchedPages < POEMS_HYDRATE_MAX_PAGES) {
    const result = await poemsApi.getAll(
      {
        page,
        pageSize: POEMS_HYDRATE_PAGE_SIZE,
      },
      { signal },
    );

    const pagePoems = normalizePoemsResponse(result);
    pagePoems.forEach((poem) => {
      if (!poem || poem.id === null || poem.id === undefined) return;
      collected.set(String(poem.id), poem);
    });

    fetchedPages += 1;

    if (Array.isArray(result) || !Array.isArray(result?.items)) {
      hasMore = false;
      break;
    }

    const declaredTotalPages = Number(result.totalPages || 0);
    const declaredTotalCount = Number(result.totalCount || 0);

    if (declaredTotalPages > 0) {
      hasMore = page < declaredTotalPages;
      page += 1;
      continue;
    }

    if (declaredTotalCount > 0) {
      const computedTotalPages = Math.ceil(
        declaredTotalCount / POEMS_HYDRATE_PAGE_SIZE,
      );
      hasMore = page < computedTotalPages;
      page += 1;
      continue;
    }

    hasMore = pagePoems.length >= POEMS_HYDRATE_PAGE_SIZE;
    page += 1;
  }

  const allPoems = Array.from(collected.values());
  poemsCache = allPoems;
  poemsCacheLoaded = true;

  try {
    await upsertCachedPoemsInDb(allPoems);
  } catch (err) {
    console.warn("Could not persist hydrated poems cache:", err);
  }

  markPoemsCacheHydrated();
  return allPoems;
}

async function removePoemFromLocalCache(poemId) {
  const normalizedId = String(poemId || "").trim();
  if (!normalizedId) return;

  poemsCache = poemsCache.filter(
    (poem) => String(poem?.id ?? "") !== normalizedId,
  );
  poemsCacheLoaded = true;

  try {
    await deleteCachedPoemFromDb(poemId);
  } catch (err) {
    console.warn("Could not update poems cache:", err);
  }
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

  const sectionLabel =
    (filters.hadraSection &&
      (HADRA_SECTION_LABELS[filters.hadraSection] || filters.hadraSection)) ||
    "";
  if (labelEl) {
    labelEl.textContent = sectionLabel ? `حضرة - ${sectionLabel}` : "حضرة";
  }

  document.querySelectorAll("[data-hadra-section]").forEach((option) => {
    const section = option.dataset.hadraSection || "";
    const isActive =
      isHadra && (filters.hadraSection || "") === (section || "");
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
  if (isLead()) {
    document
      .querySelectorAll(".lead-only")
      .forEach((el) => el.classList.remove("hidden"));
  }

  setupAddToWaslaModal();
  setupHadraDropdown();
  hydrateBookmarks();
  setupPoemsContainerEvents();
  setupPaginationEvents();

  // Load filters data
  await Promise.allSettled([loadPoets(), loadMaqamat()]);

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  filters.q = params.get("q") || "";
  filters.category = params.get("category") || "";
  filters.hadraSection = params.get("hadraSection") || "";
  if (filters.category !== "Hadra") {
    filters.hadraSection = "";
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput && filters.q) searchInput.value = filters.q;

  // Search
  searchInput?.addEventListener(
    "input",
    debounce(() => {
      filters.q = searchInput.value.trim();
      currentPage = 1;
      loadPoems();
    }, 400),
  );

  document.getElementById("searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    filters.q = searchInput?.value.trim() || "";
    currentPage = 1;
    loadPoems();
  });

  // Filters
  document.getElementById("maqamFilter")?.addEventListener("change", (e) => {
    filters.maqamId = e.target.value;
    currentPage = 1;
    loadPoems();
  });

  document.getElementById("poetFilter")?.addEventListener("change", (e) => {
    filters.poetId = e.target.value;
    currentPage = 1;
    loadPoems();
  });

  // Category buttons
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      const nextCategory = filters.category === cat ? "" : cat;
      setCategory(nextCategory, "");
    });
  });

  // Add poem button
  document.getElementById("addPoemBtn")?.addEventListener("click", () => {
    window.location.href = "add-poem.html";
  });

  syncCategoryUI();
  syncHadraDropdownUI();
  await loadPoems();
});

async function loadPoets() {
  const select = document.getElementById("poetFilter");
  if (!select) return;
  try {
    const poets = await poetsApi.getAll();
    poetNameById.clear();
    poets.forEach((p) => {
      const name = p.nameAr || p.nameEn || p.name || "";
      if (p.id !== null && p.id !== undefined && name) {
        poetNameById.set(String(p.id), name);
      }
    });
    select.innerHTML =
      `<option value="">جميع الشعراء</option>` +
      poets
        .map(
          (p) =>
            `<option value="${p.id}">${escapeHtml(p.nameAr || p.nameEn || p.name || "")}</option>`,
        )
        .join("");
  } catch {}
}

async function loadMaqamat() {
  const select = document.getElementById("maqamFilter");
  if (!select) return;
  try {
    const maqamat = await maqamatApi.getAll();
    maqamNameById.clear();
    maqamat.forEach((m) => {
      const name = m.nameAr || m.nameEn || m.name || "";
      if (m.id !== null && m.id !== undefined && name) {
        maqamNameById.set(String(m.id), name);
      }
    });
    select.innerHTML =
      `<option value="">جميع المقامات</option>` +
      maqamat
        .map(
          (m) =>
            `<option value="${m.id}">${escapeHtml(m.nameAr || m.nameEn || m.name || "")}</option>`,
        )
        .join("");
  } catch {}
}

async function loadPoems() {
  const container = document.getElementById("poemsContainer");
  if (!container) return;

  const requestController = new AbortController();
  if (poemsRequestController) poemsRequestController.abort();
  poemsRequestController = requestController;

  showLoading("poemsContainer", "جاري تحميل القصائد...");

  try {
    let localPoems = await ensurePoemsCacheLoaded();
    if (poemsRequestController !== requestController) return;

    if (!localPoems.length || !isPoemsCacheHydrated()) {
      await hydrateAllPoemsCache(requestController.signal);
      if (poemsRequestController !== requestController) return;
      localPoems = poemsCache;
    }

    let filteredPoems = filterPoemsLocally(localPoems, filters);
    const hasActiveFilters = Boolean(
      filters.q ||
      filters.poetId ||
      filters.maqamId ||
      filters.category ||
      (filters.category === "Hadra" && filters.hadraSection),
    );

    if (!filteredPoems.length && (hasActiveFilters || !localPoems.length)) {
      try {
        await fetchAndCachePoems(
          toPoemsQueryParams(filters),
          requestController.signal,
        );
      } catch (err) {
        if (err?.name === "AbortError") throw err;
        if (!localPoems.length) throw err;
      }

      if (poemsRequestController !== requestController) return;
      filteredPoems = filterPoemsLocally(poemsCache, filters);
    }

    renderPoemsFromFilteredList(filteredPoems);
  } catch (err) {
    if (err?.name === "AbortError") return;
    if (poemsRequestController !== requestController) return;
    container.innerHTML = `<div class="text-center py-12 text-red-400">${escapeHtml(err.message)}</div>`;
  } finally {
    if (poemsRequestController === requestController) {
      poemsRequestController = null;
    }
  }
}

function buildPoemCard(poem) {
  let maqamName = getPoemMaqamName(poem);
  if (!maqamName) {
    const maqamId =
      poem?.maqamId ??
      poem?.maqamID ??
      poem?.maqam_id ??
      extractId(poem?.maqam);
    maqamName = getNameFromMap(maqamNameById, maqamId);
  }

  let poetName = getPoemPoetName(poem);
  if (!poetName) {
    const poetId =
      poem?.poetId ?? poem?.poetID ?? poem?.poet_id ?? extractId(poem?.poet);
    poetName = getNameFromMap(poetNameById, poetId);
  }
  const maqamColor = maqamName
    ? getMaqamColor(maqamName)
    : {
        bg: "rgba(10,87,80,0.3)",
        border: "rgba(21,140,130,0.4)",
        text: "#4ecdc4",
      };
  const categoryLabel = CATEGORY_LABELS[poem.category] || poem.category || "";
  const hadraSectionLabel = getHadraSectionLabel(poem);
  const isHadra = String(poem.category || "").toLowerCase() === "hadra";
  const lead = isLead();

  return `
    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all
      duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
      data-id="${poem.id}">
      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            ${
              maqamName
                ? `
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
                style="background:${maqamColor.bg};border:1px solid ${maqamColor.border};color:${maqamColor.text};">
                <span class="w-1.5 h-1.5 rounded-full" style="background:${maqamColor.text};"></span>
                مقام ${escapeHtml(maqamName)}
              </span>`
                : ""
            }
            ${
              categoryLabel
                ? `
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5
                border border-white/10 text-[#9db8b6] text-xs">${escapeHtml(categoryLabel)}</span>`
                : ""
            }
            ${
              isHadra && hadraSectionLabel
                ? `
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5
                border border-white/10 text-[#c9a5ea] text-xs">${escapeHtml(hadraSectionLabel)}</span>`
                : ""
            }
          </div>
          <h3 class="text-white text-xl md:text-2xl font-serif font-bold leading-normal
            group-hover:text-primary-light transition-colors">
            ${escapeHtml(poem.title)}
          </h3>
          ${
            poetName
              ? `
            <p class="text-[#9db8b6] text-sm font-medium flex items-center gap-2 mt-1">
              <span class="material-symbols-outlined text-base opacity-70">edit</span>
              ${escapeHtml(poetName)}
            </p>`
              : ""
          }
        </div>
        <div class="flex flex-col items-center gap-2 shrink-0">
          <button class="bookmark-btn text-[#9db8b6] hover:text-yellow-400 hover:bg-white/5
            p-2 rounded-full transition-all" title="إشارة مرجعية" data-id="${poem.id}">
            <span class="material-symbols-outlined">bookmark</span>
          </button>
          ${
            lead
              ? `
            <button class="delete-poem-btn text-[#9db8b6] hover:text-red-400 hover:bg-white/5
              p-2 rounded-full transition-all" title="حذف" data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
              <span class="material-symbols-outlined">delete</span>
            </button>`
              : ""
          }
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center
        justify-between text-xs text-[#6b8c89] gap-3">
        <div class="flex items-center gap-3">
          ${
            lead
              ? `
            <button class="share-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
              <span class="material-symbols-outlined text-lg">podcasts</span>
              <span class="font-medium">عرض للجميع</span>
            </button>
            <button class="add-to-wasla-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
              <span class="material-symbols-outlined text-lg">playlist_add</span>
              <span class="font-medium">إضافة للوصلة</span>
            </button>
            <button class="edit-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}">
              <span class="material-symbols-outlined text-lg">edit</span>
              <span class="font-medium">تعديل</span>
            </button>`
              : ""
          }
        </div>
        <a href="view-poem.html?id=${poem.id}"
          class="flex items-center gap-1 text-primary-light font-bold hover:underline">
          اقرأ القصيدة
          <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>
        </a>
      </div>
    </article>`;
}

function hydrateBookmarks() {
  const stored = JSON.parse(localStorage.getItem("divan_bookmarks") || "[]");
  bookmarkedPoemIds = new Set(stored.map((id) => String(id)));
}

function syncBookmarkButtons(container) {
  container.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const poemId = String(btn.dataset.id || "");
    const isSaved = bookmarkedPoemIds.has(poemId);
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = isSaved ? "bookmark" : "bookmark_border";
    btn.style.color = isSaved ? "#d4b068" : "";
  });
}

function setupPoemsContainerEvents() {
  const container = document.getElementById("poemsContainer");
  if (!container || container.dataset.eventsBound === "1") return;
  container.dataset.eventsBound = "1";

  container.addEventListener("click", async (e) => {
    const bookmarkBtn = e.target.closest(".bookmark-btn");
    if (bookmarkBtn) {
      e.stopPropagation();
      const poemId = String(bookmarkBtn.dataset.id || "");
      if (!poemId) return;

      const icon = bookmarkBtn.querySelector(".material-symbols-outlined");
      if (bookmarkedPoemIds.has(poemId)) {
        bookmarkedPoemIds.delete(poemId);
        if (icon) icon.textContent = "bookmark_border";
        bookmarkBtn.style.color = "";
        showToast("تم إزالة القصيدة من الإشارات المرجعية", "info");
      } else {
        bookmarkedPoemIds.add(poemId);
        if (icon) icon.textContent = "bookmark";
        bookmarkBtn.style.color = "#d4b068";
        showToast("تم حفظ القصيدة في الإشارات المرجعية", "success");
      }

      localStorage.setItem(
        "divan_bookmarks",
        JSON.stringify(Array.from(bookmarkedPoemIds)),
      );
      return;
    }

    const shareBtn = e.target.closest(".share-poem-btn");
    if (shareBtn) {
      e.stopPropagation();
      try {
        await currentApi.sharePoem(shareBtn.dataset.id);
        showToast(`تم مشاركة "${shareBtn.dataset.title}" مع الجميع`, "success");
      } catch (err) {
        showToast(err.message, "error");
      }
      return;
    }

    const addBtn = e.target.closest(".add-to-wasla-btn");
    if (addBtn) {
      e.stopPropagation();
      openAddToWaslaModal(addBtn.dataset.id, addBtn.dataset.title);
      return;
    }

    const editBtn = e.target.closest(".edit-poem-btn");
    if (editBtn) {
      e.stopPropagation();
      window.location.href = `add-poem.html?id=${editBtn.dataset.id}`;
      return;
    }

    const deleteBtn = e.target.closest(".delete-poem-btn");
    if (deleteBtn) {
      e.stopPropagation();
      const confirmed = await showConfirm(
        `هل أنت متأكد من حذف "${deleteBtn.dataset.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        "حذف القصيدة",
      );
      if (!confirmed) return;
      try {
        await poemsApi.delete(deleteBtn.dataset.id);
        await removePoemFromLocalCache(deleteBtn.dataset.id);
        showToast("تم حذف القصيدة بنجاح", "success");
        loadPoems();
      } catch (err) {
        showToast(err.message, "error");
      }
      return;
    }

    const article = e.target.closest("article[data-id]");
    if (!article || !container.contains(article)) return;
    if (e.target.closest("a")) return;
    window.location.href = `view-poem.html?id=${article.dataset.id}`;
  });
}

function setupPaginationEvents() {
  const container = document.getElementById("pagination");
  if (!container || container.dataset.eventsBound === "1") return;
  container.dataset.eventsBound = "1";

  container.addEventListener("click", (e) => {
    const pageBtn = e.target.closest("[data-page]");
    if (pageBtn) {
      const page = Number.parseInt(pageBtn.dataset.page, 10);
      if (!Number.isNaN(page) && page !== currentPage) {
        currentPage = page;
        loadPoems();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (e.target.closest("#prevPage")) {
      if (currentPage > 1) {
        currentPage--;
        loadPoems();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (e.target.closest("#nextPage") && currentPage < totalPages) {
      currentPage++;
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

function setupAddToWaslaModal() {
  const modal = document.getElementById("addToWaslaModal");
  if (!modal) return;

  document
    .getElementById("closeAddToWaslaModal")
    ?.addEventListener("click", closeAddToWaslaModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddToWaslaModal();
  });

  document
    .getElementById("confirmAddToWaslaBtn")
    ?.addEventListener("click", async () => {
      const select = document.getElementById("waslaSelect");
      const waslaId = select?.value;
      if (!selectedPoemId) {
        showToast("اختر قصيدة أولاً", "warning");
        return;
      }
      if (!waslaId) {
        showToast("يرجى اختيار الوصلة", "warning");
        return;
      }
      try {
        await waslatApi.addItem(waslaId, { poemId: selectedPoemId });
        showToast("تمت إضافة القصيدة للوصلة", "success");
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
    titleEl.textContent = poemTitle ? `القصيدة: ${poemTitle}` : "";
  }
  modal.classList.remove("hidden");
  loadWaslatOptions();
}

function closeAddToWaslaModal() {
  const modal = document.getElementById("addToWaslaModal");
  if (!modal) return;
  if (waslatOptionsRequestController) {
    waslatOptionsRequestController.abort();
    waslatOptionsRequestController = null;
  }
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
  select.innerHTML = `<option value="">جاري التحميل...</option>`;
  if (hint) hint.textContent = "";

  const requestController = new AbortController();
  if (waslatOptionsRequestController) waslatOptionsRequestController.abort();
  waslatOptionsRequestController = requestController;

  try {
    const result = await waslatApi.getAll(undefined, {
      signal: requestController.signal,
    });
    if (waslatOptionsRequestController !== requestController) return;

    const items = result?.items || result || [];
    if (!items.length) {
      select.innerHTML = `<option value="">لا توجد وصلات</option>`;
      if (hint) hint.textContent = "لا توجد وصلات بعد";
      return;
    }

    select.innerHTML =
      `<option value="">اختر الوصلة...</option>` +
      items
        .map((w) => `<option value="${w.id}">${escapeHtml(w.name)}</option>`)
        .join("");
    select.disabled = false;
    if (confirmBtn) confirmBtn.disabled = false;
  } catch (err) {
    if (err?.name === "AbortError") return;
    if (waslatOptionsRequestController !== requestController) return;
    select.innerHTML = `<option value="">تعذر تحميل الوصلات</option>`;
    if (hint) hint.textContent = err.message || "تعذر تحميل الوصلات";
  } finally {
    if (waslatOptionsRequestController === requestController) {
      waslatOptionsRequestController = null;
    }
  }
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const pages = [];
  const maxVisiblePages = 7;

  const pageButton = (page) => `
      <button data-page="${page}" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${
          page === currentPage
            ? "bg-primary text-white"
            : "bg-white/5 text-[#9db8b6] hover:bg-white/10 hover:text-white"
        }">
        ${page}
      </button>`;

  const ellipsis =
    '<span class="px-2 py-1.5 text-[#6b8c89] text-sm select-none">...</span>';

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    pages.push(pageButton(1));
    if (startPage > 2) pages.push(ellipsis);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(pageButton(i));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push(ellipsis);
    pages.push(pageButton(totalPages));
  }

  container.innerHTML = `
    <div class="flex items-center gap-2 flex-wrap justify-center">
      <button id="prevPage" class="px-3 py-1.5 rounded-lg bg-white/5 text-[#9db8b6]
        hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-30 disabled:pointer-events-none"
        ${currentPage === 1 ? "disabled" : ""}>
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
      ${pages.join("")}
      <button id="nextPage" class="px-3 py-1.5 rounded-lg bg-white/5 text-[#9db8b6]
        hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-30 disabled:pointer-events-none"
        ${currentPage === totalPages ? "disabled" : ""}>
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>
    </div>`;
}
