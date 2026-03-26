// Configuration for ديوان الصوفية Frontend
// Supports both development and production environments

// Get API_BASE from environment or use defaults
const getApiBase = () => {
  // Try environment variable first (set by Vercel env vars)
  if (typeof process !== "undefined" && process.env?.VITE_API_BASE) {
    return process.env.VITE_API_BASE;
  }

  // Check window variable (Vercel injects this)
  if (window.__ENV__?.API_BASE) {
    return window.__ENV__.API_BASE;
  }

  // Default based on location
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000"; // Local backend (use HTTP to avoid SSL cert issues)
  }

  // Production default
  return "https://diwan-sufi-api.onrender.com";
};

export const API_BASE = getApiBase();
export const SIGNALR_HUB = `${API_BASE}/hubs/divan`;
export const POLL_INTERVAL = 20000; // 20 seconds polling fallback

// Log configuration in development
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  console.log("🔧 Config - API_BASE:", API_BASE);
}
