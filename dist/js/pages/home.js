import { requireAuth, getUser, isLead, logout } from "../auth.js";
import { currentApi, poemsApi, initKeepAlive } from "../api.js";
import { showToast } from "../ui.js";
import { promiseAllSettled } from "../utils.js";
if (!requireAuth("login.html")) throw new Error("Not authenticated");
function isEnglish() {
  return document.documentElement.getAttribute("lang") === "en";
}
function getRoleLabel(role) {
  if (role === "LeadMunshid")
    return isEnglish() ? "Lead Munshid" : "\u0645\u0646\u0634\u062F \u0631\u0626\u064A\u0633\u064A";
  return isEnglish() ? "Munshid" : "\u0645\u0646\u0634\u062F";
}
function getPoemsCountLabel(count) {
  return isEnglish() ? "".concat(count, " poems") : "".concat(count, " \u0642\u0635\u064A\u062F\u0629");
}
document.addEventListener("DOMContentLoaded", async () => {
  var _a, _b, _c, _d, _e, _f, _g;
  const user = getUser();
  initKeepAlive();
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  if (userNameEl)
    userNameEl.textContent = (user == null ? void 0 : user.fullName) || (user == null ? void 0 : user.username) || "";
  if (userRoleEl) userRoleEl.textContent = getRoleLabel(user == null ? void 0 : user.role);
  if (isLead()) {
    document.querySelectorAll(".lead-only").forEach((el) => el.classList.remove("hidden"));
  }
  (_a = document.getElementById("logoutBtn")) == null ? void 0 : _a.addEventListener("click", logout);
  const searchInput = document.getElementById("searchInput");
  (_b = document.getElementById("searchForm")) == null ? void 0 : _b.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput == null ? void 0 : searchInput.value.trim();
    if (q) window.location.href = "pages/poems.html?q=".concat(encodeURIComponent(q));
    else window.location.href = "pages/poems.html";
  });
  const [poemResult, waslaResult, poemsResult] = await promiseAllSettled([
    currentApi.getPoem(),
    currentApi.getWasla(),
    poemsApi.getAll({ page: 1, pageSize: 3 })
  ]);
  (_c = document.getElementById("backendNotice")) == null ? void 0 : _c.classList.add("hidden");
  if (poemResult.status === "fulfilled") {
    renderCurrentPoem(poemResult.value);
  } else {
    console.warn("Could not load current poem:", (_d = poemResult.reason) == null ? void 0 : _d.message);
  }
  if (waslaResult.status === "fulfilled") {
    renderCurrentWasla(waslaResult.value);
  } else {
    console.warn("Could not load current wasla:", (_e = waslaResult.reason) == null ? void 0 : _e.message);
  }
  if (poemsResult.status === "fulfilled") {
    renderFeaturedPoems(((_f = poemsResult.value) == null ? void 0 : _f.items) || []);
  } else {
    console.warn("Could not load featured poems:", (_g = poemsResult.reason) == null ? void 0 : _g.message);
  }
});
function renderCurrentPoem(state) {
  var _a;
  const card = document.getElementById("currentPoemCard");
  const noPoem = document.getElementById("noPoemMsg");
  if (!card) return;
  if (state == null ? void 0 : state.poem) {
    if (noPoem) noPoem.classList.add("hidden");
    card.innerHTML = '\n      <div class="flex items-center gap-4">\n        <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">\n          <span class="material-symbols-outlined text-primary-light text-2xl">menu_book</span>\n        </div>\n        <div class="flex-1 min-w-0">\n          <h3 class="text-white font-serif font-bold text-lg truncate">'.concat(state.poem.title, '</h3>\n          <p class="text-[#9db8b6] text-sm truncate">').concat(state.poem.poetName || "", '</p>\n        </div>\n        <a href="pages/view-poem.html?id=').concat(state.poem.id, '"\n          class="text-primary-light hover:text-white transition-colors">\n          <span class="material-symbols-outlined rotate-180">arrow_right_alt</span>\n        </a>\n      </div>');
    (_a = card.parentElement) == null ? void 0 : _a.classList.remove("hidden");
  }
}
function renderCurrentWasla(state) {
  const card = document.getElementById("currentWaslaCard");
  if (!card) return;
  if (state == null ? void 0 : state.wasla) {
    card.innerHTML = '\n      <div class="flex items-center gap-4">\n        <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">\n          <span class="material-symbols-outlined text-[#9db8b6] text-2xl">queue_music</span>\n        </div>\n        <div class="flex-1 min-w-0">\n          <h3 class="text-white font-bold text-lg truncate">'.concat(state.wasla.name, '</h3>\n          <p class="text-[#9db8b6] text-sm">').concat(getPoemsCountLabel(state.wasla.itemCount || 0), '</p>\n        </div>\n        <a href="pages/waslat.html?openCurrent=1"\n          class="text-[#9db8b6] hover:text-white transition-colors">\n          <span class="material-symbols-outlined rotate-180">arrow_right_alt</span>\n        </a>\n      </div>');
  }
}
function renderFeaturedPoems(poems) {
  const container = document.getElementById("featuredPoems");
  if (!container || !poems.length) return;
  container.innerHTML = poems.map(
    (p) => '\n    <a href="pages/view-poem.html?id='.concat(p.id, '"\n      class="glass-panel p-5 rounded-2xl flex items-center gap-5 cursor-pointer\n        hover:bg-white/5 transition-colors group">\n      <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-black\n        flex items-center justify-center shrink-0 shadow-lg">\n        <span class="font-serif text-2xl text-white font-bold">\n          ').concat((p.title || "\u061F")[0], '\n        </span>\n      </div>\n      <div class="flex-1 text-right min-w-0">\n        <h3 class="text-white font-serif text-xl leading-none mb-2\n          group-hover:text-primary-light transition-colors truncate">').concat(p.title, '</h3>\n        <p class="text-sm text-[#9db8b6] line-clamp-1">').concat(p.poetName || "", '</p>\n      </div>\n      <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center\n        group-hover:bg-primary group-hover:text-white transition-all text-[#9db8b6]">\n        <span class="material-symbols-outlined text-[20px]">chevron_left</span>\n      </div>\n    </a>')
  ).join("");
}
