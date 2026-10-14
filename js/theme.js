// Theme + language preferences for ديوان الصوفية

const THEME_KEY = "divan_theme";
const LANGUAGE_KEY = "divan_language";

const THEMES = {
  dark: {
    icon: "dark_mode",
    label: { ar: "وضع ليلي", en: "Dark mode" },
  },
  light: {
    icon: "light_mode",
    label: { ar: "وضع نهاري", en: "Light mode" },
  },
};

const I18N = {
  "index.pageTitle": {
    ar: "ديوان الصوفية - الرئيسية",
    en: "Sufi Diwan - Home",
  },
  "index.heroTitle": {
    ar: "ديوان الصوفية",
    en: "Sufi Diwan",
  },
  "index.heroSubtitle": {
    ar: "للقراءة والإنشاد الجماعي",
    en: "For Reading and Group Recitation",
  },
  "index.searchPlaceholder": {
    ar: "عن ماذا تبحث في الديوان؟",
    en: "What are you looking for in the Diwan?",
  },
  "index.currentPoemTitle": {
    ar: "القصيدة الحالية",
    en: "Current Poem",
  },
  "index.currentPoemSubtitle": {
    ar: "القصيدة المشتركة حالياً",
    en: "Shared poem right now",
  },
  "index.currentWaslaTitle": {
    ar: "الوصلة الحالية",
    en: "Current Wasla",
  },
  "index.currentWaslaSubtitle": {
    ar: "نظام الإنشاد الجماعي المنظم",
    en: "Organized group recitation mode",
  },
  "index.catalogButton": {
    ar: "عرض فهرس الديوان بالكامل",
    en: "Browse Full Diwan Catalog",
  },
  "index.addPoem": {
    ar: "إضافة قصيدة",
    en: "Add Poem",
  },
  "index.waslat": {
    ar: "الوصلات",
    en: "Waslat",
  },
  "index.featured": {
    ar: "مختارات من الديوان",
    en: "Featured Selections",
  },
  "index.footerWaslat": {
    ar: "الوصلات",
    en: "Waslat",
  },
  "index.settings": {
    ar: "الإعدادات",
    en: "Settings",
  },
  "index.libraryTitle": {
    ar: "الديوان",
    en: "Diwan",
  },
  "index.logoutTitle": {
    ar: "خروج",
    en: "Logout",
  },
  "index.themeAria": {
    ar: "تبديل النمط",
    en: "Toggle theme",
  },
  "login.pageTitle": {
    ar: "دخول - ديوان الصوفية",
    en: "Login - Sufi Diwan",
  },
  "login.brandTitle": {
    ar: "ديوان الصوفية",
    en: "Sufi Diwan",
  },
  "login.brandSubtitle": {
    ar: "للقراءة والإنشاد الجماعي",
    en: "For Reading and Group Recitation",
  },
  "login.heading": {
    ar: "تسجيل الدخول",
    en: "Sign In",
  },
  "login.username": {
    ar: "اسم المستخدم",
    en: "Username",
  },
  "login.usernamePlaceholder": {
    ar: "اسم المستخدم",
    en: "Username",
  },
  "login.password": {
    ar: "كلمة المرور",
    en: "Password",
  },
  "login.passwordPlaceholder": {
    ar: "كلمة المرور",
    en: "Password",
  },
  "login.passwordToggleAria": {
    ar: "إظهار/إخفاء كلمة المرور",
    en: "Show or hide password",
  },
  "login.submit": {
    ar: "دخول",
    en: "Sign In",
  },
  "login.demoUsers": {
    ar: "مستخدمون للتجربة:",
    en: "Demo users:",
  },
  "login.demoLeadRole": {
    ar: "منشد رئيسي",
    en: "Lead Munshid",
  },
  "login.demoMunshidRole": {
    ar: "منشد",
    en: "Munshid",
  },
  "pages.poemsTitle": {
    ar: "قائمة القصائد - ديوان الصوفية",
    en: "Poems List - Sufi Diwan",
  },
  "pages.waslatTitle": {
    ar: "الوصلات - ديوان الصوفية",
    en: "Waslat - Sufi Diwan",
  },
  "pages.currentPoemTitle": {
    ar: "القصيدة الحالية - ديوان الصوفية",
    en: "Current Poem - Sufi Diwan",
  },
  "pages.currentWaslaTitle": {
    ar: "الوصلة الحالية - ديوان الصوفية",
    en: "Current Wasla - Sufi Diwan",
  },
  "pages.viewPoemTitle": {
    ar: "عرض القصيدة - ديوان الصوفية",
    en: "View Poem - Sufi Diwan",
  },
  "pages.addPoemTitle": {
    ar: "إضافة قصيدة - ديوان الصوفية",
    en: "Add Poem - Sufi Diwan",
  },
};

