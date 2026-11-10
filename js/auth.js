// Authentication utilities for ديوان الصوفية
import "./theme.js";

const TOKEN_KEY = "divan_token";
const USER_KEY = "divan_user";

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getToken() {
  return readStorage(TOKEN_KEY);
}

export function getUser() {
  const u = readStorage(USER_KEY);
  try {
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  writeStorage(TOKEN_KEY, token);
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function isLoggedIn() {
  return !!getToken();
}

export function isLead() {
  const u = getUser();
  return u && u.role === "LeadMunshid";
}

export function requireAuth(redirectTo = "../login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

export function requireLead(redirectTo = "../index.html") {
  if (!isLead()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

export function logout() {
  clearAuth();
  window.location.href = "../login.html";
}
