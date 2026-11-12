const toastContainer = document.createElement("div");
toastContainer.id = "toast-container";
toastContainer.style.cssText = "\n  position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);\n  z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;\n  pointer-events: none; min-width: 280px; max-width: 90vw;\n";
document.addEventListener("DOMContentLoaded", () => document.body.appendChild(toastContainer));
function showToast(message, type = "info", duration = 3500) {
  const colors = {
    success: "rgba(16,185,129,0.95)",
    error: "rgba(239,68,68,0.95)",
    warning: "rgba(245,158,11,0.95)",
    info: "rgba(21,140,130,0.95)"
  };
  const icons = { success: "check_circle", error: "error", warning: "warning", info: "info" };
  const toast = document.createElement("div");
  toast.style.cssText = "\n    background: ".concat(colors[type] || colors.info, ";\n    color: #fff; padding: 0.875rem 1.25rem; border-radius: 0.875rem;\n    font-family: 'Cairo','Manrope',sans-serif; font-size: 0.9rem; font-weight: 600;\n    display: flex; align-items: center; gap: 0.625rem;\n    box-shadow: 0 8px 24px rgba(0,0,0,0.3);\n    pointer-events: all; cursor: pointer;\n    opacity: 0; transform: translateY(-10px);\n    transition: opacity 0.25s ease, transform 0.25s ease;\n    direction: rtl;\n  ");
  toast.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.1rem;">'.concat(icons[type], "</span><span>").concat(message, "</span>");
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });
  let removed = false;
  let removeTimer;
  const remove = () => {
    if (removed) return;
    removed = true;
    clearTimeout(removeTimer);
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  };
  toast.onclick = remove;
  removeTimer = setTimeout(remove, duration);
}
function showConfirm(message, title = "\u062A\u0623\u0643\u064A\u062F") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "\n      position: fixed; inset: 0; background: rgba(0,0,0,0.7);\n      -webkit-backdrop-filter: none; backdrop-filter: none; z-index: 8888;\n      display: flex; align-items: center; justify-content: center; padding: 1rem;\n    ";
    overlay.innerHTML = "\n      <div style=\"\n        background: rgba(28,38,38,0.95); border: 1px solid rgba(255,255,255,0.1);\n        border-radius: 1.25rem; padding: 2rem; max-width: 400px; width: 100%;\n        font-family: 'Cairo','Manrope',sans-serif; direction: rtl;\n        box-shadow: 0 20px 60px rgba(0,0,0,0.5);\n      \">\n        <h3 style=\"color:#fff;font-size:1.125rem;font-weight:700;margin-bottom:0.75rem;\">".concat(title, '</h3>\n        <p style="color:rgba(255,255,255,0.7);margin-bottom:1.5rem;line-height:1.6;">').concat(message, '</p>\n        <div style="display:flex;gap:0.75rem;justify-content:flex-end;">\n          <button id="confirmNo" style="\n            padding: 0.625rem 1.25rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.15);\n            background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 0.875rem;\n            font-family: inherit; font-weight: 600;\n          ">\u0625\u0644\u063A\u0627\u0621</button>\n          <button id="confirmYes" style="\n            padding: 0.625rem 1.25rem; border-radius: 0.75rem; border: none;\n            background: #ef4444; color: #fff; cursor: pointer; font-size: 0.875rem;\n            font-family: inherit; font-weight: 600;\n          ">\u062A\u0623\u0643\u064A\u062F</button>\n        </div>\n      </div>');
    document.body.appendChild(overlay);
    overlay.querySelector("#confirmYes").onclick = () => {
      overlay.remove();
      resolve(true);
    };
    overlay.querySelector("#confirmNo").onclick = () => {
      overlay.remove();
      resolve(false);
    };
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    };
  });
}
function showLoading(containerId, message = "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...") {
  const el = containerId ? document.getElementById(containerId) : document.body;
  if (!el) return;
  el.innerHTML = '\n    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;\n      padding:3rem;gap:1rem;color:rgba(255,255,255,0.6);font-family:\'Cairo\',sans-serif;">\n      <div style="\n        width:40px;height:40px;border:3px solid rgba(21,140,130,0.3);\n        border-top-color:#158c82;border-radius:50%;animation:spin 0.8s linear infinite;\n      "></div>\n      <span>'.concat(message, "</span>\n    </div>");
}
function showEmpty(containerId, message = "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A", icon = "inbox") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '\n    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;\n      padding:4rem 2rem;gap:1rem;color:rgba(255,255,255,0.4);font-family:\'Cairo\',sans-serif;text-align:center;">\n      <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.5;">'.concat(icon, '</span>\n      <p style="font-size:0.95rem;">').concat(message, "</p>\n    </div>");
}
function renderUserBadge(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("divan_user") || "null");
  } catch {
    user = null;
  }
  if (!user) return;
  const roleLabel = user.role === "LeadMunshid" ? "\u0645\u0646\u0634\u062F \u0631\u0626\u064A\u0633\u064A" : "\u0645\u0646\u0634\u062F";
  el.innerHTML = '\n    <div style="display:flex;align-items:center;gap:0.5rem;">\n      <div style="width:2rem;height:2rem;border-radius:50%;background:rgba(21,140,130,0.3);\n        border:1px solid rgba(21,140,130,0.5);display:flex;align-items:center;justify-content:center;">\n        <span class="material-symbols-outlined" style="font-size:1rem;color:#158c82;">person</span>\n      </div>\n      <div style="display:flex;flex-direction:column;line-height:1.2;">\n        <span style="font-size:0.8rem;font-weight:700;color:#fff;">'.concat(user.fullName || user.username, '</span>\n        <span style="font-size:0.65rem;color:rgba(255,255,255,0.5);">').concat(roleLabel, "</span>\n      </div>\n    </div>");
}
export {
  renderUserBadge,
  showConfirm,
  showEmpty,
  showLoading,
  showToast
};
