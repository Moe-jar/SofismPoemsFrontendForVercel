// Configuration for ديوان الصوفية Frontend
// Supports both development and production environments

// Get API_BASE from environment or use defaults
const getApiBase = () => {
  // Check window variable (can be injected at deploy time)
  if (typeof window !== 'undefined' && window.__ENV__?.API_BASE) {
    return window.__ENV__.API_BASE;
  }

  // Default based on location
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000'; // Local backend
  }

  // Production default
  return 'https://diwan-sufi-api.onrender.com';
};

export const API_BASE = getApiBase();
export const SIGNALR_HUB = `${API_BASE}/hubs/divan`;
export const POLL_INTERVAL = 20000; // 20 seconds polling fallback
