import { API_BASE } from "./config.js";
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
  }
}
async function apiFetch(path, options = {}) {
  const token = readStorage("divan_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = "Bearer ".concat(token);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const wakeTimer = setTimeout(() => {
      const notice = document.getElementById("backendNotice");
      if (notice) notice.classList.remove("hidden");
    }, 5e3);
    const timeoutTimer = setTimeout(() => controller.abort(), 6e4);
    try {
      const res = await fetch(API_BASE + path, {
        ...options,
        headers,
        signal: controller.signal
      });
      if (res.status === 401) {
        removeStorage("divan_token");
        removeStorage("divan_user");
        window.location.href = getLoginPath();
        return null;
      }
      if (!res.ok) {
        let errMsg = res.statusText;
        try {
          const err = await res.json();
          errMsg = err.error || err.title || err.message || errMsg;
        } catch {
        }
        throw new Error(errMsg);
      }
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.");
      }
      if (attempt === 0 && err.name === "TypeError") continue;
      throw new Error("\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645. \u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u062E\u0644\u0641\u064A\u0629.");
    } finally {
      clearTimeout(wakeTimer);
      clearTimeout(timeoutTimer);
      const notice = document.getElementById("backendNotice");
      if (notice) notice.classList.add("hidden");
    }
  }
}
function getLoginPath() {
  const path = window.location.pathname;
  if (path.includes("/pages/")) return "../login.html";
  return "login.html";
}
const authApi = {
  login: (username, password) => apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  }),
  me: () => apiFetch("/api/auth/me")
};
const poetsApi = {
  getAll: () => apiFetch("/api/poets"),
  create: (data) => apiFetch("/api/poets", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch("/api/poets/".concat(id), { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch("/api/poets/".concat(id), { method: "DELETE" })
};
const maqamatApi = {
  getAll: () => apiFetch("/api/maqamat"),
  create: (data) => apiFetch("/api/maqamat", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch("/api/maqamat/".concat(id), {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  delete: (id) => apiFetch("/api/maqamat/".concat(id), { method: "DELETE" })
};
const poemsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([key, value]) => {
        if (value === void 0 || value === null) return false;
        if (value === "" && key !== "category") return false;
        return true;
      })
    );
    return apiFetch("/api/poems?".concat(qs));
  },
  getById: (id) => apiFetch("/api/poems/".concat(id)),
  create: (data) => apiFetch("/api/poems", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch("/api/poems/".concat(id), { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch("/api/poems/".concat(id), { method: "DELETE" })
};
const waslatApi = {
  getAll: (search) => apiFetch(
    "/api/waslat".concat(search ? "?search=".concat(encodeURIComponent(search)) : "")
  ),
  getById: (id) => apiFetch("/api/waslat/".concat(id)),
  create: (data) => apiFetch("/api/waslat", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch("/api/waslat/".concat(id), {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  delete: (id) => apiFetch("/api/waslat/".concat(id), { method: "DELETE" }),
  addItem: (id, data) => apiFetch("/api/waslat/".concat(id, "/items"), {
    method: "POST",
    body: JSON.stringify(data)
  }),
  removeItem: (id, itemId) => apiFetch("/api/waslat/".concat(id, "/items/").concat(itemId), { method: "DELETE" }),
  reorderItems: (id, data) => apiFetch("/api/waslat/".concat(id, "/items/reorder"), {
    method: "PUT",
    body: JSON.stringify(data)
  })
};
const currentApi = {
  getPoem: () => apiFetch("/api/current/poem"),
  sharePoem: (poemId) => apiFetch("/api/current/poem/share/".concat(poemId), { method: "POST" }),
  getWasla: () => apiFetch("/api/current/wasla"),
  shareWasla: (waslaId) => apiFetch("/api/current/wasla/share/".concat(waslaId), { method: "POST" })
};
function initKeepAlive() {
  setInterval(async () => {
    try {
      await fetch(API_BASE + "/api/poems?pageSize=1");
    } catch (e) {
    }
  }, 10 * 60 * 1e3);
}
export {
  authApi,
  currentApi,
  initKeepAlive,
  maqamatApi,
  poemsApi,
  poetsApi,
  waslatApi
};
