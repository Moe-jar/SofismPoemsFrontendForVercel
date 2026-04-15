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
} from "../utils.js";

if (!requireAuth()) throw new Error("Not authenticated");

let waslat = [];
let selectedWaslaId = null;
const poetNameById = new Map();
const maqamNameById = new Map();

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
});

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
          ? items
              .map((item, idx) => buildWaslaItem(item, idx, wasla.id, lead))
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

    container.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
          "هل تريد حذف هذه القصيدة من الوصلة؟",
        );
        if (!confirmed) return;
        try {
          await waslatApi.removeItem(wasla.id, btn.dataset.itemId);
          showToast("تم حذف القصيدة من الوصلة", "success");
          const updated = await waslatApi.getById(wasla.id);
          const items = await enrichWaslaItems(updated.items || []);
          renderWaslaDetail({ ...updated, items }, container);
          // Reload waslat list to update count
          loadWaslat();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  }
}

function buildWaslaItem(item, idx, waslaId, lead) {
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
          class="flex items-center gap-1 text-primary-light font-bold hover:underline ${readLinkClass}"
          onclick="event.stopPropagation()">
          اقرأ القصيدة
          <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>
        </a>
      </div>
    </article>`;
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
