// Utility helpers for ديوان الصوفية

// Arabic text normalization for search
export function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[\u064B-\u065F]/g, "") // Remove tashkeel
    .trim();
}

// Get URL search param
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Category labels mapping
export const CATEGORY_LABELS = {
  Ilahiyyat: "إلهيات",
  Nabawiyyat: "نبويات",
  Hadra: "حضرة",
  Mufrad: "مفرد",
};

// Hadra section labels
export const HADRA_SECTION_LABELS = {
  Matali: "مطلع",
  Qiyam: "القيام",
  Ruku: "ركوع",
};

// Maqam color palette for badges
const MAQAM_COLORS = [
  { bg: "rgba(10,87,80,0.3)", border: "rgba(21,140,130,0.4)", text: "#4ecdc4" },
  {
    bg: "rgba(140,126,21,0.3)",
    border: "rgba(140,126,21,0.4)",
    text: "#d4c34a",
  },
  { bg: "rgba(140,58,21,0.3)", border: "rgba(140,58,21,0.4)", text: "#d4764a" },
  { bg: "rgba(42,140,21,0.3)", border: "rgba(42,140,21,0.4)", text: "#60d44a" },
  { bg: "rgba(10,87,140,0.3)", border: "rgba(10,87,140,0.4)", text: "#4a8cd4" },
  { bg: "rgba(90,21,140,0.3)", border: "rgba(90,21,140,0.4)", text: "#c44ae8" },
];
const maqamColorMap = {};
let colorIndex = 0;

export function getMaqamColor(maqamName) {
  if (!maqamColorMap[maqamName]) {
    maqamColorMap[maqamName] = MAQAM_COLORS[colorIndex % MAQAM_COLORS.length];
    colorIndex++;
  }
  return maqamColorMap[maqamName];
}

// Debounce function
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function promiseAllSettled(promises) {
  return Promise.all(
    promises.map((promise) =>
      Promise.resolve(promise).then(
        (value) => ({ status: "fulfilled", value }),
        (reason) => ({ status: "rejected", reason }),
      ),
    ),
  );
}

// Safari rejects "YYYY-MM-DD HH:mm:ss" (space instead of T) and returns Invalid Date.
export function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return Number.isNaN(dateStr.getTime()) ? null : dateStr;
  }
  const raw = String(dateStr).trim();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Format a datetime string to Arabic locale
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = parseDate(dateStr);
  if (!date) return String(dateStr);
  try {
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

// Escape HTML to prevent XSS
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractDisplayName(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const name =
      value.nameAr ||
      value.nameEn ||
      value.name ||
      value.fullName ||
      value.title ||
      value.label ||
      value.displayName ||
      "";
    return typeof name === "string" ? name.trim() : "";
  }
  return "";
}

export function getPoemPoetName(poem) {
  return extractDisplayName(
    poem?.poetName ||
      poem?.poetNameAr ||
      poem?.poetNameEn ||
      poem?.poet_name ||
      poem?.poetAr ||
      poem?.poetEn ||
      poem?.poet,
  );
}

export function getPoemMaqamName(poem) {
  return extractDisplayName(
    poem?.maqamName ||
      poem?.maqamNameAr ||
      poem?.maqamNameEn ||
      poem?.maqam_name ||
      poem?.maqamAr ||
      poem?.maqamEn ||
      poem?.maqam,
  );
}

// Normalize Hadra section name for display
export function getHadraSectionLabel(poem) {
  const raw =
    poem?.hadraSection ??
    poem?.hadra_section ??
    poem?.hadraSectionName ??
    poem?.hadraSectionLabel ??
    poem?.section ??
    "";
  if (!raw) return "";

  const value = String(raw).trim();
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

// Highlight text matching a search query
export function highlightText(text, query) {
  if (!text || !query || query.trim().length < 2) return escapeHtml(text);
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);

  // This is a simple version; a perfect Arabic highlighter would be more complex
  // due to variations in writing styles.
  try {
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return escapeHtml(text).replace(
      regex,
      '<mark class="bg-primary/40 text-white rounded px-0.5">$1</mark>',
    );
  } catch {
    return escapeHtml(text);
  }
}

