// Waslat (Playlists) page logic for ديوان الصوفية
import { requireAuth, isLead } from "../auth.js";
import {
  waslatApi,
  poemsApi,
  currentApi,
  poetsApi,
  maqamatApi,
} from "../api.js";
import { showToast, showConfirm, showLoading, showEmpty } from "../ui.js";
import {
  escapeHtml,
  getMaqamColor,
  getPoemMaqamName,
  getPoemPoetName,
  CATEGORY_LABELS,
} from "../utils.js";

if (!requireAuth()) throw new Error("Not authenticated");

let waslat = [];
let selectedWaslaId = null;
const poetNameById = new Map();
const maqamNameById = new Map();
const poemByIdCache = new Map();
let waslatListRequestController = null;
let poemsSearchRequestController = null;
const shouldOpenCurrentWasla =
  new URLSearchParams(window.location.search).get("openCurrent") === "1";
const addPoemModalState = {
  initialized: false,
  waslaId: null,
  searchTimeout: null,
  doSearch: null,
};
let createWaslaModalReady = false;

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

function getItemPoemId(item) {
  return (
    item?.poemId ??
    item?.poemID ??
    item?.poem_id ??
    item?.poem?.id ??
    item?.poem?.poemId ??
    item?.poem?.poem_id ??
    null
  );
}

function getPoemByIdCached(poemId) {
  const key = String(poemId);
  const cached = poemByIdCache.get(key);
  if (cached) return cached;

  const request = poemsApi.getById(poemId).catch((err) => {
    poemByIdCache.delete(key);
    throw err;
  });

  poemByIdCache.set(key, request);
  return request;
}

async function enrichWaslaItems(items) {
  if (!items.length) return items;

  const enriched = await Promise.all(
    items.map(async (item) => {
      const poemId = getItemPoemId(item);
      if (!poemId) return item;

      const existingPoet = getPoemPoetName({
        poetName: item?.poemPoetName || item?.poetName || item?.poem?.poetName,
        poet: item?.poemPoet || item?.poet || item?.poem?.poet,
      });
      const existingMaqam = getPoemMaqamName({
        maqamName:
          item?.poemMaqamName || item?.maqamName || item?.poem?.maqamName,
        maqam: item?.poemMaqam || item?.maqam || item?.poem?.maqam,
      });

      if (existingPoet && existingMaqam) return item;

      try {
        const poem = await getPoemByIdCached(poemId);
        return {
          ...item,
          poem,
          poemTitle: item?.poemTitle || poem.title,
          poemCategory: item?.poemCategory || poem.category,
          poemPoetName: item?.poemPoetName || poem.poetName,
          poemPoetId: item?.poemPoetId || poem.poetId,
          poemMaqamName: item?.poemMaqamName || poem.maqamName,
          poemMaqamId: item?.poemMaqamId || poem.maqamId,
          poet: item?.poet || poem.poet,
          maqam: item?.maqam || poem.maqam,
        };
      } catch {
        return item;
      }
    }),
  );

  return enriched;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (isLead()) {
    document
      .querySelectorAll(".lead-only")
      .forEach((el) => el.classList.remove("hidden"));
  }

  // Create wasla button
  document
    .getElementById("createWaslaBtn")
    ?.addEventListener("click", () => showCreateWaslaModal());

  setupWaslatContainerEvents();
  setupAddPoemModal();
  setupCreateWaslaModal();

  await Promise.allSettled([loadPoets(), loadMaqamat()]);

  // Load waslat list
  await loadWaslat();

  if (shouldOpenCurrentWasla) {
    await openCurrentWaslaFromQuery();
  }
});

async function openCurrentWaslaFromQuery() {
  clearOpenCurrentWaslaQueryParam();

  try {
    const state = await currentApi.getWasla();
    const currentWaslaId = state?.wasla?.id;

    if (!currentWaslaId) {
      showToast("لا توجد وصلة حالية الآن", "info");
      return;
    }

    await openWaslaDetail(currentWaslaId);
  } catch {
    showToast("تعذر فتح الوصلة الحالية", "error");
  }
}

function clearOpenCurrentWaslaQueryParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("openCurrent")) return;

  url.searchParams.delete("openCurrent");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

async function loadPoets() {
  try {
    const poets = await poetsApi.getAll();
    poetNameById.clear();
    poets.forEach((p) => {
      const name = p.nameAr || p.nameEn || p.name || "";
      if (p.id !== null && p.id !== undefined && name) {
        poetNameById.set(String(p.id), name);
      }
    });
  } catch {}
}

async function loadMaqamat() {
  try {
    const maqamat = await maqamatApi.getAll();
    maqamNameById.clear();
    maqamat.forEach((m) => {
      const name = m.nameAr || m.nameEn || m.name || "";
      if (m.id !== null && m.id !== undefined && name) {
        maqamNameById.set(String(m.id), name);
      }
    });
  } catch {}
}

function setupWaslatContainerEvents() {
  const container = document.getElementById("waslatContainer");
  if (!container || container.dataset.eventsBound === "1") return;
  container.dataset.eventsBound = "1";

  container.addEventListener("click", async (e) => {
    const shareBtn = e.target.closest(".share-wasla-btn");
    if (shareBtn) {
      e.stopPropagation();
      try {
        await currentApi.shareWasla(shareBtn.dataset.id);
        showToast("تم مشاركة الوصلة مع الجميع", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
      return;
    }

    const deleteBtn = e.target.closest(".delete-wasla-btn");
    if (deleteBtn) {
      e.stopPropagation();
      const confirmed = await showConfirm(
        `هل أنت متأكد من حذف "${deleteBtn.dataset.name}"؟`,
        "حذف الوصلة",
      );
      if (!confirmed) return;
      try {
        await waslatApi.delete(deleteBtn.dataset.id);
        showToast("تم حذف الوصلة", "success");
        loadWaslat();
      } catch (err) {
        showToast(err.message, "error");
      }
      return;
    }

    const card = e.target.closest(".wasla-card");
    if (!card || !container.contains(card)) return;
    openWaslaDetail(card.dataset.id);
  });
}

async function loadWaslat() {
  const container = document.getElementById("waslatContainer");
  if (!container) return;

  const requestController = new AbortController();
  if (waslatListRequestController) waslatListRequestController.abort();
  waslatListRequestController = requestController;

  showLoading("waslatContainer", "جاري تحميل الوصلات...");

  try {
    const result = await waslatApi.getAll(undefined, {
      signal: requestController.signal,
    });
    if (waslatListRequestController !== requestController) return;

    waslat = result?.items || result || [];
    if (!waslat.length) {
      showEmpty(
        "waslatContainer",
        "لا توجد وصلات بعد. أنشئ وصلتك الأولى!",
        "queue_music",
      );
      return;
    }
    renderWaslat(waslat);
  } catch (err) {
    if (err?.name === "AbortError") return;
    if (waslatListRequestController !== requestController) return;
    container.innerHTML = `<div class="text-center py-12 text-red-400">${escapeHtml(err.message)}</div>`;
  } finally {
    if (waslatListRequestController === requestController) {
      waslatListRequestController = null;
    }
  }
}

function renderWaslat(list) {
  const container = document.getElementById("waslatContainer");
  if (!container) return;
  container.innerHTML = list.map((w) => buildWaslaCard(w)).join("");
}

function buildWaslaCard(w) {
  const lead = isLead();
  return `
    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all
      duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden wasla-card"
      data-id="${w.id}">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0
          border border-primary/30">
          <span class="material-symbols-outlined text-primary-light text-3xl">queue_music</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-bold text-xl truncate group-hover:text-primary-light transition-colors">
            ${escapeHtml(w.name)}
          </h3>
          <p class="text-[#9db8b6] text-sm mt-1">${w.itemCount || 0} قصيدة</p>
          ${w.description ? `<p class="text-[#9db8b6] text-xs mt-1 truncate">${escapeHtml(w.description)}</p>` : ""}
        </div>
        <div class="flex flex-col gap-2 shrink-0">
          ${
            lead
              ? `
            <button class="share-wasla-btn p-2 rounded-full text-[#9db8b6] hover:text-primary-light
              hover:bg-white/5 transition-all" title="مشاركة مع الجميع"
              data-id="${w.id}" data-name="${escapeHtml(w.name)}">
              <span class="material-symbols-outlined text-lg">podcasts</span>
            </button>
            <button class="delete-wasla-btn p-2 rounded-full text-[#9db8b6] hover:text-red-400
              hover:bg-white/5 transition-all" title="حذف"
              data-id="${w.id}" data-name="${escapeHtml(w.name)}">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>`
              : ""
          }
          <button class="p-2 rounded-full text-[#9db8b6] hover:text-white
            hover:bg-white/5 transition-all">
            <span class="material-symbols-outlined rotate-180">chevron_right</span>
          </button>
        </div>
      </div>
    </article>`;
}

async function openWaslaDetail(waslaId) {
  selectedWaslaId = waslaId;
  const modal = document.getElementById("waslaDetailModal");
  const detailContainer = document.getElementById("waslaDetailContainer");
  if (!modal || !detailContainer) return;

  modal.classList.remove("hidden");
  showLoading("waslaDetailContainer", "جاري تحميل الوصلة...");

  try {
    const wasla = await waslatApi.getById(waslaId);
    const items = await enrichWaslaItems(wasla.items || []);
    renderWaslaDetail({ ...wasla, items }, detailContainer);
  } catch (err) {
    detailContainer.innerHTML = `<div class="text-red-400 p-4">${escapeHtml(err.message)}</div>`;
  }

  // Close button (use onclick to avoid accumulating listeners on repeated opens)
  const closeBtn = document.getElementById("closeWaslaModal");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.add("hidden");
      selectedWaslaId = null;
    };
  }

  // Backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      selectedWaslaId = null;
    }
  };
}

