const getApiBase = () => {
  var _a, _b;
  if (typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.VITE_API_BASE)) {
    return process.env.VITE_API_BASE;
  }
  if ((_b = window.__ENV__) == null ? void 0 : _b.API_BASE) {
    return window.__ENV__.API_BASE;
  }
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "https://diwan-sufi-api.onrender.com";
  }
  return "https://diwan-sufi-api.onrender.com";
};
const API_BASE = getApiBase();
const SIGNALR_HUB = "".concat(API_BASE, "/hubs/divan");
const POLL_INTERVAL = 2e4;
if (typeof process !== "undefined" && true) {
  console.log("\u{1F527} Config - API_BASE:", API_BASE);
}
export {
  API_BASE,
  POLL_INTERVAL,
  SIGNALR_HUB
};
