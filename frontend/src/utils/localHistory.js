// Mahalliy tarix (backend yo'q yoki VITE_DEMO bo'lganda)
const KEY = 'medai_local_history';

export function readLocalHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function appendLocalHistory({ symptoms, results, top_diagnosis }) {
  const items = readLocalHistory();
  const entry = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    created_at: new Date().toISOString(),
    symptoms: Array.isArray(symptoms) ? symptoms : [],
    results: Array.isArray(results) ? results : [],
    top_diagnosis: top_diagnosis || results?.[0]?.name || '—',
  };
  items.unshift(entry);
  writeLocalHistory(items);
  return entry;
}

export function deleteLocalHistory(id) {
  const sid = String(id);
  writeLocalHistory(readLocalHistory().filter((x) => String(x.id) !== sid));
}

export function getLocalHistoryPage(limit, offset) {
  const all = readLocalHistory();
  return {
    items: all.slice(offset, offset + limit),
    total: all.length,
  };
}

export function computeHistoryStats(items) {
  const total = items.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const this_week = items.filter((i) => new Date(i.created_at).getTime() >= weekAgo).length;
  const counts = {};
  for (const i of items) {
    const d = i.top_diagnosis || '—';
    if (d && d !== '—') counts[d] = (counts[d] || 0) + 1;
  }
  let top_disease = '—';
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      top_disease = k;
    }
  }
  return { total, this_week, top_disease };
}
