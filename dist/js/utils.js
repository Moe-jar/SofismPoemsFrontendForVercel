function normalizeArabic(text) {
  if (!text) return "";
  return text.replace(/[أإآ]/g, "\u0627").replace(/[ى]/g, "\u064A").replace(/[ة]/g, "\u0647").replace(/[\u064B-\u065F]/g, "").trim();
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
const CATEGORY_LABELS = {
  Ilahiyyat: "\u0625\u0644\u0647\u064A\u0627\u062A",
  Nabawiyyat: "\u0646\u0628\u0648\u064A\u0627\u062A",
  Hadra: "\u062D\u0636\u0631\u0629",
  Mufrad: "\u0645\u0641\u0631\u062F"
};
const HADRA_SECTION_LABELS = {
  Matali: "\u0645\u0637\u0644\u0639",
  Qiyam: "\u0627\u0644\u0642\u064A\u0627\u0645",
  Ruku: "\u0631\u0643\u0648\u0639"
};
const MAQAM_COLORS = [
  { bg: "rgba(10,87,80,0.3)", border: "rgba(21,140,130,0.4)", text: "#4ecdc4" },
  {
    bg: "rgba(140,126,21,0.3)",
    border: "rgba(140,126,21,0.4)",
    text: "#d4c34a"
  },
  { bg: "rgba(140,58,21,0.3)", border: "rgba(140,58,21,0.4)", text: "#d4764a" },
  { bg: "rgba(42,140,21,0.3)", border: "rgba(42,140,21,0.4)", text: "#60d44a" },
  { bg: "rgba(10,87,140,0.3)", border: "rgba(10,87,140,0.4)", text: "#4a8cd4" },
  { bg: "rgba(90,21,140,0.3)", border: "rgba(90,21,140,0.4)", text: "#c44ae8" }
];
const maqamColorMap = {};
let colorIndex = 0;
function getMaqamColor(maqamName) {
  if (!maqamColorMap[maqamName]) {
    maqamColorMap[maqamName] = MAQAM_COLORS[colorIndex % MAQAM_COLORS.length];
    colorIndex++;
  }
  return maqamColorMap[maqamName];
}
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return Number.isNaN(dateStr.getTime()) ? null : dateStr;
  }
  const raw = String(dateStr).trim();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = parseDate(dateStr);
  if (!date) return String(dateStr);
  try {
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return String(dateStr);
  }
}
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function extractDisplayName(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const name = value.nameAr || value.nameEn || value.name || value.fullName || value.title || value.label || value.displayName || "";
    return typeof name === "string" ? name.trim() : "";
  }
  return "";
}
function getPoemPoetName(poem) {
  return extractDisplayName(
    (poem == null ? void 0 : poem.poetName) || (poem == null ? void 0 : poem.poetNameAr) || (poem == null ? void 0 : poem.poetNameEn) || (poem == null ? void 0 : poem.poet_name) || (poem == null ? void 0 : poem.poetAr) || (poem == null ? void 0 : poem.poetEn) || (poem == null ? void 0 : poem.poet)
  );
}
function getPoemMaqamName(poem) {
  return extractDisplayName(
    (poem == null ? void 0 : poem.maqamName) || (poem == null ? void 0 : poem.maqamNameAr) || (poem == null ? void 0 : poem.maqamNameEn) || (poem == null ? void 0 : poem.maqam_name) || (poem == null ? void 0 : poem.maqamAr) || (poem == null ? void 0 : poem.maqamEn) || (poem == null ? void 0 : poem.maqam)
  );
}
function getHadraSectionLabel(poem) {
  var _a, _b, _c, _d, _e;
  const raw = (_e = (_d = (_c = (_b = (_a = poem == null ? void 0 : poem.hadraSection) != null ? _a : poem == null ? void 0 : poem.hadra_section) != null ? _b : poem == null ? void 0 : poem.hadraSectionName) != null ? _c : poem == null ? void 0 : poem.hadraSectionLabel) != null ? _d : poem == null ? void 0 : poem.section) != null ? _e : "";
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
    ruku: "Ruku"
  };
  const normalized = aliases[value] || aliases[value.toLowerCase()] || value;
  return HADRA_SECTION_LABELS[normalized] || value;
}
function highlightText(text, query) {
  if (!text || !query || query.trim().length < 2) return escapeHtml(text);
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);
  try {
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("(".concat(escapedQuery, ")"), "gi");
    return escapeHtml(text).replace(
      regex,
      '<mark class="bg-primary/40 text-white rounded px-0.5">$1</mark>'
    );
  } catch {
    return escapeHtml(text);
  }
}
function buildPoemCard(poem, options = {}) {
  const {
    showShare = false,
    showAddToWasla = false,
    showEdit = false,
    showDelete = false,
    basePath = "",
    searchQuery = "",
    viewMode = "card"
    // 'card' or 'list'
  } = options;
  const maqamName = getPoemMaqamName(poem);
  const poetName = getPoemPoetName(poem);
  const maqamColor = maqamName ? getMaqamColor(maqamName) : MAQAM_COLORS[0];
  const categoryLabel = CATEGORY_LABELS[poem.category] || poem.category || "";
  const hadraSectionLabel = getHadraSectionLabel(poem);
  const categoryStyles = {
    Ilahiyyat: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    Nabawiyyat: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    Hadra: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    Mufrad: "bg-blue-500/10 border-blue-500/20 text-blue-400"
  };
  const categoryClass = categoryStyles[poem.category] || "bg-white/5 border-white/10 text-[#9db8b6]";
  const highlightedTitle = highlightText(poem.title, searchQuery);
  const highlightedPoet = highlightText(poetName, searchQuery);
  if (viewMode === "list") {
    return '\n      <article class="glass-card rounded-xl p-3 flex items-center justify-between gap-4 group\n        hover:bg-[#1c2626]/80 transition-all cursor-pointer border border-white/5"\n        data-id="'.concat(poem.id, '">\n        <div class="flex items-center gap-4 flex-1 min-w-0">\n          <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20">\n                        <span class="material-symbols-outlined text-primary-light/70 group-hover:text-primary-light">description</span>\n\n          </div>\n          <div class="flex-1 min-w-0">\n            <h3 class="text-white text-base font-bold truncate group-hover:text-primary-light transition-colors">\n              ').concat(highlightedTitle, '\n            </h3>\n            <div class="flex items-center gap-3 text-xs text-[#6b8c89]">\n              ').concat(poetName ? '<span class="truncate">'.concat(highlightedPoet, "</span>") : "", "\n              ").concat(maqamName ? '<span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10" style="color:'.concat(maqamColor.text, '">').concat(escapeHtml(maqamName), "</span>") : "", '\n            </div>\n          </div>\n        </div>\n          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">\n                   <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">\n          <a href="').concat(basePath, "view-poem.html?id=").concat(poem.id, '" class="p-2 text-primary-light hover:bg-white/5 rounded-full" onclick="event.stopPropagation()">\n            <span class="material-symbols-outlined">open_in_new</span>\n          </a>\n        </div>\n\n      </article>');
  }
  return '\n    <article class="glass-card rounded-2xl p-5 group hover:bg-[#1c2626]/60 transition-all duration-300\n      hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"\n      data-id="'.concat(poem.id, '">\n      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent\n        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>\n      <div class="flex items-start justify-between gap-4">\n        <div class="flex-1 flex flex-col gap-2 min-w-0">\n          <div class="flex flex-wrap items-center gap-2 mb-1">\n            ').concat(maqamName ? '\n              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"\n                style="background:'.concat(maqamColor.bg, ";border:1px solid ").concat(maqamColor.border, ";color:").concat(maqamColor.text, ';">\n                <span class="w-1.5 h-1.5 rounded-full" style="background:').concat(maqamColor.text, ';"></span>\n                \u0645\u0642\u0627\u0645 ').concat(escapeHtml(maqamName), "\n              </span>") : "", "\n            ").concat(categoryLabel ? '\n              <span class="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium '.concat(categoryClass, '">\n                ').concat(escapeHtml(categoryLabel), "\n              </span>") : "", "\n            ").concat(hadraSectionLabel && String(poem.category || "").toLowerCase() === "hadra" ? '\n              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/5\n                border border-purple-500/20 text-purple-300/80 text-xs">'.concat(escapeHtml(hadraSectionLabel), "</span>") : "", '\n          </div>\n          <h3 class="text-white text-xl md:text-2xl font-serif font-bold leading-normal\n            group-hover:text-primary-light transition-colors">\n            ').concat(highlightedTitle, "\n          </h3>\n          ").concat(poetName ? '\n            <p class="text-[#9db8b6] text-sm font-medium flex items-center gap-2 mt-1">\n                            <span class="material-symbols-outlined text-base opacity-70">edit</span>\n\n              '.concat(highlightedPoet, "\n            </p>") : "", '\n        </div>\n        <div class="flex flex-col items-center gap-2 shrink-0">\n          <button class="bookmark-btn text-[#9db8b6] hover:text-yellow-400 hover:bg-white/5\n            p-2 rounded-full transition-all" title="\u0625\u0634\u0627\u0631\u0629 \u0645\u0631\u062C\u0639\u064A\u0629" data-id="').concat(poem.id, '">\n                       <span class="material-symbols-outlined">bookmark</span>\n\n          </button>\n          ').concat(showDelete ? '\n            <button class="delete-poem-btn text-[#9db8b6] hover:text-red-400 hover:bg-white/5\n              p-2 rounded-full transition-all" title="\u062D\u0630\u0641" data-id="'.concat(poem.id, '" data-title="').concat(escapeHtml(poem.title), '">\n                            <span class="material-symbols-outlined">delete</span>\n\n            </button>') : "", '\n        </div>\n      </div>\n      <div class="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between\n        text-xs text-[#6b8c89] gap-3">\n        <div class="flex items-center gap-3">\n          ').concat(showShare ? '\n            <button class="share-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg\n              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"\n              data-id="'.concat(poem.id, '" data-title="').concat(escapeHtml(poem.title), '">\n              <span class="material-symbols-outlined text-lg">podcasts</span>\n              <span class="font-medium">\u0639\u0631\u0636 \u0644\u0644\u062C\u0645\u064A\u0639</span>\n            </button>') : "", "\n          ").concat(showAddToWasla ? '\n            <button class="add-to-wasla-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg\n              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"\n              data-id="'.concat(poem.id, '" data-title="').concat(escapeHtml(poem.title), '">\n              <span class="material-symbols-outlined text-lg">playlist_add</span>\n              <span class="font-medium">\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0648\u0635\u0644\u0629</span>\n            </button>') : "", "\n          ").concat(showEdit ? '\n            <button class="edit-poem-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg\n              bg-white/5 hover:bg-primary/20 hover:text-primary-light transition-colors text-[#9db8b6]"\n              data-id="'.concat(poem.id, '">\n              <span class="material-symbols-outlined text-lg">edit</span>\n              <span class="font-medium">\u062A\u0639\u062F\u064A\u0644</span>\n            </button>') : "", '\n        </div>\n        <a href="').concat(basePath, "view-poem.html?id=").concat(poem.id, '"\n          class="flex items-center gap-1 text-primary-light font-bold hover:underline"\n          onclick="event.stopPropagation()">\n          \u0627\u0642\u0631\u0623 \u0627\u0644\u0642\u0635\u064A\u062F\u0629\n                   <span class="material-symbols-outlined text-sm rotate-180">arrow_right_alt</span>\n\n        </a>\n      </div>\n    </article>');
}
export {
  CATEGORY_LABELS,
  HADRA_SECTION_LABELS,
  buildPoemCard,
  debounce,
  escapeHtml,
  formatDate,
  getHadraSectionLabel,
  getMaqamColor,
  getParam,
  getPoemMaqamName,
  getPoemPoetName,
  highlightText,
  normalizeArabic,
  parseDate
};
