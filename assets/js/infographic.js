/* ─────────────────────────────────────────────
   إنفوجرافيك: أرقام محسوبة من المحتوى (لا أرقام مكتوبة باليد)، رادار المعايير،
   خط الرحلة (محطات مترو زمنية)، ملاحة جانبية بالنقاط، وعدّادات ذكية.
   كل شيء يُشتق من ملفات content/ وقت التشغيل.
   ───────────────────────────────────────────── */
import { state, t, L, has, esc, $, $$, reduce, fmtDate } from "./core.js";
import { cityOf } from "./atlas.js";
import { MOTIFS } from "./themes.js";

const UI = {
  ar: { now_k: "حالياً", now_h: "أعمل الآن <em>مع</em>", now_lead: "عقدان مستمران إلى جانب الدراسة.", ongoing: "مستمر حتى الآن", since: "منذ", months: "شهراً", month: "شهر", years: "سنوات", year: "سنة", and: "و", two_years: "سنتان", two_months: "شهران", projects: "مشروعاً", cities: "مدناً على الخريطة", boards: "بوستراً ولوحة", certs: "شهادة وتكريماً", honors: "تكريماً", tools: "أداة", years: "سنوات نشاط", since: "منذ", journey_k: "خط الرحلة", journey_h: "محطات <em>الرحلة</em>.", journey_lead: "كل محطة تاريخ: دراسة، عمل، تطوع، أو تكريم. مرّر على المحطة لتقرأها.", details: "التفاصيل الكاملة", work: "عمل", study: "دراسة", volunteer: "تطوع", honor: "تكريم", course: "دورة", future: "متوقع", radar_h: "خريطة المعايير", radar_sub: "حجم الدليل لكل معيار: مشاريع وشهادات وخبرات", more: "المزيد", less: "أقل", now: "الآن" },
  en: { now_k: "Now", now_h: "Currently working <em>with</em>", now_lead: "Two ongoing roles alongside my studies.", ongoing: "ongoing", since: "since", months: "months", month: "month", years: "years", year: "year", and: "and", two_years: "2 years", two_months: "2 months", projects: "projects", cities: "cities on the map", boards: "posters & boards", certs: "certificates & honours", honors: "honours", tools: "tools", years: "years active", since: "since", journey_k: "The journey line", journey_h: "Stations of <em>the journey</em>.", journey_lead: "Every station is a date: study, work, volunteering or an honour. Hover a station to read it.", details: "Full details", work: "work", study: "study", volunteer: "volunteer", honor: "honour", course: "course", future: "expected", radar_h: "Criteria map", radar_sub: "Evidence per criterion: projects, certificates, experience", more: "more", less: "less", now: "now" },
};
const s = (k) => (UI[state.lang] || UI.ar)[k];
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MOTIFS[k] || MOTIFS.grid}"/></svg>`;

/* ═══ الأرقام المحسوبة ═══ */
export function computeNumbers(c) {
  const projects = c.projects || [];
  const located = projects.filter((p) => p.location && typeof p.location.lat === "number");
  const cities = new Set(located.map(cityOf).filter(Boolean));
  const years = projects.map((p) => +p.year).filter((y) => y > 2000);
  const minY = years.length ? Math.min(...years) : new Date().getFullYear();
  const span = Math.max(1, new Date().getFullYear() - minY + 1);
  const honors = (c.certificates || []).filter((x) => x.category === "honors").length;
  return [
    { k: "projects", v: projects.length, ic: "grid" },
    { k: "boards", v: (c.posters || []).length, ic: "clipboard" },
    { k: "certs", v: (c.certificates || []).length, ic: "school", sub: honors ? `${honors} ${s("honors")}` : "" },
    { k: "cities", v: cities.size, ic: "compass" },
    { k: "tools", v: ((c.skills && c.skills.tools) || []).length, ic: "cube" },
    { k: "years", v: span, ic: "sun", sub: `${s("since")} ${minY}` },
  ].filter((n) => n.v > 0);
}
export function numbersHtml(c, limit = 6) {
  const ns = computeNumbers(c).slice(0, limit); const max = Math.max(...ns.map((n) => n.v), 1);
  return `<div class="nums rv">${ns.map((n, i) => { const f = Math.max(.12, n.v / max); return `<div class="num" style="--i:${i};--f:${f.toFixed(3)}"><svg class="num-ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="rg" cx="32" cy="32" r="27"/><circle class="rv" cx="32" cy="32" r="27" pathLength="1"/></svg><i class="num-ic">${icon(n.ic)}</i><b class="num-v mono" data-count="${n.v}">0</b><span class="num-l">${esc(s(n.k))}</span>${n.sub ? `<small class="num-s">${esc(n.sub)}</small>` : ""}</div>`; }).join("")}</div>`;
}
export function heroNumsHtml(c) {
  const ns = computeNumbers(c).filter((n) => ["projects", "boards", "certs"].includes(n.k));
  return `<div class="hero-nums rv">${ns.map((n) => `<span><b class="mono" data-count="${n.v}">0</b> ${esc(s(n.k))}</span>`).join('<i class="sep"></i>')}</div>`;
}

