import { authApi } from "../api.js";
import { setAuth, isLoggedIn } from "../auth.js";
import { showToast } from "../ui.js";
if (isLoggedIn()) {
  window.location.href = "../index.html";
}
document.addEventListener("DOMContentLoaded", () => {
  const isEnglish = document.documentElement.getAttribute("lang") === "en";
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const showError = (msg) => {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove("hidden");
    } else {
      showToast(msg, "error");
    }
  };
  const hideError = () => {
    if (errorMsg) errorMsg.classList.add("hidden");
  };
  form == null ? void 0 : form.addEventListener("submit", async (e) => {
    var _a;
    e.preventDefault();
    hideError();
    const username = usernameInput == null ? void 0 : usernameInput.value.trim();
    const password = passwordInput == null ? void 0 : passwordInput.value.trim();
    if (!username || !password) {
      showError(
        isEnglish ? "Please enter username and password." : "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"
      );
      return;
    }
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin"\n      style="animation:spin 0.8s linear infinite">progress_activity</span> '.concat(isEnglish ? "Signing in..." : "\u062C\u0627\u0631\u064A \u0627\u0644\u062F\u062E\u0648\u0644...");
    try {
      const response = await authApi.login(username, password);
      setAuth(response.token, {
        id: response.userId,
        fullName: response.fullName,
        username: response.username,
        role: response.role
      });
      showToast(
        isEnglish ? "Welcome ".concat(response.fullName, " \u{1F44B}") : "\u0623\u0647\u0644\u0627\u064B ".concat(response.fullName, " \u{1F44B}"),
        "success"
      );
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 800);
    } catch (error) {
      showError(
        error.message === "Unauthorized" || ((_a = error.message) == null ? void 0 : _a.includes("401")) ? isEnglish ? "Invalid username or password." : "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" : error.message || (isEnglish ? "Something went wrong. Please try again." : "\u062D\u062F\u062B \u062E\u0637\u0623. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B.")
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
  usernameInput == null ? void 0 : usernameInput.focus();
});
