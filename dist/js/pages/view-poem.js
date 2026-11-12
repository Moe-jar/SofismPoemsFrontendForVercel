import { requireAuth, isLead } from "../auth.js";
import { poemsApi, currentApi, waslatApi } from "../api.js";
import { showToast, showConfirm } from "../ui.js";
import {
  escapeHtml,
  getParam,
  getPoemMaqamName,
  getPoemPoetName,
  CATEGORY_LABELS,
  HADRA_SECTION_LABELS
} from "../utils.js";
if (!requireAuth()) throw new Error("Not authenticated");
const poemId = getParam("id");
let poem = null;
let readingProgress = 0;
document.addEventListener("DOMContentLoaded", async () => {
  var _a, _b, _c, _d;
  if (!poemId) {
    window.location.href = "poems.html";
    return;
  }
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  (_a = document.getElementById("backBtn")) == null ? void 0 : _a.addEventListener("click", () => history.back());
  const bookmarks = JSON.parse(localStorage.getItem("divan_bookmarks") || "[]");
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  updateBookmarkBtn(bookmarks.includes(poemId));
  bookmarkBtn == null ? void 0 : bookmarkBtn.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("divan_bookmarks") || "[]");
    const idx = saved.indexOf(poemId);
    if (idx === -1) {
      saved.push(poemId);
      showToast("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0641\u064A \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629", "success");
    } else {
      saved.splice(idx, 1);
      showToast("\u062A\u0645 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0646 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629", "info");
    }
    localStorage.setItem("divan_bookmarks", JSON.stringify(saved));
    updateBookmarkBtn(idx === -1);
  });
  await loadPoem();
  (_b = document.getElementById("sharePoemBtn")) == null ? void 0 : _b.addEventListener("click", async () => {
    try {
      await currentApi.sharePoem(poemId);
      showToast("\u062A\u0645 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });
  (_c = document.getElementById("editPoemBtn")) == null ? void 0 : _c.addEventListener("click", () => {
    window.location.href = "add-poem.html?id=".concat(poemId);
  });
  (_d = document.getElementById("deletePoemBtn")) == null ? void 0 : _d.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      '\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 "'.concat(poem == null ? void 0 : poem.title, '"\u061F'),
      "\u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629"
    );
    if (!confirmed) return;
    try {
      await poemsApi.delete(poemId);
      showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629", "success");
      setTimeout(() => {
        window.location.href = "poems.html";
      }, 800);
    } catch (err) {
      showToast(err.message, "error");
    }
  });
  window.addEventListener("scroll", updateProgress, { passive: true });
});
function updateBookmarkBtn(isBookmarked) {
  const btn = document.getElementById("bookmarkBtn");
  if (!btn) return;
  const icon = btn.querySelector(".material-symbols-outlined");
  if (icon) icon.textContent = isBookmarked ? "bookmark" : "bookmark_border";
  btn.title = isBookmarked ? "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629" : "\u0625\u0636\u0627\u0641\u0629 \u0625\u0634\u0627\u0631\u0629 \u0645\u0631\u062C\u0639\u064A\u0629";
  btn.style.color = isBookmarked ? "#d4b068" : "";
}
async function loadPoem() {
  var _a;
  const titleEl = document.getElementById("poemTitle");
  const poetEl = document.getElementById("poemPoet");
  const maqamEl = document.getElementById("poemMaqam");
  const categoryEl = document.getElementById("poemCategory");
  const bodyEl = document.getElementById("poemBody");
  if (titleEl)
    titleEl.innerHTML = '<div class="skeleton h-8 w-48 mx-auto rounded"></div>';
  if (bodyEl)
    bodyEl.innerHTML = Array(3).fill(
      '\n    <div class="skeleton h-6 w-full rounded mb-3"></div>\n    <div class="skeleton h-6 w-3/4 mx-auto rounded mb-6"></div>'
    ).join("");
  try {
    poem = await poemsApi.getById(poemId);
    const poetName = getPoemPoetName(poem);
    const maqamName = getPoemMaqamName(poem);
    if (titleEl) titleEl.textContent = poem.title || "";
    if (poetEl) poetEl.textContent = poetName || "";
    if (maqamEl) {
      maqamEl.textContent = maqamName || "";
      (_a = maqamEl.parentElement) == null ? void 0 : _a.classList.toggle("hidden", !maqamName);
    }
    if (categoryEl) {
      categoryEl.textContent = CATEGORY_LABELS[poem.category] || poem.category || "";
    }
    const isEnglish = document.documentElement.getAttribute("lang") === "en";
    document.title = isEnglish ? "".concat(poem.title, " - Sufi Diwan") : "".concat(poem.title, " - \u062F\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0641\u064A\u0629");
    renderPoemBody(poem, bodyEl);
    updateProgress();
  } catch (err) {
    if (bodyEl)
      bodyEl.innerHTML = '\n      <div class="text-center py-12 text-red-400">'.concat(escapeHtml(err.message), "</div>");
  }
}
function renderPoemBody(poem2, container) {
  var _a, _b, _c;
  const bodyText = (_a = poem2.body) != null ? _a : poem2.content;
  if (!container || !bodyText) return;
  const lines = bodyText.split("\n").filter((l) => l.trim());
  const verses = [];
  for (let i = 0; i < lines.length; i += 2) {
    const sadr = ((_b = lines[i]) == null ? void 0 : _b.trim()) || "";
    const ajuz = ((_c = lines[i + 1]) == null ? void 0 : _c.trim()) || "";
    verses.push({ sadr, ajuz });
  }
  if (!verses.length) {
    container.innerHTML = '<p class="font-poem text-2xl leading-loose text-center whitespace-pre-wrap">'.concat(escapeHtml(bodyText), "</p>");
    return;
  }
  container.innerHTML = verses.map(
    (v, idx) => '\n    <div class="group flex flex-col md:flex-row items-center justify-center\n      md:justify-between md:gap-8 hover:text-white transition-colors duration-500\n      relative py-3 verse-item" data-verse="'.concat(idx, '">\n      <!-- Mobile: first hemistich -->\n      <div class="flex-1 text-center w-full md:text-left md:pl-8 relative">\n        <span>').concat(escapeHtml(v.sadr), "</span>\n        ").concat(v.ajuz ? '<div class="md:hidden text-primary/40 my-1 text-sm">\u06DE</div>' : "", "\n      </div>\n      <!-- Desktop divider -->\n      ").concat(v.ajuz ? '\n        <div class="hidden md:flex items-center justify-center w-12 opacity-30 text-[#d4b068] select-none">\n          <span class="text-xl">\u2724</span>\n        </div>\n        <div class="flex-1 text-center w-full md:text-right md:pr-8">\n          <span>'.concat(escapeHtml(v.ajuz), "</span>\n        </div>") : "", '\n      <!-- Hover effect -->\n      <div class="absolute inset-0 -mx-4 rounded-xl bg-white/[0.02] opacity-0\n        group-hover:opacity-100 transition-opacity pointer-events-none"></div>\n    </div>')
  ).join("");
}
let progressFrame = 0;
function updateProgress() {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(() => {
    progressFrame = 0;
    const progressBar = document.getElementById("progressBar");
    if (!progressBar) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? winScroll / height * 100 : 0;
    progressBar.style.width = "".concat(Math.min(scrolled, 100), "%");
  });
}