const AUTO_UI_TEXT_AR_TO_EN = {
  الرئيسية: "Home",
  الديوان: "Diwan",
  الوصلات: "Waslat",
  القائمة: "Menu",
  حالية: "Current",
  خروج: "Logout",
  رجوع: "Back",
  مباشر: "Live",
  الإعدادات: "Settings",
  "ديوان الصوفية": "Sufi Diwan",
  "رحلة في الشعر العرفاني": "A Journey in Mystical Poetry",
  "القصيدة الحالية": "Current Poem",
  "الوصلة الحالية": "Current Wasla",
  "القصيدة المشتركة حالياً": "Shared poem right now",
  "القصيدة المشتركة حاليا": "Shared poem right now",
  "نظام الإنشاد الجماعي المنظم": "Organized group recitation mode",
  "عرض فهرس الديوان بالكامل": "Browse Full Diwan Catalog",
  "مختارات من الديوان": "Featured Selections",
  "إضافة قصيدة": "Add Poem",
  "إضافة قصيدة جديدة": "Add New Poem",
  "تصفح الديوان": "Browse Diwan",
  "لا توجد قصيدة حالية": "No current poem",
  "لا توجد وصلة حالية": "No current wasla",
  "ينتظر المنشد الرئيسي مشاركة قصيدة ليراها الجميع في الوقت الفعلي.":
    "Waiting for the lead munshid to share a poem in real time.",
  "ينتظر المنشد الرئيسي مشاركة وصلة جديدة.":
    "Waiting for the lead munshid to share a new wasla.",
  "شارك بواسطة:": "Shared by:",
  "قراءة القصيدة كاملة": "Read Full Poem",
  مقام: "Maqam",
  "مقام موسيقي": "Musical Maqam",
  "تفاصيل الوصلة": "Wasla Details",
  "وصلة جديدة": "New Wasla",
  "إنشاء وصلة جديدة": "Create New Wasla",
  "اسم الوصلة *": "Wasla Name *",
  "اسم الوصلة مطلوب": "Wasla name is required",
  "مثل: وصلة البردة...": "e.g. Burda wasla...",
  "الوصف (اختياري)": "Description (optional)",
  "وصف الوصلة...": "Wasla description...",
  "إنشاء الوصلة": "Create Wasla",
  "إضافة قصيدة للوصلة": "Add Poem to Wasla",
  "ابحث عن قصيدة...": "Search for a poem...",
  "لا توجد نتائج": "No results",
  "لا توجد قصائد في هذه الوصلة": "No poems in this wasla",
  "لا توجد قصائد في هذه الوصلة بعد": "No poems in this wasla yet",
  "هل تريد حذف هذه القصيدة من الوصلة؟": "Remove this poem from the wasla?",
  "حذف من الوصلة": "Remove from wasla",
  "اقرأ القصيدة": "Read Poem",
  مشاركة: "Share",
  "مشاركة مع الجميع": "Share with everyone",
  حذف: "Delete",
  "حذف الوصلة": "Delete Wasla",
  "تم حذف الوصلة": "Wasla deleted",
  "تم مشاركة الوصلة مع الجميع": "Wasla shared with everyone",
  "تم إنشاء الوصلة بنجاح": "Wasla created successfully",
  "لا توجد وصلة حالية الآن": "No current wasla at the moment",
  "تعذر فتح الوصلة الحالية": "Could not open the current wasla",
  "جاري تحميل الوصلات...": "Loading waslat...",
  "لا توجد وصلات بعد. أنشئ وصلتك الأولى!":
    "No waslat yet. Create your first wasla!",
  "جاري تحميل الوصلة...": "Loading wasla...",
  "إضافة للوصلة": "Add to wasla",
  "عرض للجميع": "Share with everyone",
  "إشارة مرجعية": "Bookmark",
  "إزالة الإشارة المرجعية": "Remove bookmark",
  "إضافة إشارة مرجعية": "Add bookmark",
  "تم حفظ القصيدة في الإشارات المرجعية": "Poem saved to bookmarks",
  "تم إزالة القصيدة من الإشارات المرجعية": "Poem removed from bookmarks",
  "تم مشاركة القصيدة مع الجميع": "Poem shared with everyone",
  "تم حذف القصيدة": "Poem deleted",
  "تم حذف القصيدة بنجاح": "Poem deleted successfully",
  "تم حذف القصيدة من الوصلة": "Poem removed from wasla",
  "تمت إضافة القصيدة للوصلة": "Poem added to wasla",
  "اختر قصيدة أولا": "Select a poem first",
  "يرجى اختيار الوصلة": "Please choose a wasla",
  "القصيدة:": "Poem:",
  "اختر الوصلة": "Select wasla",
  "اختر الوصلة...": "Select wasla...",
  "جاري التحميل...": "Loading...",
  "لا توجد وصلات": "No waslat",
  "لا توجد وصلات بعد": "No waslat yet",
  "تعذر تحميل الوصلات": "Could not load waslat",
  "قائمة القصائد": "Poems List",
  "كل القصائد": "All poems",
  الكل: "All",
  إلهيات: "Ilahiyyat",
  نبويات: "Nabawiyyat",
  حضرة: "Hadra",
  مفرد: "Mufrad",
  "جميع الشعراء": "All poets",
  "جميع المقامات": "All maqamat",
  "جاري تحميل القصائد...": "Loading poems...",
  "لا توجد قصائد تطابق البحث": "No poems match your search",
  تعديل: "Edit",
  "حذف القصيدة": "Delete Poem",
  "لا يمكن التراجع عن هذا الإجراء.": "This action cannot be undone.",
  تأكيد: "Confirm",
  إلغاء: "Cancel",
  جديدة: "New",
  "تعذر تحميل قائمة الشعراء": "Could not load poets list",
  "تعذر تحميل قائمة المقامات": "Could not load maqamat list",
  "تعذر تحميل بيانات القصيدة": "Could not load poem data",
  "عنوان القصيدة": "Poem title",
  "نص القصيدة": "Poem text",
  "عنوان القصيدة مطلوب": "Poem title is required",
  "نص القصيدة مطلوب": "Poem text is required",
  "يرجى اختيار الشاعر": "Please choose a poet",
  "يرجى اختيار المقام": "Please choose a maqam",
  "يرجى اختيار تصنيف القصيدة": "Please choose poem category",
  "يرجى اختيار قسم الحضرة": "Please choose hadra section",
  "اسم الشاعر": "Poet name",
  "اسم الشاعر الجديد": "New poet name",
  "اسم الشاعر مطلوب": "Poet name is required",
  "اختر الشاعر...": "Select poet...",
  "اختر المقام...": "Select maqam...",
  "اختر القسم...": "Select section...",
  "اختر التصنيف...": "Select category...",
  "+ شاعر جديد...": "+ New poet...",
  "اكتب اسم الشاعر...": "Type poet name...",
  "اكتب أبيات القصيدة هنا، شطر واحد في كل سطر...":
    "Write poem verses here, one hemistich per line...",
  "كل أقسام الحضرة": "All hadra sections",
  الافتتاح: "Opening",
  القيام: "Qiyam",
  ركوع: "Ruku",
  "سطر لكل شطر": "One line per hemistich",
  "يرجى التأكد من صحة التشكيل لضمان دقة القراءة.":
    "Please verify diacritics for accurate reading.",
  "حفظ التعديلات": "Save changes",
  "حفظ كمسودة": "Save as draft",
  "حفظ ونشر": "Save and publish",
  "تعديل قصيدة": "Edit poem",
  "تعذر إضافة الشاعر الجديد": "Could not add new poet",
  "تم تحديث القصيدة بنجاح": "Poem updated successfully",
  "تم حفظ المسودة بنجاح": "Draft saved successfully",
  "تم نشر القصيدة بنجاح": "Poem published successfully",
  "حدث خطأ أثناء الحفظ": "An error occurred while saving",
  "حدث خطأ. حاول مجدداً.": "Something went wrong. Please try again.",
  "جميع الحقوق محفوظة": "All rights reserved",
};

