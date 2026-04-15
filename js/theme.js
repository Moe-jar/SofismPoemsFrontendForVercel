// Theme toggle and persistence for ديوان الصوفية

const THEME_KEY = "divan_theme";
const THEMES = {
  dark: { label: "وضع ليلي", icon: "dark_mode" },
  light: { label: "وضع نهاري", icon: "light_mode" },
};

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

function updateToggle(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", theme === "light");

  const text = document.getElementById("themeToggleText");
  const icon = document.getElementById("themeToggleIcon");
  const meta = THEMES[theme] || THEMES.dark;

  if (text) text.textContent = meta.label;
  if (icon) icon.textContent = meta.icon;
}

export function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
  updateToggle(next);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  applyTheme(next);
}

applyTheme(getStoredTheme());

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", toggleTheme);
  updateToggle(getStoredTheme());
});
