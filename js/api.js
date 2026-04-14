// API module for ديوان الصوفية
// Backend: SofismBoemsAPIs — routes /api/Authors/* and /api/Boems/*
// No authentication backend; login is simulated locally.
import { API_BASE } from './config.js';

// ─── Response Normalizers ─────────────────────────────────────────────────────
// Backend may return PascalCase or camelCase depending on .NET JSON settings.
// Normalise to the camelCase shape the rest of the frontend expects.

function _val(...candidates) {
  for (const v of candidates) {
    if (v !== undefined && v !== null) return v;
  }
  return null;
}

function normalizeAuthor(a) {
  if (!a) return null;
  return {
    id:   _val(a.id, a.iD, a.ID),
    name: _val(a.name, a.Name) ?? '',
  };
}

// authorsMap: { [authorId]: authorName } for joining poet name onto poem
function normalizePoem(p, authorsMap = {}) {
  if (!p) return null;
  const id       = _val(p.id, p.iD, p.ID);
  const authorId = _val(p.poetId, p.authorId, p.authorID, p.AuthorID);
  return {
    id,
    title:        _val(p.title, p.Title) ?? '',
    content:      _val(p.content, p.boemText, p.BoemText) ?? '',
    poetId:       authorId,
    poetName:     _val(p.poetName, p.authorName, authorsMap[authorId]) ?? '',
    maqamId:      _val(p.maqamId, p.MaqamId) ?? null,
    maqamName:    _val(p.maqamName, p.MaqamName) ?? null,
    category:     _val(p.category, p.Category) ?? null,
    hadraSection: _val(p.hadraSection, p.HadraSection) ?? null,
  };
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('divan_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_BASE + path, { ...options, headers });
  } catch (err) {
    throw new Error('تعذر الاتصال بالخادم. تأكد من تشغيل الواجهة الخلفية.');
  }

  if (res.status === 401) {
    localStorage.removeItem('divan_token');
    localStorage.removeItem('divan_user');
    window.location.href = getLoginPath();
    return;
  }

  if (!res.ok) {
    let errMsg = res.statusText;
    try {
      const err = await res.json();
      errMsg = (typeof err === 'string' ? err : null)
        || err.error || err.title || err.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  if (res.status === 204) return null;
  return res.json();
}

function getLoginPath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../login.html';
  return 'login.html';
}

// ─── Auth API (local simulation — backend has no auth endpoints) ──────────────
// The admin username recognised by the backend is "kurdi" (sets current poem).
function _randomHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export const authApi = {
  login: (username, password) => {
    const uname = (username || '').trim().toLowerCase();
    if (!uname || !password) {
      return Promise.reject(new Error('اسم المستخدم وكلمة المرور مطلوبان'));
    }
    const isAdmin = uname === 'kurdi';
    return Promise.resolve({
      token:    _randomHex(32),
      userId:   isAdmin ? 1 : 2,
      fullName: isAdmin ? 'المسؤول' : username,
      username: uname,
      role:     isAdmin ? 'LeadMunshid' : 'Munshid',
    });
  },
  me: () => {
    const user = JSON.parse(localStorage.getItem('divan_user') || 'null');
    if (user) return Promise.resolve(user);
    return Promise.reject(new Error('غير مصرح'));
  },
};

// ─── Authors cache (used to resolve poetName from poetId) ────────────────────
let _authorsCache = null;

async function getAuthorsMap() {
  if (_authorsCache) return _authorsCache;
  try {
    const list = await apiFetch('/api/Authors/All');
    _authorsCache = {};
    (list || []).forEach(a => {
      const id = _val(a.id, a.iD, a.ID);
      if (id != null) _authorsCache[id] = _val(a.name, a.Name) ?? '';
    });
  } catch {
    _authorsCache = {};
  }
  return _authorsCache;
}

// ─── Poets (Authors) API — /api/Authors/* ────────────────────────────────────
export const poetsApi = {
  getAll: async () => {
    const data = await apiFetch('/api/Authors/All');
    return (data || []).map(normalizeAuthor);
  },

  create: async (data) => {
    const result = await apiFetch('/api/Authors/Add', {
      method: 'POST',
      body: JSON.stringify({ ID: 0, Name: data.name || data.Name || '' }),
    });
    // Invalidate cache so new author is picked up
    _authorsCache = null;
    const dto = result?.authorDTO ?? result?.AuthorDTO ?? result;
    return normalizeAuthor(dto);
  },

  update: async (id, data) => {
    const result = await apiFetch('/api/Authors/Update', {
      method: 'PUT',
      body: JSON.stringify({ ID: Number(id), Name: data.name || data.Name || '' }),
    });
    _authorsCache = null;
    const dto = result?.authorDTO ?? result?.AuthorDTO ?? result;
    return normalizeAuthor(dto);
  },

  delete: (id) => {
    _authorsCache = null;
    return apiFetch(`/api/Authors/Delete/${id}`, { method: 'DELETE' });
  },
};

// ─── Maqamat API (not supported by current backend) ──────────────────────────
export const maqamatApi = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.reject(new Error('المقامات غير مدعومة حالياً في الواجهة الخلفية')),
  update: () => Promise.reject(new Error('المقامات غير مدعومة حالياً في الواجهة الخلفية')),
  delete: () => Promise.reject(new Error('المقامات غير مدعومة حالياً في الواجهة الخلفية')),
};