const AUTO_UI_TEXT_EN_TO_AR = Object.fromEntries(
  Object.entries(AUTO_UI_TEXT_AR_TO_EN).map(([ar, en]) => [en, ar]),
);

const AUTO_UI_AR_ENTRIES = Object.entries(AUTO_UI_TEXT_AR_TO_EN).sort(
  (a, b) => b[0].length - a[0].length,
);
const AUTO_UI_EN_ENTRIES = Object.entries(AUTO_UI_TEXT_EN_TO_AR).sort(
  (a, b) => b[0].length - a[0].length,
);

let autoTranslationObserver = null;
let isApplyingAutoTranslation = false;

function replaceEntries(value, entries) {
  let next = value;
  for (const [from, to] of entries) {
    if (!from || !next.includes(from)) continue;
    next = next.split(from).join(to);
  }
  return next;
}

function autoTranslateValue(value, lang) {
  if (typeof value !== "string" || !value.trim()) return value;

  let next = value;

  if (lang === "en") {
    next = next.replace(/(\d+)\s+قصائد?/g, "$1 poems");
    next = next.replace(/حضرة\s*-\s*/g, "Hadra - ");
    next = next.replace(/القصيدة الحالية:\s*/g, "Current Poem: ");
    next = next.replace(/الوصلة الحالية:\s*/g, "Current Wasla: ");
    next = next.replace(/القصيدة:\s*/g, "Poem: ");
    next = next.replace(
      /تم مشاركة\s+"([^"]+)"\s+مع الجميع/g,
      'Shared "$1" with everyone',
    );
    next = next.replace(
      /تم إضافة\s+"([^"]+)"\s+لل?وصلة/g,
      'Added "$1" to wasla',
    );
    next = next.replace(
      /هل أنت متأكد من حذف\s+"([^"]+)"[؟?]/g,
      'Are you sure you want to delete "$1"?',
    );
    next = replaceEntries(next, AUTO_UI_AR_ENTRIES);
    return next;
  }

  next = next.replace(/(\d+)\s+poems?/gi, "$1 قصيدة");
  next = next.replace(/Hadra\s*-\s*/g, "حضرة - ");
  next = next.replace(/Current Poem:\s*/g, "القصيدة الحالية: ");
  next = next.replace(/Current Wasla:\s*/g, "الوصلة الحالية: ");
  next = next.replace(/Poem:\s*/g, "القصيدة: ");
  next = next.replace(
    /Shared\s+"([^"]+)"\s+with everyone/g,
    'تم مشاركة "$1" مع الجميع',
  );
  next = next.replace(/Added\s+"([^"]+)"\s+to wasla/g, 'تم إضافة "$1" للوصلة');
  next = next.replace(
    /Are you sure you want to delete\s+"([^"]+)"\?/g,
    'هل أنت متأكد من حذف "$1"؟',
  );
  next = replaceEntries(next, AUTO_UI_EN_ENTRIES);
  return next;
}