/* ═══ العدّادات: تعمل عند الظهور، وتفهم الفواصل والنسب ═══ */
export function initCounters(root = document) {
  const els = $$("[data-count]", root); if (!els.length) return;
  const run = (el) => { if (el.dataset.done) return; el.dataset.done = "1"; const raw = String(el.dataset.count); const m = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/.exec(raw.trim()); if (!m) { el.textContent = raw; return; }
    const pre = m[1], post = m[3], num = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length, grouped = m[2].includes(",");
    const fmt = (v) => { let sv = dec ? v.toFixed(dec) : String(Math.round(v)); if (grouped) sv = sv.replace(/\B(?=(\d{3})+(?!\d))/g, ","); return pre + sv + post; };
    if (reduce) { el.textContent = fmt(num); return; }
    const t0 = performance.now(), dur = 1100 + Math.min(900, Math.log10(Math.abs(num) + 1) * 200);
    const f = (ts) => { const k = Math.min(1, (ts - t0) / dur); el.textContent = fmt(num * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); else el.textContent = fmt(num); }; requestAnimationFrame(f); };
  if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .5 });
  els.forEach((el) => io.observe(el));
}

/* ═══ رادار المعايير: حجم الدليل لكل مجموعة ═══ */
export function radarHtml(groups, graph) {
  const gs = groups.filter((g) => (g.items || []).length); if (gs.length < 3) return "";
  const vals = gs.map((g) => (g.items || []).reduce((a, sk) => { const n = graph.skills.get(sk.id); return a + (n ? n.projects.length + n.certificates.length + n.experience.length : 0); }, 0));
  const max = Math.max(1, ...vals); const R = 112, cx = 230, cy = 160, n = gs.length;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const ring = (f) => gs.map((_, i) => pt(i, R * f).map((v) => v.toFixed(1)).join(",")).join(" ");
  const rr = (v) => R * (0.12 + 0.88 * v / max);
  const poly = vals.map((v, i) => pt(i, rr(v)).map((x) => x.toFixed(1)).join(",")).join(" ");
  const colors = ["#28A085", "#2D6F8E", "#5FD1B4", "#7E6BD1", "#C9B23A", "#B8864A"];
  const icons = { planning: "grid", gis: "compass", geomatics: "drone", design: "cube", digital: "clipboard" };
  return `<div class="radar rv"><div class="radar-head"><b>${esc(s("radar_h"))}</b><small>${esc(s("radar_sub"))}</small></div>
    <svg viewBox="0 0 600 330" class="radar-svg" direction="ltr" aria-hidden="true"><defs><radialGradient id="rfill" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="var(--accent)" stop-opacity=".55"/><stop offset="1" stop-color="var(--accent-2)" stop-opacity=".12"/></radialGradient><linearGradient id="rsweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--accent)" stop-opacity="0"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".35"/></linearGradient></defs>
      <circle class="rbg" cx="${cx}" cy="${cy}" r="${R}"/>${[.25, .5, .75, 1].map((f) => `<polygon class="rg" points="${ring(f)}"/>`).join("")}${gs.map((_, i) => { const [x, y] = pt(i, R); return `<line class="rg" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("")}
      <g class="rsweep" style="transform-origin:${cx}px ${cy}px"><path d="M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 0 1 ${(cx + R * Math.sin(1.1)).toFixed(1)} ${(cy - R * Math.cos(1.1)).toFixed(1)} Z" fill="url(#rsweep)"/></g>
      <polygon class="rp" points="${poly}" fill="url(#rfill)"/><polygon class="rp2" points="${poly}"/>
      ${vals.map((v, i) => { const [x, y] = pt(i, rr(v)); return `<g class="rd" style="--i:${i};--c:${colors[i % colors.length]}"><circle class="rd-h" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/><circle class="rd-c" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/></g>`; }).join("")}
      ${gs.map((g, i) => { const [x, y] = pt(i, R + 34); const ax = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end"; const ix = ax === "middle" ? x - 9 : ax === "start" ? x - 2 : x - 16; return `<g class="rlb" style="--c:${colors[i % colors.length]}"><svg x="${ix.toFixed(1)}" y="${(y - 26).toFixed(1)}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${colors[i % colors.length]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${MOTIFS[icons[g.id]] || MOTIFS.grid}"/></svg><text class="rl${g.id === "planning" ? " prime" : ""}" x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" text-anchor="${ax}">${g.id === "planning" ? "★ " : ""}${esc(L(g.title))}</text><text class="rn mono" x="${x.toFixed(1)}" y="${(y + 20).toFixed(1)}" text-anchor="${ax}">${vals[i]}</text></g>`; }).join("")}
      <text class="rc mono" x="${cx}" y="${cy + 4}" text-anchor="middle">${vals.reduce((a, b) => a + b, 0)}</text></svg></div>`;
}

/* ═══ خط الرحلة ═══ */
const KIND = { job: "work", training: "work", freelance: "work", volunteer: "volunteer", honors: "honor", professional: "course", planning: "course", language: "course", other: "course", edu: "study" };
export function journeyItems(c) {
  const items = [];
  for (const e of c.experience || []) if (e.start) items.push({ d: e.start, kind: KIND[e.type] || "work", title: L(e.role), org: L(e.org), sum: L(e.summary) || "", end: e.end });
  for (const x of c.certificates || []) if (x.date && (x.category === "honors" || ["professional", "planning", "language"].includes(x.category))) items.push({ d: x.date, kind: KIND[x.category] || "course", title: L(x.title), org: L(x.issuer) || "", sum: L(x.note) || "" });
  for (const e of c.education || []) { if (e.end) items.push({ d: String(e.end), kind: "study", title: `${t("expected")} · ${L(e.degree)}`, org: L(e.institution), sum: L(e.notes) || "", future: true }); }
  return items.sort((a, b) => String(a.d).localeCompare(String(b.d)));
}
export function journeyHtml(c) {
  const items = journeyItems(c); if (items.length < 3) return "";
  const n = items.length, W = 1240, H = 300, pad = 120, yMid = 150;
  const xs = items.map((_, i) => pad + (W - 2 * pad) * i / (n - 1));
  const ys = items.map((_, i) => yMid + Math.sin(i * 1.1) * 30);
  const rtl = state.lang === "ar"; const X = (x) => rtl ? W - x : x;
  const seg = (i) => { const x0 = X(xs[i - 1]), x1 = X(xs[i]); const cxm = (x0 + x1) / 2; return `M${x0.toFixed(1)} ${ys[i - 1].toFixed(1)} C${cxm.toFixed(1)} ${ys[i - 1].toFixed(1)} ${cxm.toFixed(1)} ${ys[i].toFixed(1)} ${x1.toFixed(1)} ${ys[i].toFixed(1)}`; };
  let d = `M${X(xs[0]).toFixed(1)} ${ys[0].toFixed(1)}`; for (let i = 1; i < n; i++) d += seg(i).replace(/^M[^C]+/, " ");
  const COL = { work: "#C9B23A", study: "#2D6F8E", volunteer: "#28A085", honor: "#B8864A", course: "#7E6BD1" };
  const years = []; items.forEach((it, i) => { const y = String(it.d).slice(0, 4); if (!years.length || years[years.length - 1].y !== y) years.push({ y, i }); });
  return `<div class="journey rv" id="journey" style="--n:${n}"><svg viewBox="0 0 ${W} ${H}" class="journey-svg" preserveAspectRatio="xMidYMid meet"><defs><pattern id="jgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" stroke-opacity=".08"/></pattern><filter id="jglow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <rect class="jbg" width="${W}" height="${H}" fill="url(#jgrid)"/>
      ${years.map((yr) => `<g class="jy"><line x1="${X(xs[yr.i]).toFixed(1)}" y1="22" x2="${X(xs[yr.i]).toFixed(1)}" y2="${H - 22}"/><text x="${X(xs[yr.i]).toFixed(1)}" y="16" text-anchor="middle" class="mono">${yr.y}</text></g>`).join("")}
      <path class="jl-bg" d="${d}"/><path class="jl-glow" d="${d}" filter="url(#jglow)"/>
      ${items.slice(1).map((it, k) => `<path class="jseg" d="${seg(k + 1)}" pathLength="1" style="--c:${COL[it.kind] || COL.work};--i:${k}"${it.future ? ' stroke-dasharray=".06 .04"' : ""}/>`).join("")}
      ${items.map((it, i) => { const x = X(xs[i]), y = ys[i]; const up = i % 2 === 0; const ty = up ? y - 52 : y + 62; const col = COL[it.kind] || COL.work; const lab = short(it.title, 24); const w = Math.max(60, lab.length * 6.6 + 18); return `<g class="st st-${it.kind}${it.future ? " st-future" : ""}" data-j="${i}" tabindex="0" role="button" style="--i:${i};--c:${col}"><line class="st-tick" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(up ? y - 36 : y + 36).toFixed(1)}"/><circle class="st-halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/><circle class="st-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"/><circle class="st-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/><rect class="st-pill" x="${(x - w / 2).toFixed(1)}" y="${(ty - 13).toFixed(1)}" width="${w.toFixed(1)}" height="20" rx="10"/><text class="st-t" x="${x.toFixed(1)}" y="${(ty + 1).toFixed(1)}" text-anchor="middle">${esc(lab)}</text><text class="st-y mono" x="${x.toFixed(1)}" y="${(up ? y - 38 : y + 50).toFixed(1)}" text-anchor="middle">${esc(fmtDate(it.d))}</text></g>`; }).join("")}
      <g class="train"><rect x="-16" y="-7" width="32" height="14" rx="5"/><rect x="-11" y="-4" width="6" height="5" rx="1.5" class="win"/><rect x="-3" y="-4" width="6" height="5" rx="1.5" class="win"/><rect x="5" y="-4" width="6" height="5" rx="1.5" class="win"/><circle cx="-13" cy="0" r="2" class="lt"/><animateMotion dur="${Math.max(10, n * 1.6)}s" repeatCount="indefinite" rotate="auto"><mpath href="#jpath"/></animateMotion></g>
      <path id="jpath" d="${d}" fill="none" stroke="none"/></svg>
    <div class="journey-legend">${["work", "study", "volunteer", "honor", "course"].map((k) => `<span class="jk jk-${k}"><i></i>${esc(s(k))}</span>`).join("")}<span class="jk jk-future"><i></i>${esc(s("future"))}</span></div>
    <div class="journey-card" id="journey-card" hidden></div></div>`;
}
const short = (x, n) => (x || "").length > n ? x.slice(0, n - 1) + "…" : (x || "");
export function initJourney(c) {
  const root = $("#journey"); if (!root) return; const items = journeyItems(c); const card = $("#journey-card");
  const show = (i) => { const it = items[i]; if (!it) return; $$(".st", root).forEach((g) => g.classList.toggle("on", +g.dataset.j === i)); card.hidden = false; card.className = `journey-card in jc-${it.kind}`;
    card.innerHTML = `<div class="jc-k mono">${esc(fmtDate(it.d))}${it.end ? ` → ${esc(it.end === "present" ? s("now") : fmtDate(it.end))}` : ""} · ${esc(s(it.kind))}</div><h4>${esc(it.title)}</h4>${it.org ? `<div class="jc-o">${esc(it.org)}</div>` : ""}${it.sum ? `<p>${esc(it.sum)}</p>` : ""}`; };
  $$(".st", root).forEach((g) => { g.addEventListener("pointerenter", () => show(+g.dataset.j)); g.addEventListener("focus", () => show(+g.dataset.j)); g.addEventListener("click", () => show(+g.dataset.j)); });
  // افتراضياً: آخر محطة فعلية
  const last = items.map((it, i) => [it, i]).filter(([it]) => !it.future).pop(); if (last) show(last[1]);
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("go"); io.disconnect(); } }), { threshold: .3 }); io.observe(root); } else root.classList.add("go");
}

/* ═══ ملاحة بالنقاط على جانب الشاشة ═══ */
export function initDotsNav() {
  if ($(".dots-nav")) $(".dots-nav").remove();
  const secs = $$("#app > section[id]").filter((sc) => sc.querySelector(".kicker, h1, h2")); if (secs.length < 3) return;
  const nav = document.createElement("nav"); nav.className = "dots-nav"; nav.setAttribute("aria-label", "sections");
  nav.innerHTML = secs.map((sc) => { const k = sc.querySelector(".kicker"); const h = sc.querySelector("h2, h1"); const label = (k ? k.textContent.replace(/^\d\d\s*·\s*/, "") : h ? [...h.childNodes].map((x) => x.textContent).join(" ").replace(/\s+/g, " ") : sc.id).trim(); return `<a href="#${esc(sc.id)}" data-s="${esc(sc.id)}"><i></i><span>${esc(label)}</span></a>`; }).join("");
  document.body.appendChild(nav);
  const links = $$("a", nav);
  const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.s === e.target.id)); }); }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((sc) => io.observe(sc));
  links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const sc = document.getElementById(a.dataset.s); if (sc) scrollTo({ top: sc.getBoundingClientRect().top + scrollY - 64, behavior: reduce ? "auto" : "smooth" }); }));
}

/* ═══ طيّ القوائم الطويلة: أول 5 ثم «المزيد» ═══ */
export function collapseLists(sel, keep = 5) {
  $$(sel).forEach((ul) => { const li = [...ul.children]; if (li.length <= keep + 1) return; li.slice(keep).forEach((x) => x.classList.add("folded")); const b = document.createElement("button"); b.type = "button"; b.className = "fold-btn"; b.textContent = `+${li.length - keep} ${s("more")}`;
    b.addEventListener("click", () => { const open = ul.classList.toggle("open"); b.textContent = open ? s("less") : `+${li.length - keep} ${s("more")}`; }); ul.after(b); });
}

/* ═══ أعمل الآن مع: عقود مستمرة ═══ */
const ym = (d) => { const [y, m] = String(d).split("-").map(Number); return { y, m: m || 1 }; };
const monthsBetween = (a, b) => (b.y - a.y) * 12 + (b.m - a.m);
const nthYear = (n) => { const ar = state.lang === "ar"; const A = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"]; return ar ? `في السنة ${A[n] || n}` : `in year ${n}`; };
const durText = (n) => { const ar = state.lang === "ar"; const y = Math.floor(n / 12), m = n % 12; const parts = [];
  if (y) parts.push(ar ? (y === 1 ? "سنة" : y === 2 ? "سنتان" : `${y} ${y <= 10 ? "سنوات" : "سنة"}`) : `${y} ${y === 1 ? "year" : "years"}`);
  if (m) parts.push(ar ? (m === 1 ? "شهر" : m === 2 ? "شهران" : `${m} ${m <= 10 ? "أشهر" : "شهراً"}`) : `${m} ${m === 1 ? "month" : "months"}`);
  return parts.join(ar ? " و" : " and ") || (ar ? "أقل من شهر" : "< 1 month"); };
export function nowHtml(c) {
  const items = (c.experience || []).filter((e) => e.end === "present" && (e.type === "job" || e.type === "freelance") && e.start); if (!items.length) return "";
  const now = new Date(); const cur = { y: now.getFullYear(), m: now.getMonth() + 1 };
  const starts = items.map((e) => ym(e.since || e.start)); const yearOnly = items.map((e) => !/-/.test(String(e.since || e.start))); const first = starts.reduce((a, b) => monthsBetween(a, b) < 0 ? b : a); const total = Math.max(1, monthsBetween(first, cur));
  const yearTicks = []; for (let y = first.y; y <= cur.y; y++) { const off = monthsBetween(first, { y, m: 1 }); if (off >= 0 && off <= total) yearTicks.push({ y, p: off / total }); }
  return `<div class="now-grid">${items.map((e, i) => { const st = starts[i]; const len = monthsBetween(st, cur); const p0 = monthsBetween(first, st) / total;
    return `<article class="card now rv" style="--i:${i};--p0:${p0.toFixed(3)}"><div class="now-logo"><img src="${esc(e.logo || "")}" alt="${esc(L(e.orgShort || e.org))}" loading="lazy" decoding="async"></div>
      <div class="now-b"><div class="now-k"><span class="live"><i></i>${esc(s("ongoing"))}</span><span class="mono">${esc(s("since"))} ${esc(fmtDate(e.since || e.start))}</span></div><h3>${esc(L(e.orgShort || e.org))}</h3><div class="now-role">${esc(L(e.role))}</div>
      <div class="now-bar" aria-hidden="true"><i class="fill"></i><b class="head"></b>${yearTicks.map((tk) => `<span class="tick" style="--p:${tk.p.toFixed(3)}"><small class="mono">${tk.y}</small></span>`).join("")}</div>
      <div class="now-dur">${yearOnly[i] ? `+<b class="mono" data-count="${cur.y - st.y}">0</b> ${esc(s("year"))} · ${esc(nthYear(cur.y - st.y + 1))}` : `<b class="mono" data-count="${len}">0</b> ${esc(len === 1 ? s("month") : s("months"))} · ${esc(durText(len))}`}</div></div></article>`; }).join("")}</div>`;
}
