/* ─────────────────────────────────────────────
   الملفات: استعراض الشهادات كملفات على مكتب؛ افتح ملفاً فتتطاير شهاداته مروحةً أمامك،
   مع شريط سنوات يبرز ما حصل في كل سنة. (transform/opacity فقط، ويحترم تقليل الحركة)
   ───────────────────────────────────────────── */
import { state, t, L, has, esc, $, $$, reduce, fmtDate } from "./core.js";

const GROUPS = [
  { id: "honors", cats: ["honors"], ar: "تكريم وشكر", en: "Honours & thanks", tone: "gold" },
  { id: "volunteer", cats: ["volunteer"], ar: "التطوع", en: "Volunteering", tone: "teal" },
  { id: "courses", cats: ["professional", "planning", "language", "other"], ar: "دورات وتعلّم", en: "Courses & learning", tone: "blue" },
];
const UI = {
  ar: { lead: "اختر ملفاً فتتطاير شهاداته أمامك؛ مرّر على أي شهادة لترفعها، واضغطها لتقرأها كاملة.", hint: "افتح ملفاً", close: "أغلق الملف", cert: "شهادة", certs: "شهادات", all: "كل السنوات", list: "عرض القائمة", fan: "عرض الملفات", nofile: "بلا ملف منشور" },
  en: { lead: "Open a folder and its certificates fan out; hover one to lift it, click to read it in full.", hint: "Open a folder", close: "Close folder", cert: "certificate", certs: "certificates", all: "All years", list: "List view", fan: "Folders view", nofile: "no file published" },
};
const s = (k) => (UI[state.lang] || UI.ar)[k];
const yearOf = (x) => String(x.date || "").slice(0, 4);

export function dossierHtml(certs) {
  const groups = GROUPS.map((g) => ({ ...g, items: certs.filter((x) => g.cats.includes(x.category || "other")) })).filter((g) => g.items.length);
  const years = [...new Set(certs.map(yearOf).filter(Boolean))].sort();
  return `<p class="lead">${esc(s("lead"))}</p>
  <div class="dossier" id="dossier">
    <div class="desk">${groups.map((g, i) => `<button class="folder tone-${g.tone}" type="button" data-folder="${g.id}" style="--i:${i}" aria-expanded="false"><span class="f-back"></span><span class="f-papers">${g.items.slice(0, 3).map((x, k) => `<i style="--k:${k}">${has(x.image) ? `<img src="${esc(x.image)}" alt="" loading="lazy" decoding="async">` : ""}</i>`).join("")}</span><span class="f-front"><b class="f-name">${esc(state.lang === "ar" ? g.ar : g.en)}</b><span class="f-count mono">${g.items.length} ${esc(g.items.length === 1 ? s("cert") : s("certs"))}</span></span><span class="f-tab"></span></button>`).join("")}</div>
    <div class="fan" id="fan" aria-live="polite"><div class="fan-hint" id="fan-hint"><i></i>${esc(s("hint"))}</div></div>
    <div class="years" id="cert-years"><button class="chip" data-year="all" aria-pressed="true">${esc(s("all"))}</button>${years.map((y) => `<button class="chip" data-year="${y}" aria-pressed="false">${y}<small>${certs.filter((x) => yearOf(x) === y).length}</small></button>`).join("")}</div>
  </div>`;
}

export function initDossier(certs, open) {
  const root = $("#dossier"); if (!root) return; const fan = $("#fan"), hint = $("#fan-hint");
  let cur = null, year = "all";
  const byDate = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));
  const groups = Object.fromEntries(GROUPS.map((g) => [g.id, certs.filter((x) => g.cats.includes(x.category || "other")).sort(byDate)]));
  const layout = () => {
    const cards = $$(".fcard", fan); const n = cards.length; if (!n) return; const W = fan.clientWidth; const cw = Math.min(230, Math.max(150, W * .3));
    const step = n > 1 ? Math.min(cw * .62, (W - cw - 24) / (n - 1)) : 0; const mid = (n - 1) / 2;
    const sg = document.documentElement.dir === "rtl" ? -1 : 1;
    cards.forEach((c, i) => { const d = i - mid; const dim = year !== "all" && c.dataset.y !== year; c.style.setProperty("--x", `${(d * step * sg).toFixed(1)}px`); c.style.setProperty("--r", `${(d * Math.min(7, 42 / n) * sg).toFixed(2)}deg`); c.style.setProperty("--y", `${(d * d * (120 / (n * n)) + (dim ? 26 : 0)).toFixed(1)}px`); c.style.setProperty("--w", `${cw}px`); c.style.setProperty("--i", i); c.classList.toggle("dim", dim); c.style.zIndex = String(10 - Math.round(Math.abs(d))); });
    fan.style.height = `${Math.round(cw * .68 + 90 + (n > 1 ? 24 : 0))}px`;
  };
  const openFolder = (id) => {
    if (cur === id) { closeFolder(); return; } cur = id; root.dataset.open = id; hint.hidden = true;
    $$(".folder", root).forEach((f) => { f.classList.toggle("open", f.dataset.folder === id); f.setAttribute("aria-expanded", String(f.dataset.folder === id)); });
    const list = groups[id] || []; fan.querySelectorAll(".fcard").forEach((c) => c.remove());
    fan.insertAdjacentHTML("beforeend", list.map((x, i) => `<button class="fcard${has(x.image) ? "" : " nofile"}" type="button" data-id="${esc(x.id)}" data-y="${esc(yearOf(x))}" style="--i:${i}" aria-label="${esc(L(x.title))}">${has(x.image) ? `<img src="${esc(x.image)}" alt="" loading="lazy" decoding="async">` : `<span class="ph">${esc(s("nofile"))}</span>`}<span class="fc-cap"><b>${esc(L(x.title))}</b>${x.date ? `<small class="mono">${esc(fmtDate(x.date))}</small>` : ""}</span></button>`).join(""));
    layout(); requestAnimationFrame(() => requestAnimationFrame(() => fan.classList.add("out")));
    $$(".fcard", fan).forEach((c) => c.addEventListener("click", () => open(c.dataset.id)));
  };
  const closeFolder = () => { cur = null; delete root.dataset.open; fan.classList.remove("out"); $$(".folder", root).forEach((f) => { f.classList.remove("open"); f.setAttribute("aria-expanded", "false"); }); setTimeout(() => { if (!cur) { fan.querySelectorAll(".fcard").forEach((c) => c.remove()); hint.hidden = false; fan.style.height = ""; } }, reduce ? 0 : 500); };
  $$(".folder", root).forEach((f) => f.addEventListener("click", () => openFolder(f.dataset.folder)));
  $$("[data-year]", root).forEach((b) => b.addEventListener("click", () => { year = b.dataset.year; $$("[data-year]", root).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); if (!cur) { const g = GROUPS.find((g) => groups[g.id].some((x) => year === "all" || yearOf(x) === year)); if (g) openFolder(g.id); } else layout(); }));
  addEventListener("resize", () => { clearTimeout(root._rt); root._rt = setTimeout(layout, 120); });
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("in"); io.disconnect(); } }), { threshold: .3 }); io.observe(root); } else root.classList.add("in");
}