function shouldSkipTranslation(el) {
  if (!el) return true;
  if (el.closest("[data-no-auto-translate]")) return true;
  if (el.closest("#poemBody")) return true;
  if (el.classList?.contains("material-symbols-outlined")) return true;

  const tag = el.tagName;
  return (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "NOSCRIPT" ||
    tag === "CODE" ||
    tag === "PRE"
  );
}

function translateElementAttributes(el, lang) {
  if (!el || shouldSkipTranslation(el)) return;

  ["title", "placeholder", "aria-label"].forEach((attr) => {
    if (!el.hasAttribute(attr)) return;
    const current = el.getAttribute(attr);
    const next = autoTranslateValue(current, lang);
    if (next !== current) el.setAttribute(attr, next);
  });
}

function translateTextNode(node, lang) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const parent = node.parentElement;
  if (!parent || shouldSkipTranslation(parent)) return;

  const current = node.textContent;
  const next = autoTranslateValue(current, lang);
  if (next !== current) node.textContent = next;
}

function translateTree(node, lang) {
  if (!node) return;

  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node, lang);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node;
  if (shouldSkipTranslation(el)) return;

  translateElementAttributes(el, lang);
  el.childNodes.forEach((child) => translateTree(child, lang));
}

function translateDocumentTitle(lang) {
  if (!document.title) return;
  const next = autoTranslateValue(document.title, lang);
  if (next !== document.title) document.title = next;
}

function applyAutomaticUiTranslation(lang) {
  if (!document.body) return;
  isApplyingAutoTranslation = true;
  try {
    translateTree(document.body, lang);
    translateDocumentTitle(lang);
  } finally {
    isApplyingAutoTranslation = false;
  }
}

