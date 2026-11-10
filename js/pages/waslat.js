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
  debounce,
  getMaqamColor,
  getPoemMaqamName,
  getPoemPoetName,
  CATEGORY_LABELS,
  buildPoemCard,
} from "../utils.js";

if (!requireAuth()) throw new Error("Not authenticated");

let waslat = [];
let selectedWaslaId = null;
const poetNameById = new Map();
const maqamNameById = new Map();
const shouldOpenCurrentWasla =
  new URLSearchParams(window.location.search).get("openCurrent") === "1";

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
        const poem = await poemsApi.getById(poemId);
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

async function loadWaslat() {
  const container = document.getElementById("waslatContainer");
  if (!container) return;
  showLoading("waslatContainer", "جاري تحميل الوصلات...");

  try {
    const result = await waslatApi.getAll();
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
    container.innerHTML = `<div class="text-center py-12 text-red-400">${escapeHtml(err.message)}</div>`;
  }
}

function renderWaslat(list) {
  const container = document.getElementById("waslatContainer");
  if (!container) return;
  container.innerHTML = list.map((w) => buildWaslaCard(w)).join("");

  // Attach click handlers
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
          showToast("تم مشاركة الوصلة مع الجميع", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });

    container.querySelectorAll(".delete-wasla-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
          `هل أنت متأكد من حذف "${btn.dataset.name}"؟`,
          "حذف الوصلة",
        );
        if (!confirmed) return;
        try {
          await waslatApi.delete(btn.dataset.id);
          showToast("تم حذف الوصلة", "success");
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
  return `
    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all
      duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden wasla-card border border-white/5"
      data-id="${w.id}">
      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0
          border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <span class="material-symbols-outlined text-primary-light text-3xl group-hover:scale-110 transition-transform">queue_music</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
             <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#9db8b6] text-[10px] font-bold uppercase tracking-wider">
               وصلة إنشادية
             </span>
          </div>
          <h3 class="text-white font-bold text-xl md:text-2xl truncate group-hover:text-primary-light transition-colors">
            ${escapeHtml(w.name)}
          </h3>
          <div class="flex items-center gap-4 mt-2">
            <span class="flex items-center gap-1.5 text-[#9db8b6] text-sm">
              <span class="material-symbols-outlined text-base opacity-70">auto_stories</span>
              ${w.itemCount || 0} قصائد
            </span>
            ${
              w.description
                ? `
              <span class="flex items-center gap-1.5 text-[#9db8b6] text-sm truncate max-w-[200px]">
                <span class="material-symbols-outlined text-base opacity-70">info</span>
                ${escapeHtml(w.description)}
              </span>`
                : ""
            }
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          ${
            lead
              ? `
            <button class="share-wasla-btn p-2.5 rounded-xl text-[#9db8b6] hover:text-primary-light
              hover:bg-primary/10 transition-all" title="مشاركة مع الجميع"
              data-id="${w.id}" data-name="${escapeHtml(w.name)}">
              <span class="material-symbols-outlined text-xl">podcasts</span>
            </button>
            <button class="delete-wasla-btn p-2.5 rounded-xl text-[#9db8b6] hover:text-red-400
              hover:bg-red-400/10 transition-all" title="حذف"
              data-id="${w.id}" data-name="${escapeHtml(w.name)}">
              <span class="material-symbols-outlined text-xl">delete</span>
            </button>`
              : ""
          }
          <div class="p-2.5 rounded-xl text-primary-light">
            <span class="material-symbols-outlined rotate-180 text-2xl">arrow_right_alt</span>
          </div>
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

    <div id="waslaItemsList" class="flex flex-col gap-2">
      ${
        items.length
          ? items
              .map((item) => {
                const poemId = getItemPoemId(item);
                const poemData = {
                  id: poemId,
                  title: item?.poemTitle || item?.poem?.title || "",
                  category:
                    item?.poemCategory ||
                    item?.category ||
                    item?.poem?.category ||
                    "",
                  poetName:
                    item?.poemPoetName ||
                    item?.poem?.poetName ||
                    item?.poem?.poet ||
                    "",
                  maqamName:
                    item?.poemMaqamName ||
                    item?.maqamName ||
                    item?.poem?.maqamName ||
                    "",
                };
                return buildPoemCard(poemData, {
                  showDelete: lead,
                  viewMode: "list",
                  basePath: "../pages/",
                });
              })
              .join("")
          : `<div class="text-center py-8 text-[#9db8b6]">
            <span class="material-symbols-outlined text-4xl mb-2">queue_music</span>
            <p>لا توجد قصائد في هذه الوصلة بعد</p>
          </div>`
      }
    </div>`;

  if (lead) {
    container
      .querySelector("#addToPoemWaslaBtn")
      ?.addEventListener("click", () => {
        showAddPoemToWaslaModal(wasla.id);
      });

    container.querySelectorAll(".delete-poem-btn").forEach((btn, idx) => {
      // In Wasla view, the delete button is actually "Remove from Wasla"
      const item = items[idx];
      btn.title = "حذف من الوصلة";
      btn.querySelector(".material-symbols-outlined").textContent =
        "remove_circle";

      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
          "هل تريد حذف هذه القصيدة من الوصلة؟",
        );
        if (!confirmed) return;
        try {
          await waslatApi.removeItem(wasla.id, item.id);
          showToast("تم حذف القصيدة من الوصلة", "success");
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

  // Navigate on item click
  container.querySelectorAll("article[data-id]").forEach((article) => {
    article.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      window.location.href = `view-poem.html?id=${article.dataset.id}`;
    });
  });
}

async function showAddPoemToWaslaModal(waslaId) {
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

      resultsContainer.querySelectorAll(".add-to-wasla-item").forEach((btn) => {
        btn.addEventListener("click", async () => {
          try {
            await waslatApi.addItem(waslaId, { poemId: btn.dataset.id });
            showToast(`تم إضافة "${btn.dataset.title}" للوصلة`, "success");
            modal.classList.add("hidden");
            // Refresh wasla detail
            const updated = await waslatApi.getById(selectedWaslaId);
            const items = await enrichWaslaItems(updated.items || []);
            const detailContainer = document.getElementById(
              "waslaDetailContainer",
            );
            if (detailContainer)
              renderWaslaDetail({ ...updated, items }, detailContainer);
            loadWaslat();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
    } catch (err) {
      if (resultsContainer)
        resultsContainer.innerHTML = `<div class="text-red-400 p-4">${escapeHtml(err.message)}</div>`;
    }
  };

  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => doSearch(searchInput.value.trim()), 300);
  });

  // Initial load
  doSearch("");

  // Close
  modal.querySelector("#closeAddPoemModal")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}

function showCreateWaslaModal() {
  const modal = document.getElementById("createWaslaModal");
  if (!modal) return;
  modal.classList.remove("hidden");

  const form = modal.querySelector("#createWaslaForm");
  form?.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      const name = modal.querySelector("#waslaName")?.value.trim();
      const desc = modal.querySelector("#waslaDesc")?.value.trim();
      if (!name) {
        showToast("اسم الوصلة مطلوب", "error");
        return;
      }
      try {
        await waslatApi.create({ name, description: desc || null });
        showToast("تم إنشاء الوصلة بنجاح", "success");
        modal.classList.add("hidden");
        loadWaslat();
      } catch (err) {
        showToast(err.message, "error");
      }
    },
    { once: true },
  );

  modal
    .querySelector("#closeCreateWaslaModal")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}
