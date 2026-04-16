// SignalR + Polling fallback for real-time updates
import { POLL_INTERVAL } from "./config.js";

let pollTimer = null;
let pollInFlight = false;
let visibilityHandler = null;
const listeners = {};

// Simple event emitter
function emit(event, data) {
  const handlers = listeners[event];
  if (!handlers) return;
  handlers.forEach((fn) => fn(data));
}

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  const handlers = listeners[event];
  if (!handlers) return;
  handlers.delete(fn);
  if (!handlers.size) delete listeners[event];
}

// Polling-based fallback (always used since we don't bundle SignalR client)
export function startPolling(fetchCurrentPoem, fetchCurrentWasla) {
  if (pollTimer) stopPolling();

  const poll = async () => {
    if (pollInFlight) return;
    pollInFlight = true;
    try {
      if (fetchCurrentPoem) {
        const poem = await fetchCurrentPoem();
        emit("currentPoemUpdated", poem);
      }
      if (fetchCurrentWasla) {
        const wasla = await fetchCurrentWasla();
        emit("currentWaslaUpdated", wasla);
      }
    } catch (err) {
      console.warn("Polling error:", err.message);
    } finally {
      pollInFlight = false;
    }
  };

  const schedulePoll = () => {
    if (document.hidden) return;
    poll();
  };

  schedulePoll(); // immediate first visible call
  pollTimer = setInterval(schedulePoll, POLL_INTERVAL);

  visibilityHandler = () => {
    if (!document.hidden) schedulePoll();
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}