function ensureAutoTranslationObserver() {
  if (autoTranslationObserver || !document.body) return;

  autoTranslationObserver = new MutationObserver((mutations) => {
    if (isApplyingAutoTranslation) return;

    const lang = getCurrentLanguage();
    isApplyingAutoTranslation = true;
    try {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target, lang);
        }

        mutation.addedNodes.forEach((node) => {
          translateTree(node, lang);
        });
      });
    } finally {
      isApplyingAutoTranslation = false;
    }
  });

  autoTranslationObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    // Backward compatibility with previous naming.
    if (saved === "deep" || saved === "classic") return "dark";

    return "dark";
  } catch {
    return "dark";
  }
}

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {}

  const htmlLang = document.documentElement.getAttribute("lang") || "ar";
  return htmlLang.toLowerCase().startsWith("en") ? "en" : "ar";
}

export function getCurrentLanguage() {
  const htmlLang = document.documentElement.getAttribute("lang") || "ar";
  return htmlLang.toLowerCase().startsWith("en") ? "en" : "ar";
}

function translate(key, lang) {
  const value = I18N[key];
  if (!value) return "";
  return value[lang] || value.ar || "";
}

function applyI18nText(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const next = translate(key, lang);
    if (next) el.textContent = next;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const next = translate(key, lang);
    if (next) el.setAttribute("placeholder", next);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const next = translate(key, lang);
    if (next) el.setAttribute("title", next);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const next = translate(key, lang);
    if (next) el.setAttribute("aria-label", next);
  });
}

function ensureLanguageToggle() {
  let btn = document.getElementById("langToggle");
  if (btn) return btn;
  if (!document.body) return null;

  btn = document.createElement("button");
  btn.id = "langToggle";
  btn.type = "button";
  btn.className = "theme-toggle language-toggle-floating";
  btn.setAttribute("aria-pressed", "false");
  btn.innerHTML = `
    <span class="theme-toggle-label">
      <span class="material-symbols-outlined">translate</span>
      <span data-lang-code>EN</span>
      <span data-lang-label>English</span>
    </span>`;

  document.body.appendChild(btn);
  return btn;
}

function updateLanguageToggle(lang) {
  const btn = document.getElementById("langToggle");
  if (!btn) return;

  const target = lang === "ar" ? "en" : "ar";
  const code = target.toUpperCase();
  const label = target === "en" ? "English" : "العربية";
  const aria = target === "en" ? "Switch to English" : "التبديل إلى العربية";

  const codeEl = btn.querySelector("[data-lang-code]");
  const labelEl = btn.querySelector("[data-lang-label]");

  if (codeEl) codeEl.textContent = code;
  if (labelEl) labelEl.textContent = label;
  btn.setAttribute("aria-label", aria);
}

function updateThemeToggle(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", theme === "light");

  const text = document.getElementById("themeToggleText");
  const icon = document.getElementById("themeToggleIcon");
  const lang = getCurrentLanguage();
  const meta = THEMES[theme] || THEMES.dark;

  if (text) text.textContent = meta.label[lang] || meta.label.ar;
  if (icon) icon.textContent = meta.icon;
}

export function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
  updateThemeToggle(next);
}

export function applyLanguage(language) {
  const next = language === "en" ? "en" : "ar";
  const direction = next === "en" ? "ltr" : "rtl";
  const root = document.documentElement;

  root.setAttribute("lang", next);
  root.setAttribute("dir", direction);
  root.setAttribute("data-language", next);

  applyI18nText(next);
  applyAutomaticUiTranslation(next);
  updateLanguageToggle(next);
  updateThemeToggle(root.getAttribute("data-theme") || getStoredTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  applyTheme(next);
}

function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === "ar" ? "en" : "ar";
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch {}
  applyLanguage(next);
}

function initializePreferenceButtons() {
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn && themeBtn.dataset.bound !== "1") {
    themeBtn.addEventListener("click", toggleTheme);
    themeBtn.dataset.bound = "1";
  }

  const langBtn = ensureLanguageToggle();
  if (langBtn && langBtn.dataset.bound !== "1") {
    langBtn.addEventListener("click", toggleLanguage);
    langBtn.dataset.bound = "1";
  }

  applyI18nText(getCurrentLanguage());
  applyAutomaticUiTranslation(getCurrentLanguage());
  updateLanguageToggle(getCurrentLanguage());
  updateThemeToggle(
    document.documentElement.getAttribute("data-theme") || getStoredTheme(),
  );

  ensureAutoTranslationObserver();
}

applyLanguage(getStoredLanguage());
applyTheme(getStoredTheme());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePreferenceButtons);
} else {
  initializePreferenceButtons();
}