// Build poem card HTML (for catalog/waslat pages)
export function buildPoemCard(poem, options = {}) {
  const {
    showShare = false,
    showAddToWasla = false,
    showEdit = false,
    showDelete = false,
    basePath = "",
    searchQuery = "",
    viewMode = "card", // 'card' or 'list'
  } = options;

  const maqamName = getPoemMaqamName(poem);
  const poetName = getPoemPoetName(poem);
  const maqamColor = maqamName ? getMaqamColor(maqamName) : MAQAM_COLORS[0];
  const categoryLabel = CATEGORY_LABELS[poem.category] || poem.category || "";
  const hadraSectionLabel = getHadraSectionLabel(poem);

  // Category specific styles
  const categoryStyles = {
    Ilahiyyat: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    Nabawiyyat: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    Hadra: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    Mufrad: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  const categoryClass = categoryStyles[poem.category] || "bg-white/5 border-white/10 text-[#9db8b6]";

  const highlightedTitle = highlightText(poem.title, searchQuery);
  const highlightedPoet = highlightText(poetName, searchQuery);

  if (viewMode === "list") {
    return `
      <article class="glass-card rounded-xl p-3 flex items-center justify-between gap-4 group
        hover:bg-[#1c2626]/80 transition-all cursor-pointer border border-white/5"
        data-id="${poem.id}">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
                        <span class="material-symbols-outlined text-primary-light/70 group-hover:text-primary-light">description</span>

          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-white text-base font-bold truncate group-hover:text-primary-light transition-colors">
              ${highlightedTitle}
            </h3>
            <div class="flex items-center gap-3 text-xs text-[#6b8c89]">
              ${poetName ? `<span class="truncate">${highlightedPoet}</span>` : ""}
              ${maqamName ? `<span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" style="color:${maqamColor.text}">${escapeHtml(maqamName)}</span>` : ""}
            </div>
          </div>
        </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href="${basePath}view-poem.html?id=${poem.id}" class="p-2 text-primary-light hover:bg-white/5 rounded-full" onclick="event.stopPropagation()">
            <span class="material-symbols-outlined">open_in_new</span>
          </a>
        </div>

      </article>`;
  }

  return `
    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all duration-300
      hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
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
              <span class="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${categoryClass}">
                ${escapeHtml(categoryLabel)}
              </span>`
                : ""
            }
            ${
              hadraSectionLabel &&
              String(poem.category || "").toLowerCase() === "hadra"
                ? `
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/5
                border border-purple-500/20 text-purple-300/80 text-xs">${escapeHtml(hadraSectionLabel)}</span>`
                : ""
            }
          </div>
          <h3 class="text-white text-xl md:text-2xl font-serif font-bold leading-normal
            group-hover:text-primary-light transition-colors">
            ${highlightedTitle}
          </h3>
          ${
            poetName
              ? `
            <p class="text-[#9db8b6] text-sm font-medium flex items-center gap-2 mt-1">
                            <span class="material-symbols-outlined text-base opacity-70">edit</span>

              ${highlightedPoet}
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
            showDelete
              ? `
            <button class="delete-poem-btn text-[#9db8b6] hover:text-red-400 hover:bg-white/5
              p-2 rounded-full transition-all" title="حذف" data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
                            <span class="material-symbols-outlined">delete</span>

            </button>`
              : ""
          }
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between
        text-xs text-[#6b8c89] gap-3">
        <div class="flex items-center gap-3">
          ${
            showShare
              ? `
            <button class="share-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
              <span class="material-symbols-outlined text-lg">podcasts</span>
              <span class="font-medium">عرض للجميع</span>
            </button>`
              : ""
          }
          ${
            showAddToWasla
              ? `
            <button class="add-to-wasla-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}" data-title="${escapeHtml(poem.title)}">
              <span class="material-symbols-outlined text-lg">playlist_add</span>
              <span class="font-medium">إضافة للوصلة</span>
            </button>`
              : ""
          }
          ${
            showEdit
              ? `
            <button class="edit-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"
              data-id="${poem.id}">
              <span class="material-symbols-outlined text-lg">edit</span>
              <span class="font-medium">تعديل</span>
            </button>`
              : ""
          }
        </div>
        <a href="${basePath}view-poem.html?id=${poem.id}"
          class="flex items-center gap-1 text-primary-light font-bold hover:underline"
          onclick="event.stopPropagation()">
          اقرأ القصيدة
                   <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>

        </a>
      </div>
    </article>`;
}
