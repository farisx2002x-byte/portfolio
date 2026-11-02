/* ─────────────────────────────────────────────
   محرك الملاءمة (Weighted Overlay)
   المعيار = مجموعة مهارات، له وزن 0..5.
   مطابقة المشروع للمعيار = 0.75 × أعلى مستوى مهارة مستخدمة/5
                            + 0.25 × نسبة مهارات المجموعة المستخدمة.
   الدرجة = Σ(وزن × مطابقة) ÷ Σ(وزن) × 100.
   ───────────────────────────────────────────── */
import { state } from "./core.js";

export const weights = {};            // { groupId: 0..5 }
const listeners = new Set();
export const onWeights = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const classOf = (score) => Math.max(0, Math.min(4, Math.floor(score / 20)));

export function groups() { return state.content.skills.groups.filter((g) => (g.items || []).length); }

export function initWeights() {
  const g = groups();
  let saved = null; try { saved = JSON.parse(sessionStorage.getItem("fa-weights") || "null"); } catch {}
  for (const x of g) weights[x.id] = saved && typeof saved[x.id] === "number" ? saved[x.id] : 3;
}
export function setWeights(w, presetId = null) {
  for (const k of Object.keys(weights)) if (typeof w[k] === "number") weights[k] = Math.max(0, Math.min(5, w[k]));
  try { sessionStorage.setItem("fa-weights", JSON.stringify(weights)); } catch {}
  for (const fn of listeners) fn(weights, presetId);
}
export function equalWeights() { const w = {}; for (const k of Object.keys(weights)) w[k] = 3; setWeights(w, "equal"); }

/* مطابقة عنصر (مشروع/خدمة) لمجموعة */
export function matchGroup(item, g) {
  const ids = new Set(item.skills || []); const items = g.items || [];
  const used = items.filter((s) => ids.has(s.id)); if (!used.length) return 0;
  const depth = Math.max(...used.map((s) => (s.level || 3) / 5));
  const breadth = Math.min(1, used.length / Math.min(3, items.length)); // ثلاث مهارات من المجموعة = اتساع كامل
  return Math.min(1, 0.75 * depth + 0.25 * breadth);
}

/* درجة عنصر مع تفكيكها */
export function score(item) {
  const gs = groups(); let num = 0, den = 0; const parts = [];
  const allZero = gs.every((g) => !weights[g.id]);
  for (const g of gs) {
    const w = allZero ? 3 : (weights[g.id] ?? 0); const m = matchGroup(item, g);
    num += w * m; den += w; parts.push({ group: g, w, m, contrib: w * m });
  }
  const s = den ? Math.round((num / den) * 100) : 0;
  parts.sort((a, b) => b.contrib - a.contrib);
  return { score: s, k: classOf(s), parts, top: parts.filter((p) => p.contrib > 0).slice(0, 3) };
}

export function rankProjects(list = state.content.projects) {
  return list.map((p) => ({ p, ...score(p) })).sort((a, b) => b.score - a.score || (a.p.order ?? 99) - (b.p.order ?? 99));
}
export function rankServices(list = state.content.services) {
  return list.map((s) => ({ s, ...score(s) })).sort((a, b) => b.score - a.score);
}
