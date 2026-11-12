import { POLL_INTERVAL } from "./config.js";
let pollTimer = null;
const listeners = {};
let activePoll = null;
let pollTick = null;
function clearPollTimer() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
function onVisibilityChange() {
  if (!pollTick) return;
  if (document.hidden) {
    clearPollTimer();
    return;
  }
  pollTick();
  clearPollTimer();
  pollTimer = setInterval(pollTick, POLL_INTERVAL);
}
function emit(event, data) {
  [...listeners[event] || []].forEach((fn) => fn(data));
}
function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  if (!listeners[event].includes(fn)) listeners[event].push(fn);
  return () => off(event, fn);
}
function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((f) => f !== fn);
  if (listeners[event].length === 0) delete listeners[event];
}
function startPolling(fetchCurrentPoem, fetchCurrentWasla) {
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
  pollTick = poll;
  document.removeEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (!document.hidden) {
    poll();
    pollTimer = setInterval(poll, POLL_INTERVAL);
  }
}
function stopPolling() {
  activePoll = null;
  pollTick = null;
  document.removeEventListener("visibilitychange", onVisibilityChange);
  clearPollTimer();
}
export {
  off,
  on,
  startPolling,
  stopPolling
};
