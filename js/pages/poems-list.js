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

  const aliases = {
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

  const sectionLabel =
    (filters.hadraSection &&
      (HADRA_SECTION_LABELS[filters.hadraSection] ||
        filters.hadraSection)) ||
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
  filters.hadraSection =
    filters.category === "Hadra" ? hadraSection || "" : "";
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

  showLoading("poemsContainer", "جاري تحميل القصائد...");

  try {
    const result = await poemsApi.getAll({
      page: currentPage,
      pageSize,
      query: filters.q || undefined,
      poetId: filters.poetId || undefined,
      maqamId: filters.maqamId || undefined,
      category: filters.category || undefined,
      hadraSection:
        filters.category === "Hadra"
          ? filters.hadraSection || undefined
          : undefined,
    });

    const poems = result?.items || result || [];
    totalPages = result?.totalPages || 1;
    const total = result?.totalCount || poems.length;

    // Update count
    const countEl = document.getElementById("poemsCount");
    if (countEl) countEl.textContent = `${total} قصيدة`;

    if (!poems.length) {
      showEmpty("poemsContainer", "لا توجد قصائد تطابق البحث", "search_off");
      renderPagination();
      return;
    }

    container.innerHTML = poems.map((poem) => buildPoemCard(poem)).join("");
    setupCardActions(container);
    renderPagination();
  } catch (err) {
    container.innerHTML = `<div class="text-center py-12 text-red-400">${escapeHtml(err.message)}</div>`;
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
          class="flex items-center gap-1 text-primary-light font-bold hover:underline"
          onclick="event.stopPropagation()">
          اقرأ القصيدة
          <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>
        </a>
      </div>
    </article>`;
}

function setupCardActions(container) {
  // Navigate on article click
  container.querySelectorAll("article[data-id]").forEach((article) => {
    article.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      window.location.href = `view-poem.html?id=${article.dataset.id}`;
    });
  });

  // Bookmark toggle
  const initialBookmarks = JSON.parse(
    localStorage.getItem("divan_bookmarks") || "[]",
  );
  container.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const id = btn.dataset.id;
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon)
      icon.textContent = initialBookmarks.includes(id)
        ? "bookmark"
        : "bookmark_border";
    if (initialBookmarks.includes(id)) btn.style.color = "#d4b068";

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const saved = JSON.parse(localStorage.getItem("divan_bookmarks") || "[]");
      const idx = saved.indexOf(id);
      if (idx === -1) {
        saved.push(id);
        if (icon) icon.textContent = "bookmark";
        btn.style.color = "#d4b068";
        showToast("تم حفظ القصيدة في الإشارات المرجعية", "success");
      } else {
        saved.splice(idx, 1);
        if (icon) icon.textContent = "bookmark_border";
        btn.style.color = "";
        showToast("تم إزالة القصيدة من الإشارات المرجعية", "info");
      }
      localStorage.setItem("divan_bookmarks", JSON.stringify(saved));
    });
  });

  // Share poem
  container.querySelectorAll(".share-poem-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await currentApi.sharePoem(btn.dataset.id);
        showToast(`تم مشاركة "${btn.dataset.title}" مع الجميع`, "success");
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

  // Edit poem
  container.querySelectorAll(".edit-poem-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `add-poem.html?id=${btn.dataset.id}`;
    });
  });

  // Delete poem
  container.querySelectorAll(".delete-poem-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const confirmed = await showConfirm(
        `هل أنت متأكد من حذف "${btn.dataset.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        "حذف القصيدة",
      );
      if (!confirmed) return;
      try {
        await poemsApi.delete(btn.dataset.id);
        showToast("تم حذف القصيدة بنجاح", "success");
        loadPoems();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
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

  try {
    const result = await waslatApi.getAll();
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
    select.innerHTML = `<option value="">تعذر تحميل الوصلات</option>`;
    if (hint) hint.textContent = err.message || "تعذر تحميل الوصلات";
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
  for (let i = 1; i <= totalPages; i++) {
    pages.push(`
      <button data-page="${i}" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${
          i === currentPage
            ? "bg-primary text-white"
            : "bg-white/5 text-[#9db8b6] hover:bg-white/10 hover:text-white"
        }">
        ${i}
      </button>`);
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

  container.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  container.querySelector("#prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  container.querySelector("#nextPage")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadPoems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}