function renderWaslaDetail(wasla, container) {
  const lead = isLead();
  const items = wasla.items || [];

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-white text-2xl font-bold font-serif">${escapeHtml(wasla.name)}</h2>
        <p class="text-[#9db8b6] text-sm mt-1">${items.length} قصيدة</p>
      </div>
      ${
        lead
          ? `
        <button id="addToPoemWaslaBtn" class="flex items-center gap-2 px-4 py-2 rounded-xl
          bg-primary/20 border border-primary/30 text-primary-light hover:bg-primary/30 transition-all
          text-sm font-bold">
          <span class="material-symbols-outlined text-lg">playlist_add</span>
          إضافة قصيدة
        </button>`
          : ""
      }
    </div>

    <div id="waslaItemsList" class="flex flex-col gap-3">
      ${
        items.length
          ? items.map((item) => buildWaslaItem(item, lead)).join("")
          : `<div class="text-center py-8 text-[#9db8b6]">
            <span class="material-symbols-outlined text-4xl mb-2">queue_music</span>
            <p>لا توجد قصائد في هذه الوصلة بعد</p>
          </div>`
      }
    </div>`;

  container.onclick = null;
  if (lead) {
    container.onclick = async (e) => {
      const addBtn = e.target.closest("#addToPoemWaslaBtn");
      if (addBtn) {
        showAddPoemToWaslaModal(wasla.id);
        return;
      }

      const removeBtn = e.target.closest(".remove-item-btn");
      if (!removeBtn) return;

      e.stopPropagation();
      const confirmed = await showConfirm("هل تريد حذف هذه القصيدة من الوصلة؟");
      if (!confirmed) return;
      try {
        await waslatApi.removeItem(wasla.id, removeBtn.dataset.itemId);
        showToast("تم حذف القصيدة من الوصلة", "success");
        const updated = await waslatApi.getById(wasla.id);
        const items = await enrichWaslaItems(updated.items || []);
        renderWaslaDetail({ ...updated, items }, container);
        loadWaslat();
      } catch (err) {
        showToast(err.message, "error");
      }
    };
  }
}

function buildWaslaItem(item, lead) {
  const poemId = getItemPoemId(item);
  const poem = {
    id: poemId,
    title: item?.poemTitle || item?.poem?.title || "",
    category:
      item?.poemCategory || item?.category || item?.poem?.category || "",
    poetName:
      item?.poemPoetName || item?.poem?.poetName || item?.poem?.poet || "",
    poet: item?.poemPoet || item?.poet || item?.poem?.poet,
    maqamName:
      item?.poemMaqamName || item?.maqamName || item?.poem?.maqamName || "",
    maqam: item?.poemMaqam || item?.maqam || item?.poem?.maqam,
  };
  let maqamName = getPoemMaqamName(poem);
  if (!maqamName) {
    const maqamId =
      item?.poemMaqamId ??
      item?.maqamId ??
      item?.maqamID ??
      item?.maqam_id ??
      item?.poem?.maqamId ??
      item?.poem?.maqamID ??
      item?.poem?.maqam_id ??
      extractId(item?.maqam) ??
      extractId(item?.poem?.maqam);
    maqamName = getNameFromMap(maqamNameById, maqamId);
  }

  let poetName = getPoemPoetName(poem);
  if (!poetName) {
    const poetId =
      item?.poemPoetId ??
      item?.poetId ??
      item?.poetID ??
      item?.poet_id ??
      item?.poem?.poetId ??
      item?.poem?.poetID ??
      item?.poem?.poet_id ??
      extractId(item?.poet) ??
      extractId(item?.poem?.poet);
    poetName = getNameFromMap(poetNameById, poetId);
  }
  const categoryLabel = CATEGORY_LABELS[poem.category] || poem.category || "";
  const maqamColor = maqamName
    ? getMaqamColor(maqamName)
    : {
        bg: "rgba(10,87,80,0.3)",
        border: "rgba(21,140,130,0.4)",
        text: "#4ecdc4",
      };
  const readLink = poemId ? `view-poem.html?id=${poemId}` : "#";
  const readLinkClass = poemId ? "" : "pointer-events-none opacity-60";
  return `
    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all
      duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
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
          </div>
          <h3 class="text-white text-xl md:text-2xl font-serif font-bold leading-normal
            group-hover:text-primary-light transition-colors">
            ${escapeHtml(poem.title || "")}
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
      </div>

      <div class="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center
        justify-between text-xs text-[#6b8c89] gap-3">
        <div class="flex items-center gap-3">
          ${
            lead
              ? `
            <button class="remove-item-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-red-400/20 hover:text-red-300 transition-colors text-[#9db8b6]"
              title="حذف من الوصلة" data-item-id="${item.id}">
              <span class="material-symbols-outlined text-lg">remove_circle</span>
              <span class="font-medium">حذف من الوصلة</span>
            </button>`
              : ""
          }
        </div>
        <a href="${readLink}"
          class="flex items-center gap-1 text-primary-light font-bold hover:underline ${readLinkClass}">
          اقرأ القصيدة
          <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>
        </a>
      </div>
    </article>`;
}

function setupAddPoemModal() {
  if (addPoemModalState.initialized) return;
  const modal = document.getElementById("addPoemModal");
  if (!modal) return;

  const searchInput = modal.querySelector("#poemSearchInput");
  const resultsContainer = modal.querySelector("#poemSearchResults");

  addPoemModalState.doSearch = async (q) => {
    if (!resultsContainer) return;

    const requestController = new AbortController();
    if (poemsSearchRequestController) poemsSearchRequestController.abort();
    poemsSearchRequestController = requestController;

    showLoading("poemSearchResults");
    try {
      const result = await poemsApi.getAll(
        { query: q, pageSize: 10 },
        { signal: requestController.signal },
      );
      if (poemsSearchRequestController !== requestController) return;

      const items = result?.items || result || [];
      if (!items.length) {
        showEmpty("poemSearchResults", "لا توجد نتائج", "search_off");
        return;
      }
      resultsContainer.innerHTML = items
        .map(
          (p) => `
        <button class="add-to-wasla-item w-full flex items-center gap-3 p-3 rounded-xl
          hover:bg-white/10 transition-all text-right border border-transparent
          hover:border-primary/20" data-id="${p.id}" data-title="${escapeHtml(p.title)}">
          <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-primary-light">book</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">${escapeHtml(p.title)}</p>
            <p class="text-[#9db8b6] text-xs">${escapeHtml(p.poetName || "")}</p>
          </div>
          <span class="material-symbols-outlined text-primary-light text-lg">add</span>
        </button>`,
        )
        .join("");
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (poemsSearchRequestController !== requestController) return;
      if (resultsContainer)
        resultsContainer.innerHTML = `<div class="text-red-400 p-4">${escapeHtml(err.message)}</div>`;
    } finally {
      if (poemsSearchRequestController === requestController) {
        poemsSearchRequestController = null;
      }
    }
  };

  const closeAddPoemModal = () => {
    if (addPoemModalState.searchTimeout) {
      clearTimeout(addPoemModalState.searchTimeout);
      addPoemModalState.searchTimeout = null;
    }
    if (poemsSearchRequestController) {
      poemsSearchRequestController.abort();
      poemsSearchRequestController = null;
    }
    modal.classList.add("hidden");
  };

  resultsContainer?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-to-wasla-item");
    if (!btn) return;

    const activeWaslaId = addPoemModalState.waslaId || selectedWaslaId;
    if (!activeWaslaId) return;

    try {
      await waslatApi.addItem(activeWaslaId, { poemId: btn.dataset.id });
      showToast(`تم إضافة "${btn.dataset.title}" للوصلة`, "success");
      closeAddPoemModal();
      const updated = await waslatApi.getById(activeWaslaId);
      const items = await enrichWaslaItems(updated.items || []);
      const detailContainer = document.getElementById("waslaDetailContainer");
      if (detailContainer)
        renderWaslaDetail({ ...updated, items }, detailContainer);
      loadWaslat();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  searchInput?.addEventListener("input", () => {
    clearTimeout(addPoemModalState.searchTimeout);
    addPoemModalState.searchTimeout = setTimeout(
      () => addPoemModalState.doSearch(searchInput.value.trim()),
      300,
    );
  });

  modal.querySelector("#closeAddPoemModal")?.addEventListener("click", () => {
    closeAddPoemModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddPoemModal();
  });

  addPoemModalState.initialized = true;
}

async function showAddPoemToWaslaModal(waslaId) {
  const modal = document.getElementById("addPoemModal");
  if (!modal) return;

  setupAddPoemModal();
  addPoemModalState.waslaId = waslaId;
  modal.classList.remove("hidden");

  const searchInput = modal.querySelector("#poemSearchInput");
  if (searchInput) searchInput.value = "";
  await addPoemModalState.doSearch?.("");
}

function setupCreateWaslaModal() {
  if (createWaslaModalReady) return;

  const modal = document.getElementById("createWaslaModal");
  if (!modal) return;

  const form = modal.querySelector("#createWaslaForm");
  let submitting = false;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = modal.querySelector("#waslaName")?.value.trim();
    const desc = modal.querySelector("#waslaDesc")?.value.trim();
    if (!name) {
      showToast("اسم الوصلة مطلوب", "error");
      return;
    }

    submitting = true;
    try {
      await waslatApi.create({ name, description: desc || null });
      showToast("تم إنشاء الوصلة بنجاح", "success");
      modal.classList.add("hidden");
      form.reset();
      loadWaslat();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      submitting = false;
    }
  });

  modal
    .querySelector("#closeCreateWaslaModal")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  createWaslaModalReady = true;
}

function showCreateWaslaModal() {
  const modal = document.getElementById("createWaslaModal");
  if (!modal) return;
  setupCreateWaslaModal();

  modal.querySelector("#createWaslaForm")?.reset();
  modal.classList.remove("hidden");
}
