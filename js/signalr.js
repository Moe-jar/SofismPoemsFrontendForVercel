// SignalR + Polling fallback for real-time updates
import { POLL_INTERVAL } from "./config.js";

let pollTimer = null;
const listeners = {};
let activePoll = null;

// Simple event emitter
function emit(event, data) {
  [...(listeners[event] || [])].forEach((fn) => fn(data));
}

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  if (!listeners[event].includes(fn)) listeners[event].push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(f => f !== fn);
  if (listeners[event].length === 0) delete listeners[event];
}

// Polling-based fallback (always used since we don't bundle SignalR client)
export function startPolling(fetchCurrentPoem, fetchCurrentWasla) {
  stopPolling();
  const pollRun = { inFlight: false };
  activePoll = pollRun;

  const poll = async () => {
    if (activePoll !== pollRun || pollRun.inFlight) return;
    pollRun.inFlight = true;

    try {
      if (fetchCurrentPoem) {
        const poem = await fetchCurrentPoem();
        if (activePoll !== pollRun) return;
        emit("currentPoemUpdated", poem);
      }
      if (fetchCurrentWasla) {
        const wasla = await fetchCurrentWasla();
        if (activePoll !== pollRun) return;
        emit("currentWaslaUpdated", wasla);
      }
    } catch (err) {
      if (activePoll === pollRun) {
        console.warn("Polling error:", err.message);
      }
    } finally {
      pollRun.inFlight = false;
    }
  };

  poll(); // immediate first call
  pollTimer = setInterval(poll, POLL_INTERVAL);
}

export function stopPolling() {
  activePoll = null;
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
