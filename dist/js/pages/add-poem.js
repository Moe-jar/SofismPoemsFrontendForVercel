import { requireLead } from "../auth.js";
import { poemsApi, poetsApi, maqamatApi } from "../api.js";
import { showToast } from "../ui.js";
import { escapeHtml, CATEGORY_LABELS, promiseAllSettled } from "../utils.js";
if (!requireLead()) throw new Error("Not authorized");
let editId = null;
document.addEventListener("DOMContentLoaded", async () => {
  var _a, _b, _c, _d;
  const params = new URLSearchParams(window.location.search);
  editId = params.get("id");
  await promiseAllSettled([loadPoets(), loadMaqamat()]);
  if (editId) {
    document.getElementById("pageTitle").textContent = "\u062A\u0639\u062F\u064A\u0644 \u0642\u0635\u064A\u062F\u0629";
    document.getElementById("submitBtn").innerHTML = '\n      <span class="material-symbols-outlined text-lg">save</span> \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A';
    await loadPoemForEdit(editId);
  }
  document.querySelectorAll('input[name="category"]').forEach((radio) => {
    radio.addEventListener("change", () => toggleHadraSection());
  });
  toggleHadraSection();
  (_a = document.getElementById("poetId")) == null ? void 0 : _a.addEventListener("change", (e) => {
    const newPoetGroup = document.getElementById("newPoetGroup");
    if (newPoetGroup) {
      newPoetGroup.classList.toggle("hidden", e.target.value !== "new");
    }
  });
  (_b = document.getElementById("cancelBtn")) == null ? void 0 : _b.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "poems.html";
    }
  });
  (_c = document.getElementById("draftBtn")) == null ? void 0 : _c.addEventListener("click", () => {
    submitForm(true);
  });
  (_d = document.getElementById("poemForm")) == null ? void 0 : _d.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(false);
  });
});
function toggleHadraSection() {
  var _a;
  const selected = (_a = document.querySelector(
    'input[name="category"]:checked'
  )) == null ? void 0 : _a.value;
  const hadraSectionGroup = document.getElementById("hadraSectionGroup");
  if (hadraSectionGroup) {
    hadraSectionGroup.classList.toggle("hidden", selected !== "Hadra");
  }
}
async function loadPoets() {
  const select = document.getElementById("poetId");
  if (!select) return;
  try {
    const poets = await poetsApi.getAll();
    select.innerHTML = '<option value="" disabled selected>\u0627\u062E\u062A\u0631 \u0627\u0644\u0634\u0627\u0639\u0631...</option>' + poets.map(
      (p) => '<option value="'.concat(p.id, '">').concat(escapeHtml(p.nameAr || p.nameEn || p.name || ""), "</option>")
    ).join("") + '<option value="new">+ \u0634\u0627\u0639\u0631 \u062C\u062F\u064A\u062F...</option>';
  } catch {
    showToast("\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0634\u0639\u0631\u0627\u0621", "warning");
  }
}
async function loadMaqamat() {
  const select = document.getElementById("maqamId");
  if (!select) return;
  try {
    const maqamat = await maqamatApi.getAll();
    select.innerHTML = '<option value="" disabled selected>\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0642\u0627\u0645...</option>' + maqamat.map(
      (m) => '<option value="'.concat(m.id, '">').concat(escapeHtml(m.nameAr || m.nameEn || m.name || ""), "</option>")
    ).join("");
  } catch {
    showToast("\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0642\u0627\u0645\u0627\u062A", "warning");
  }
}
async function loadPoemForEdit(id) {
  var _a, _b;
  try {
    const poem = await poemsApi.getById(id);
    document.getElementById("title").value = poem.title || "";
    const bodyText = (_b = (_a = poem.body) != null ? _a : poem.content) != null ? _b : "";
    document.getElementById("content").value = bodyText;
    const categoryMap = {
      Ilahiyat: "Ilahiyyat",
      Nabawiyat: "Nabawiyyat"
    };
    const hadraSectionMap = {
      Opening: "Matali",
      Main: "Qiyam",
      Closing: "Ghinaa"
    };
    const poetSelect = document.getElementById("poetId");
    if (poetSelect && poem.poetId) poetSelect.value = poem.poetId;
    const maqamSelect = document.getElementById("maqamId");
    if (maqamSelect && poem.maqamId) maqamSelect.value = poem.maqamId;
    const normalizedCategory = categoryMap[poem.category] || poem.category;
    const categoryRadio = document.querySelector(
      'input[name="category"][value="'.concat(normalizedCategory, '"]')
    );
    if (categoryRadio) categoryRadio.checked = true;
    const hadraSelect = document.getElementById("hadraSection");
    const normalizedHadra = hadraSectionMap[poem.hadraSection] || poem.hadraSection;
    if (hadraSelect && normalizedHadra) hadraSelect.value = normalizedHadra;
    toggleHadraSection();
  } catch (err) {
    showToast("\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u0635\u064A\u062F\u0629", "error");
  }
}
async function submitForm(isDraft = false) {
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const poetSelect = document.getElementById("poetId");
  const maqamSelect = document.getElementById("maqamId");
  const categoryInput = document.querySelector(
    'input[name="category"]:checked'
  );
  const hadraSectionSelect = document.getElementById("hadraSection");
  const newPoetInput = document.getElementById("newPoetName");
  clearErrors();
  let valid = true;
  if (!(titleInput == null ? void 0 : titleInput.value.trim())) {
    showFieldError("titleError", "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0637\u0644\u0648\u0628");
    valid = false;
  }
  if (!(contentInput == null ? void 0 : contentInput.value.trim())) {
    showFieldError("contentError", "\u0646\u0635 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0645\u0637\u0644\u0648\u0628");
    valid = false;
  }
  if (!(poetSelect == null ? void 0 : poetSelect.value)) {
    showFieldError("poetError", "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0634\u0627\u0639\u0631");
    valid = false;
  }
  if (!(maqamSelect == null ? void 0 : maqamSelect.value)) {
    showFieldError("maqamError", "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u0642\u0627\u0645");
    valid = false;
  }
  if (!categoryInput) {
    showFieldError("categoryError", "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0642\u0635\u064A\u062F\u0629");
    valid = false;
  }
  if ((categoryInput == null ? void 0 : categoryInput.value) === "Hadra" && !(hadraSectionSelect == null ? void 0 : hadraSectionSelect.value)) {
    showFieldError("hadraSectionError", "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0642\u0633\u0645 \u0627\u0644\u062D\u0636\u0631\u0629");
    valid = false;
  }
  if (!valid) return;
  let poetId = poetSelect == null ? void 0 : poetSelect.value;
  if (poetId === "new") {
    const newName = newPoetInput == null ? void 0 : newPoetInput.value.trim();
    if (!newName) {
      showFieldError("newPoetError", "\u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0639\u0631 \u0645\u0637\u0644\u0648\u0628");
      return;
    }
    try {
      const created = await poetsApi.create({ nameAr: newName });
      poetId = created.id;
    } catch (err) {
      showToast("\u062A\u0639\u0630\u0631 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0634\u0627\u0639\u0631 \u0627\u0644\u062C\u062F\u064A\u062F", "error");
      return;
    }
  }
  const normalizeId = (value) => {
    if (!value) return null;
    return typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  };
  const bodyText = contentInput.value.trim();
  const data = {
    title: titleInput.value.trim(),
    body: bodyText,
    content: bodyText,
    poetId: normalizeId(poetId),
    maqamId: normalizeId(maqamSelect == null ? void 0 : maqamSelect.value),
    category: (categoryInput == null ? void 0 : categoryInput.value) || null,
    hadraSection: (categoryInput == null ? void 0 : categoryInput.value) === "Hadra" ? (hadraSectionSelect == null ? void 0 : hadraSectionSelect.value) || null : null
  };
  const submitBtn = document.getElementById("submitBtn");
  const draftBtn = document.getElementById("draftBtn");
  const btn = isDraft ? draftBtn : submitBtn;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML += ' <span style="opacity:.7">...</span>';
  }
  try {
    if (editId) {
      await poemsApi.update(editId, data);
      showToast("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D", "success");
    } else {
      const created = await poemsApi.create(data);
      showToast(
        isDraft ? "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0633\u0648\u062F\u0629 \u0628\u0646\u062C\u0627\u062D" : "\u062A\u0645 \u0646\u0634\u0631 \u0627\u0644\u0642\u0635\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D",
        "success"
      );
      if (!isDraft) {
        setTimeout(() => {
          window.location.href = "view-poem.html?id=".concat(created.id);
        }, 800);
        return;
      }
    }
    setTimeout(() => {
      window.location.href = "poems.html";
    }, 800);
  } catch (err) {
    showToast(err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0641\u0638", "error");
    if (btn) {
      btn.disabled = false;
    }
  }
}
function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.remove("hidden");
  }
}
function clearErrors() {
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
}