// ─── Poems (Boems) API — /api/Boems/* ────────────────────────────────────────
export const poemsApi = {
  getAll: async (params = {}) => {
    const authorsMap = await getAuthorsMap();
    let raw;
    if (params.query) {
      raw = await apiFetch(`/api/Boems/Search/${encodeURIComponent(params.query)}`);
    } else {
      raw = await apiFetch('/api/Boems/All');
    }

    let items = (raw || []).map(p => normalizePoem(p, authorsMap));

    // Client-side filtering (backend has no filter params)
    if (params.poetId) {
      items = items.filter(p => String(p.poetId) === String(params.poetId));
    }
    if (params.category) {
      items = items.filter(p => p.category === params.category);
    }
    if (params.maqamId) {
      items = items.filter(p => String(p.maqamId) === String(params.maqamId));
    }

    // Client-side pagination (backend returns full list)
    const page     = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start      = (page - 1) * pageSize;

    return { items: items.slice(start, start + pageSize), totalCount, totalPages, page };
  },

  getById: async (id) => {
    const authorsMap = await getAuthorsMap();
    const poem = await apiFetch(`/api/Boems/ById/${id}`);
    return normalizePoem(poem, authorsMap);
  },

  create: async (data) => {
    const body = {
      ID:       0,
      Title:    data.title || data.Title || '',
      BoemText: data.content || data.boemText || data.BoemText || '',
      AuthorID: Number(data.poetId || data.authorId || data.AuthorID || 0),
    };
    const result = await apiFetch('/api/Boems/Add', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const authorsMap = await getAuthorsMap();
    // Backend returns clsPoem object; try boemDTO first, else the root object
    const dto = result?.boemDTO ?? result?.BoemDTO ?? result;
    return normalizePoem(dto, authorsMap);
  },

  // Backend has no update endpoint for poems
  update: () => Promise.reject(new Error('تعديل القصائد غير مدعوم حالياً في الواجهة الخلفية')),

  // Backend has no delete endpoint for poems
  delete: () => Promise.reject(new Error('حذف القصائد غير مدعوم حالياً في الواجهة الخلفية')),
};

// ─── Waslat API (not supported by current backend) ───────────────────────────
export const waslatApi = {
  getAll:       () => Promise.resolve([]),
  getById:      () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  create:       () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  update:       () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  delete:       () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  addItem:      () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  removeItem:   () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
  reorderItems: () => Promise.reject(new Error('الوصلات غير مدعومة حالياً')),
};

// ─── Current state API ────────────────────────────────────────────────────────
export const currentApi = {
  getPoem: async () => {
    try {
      const authorsMap = await getAuthorsMap();
      const raw = await apiFetch('/api/Boems/Current');
      if (!raw) return { poem: null };
      return {
        poem:         normalizePoem(raw, authorsMap),
        sharedByName: 'المسؤول',
        sharedAt:     new Date().toISOString(),
      };
    } catch {
      // 400 = no current poem set; treat as empty
      return { poem: null };
    }
  },

  // Backend: POST /api/Boems/AddToCurrent?id={id}&AdminUserName=kurdi
  // poemId is validated as a positive integer; admin username is taken from the current session.
  sharePoem: (poemId) => {
    const id = parseInt(poemId, 10);
    if (!Number.isInteger(id) || id < 1) {
      return Promise.reject(new Error('معرّف القصيدة غير صالح'));
    }
    const user = JSON.parse(localStorage.getItem('divan_user') || 'null');
    const adminName = (user?.username || '').toLowerCase();
    return apiFetch(
      `/api/Boems/AddToCurrent?id=${id}&AdminUserName=${encodeURIComponent(adminName)}`,
      { method: 'POST' },
    );
  },

  getWasla: async () => {
    try {
      const authorsMap = await getAuthorsMap();
      const raw = await apiFetch('/api/Boems/CurrentListOfBoems');
      if (!raw || !Array.isArray(raw) || !raw.length) return { wasla: null };
      const items = raw.map((p, idx) => {
        const norm = normalizePoem(p, authorsMap);
        return { order: idx + 1, poemId: norm.id, poemTitle: norm.title, poemPoetName: norm.poetName };
      });
      return {
        wasla: { id: 1, name: 'الوصلة الحالية', itemCount: items.length, items },
        sharedByName: 'المسؤول',
        sharedAt:     new Date().toISOString(),
      };
    } catch {
      return { wasla: null };
    }
  },

  shareWasla: () => Promise.reject(new Error('مشاركة الوصلة غير مدعومة حالياً')),
};
