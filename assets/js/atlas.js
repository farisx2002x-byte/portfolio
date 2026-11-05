/* ─────────────────────────────────────────────
   الأطلس: خريطة المملكة التفاعلية (SVG بلا شبكة) على ثلاث طبقات:
   المملكة ومناطقها الثلاث عشرة ← المنطقة ومدنها ← المدينة وأحياؤها حيث تقع المشاريع.
   تكبير/تحريك بالسحب والعجلة، تصفية بالتصنيف، قراءة LAT/LON حية، جولة تلقائية، ورحلة عبر السنوات.
   ───────────────────────────────────────────── */
import { state, t, L, has, esc, $, $$, reduce } from "./core.js";
import { projectHref, PRIMARY, STAR } from "./app-shared.js";
import { THEMES, MOTIFS } from "./themes.js";
import { KSA_OUTLINE, KSA_PROVINCES } from "./ksa-regions.js";

/* حدود المملكة (مبسّطة، lon/lat) — رسم أسلوبي لا مرجعي */
const KSA = KSA_OUTLINE;
/* مياه ويابسة مجاورة للسياق (باهتة) */
const RED_SEA = [[31.0, 31.0], [36.0, 31.0], [39.5, 28.5], [41.0, 25.0], [42.5, 21.0], [43.5, 17.5], [44.0, 15.0], [41.0, 13.5], [36.0, 19.0], [31.0, 27.0]];
const GULF = [[47.5, 30.2], [49.0, 29.0], [50.0, 27.5], [50.5, 25.8], [51.2, 24.8], [53.0, 24.3], [55.0, 25.8], [54.5, 27.0], [51.0, 30.0], [48.5, 30.5]];
const NEIGHBOURS = [[[55.6, 22.0], [55.0, 20.0], [52.0, 19.0], [49.1, 18.6], [48.0, 18.0], [47.0, 17.1], [45.3, 17.4], [44.4, 17.4], [43.4, 17.5], [42.8, 16.5], [43.2, 15.0], [45.0, 12.8], [52.0, 12.5], [57.0, 17.0], [59.5, 20.5], [57.5, 24.0], [56.2, 26.0], [54.5, 26.5], [53.5, 25.6], [52.5, 24.9], [51.6, 24.3], [52.5, 22.9], [55.2, 22.7]], [[34.95, 29.35], [36.07, 29.19], [37.0, 29.9], [38.8, 30.4], [39.2, 32.1], [40.4, 31.9], [42.0, 31.1], [44.7, 29.2], [46.5, 29.1], [47.5, 29.0], [48.1, 28.4], [48.6, 29.6], [47.5, 31.5], [45.0, 34.0], [38.0, 34.0], [34.0, 31.5], [33.5, 30.2]], [[32.5, 30.0], [33.5, 27.0], [35.5, 22.5], [38.0, 18.0], [41.0, 14.5], [43.2, 15.0], [43.0, 11.0], [38.0, 14.0], [36.0, 22.0], [32.0, 26.0], [30.0, 30.0]]];
/* مناطق المملكة الثلاث عشرة (حدود تقريبية) */
const LABEL_AT = { eastern: [49.4, 24.0], riyadh: [45.6, 23.6], makkah: [40.6, 21.3], madinah: [39.4, 25.3], tabuk: [37.2, 28.1], hail: [41.6, 27.4], qassim: [43.6, 26.2], north: [42.6, 30.1], jawf: [39.6, 30.2], asir: [42.6, 18.9], jazan: [42.7, 17.2], najran: [46.4, 18.3], bahah: [41.4, 20.0] };
const PROVINCES = KSA_PROVINCES.map((p) => ({ ...p, poly: p.rings[0], label: LABEL_AT[p.id] }));
/* مدن للسياق: الاسم، الإحداثيات، المنطقة، وهل التسمية تحت النقطة */
const CITIES = [["جدة", "Jeddah", 39.17, 21.54, "makkah"], ["الرياض", "Riyadh", 46.68, 24.71, "riyadh"], ["مكة المكرمة", "Makkah", 39.83, 21.42, "makkah", 1], ["المدينة المنورة", "Madinah", 39.61, 24.47, "madinah", 1], ["الدمام", "Dammam", 50.1, 26.43, "eastern", 1], ["تبوك", "Tabuk", 36.57, 28.38, "tabuk"], ["أبها", "Abha", 42.5, 18.22, "asir", 1], ["حائل", "Hail", 41.69, 27.52, "hail"], ["جازان", "Jazan", 42.55, 16.89, "jazan"], ["العلا", "AlUla", 37.9, 26.6, "madinah"], ["الخبر", "Khobar", 50.2, 26.3, "eastern"], ["بريدة", "Buraidah", 43.97, 26.33, "qassim"], ["نجران", "Najran", 44.13, 17.49, "najran"], ["سكاكا", "Sakaka", 40.2, 29.97, "jawf"], ["عرعر", "Arar", 41.02, 30.98, "north"], ["الباحة", "Al-Bahah", 41.47, 20.01, "bahah"], ["الطائف", "Taif", 40.42, 21.27, "makkah", 1], ["ينبع", "Yanbu", 38.06, 24.09, "madinah"], ["الأحساء", "Al-Ahsa", 49.6, 25.38, "eastern", 1], ["الوجه", "Al Wajh", 36.46, 26.24, "tabuk"], ["ضباء", "Duba", 35.69, 27.35, "tabuk"]];

/* إسقاط بسيط: 1 درجة = 46 وحدة، مع ضغط الطول بجيب تمام 24° */
const W = 1100, H = 800, S = 46, KX = Math.cos(24 * Math.PI / 180), KXX = S * KX * 1.18;
const px = (lon) => (lon - 33.5) * KXX, py = (lat) => (33.2 - lat) * S;
const poly = (pts) => pts.map(([a, b], i) => `${i ? "L" : "M"}${px(a).toFixed(1)} ${py(b).toFixed(1)}`).join(" ") + "Z";
const inPoly = (pts, lon, lat) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) c = !c; } return c; };
const centroid = (pts) => { let x = 0, y = 0; for (const [a, b] of pts) { x += a; y += b; } return [x / pts.length, y / pts.length]; };
const provinceOf = (lon, lat) => PROVINCES.find((p) => p.rings.some((r) => inPoly(r, lon, lat))) || PROVINCES.reduce((best, p) => { const [cx, cy] = p.label || centroid(p.poly); const d = Math.hypot(cx - lon, cy - lat); return !best || d < best.d ? { d, p } : best; }, null).p;
const bbox = (pts) => { const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };

const UI = {
  ar: { lead: "خريطة بثلاث طبقات: اختر منطقة فتقترب الخريطة وتظهر مشاريعها في مواقعها، ثم مجموعةً لترى المدينة وأحياءها، ثم اضغط الدبوس مرتين لتفتح المشروع. وعند اختيار تصنيف، تطلع رموزه من الدبابيس.", all: "الكل", tour: "جولة تلقائية", stop: "إيقاف الجولة", hint0: "اختر منطقة من الخريطة", hint1: "اختر مشروعاً أو مجموعة مشاريع", hint2: "اضغط دبوساً لتقرأ الخلاصة، ومرة أخرى لتفتح المشروع", again: "اضغط الدبوس مرة أخرى لفتح المشروع", here: "مشاريع", project: "مشروع", projects: "مشاريع", open: "افتح المشروع", reset: "عرض المملكة", kingdom: "المملكة", ksa: "المملكة العربية السعودية", redsea: "البحر الأحمر", gulf: "الخليج العربي", zoom: "ZOOM", timeline: "الرحلة عبر السنوات", upto: "حتى", play: "شغّل الرحلة", yearsAll: "كل السنوات", citywide: "على مستوى المدينة", back: "رجوع", none: "لا مشاريع هنا بهذا التصنيف", zoomIn: "اضغط للاقتراب" },
  en: { lead: "A three-layer map: pick a province to fly in and see its projects in place, then a group to see the city and its districts, then tap a pin twice to open the project. Pick a category and its motifs rise from the pins.", all: "All", tour: "Auto tour", stop: "Stop tour", hint0: "Pick a province on the map", hint1: "Pick a project or a group", hint2: "Tap a pin to read the summary, tap again to open it", again: "Tap the pin again to open the project", here: "projects", project: "project", projects: "projects", open: "Open project", reset: "Whole Kingdom", kingdom: "Kingdom", ksa: "Saudi Arabia", redsea: "Red Sea", gulf: "Arabian Gulf", zoom: "ZOOM", timeline: "The journey through the years", upto: "up to", play: "Play the journey", yearsAll: "All years", citywide: "city-wide", back: "Back", none: "No projects here in this category", zoomIn: "click to zoom in" },
};
const s = (k) => (UI[state.lang] || UI.ar)[k];
let YEARS = [];
const PROV_NAMES = PROVINCES.flatMap((p) => [p.ar, p.en, p.ar.replace(/^منطقة /, ""), p.en.replace(/ Province$/, "")]);
const nameParts = (p) => (L(p.location?.name) || "").split(/[،,]/).map((x) => x.trim()).filter(Boolean);
export const cityOf = (p) => { const parts = nameParts(p); let last = parts[parts.length - 1] || ""; if (PROV_NAMES.includes(last) && parts.length > 1) last = parts[parts.length - 2]; return last.replace(/^(حي|مدينة)\s+/, ""); };
const districtOf = (p) => { const parts = nameParts(p); const d = parts[0] || ""; return parts.length > 1 ? d : s("citywide"); };

export function atlasHtml(projects) {
  YEARS = [...new Set(projects.filter((p) => p.location && p.year).map((p) => +p.year))].sort();
  const cats = [...new Set(projects.flatMap((p) => p.categories || []))].filter((k) => ["planning", "transport", "gis", "urban-design", "heritage", "geomatics"].includes(k));
  return `<div class="atlas-head"><p class="lead">${esc(s("lead"))}</p><div class="atlas-ctl"><div class="filters" id="atlas-f"><button class="chip" data-af="all" aria-pressed="true">${esc(s("all"))}</button>${cats.map((k) => `<button class="chip" data-af="${esc(k)}" aria-pressed="false">${k === PRIMARY ? STAR : ""}${esc(t("cat." + k))}</button>`).join("")}</div><button class="btn btn-ghost btn-sm" id="atlas-tour" type="button">▸ ${esc(s("tour"))}</button></div></div>
  <div class="atlas" id="atlas-map"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="atlas-svg" id="atlas-svg" aria-label="${esc(s("ksa"))}">
    <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="currentColor" opacity=".2"/></pattern><clipPath id="landclip"><path d="${poly(KSA)}"/></clipPath><linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--accent-2)" stop-opacity="0"/><stop offset="1" stop-color="var(--accent-2)" stop-opacity=".22"/></linearGradient><pattern id="streets" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 13H26M13 0V26" stroke="var(--accent)" stroke-opacity=".12" stroke-width="1"/></pattern><radialGradient id="cityglow"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
    <g id="atlas-g" class="atlas-g">
      <g class="grat">${Array.from({ length: 14 }, (_, i) => `<line x1="${px(30 + i * 2)}" y1="-400" x2="${px(30 + i * 2)}" y2="${H + 400}"/>`).join("")}${Array.from({ length: 12 }, (_, i) => `<line x1="-400" y1="${py(36 - i * 2)}" x2="${W + 400}" y2="${py(36 - i * 2)}"/>`).join("")}</g>
      ${NEIGHBOURS.map((n) => `<path class="nb" d="${poly(n)}"/>`).join("")}
      <path class="sea" d="${poly(RED_SEA)}"/><path class="sea" d="${poly(GULF)}"/>
      <path class="land-glow2" d="${poly(KSA)}"/><path class="land-glow" d="${poly(KSA)}"/><path class="land" d="${poly(KSA)}"/>
      <g class="provs" id="atlas-provs" clip-path="url(#landclip)">${PROVINCES.map((p, i) => `<path class="prov" data-prov="${p.id}" d="${p.rings.map(poly).join(" ")}" style="--i:${i}"/>`).join("")}</g>
      <path class="land-dots" d="${poly(KSA)}" fill="url(#dots)"/>
      <text class="sea-lbl" x="${px(36.2)}" y="${py(22.5)}" transform="rotate(-62 ${px(36.2)} ${py(22.5)})">${esc(s("redsea"))}</text><text class="sea-lbl" x="${px(50.6)}" y="${py(27.9)}" transform="rotate(-40 ${px(50.6)} ${py(27.9)})">${esc(s("gulf"))}</text>
      <g class="prov-labels" id="atlas-plabels"></g>
      <g class="fabric" id="atlas-fabric"></g>
      <g class="cities" id="atlas-cities"></g>
      <path id="atlas-route" class="route" d=""/>
      <g id="atlas-pins"></g>
    </g></svg>
    <div class="atlas-crumb" id="atlas-crumb"></div>
    <div class="atlas-read mono" id="atlas-read"><span>LAT</span> —<br><span>LON</span> —<br><span>${esc(s("zoom"))}</span> <b>×1.0</b></div>
    <div class="atlas-zoom"><button type="button" data-z="1">+</button><button type="button" data-z="-1">−</button><button type="button" data-z="0" aria-label="${esc(s("reset"))}">⊕</button></div>
    <div class="atlas-foot"><span class="atlas-title">${esc(s("ksa"))}</span><span class="atlas-scale mono"><i></i> <b id="atlas-km">343 km</b></span></div>
    <div class="atlas-hint" id="atlas-hint"><i></i><span>${esc(s("hint0"))}</span></div>
    <div class="atlas-tip" id="atlas-tip" hidden></div>
    <div class="atlas-card" id="atlas-card" hidden></div>
  </div>
  <div class="atlas-tl" id="atlas-tl"><button class="tl-play" id="tl-play" type="button" aria-label="${esc(s("play"))}">▸</button><div class="tl-body"><div class="tl-top"><span class="tl-k">${esc(s("timeline"))}</span><b class="tl-year mono" id="tl-year">${esc(s("yearsAll"))}</b></div><input id="tl-range" type="range" min="0" max="${YEARS.length}" value="${YEARS.length}" step="1" aria-label="${esc(s("timeline"))}"><div class="tl-ticks">${YEARS.map((y, i) => `<span style="--p:${(i + 1) / YEARS.length}">${y}</span>`).join("")}</div></div></div>`;
}

export function initAtlas(projects) {
  const root = $("#atlas-map"); if (!root) return; const svg = $("#atlas-svg"), g = $("#atlas-g"), pins = $("#atlas-pins"), card = $("#atlas-card"), hint = $("#atlas-hint"), read = $("#atlas-read"), tip = $("#atlas-tip"), crumb = $("#atlas-crumb"), citiesG = $("#atlas-cities"), plabels = $("#atlas-plabels"), fabric = $("#atlas-fabric");
  const located = projects.filter((p) => p.location && typeof p.location.lat === "number");
  /* تحضير: منطقة كل مشروع ومدينته */
  const meta = new Map(); for (const p of located) { const prov = provinceOf(p.location.lon, p.location.lat); meta.set(p.id, { prov, city: cityOf(p), district: districtOf(p) }); }
  const cityKey = (p) => meta.get(p.id).prov.id + "|" + meta.get(p.id).city;
  const cityIndex = () => { const m = new Map(); for (const p of visible()) { const k = cityKey(p); if (!m.has(k)) m.set(k, { key: k, name: meta.get(p.id).city, prov: meta.get(p.id).prov, items: [], lon: 0, lat: 0 }); const c = m.get(k); c.items.push(p); } for (const c of m.values()) { c.lon = c.items.reduce((a, p) => a + p.location.lon, 0) / c.items.length; c.lat = c.items.reduce((a, p) => a + p.location.lat, 0) / c.items.length; } return m; };
  let filter = "all", yearMax = Infinity, view = { x: 0, y: 0, k: 1 }, tour = null, tourStep = 0, shown = new Set(), level = 0, curProv = null, curCity = null, minK = 1;
  const visible = () => located.filter((p) => (filter === "all" || (p.categories || []).includes(filter)) && (!p.year || +p.year <= yearMax));
  const num = (p) => String(projects.indexOf(p) + 1).padStart(2, "0");
  const colorOf = (p) => (THEMES[(p.categories || [])[0]] || THEMES.planning).c;
  const pname = (pr) => state.lang === "ar" ? pr.ar : pr.en;

  /* التحويل بوحدات viewBox: transform واحد على المجموعة = حركة سلسة */
  const box = () => { const r = svg.getBoundingClientRect(); const sc = Math.max(r.width / W, r.height / H); return { r, sc, ox: (r.width - W * sc) / 2, oy: (r.height - H * sc) / 2 }; };
  const apply = (anim = true, dur = .9) => { g.style.transition = anim && !reduce ? `transform ${dur}s cubic-bezier(.2,.8,.2,1)` : "none"; g.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`; root.style.setProperty("--k", view.k); root.style.setProperty("--ps", Math.min(innerWidth < 640 ? 1.25 : 1.7, Math.max(1, 1 / box().sc)).toFixed(2));
    placePop(); $("#atlas-km").textContent = (view.k >= 8 ? (343 / view.k).toFixed(1) : Math.round(343 / view.k)) + " km"; const z = read.querySelector("b"); if (z) z.textContent = `×${view.k.toFixed(1)}`; };
  const toUser = (clientX, clientY) => { const { r, sc, ox, oy } = box(); return [(clientX - r.left - ox) / sc, (clientY - r.top - oy) / sc]; };
  const svgPt = (clientX, clientY) => { const [x, y] = toUser(clientX, clientY); return [(x - view.x) / view.k, (y - view.y) / view.k]; };
  const visibleSize = () => { const { r, sc } = box(); return [r.width / sc, r.height / sc]; };
  const zoomAt = (cx, cy, k2) => { k2 = Math.min(90, Math.max(minK, k2)); view.x = cx - (cx - view.x) * (k2 / view.k); view.y = cy - (cy - view.y) * (k2 / view.k); view.k = k2; };
  const fitView = () => { const [vw] = visibleSize(); minK = Math.min(1, vw / 1070); view = { k: minK, x: W / 2 - (W / 2) * minK, y: H / 2 - (H / 2) * minK }; };
  /* ملاءمة مستطيل (بوحدات الخريطة) داخل الإطار المرئي */
  const fitBox = (x0, y0, x1, y1, pad = .18, kMin = 1, kMax = 24) => { const [vw, vh] = visibleSize(); const bw = Math.max(x1 - x0, 1), bh = Math.max(y1 - y0, 1); let k = Math.min(vw / (bw * (1 + pad * 2)), vh / (bh * (1 + pad * 2))); k = Math.min(kMax, Math.max(kMin, k)); const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; view = { k, x: W / 2 - cx * k, y: H / 2 - cy * k }; };
  const flyTo = (lon, lat, k) => { view.k = k; view.x = W / 2 - px(lon) * k; view.y = H / 2 - py(lat) * k; apply(); };

  /* ═══ الطبقات ═══ */
  const setLevel = (lv, prov = null, city = null, anim = true) => {
    level = lv; curProv = prov; curCity = city; root.dataset.level = lv; closeCard(false);
    if (lv === 0) { fitView(); } else if (lv === 1) { const b = bbox(prov.rings.flat().map(([a, c]) => [px(a), py(c)])); fitBox(b[0], b[1], b[2], b[3], .12, 1.4, 6); } else { const pts = city.items.map((p) => [px(p.location.lon), py(p.location.lat)]); const b = bbox(pts); fitBox(b[0], b[1], b[2], b[3], .5, 9, 70); view.y += 36; }
    apply(anim, lv === 2 ? 1.2 : .95); draw(); drawCrumb(); hint.querySelector("span").textContent = s("hint" + lv);
  };
  const drawCrumb = () => { const parts = [`<button type="button" data-lv="0">${esc(s("kingdom"))}</button>`]; if (curProv) parts.push(`<button type="button" data-lv="1">${esc(pname(curProv))}</button>`); if (curCity) parts.push(`<button type="button" data-lv="2">${esc(curCity.name)}</button>`);
    crumb.innerHTML = parts.join('<i>›</i>') + (level ? `<button type="button" class="crumb-back" data-lv="${level - 1}">↩ ${esc(s("back"))}</button>` : ""); crumb.classList.toggle("on", true);
    $$("button", crumb).forEach((b) => b.addEventListener("click", () => { const lv = +b.dataset.lv; if (lv === 0) setLevel(0); else if (lv === 1) setLevel(1, curProv); else setLevel(2, curProv, curCity); })); };

  /* رموز الثيم التي تطلع من الدبابيس (24×24) */
  const FXG = { layers: "M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5", arch: "M5 21V11a7 7 0 0 1 14 0v10M3 21h18M9 21v-6h6v6", camera: "M4 8h3l2-3h6l2 3h3v11H4ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8", flash: "M13 2 4 14h7l-1 8 9-12h-7Z", tree: "M12 22v-5M7 17h10l-2-4h1l-4-7-4 7h1Z", ruler: "M3 17 17 3l4 4L7 21ZM8 12l2 2M11 9l2 2M14 6l2 2", target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v3M12 19v3M2 12h3M19 12h3", pin: "M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", signal: "M4 20a16 16 0 0 1 16 0M7 20a10 10 0 0 1 10 0M10 20a4 4 0 0 1 4 0M12 4v4" };
  const FX = { planning: ["grid", "house", "ruler", "clipboard"], regional: ["grid", "mountain", "ruler", "compass"], transport: ["bus", "road", "signal", "compass"], gis: ["layers", "pin", "eye", "grid"], geomatics: ["drone", "flash", "camera", "target"], "urban-design": ["house", "tree", "sun", "cube"], heritage: ["arch", "house", "sun", "ruler"], design: ["cube", "ruler", "sun", "house"], digital: ["layers", "signal", "eye", "cube"], sustainability: ["tree", "sun", "droplet", "house"] };
  const fxFor = (p) => { const cat = (filter !== "all" && (p.categories || []).includes(filter)) ? filter : (p.categories || [])[0]; return FX[cat] || FX.planning; };
  const fxOf = (keys, top) => `<g class="fx" aria-hidden="true">${keys.map((k, j) => { const d = MOTIFS[k] || FXG[k]; if (!d) return ""; const cls = k === "drone" ? " fly" : k === "flash" ? " blink" : ""; return `<g class="fxi${cls}" style="--j:${j};--dx:${(j % 2 ? 1 : -1) * (8 + j * 6)}px"><g transform="translate(-11 ${top}) scale(.92)"><path class="bk" d="${d}"/><path d="${d}"/></g></g>`; }).join("")}</g>`;
  const fxHtml = (p, c) => fxOf(fxFor(p), c ? -58 : -62);
  const groupBy = (items, cell, xy) => { const groups = []; for (const p of items) { const [x, y] = xy ? xy(p) : [px(p.location.lon), py(p.location.lat)]; const gr = groups.find((q) => Math.hypot(q.x - x, q.y - y) < cell); if (gr) { gr.items.push(p); gr.x = (gr.x * (gr.items.length - 1) + x) / gr.items.length; gr.y = (gr.y * (gr.items.length - 1) + y) / gr.items.length; } else groups.push({ x, y, items: [p] }); } return groups; };
  let groups = [];
  const bindPins = () => {
    $$("[data-pin]", pins).forEach((n) => { n.addEventListener("click", (e) => { e.stopPropagation(); if (root._dragged) return; const id = n.dataset.pin; if (n.classList.contains("active") && level === 2) { go(id); return; } openPin(id); });
      n.addEventListener("dblclick", (e) => { e.stopPropagation(); go(n.dataset.pin); }); n.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); n.classList.contains("active") ? go(n.dataset.pin) : openPin(n.dataset.pin); } }); });
    $$("[data-cluster]", pins).forEach((n) => n.addEventListener("click", (e) => { e.stopPropagation(); if (root._dragged) return; const gr = groups[+n.dataset.cluster]; if (!gr) return;
      if (level === 1) { const keys = new Set(gr.items.map(cityKey)); if (keys.size === 1) setLevel(2, curProv, cityIndex().get(cityKey(gr.items[0]))); else { const b = bbox(gr.items.map((p) => [px(p.location.lon), py(p.location.lat)])); fitBox(b[0], b[1], b[2], b[3], .6, view.k * 1.6, 8); apply(); draw(); } }
      else showList(gr, n); }));
  };
  const draw = () => {
    const list = visible(); const cities = cityIndex();
    // المناطق: عدد المشاريع، والتعتيم خارج المنطقة المختارة
    const count = {}; for (const p of list) { const id = meta.get(p.id).prov.id; count[id] = (count[id] || 0) + 1; }
    $$(".prov", root).forEach((n) => { const id = n.dataset.prov; n.classList.toggle("has", !!count[id]); n.classList.toggle("active", !!curProv && curProv.id === id); n.classList.toggle("dim", !!curProv && curProv.id !== id); });
    plabels.innerHTML = level === 0 ? PROVINCES.map((pr) => { const [cx, cy] = pr.label || centroid(pr.poly); const n = count[pr.id] || 0; return `<g class="plabel${n ? " has" : ""}" data-prov="${pr.id}" transform="translate(${px(cx).toFixed(1)} ${py(cy).toFixed(1)})" style="--i:${PROVINCES.indexOf(pr)}">${n && filter !== "all" ? `<g transform="translate(0 16)">${fxOf(FX[filter] || FX.planning, -26)}</g>` : ""}<text y="${n ? -4 : 4}">${esc(pname(pr).replace(/^منطقة /, ""))}</text>${n ? `<g class="pbadge"><circle r="13" cy="16"/><text class="n" y="21">${n}</text></g>` : ""}</g>`; }).join("") : "";
    plabels.style.opacity = level === 0 ? 1 : 0;
    citiesG.innerHTML = ""; fabric.innerHTML = ""; pins.innerHTML = ""; $("#atlas-route").setAttribute("d", ""); groups = [];
    if (level === 1) {
      // طبقة المنطقة: المشاريع نفسها دبابيس ومجموعات (مجموعة = مدينة أو موقع فيه عدة مشاريع)، ومدن للسياق
      const inProv = list.filter((p) => meta.get(p.id).prov.id === curProv.id);
      groups = groupBy(inProv, 24 / view.k);
      const ctx = CITIES.filter((c) => c[4] === curProv.id && !groups.some((gr) => Math.hypot(gr.x - px(c[2]), gr.y - py(c[3])) < 46 / view.k));
      citiesG.innerHTML = ctx.map(([a, e, lon, lat, , below], i) => `<g class="cmark ctx" style="--i:${i}" transform="translate(${px(lon).toFixed(1)} ${py(lat).toFixed(1)})"><circle class="dot" r="2.2"/><text class="lbl" y="${below ? 13 : -8}">${esc(state.lang === "ar" ? a : e)}</text></g>`).join("");
      pins.innerHTML = groups.map((gr, i) => gr.items.length === 1 ? pin(gr.items[0], gr.x, gr.y, i, !shown.has(gr.items[0].id), false, meta.get(gr.items[0].id).city) : cluster(gr, i, `${meta.get(gr.items[0].id).city} · ${gr.items.length} ${s("projects")}`)).join(""); inProv.forEach((p) => shown.add(p.id));
      bindPins();
    }
    if (level === 2 && curCity) {
      const c = cities.get(curCity.key) || curCity; curCity = c;
      const local = c.items.filter((p) => nameParts(p).length > 1), wide = c.items.filter((p) => nameParts(p).length <= 1);
      const anchor = local.length ? local : c.items; const cx = anchor.reduce((a, p) => a + px(p.location.lon), 0) / anchor.length, cy = anchor.reduce((a, p) => a + py(p.location.lat), 0) / anchor.length;
      // نسيج المدينة: شبكة شوارع دائرية وحلقات باهتة (بحجم ثابت على الشاشة)
      const R = 190; fabric.innerHTML = `<circle class="glow" cx="${cx}" cy="${cy}" r="${R + 60}" fill="url(#cityglow)"/><circle class="streets" cx="${cx}" cy="${cy}" r="${R + 40}" fill="url(#streets)"/>${[R * .35, R * .7, R + 40].map((r) => `<circle class="ring" cx="${cx}" cy="${cy}" r="${r}"/>`).join("")}${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + .3; return `<line class="ray" x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * (R + 40)).toFixed(1)}" y2="${(cy + Math.sin(a) * (R + 40)).toFixed(1)}"/>`; }).join("")}${wide.length ? `<text class="wide-lbl" x="${cx}" y="${cy - R - 52}">${esc(s("citywide"))}</text>` : ""}`;
      // المشاريع المحلية في مواقعها، والمشاريع على مستوى المدينة على حلقة حولها
      groups = groupBy(local, 36 / view.k);
      const rr = R / view.k; wide.forEach((p, i) => { const a = -Math.PI / 2 + (i - (wide.length - 1) / 2) * (Math.PI / Math.max(3, wide.length)); groups.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, items: [p], wide: true }); });
      pins.innerHTML = groups.map((gr, i) => gr.items.length === 1 ? pin(gr.items[0], gr.x, gr.y, i, !shown.has(gr.items[0].id), gr.wide) : cluster(gr, i)).join(""); c.items.forEach((p) => shown.add(p.id));
      const pts = groups.filter((g) => !g.wide).map((q) => [q.x, q.y]); $("#atlas-route").setAttribute("d", pts.length > 1 ? pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ") : "");
      bindPins();
    }
    if (level === 0 && !list.length) { hint.querySelector("span").textContent = s("none"); }
  };
  const short = (str, n = 26) => str.length > n ? str.slice(0, n - 1) + "…" : str;
  const pin = (p, x, y, i, fresh, wide, label) => { const m = meta.get(p.id); return `<g class="pin${fresh ? " drop" : ""}${wide ? " wide" : ""}" data-pin="${esc(p.id)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" style="--i:${i};--c:${colorOf(p)}" tabindex="0" role="button" aria-label="${esc(L(p.title))}"><g class="pin-in"><ellipse class="shd" cy="2" rx="7" ry="2.5"/><circle class="halo" r="9"/>${fxHtml(p)}<path d="M0 0C-12 -14 -14 -22 -14 -28a14 14 0 1 1 28 0c0 6-2 14-14 28Z"/><text y="-24" text-anchor="middle">${num(p)}</text><text class="dl" y="16" text-anchor="middle">${esc(label || (wide ? short(L(p.title)) : m.district))}</text></g></g>`; };
  const cluster = (gr, i, label) => `<g class="cluster" data-cluster="${i}" transform="translate(${gr.x.toFixed(1)} ${gr.y.toFixed(1)})" style="--i:${i};--c:${colorOf(gr.items[0])}" tabindex="0" role="button" aria-label="${gr.items.length} ${esc(s("projects"))}"><g class="cl-in"><circle class="ring" r="30"/>${fxHtml(gr.items[0], true)}<g class="sat">${gr.items.slice(0, 16).map((p, j) => { const a = j / Math.min(gr.items.length, 16) * Math.PI * 2; return `<circle r="3.4" cx="${(Math.cos(a) * 31).toFixed(1)}" cy="${(Math.sin(a) * 31).toFixed(1)}" fill="${colorOf(p)}"/>`; }).join("")}</g><circle class="core" r="20"/><text y="6" text-anchor="middle">${gr.items.length}</text><text class="dl" y="44" text-anchor="middle">${esc(label || meta.get(gr.items[0].id).district)}</text></g></g>`;

  /* فقاعة المشروع: تظهر ملاصقة للدبوس، والنقرة الثانية (أو المزدوجة) تفتح المشروع مباشرة */
  const go = (id) => { const p = projects.find((x) => x.id === id); if (p) location.href = projectHref(p); };
  const toScreen = (x, y) => { const { sc, ox, oy } = box(); return [ox + (view.x + x * view.k) * sc, oy + (view.y + y * view.k) * sc]; };
  const pinXY = (sel) => { const n = pins.querySelector(sel); const m = n && /translate\(([\d.-]+) ([\d.-]+)\)/.exec(n.getAttribute("transform")); return m ? [+m[1], +m[2]] : null; };
  let popAt = null;
  const placePop = () => { if (card.hidden || !popAt) return; if (mob()) { card.style.left = card.style.top = ""; card.classList.remove("below"); return; } const [sx, sy] = toScreen(popAt[0], popAt[1]); const r = root.getBoundingClientRect(); const w = card.offsetWidth || 260, h = card.offsetHeight || 200; const lift = popAt[2] ? 34 : 58;
    const below = sy - lift - h < 8; let left = sx - w / 2; left = Math.max(8, Math.min(r.width - w - 8, left)); const top = below ? sy + 16 : sy - lift - h;
    card.style.left = left + "px"; card.style.top = Math.max(8, top) + "px"; card.classList.toggle("below", below); card.style.setProperty("--ax", `${Math.max(14, Math.min(w - 14, sx - left))}px`); };
  const mob = () => innerWidth < 640;
  const ensureOnScreen = (x, y) => { const [sx, sy] = toScreen(x, y); const r = root.getBoundingClientRect(); const m = 70, mt = mob() ? 110 : 230, mb = mob() ? 320 : 70; let dx = 0, dy = 0; if (sx < m) dx = m - sx; if (sx > r.width - m) dx = r.width - m - sx; if (sy < mt) dy = mt - sy; if (sy > r.height - mb) dy = r.height - mb - sy; if (dx || dy) { const { sc } = box(); view.x += dx / sc; view.y += dy / sc; apply(true, .6); return true; } return false; };
  const showPop = (html, at, delay = 0) => { popAt = at; card.innerHTML = html; card.hidden = false; hint.hidden = true; card.classList.remove("in"); card.style.visibility = "hidden"; setTimeout(() => { placePop(); card.style.visibility = ""; card.classList.add("in"); }, delay); $(".pop-x", card).addEventListener("click", (e) => { e.stopPropagation(); closeCard(); }); };
  const goProject = (p) => { const m = meta.get(p.id); const c = cityIndex().get(cityKey(p)); if (!c) return; if (level !== 2 || curCity?.key !== c.key) { setLevel(2, m.prov, c); setTimeout(() => openPin(p.id), 1000); } else openPin(p.id); };
  const openPin = (id) => { const p = projects.find((x) => x.id === id); if (!p) return; if (level !== 2) { goProject(p); return; }
    const at = pinXY(`[data-pin="${CSS.escape(id)}"]`); if (!at) { goProject(p); return; } const m = meta.get(p.id); const moved = ensureOnScreen(at[0], at[1]);
    $$("[data-pin]", pins).forEach((n) => n.classList.toggle("active", n.dataset.pin === id)); $$("[data-cluster].active", pins).forEach((n) => n.classList.remove("active"));
    showPop(`<button class="pop-x" type="button" aria-label="close">✕</button>${has(p.cover) ? `<img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">` : ""}<div class="pop-b"><div class="pop-k mono">${esc(num(p))} · ${esc(m.district)} · ${esc(m.city)}${p.year ? ` · ${esc(String(p.year))}` : ""}</div><h4>${esc(L(p.title))}</h4><p>${esc(L(p.summary) || "")}</p><div class="pop-tags">${(p.categories || []).slice(0, 3).map((k) => `<span class="tag">${esc(t("cat." + k))}</span>`).join("")}</div><a class="btn btn-primary btn-sm pop-go" href="${projectHref(p)}">${esc(s("open"))} ↗</a><small class="pop-hint">${esc(s("again"))}</small></div><i class="pop-arrow"></i>`, at, moved ? 650 : 0);
    card.onclick = (e) => { if (!e.target.closest(".pop-x, a")) go(id); }; card.classList.remove("list");
    document.dispatchEvent(new CustomEvent("atlas:pick", { detail: id })); };
  const showList = (gr, n) => { $$("[data-pin].active, [data-cluster].active", pins).forEach((x) => x.classList.remove("active")); n.classList.add("active"); const moved = ensureOnScreen(gr.x, gr.y);
    showPop(`<button class="pop-x" type="button" aria-label="close">✕</button><div class="pop-b"><div class="pop-k mono">${gr.items.length} ${esc(s("here"))} · ${esc(meta.get(gr.items[0].id).district)}</div><ul class="pop-list">${gr.items.map((p) => `<li><button type="button" data-open="${esc(p.id)}" style="--c:${colorOf(p)}"><span class="mono">${esc(num(p))}</span> ${esc(L(p.title))}</button></li>`).join("")}</ul></div><i class="pop-arrow"></i>`, [gr.x, gr.y, true], moved ? 650 : 0);
    card.onclick = null; card.classList.add("list"); $$("[data-open]", card).forEach((b) => b.addEventListener("click", () => openPin(b.dataset.open))); };

  const closeCard = (showHint = true) => { card.hidden = true; popAt = null; card.onclick = null; if (showHint) hint.hidden = false; $$("[data-pin].active, [data-cluster].active", pins).forEach((n) => n.classList.remove("active")); };

  /* تفاعلات: مناطق، تلميح، سحب، عجلة، قراءة الإحداثيات، أزرار */
  root.addEventListener("click", (e) => { const pr = e.target.closest(".prov, .plabel"); if (pr && level === 0 && !root._dragged) { const p = PROVINCES.find((x) => x.id === pr.dataset.prov); if (p) setLevel(1, p); } });
  let drag = null;
  root.addEventListener("pointermove", (e) => { const pr = e.target.closest(".prov, .plabel, .cluster"); if (pr && level < 2 && !drag) { const r = root.getBoundingClientRect(); let txt = ""; if (pr.dataset.prov) { const p = PROVINCES.find((x) => x.id === pr.dataset.prov); const n = visible().filter((q) => meta.get(q.id).prov.id === p.id).length; txt = `<b>${esc(pname(p))}</b><span>${n} ${esc(n === 1 ? s("project") : s("projects"))}</span>`; } else { const gr = groups[+pr.dataset.cluster]; if (gr) txt = `<b>${esc(meta.get(gr.items[0].id).city)}</b><span>${gr.items.length} ${esc(gr.items.length === 1 ? s("project") : s("projects"))} · ${esc(s("zoomIn"))}</span>`; }
      tip.innerHTML = txt; tip.hidden = false; tip.style.left = (e.clientX - r.left) + "px"; tip.style.top = (e.clientY - r.top) + "px"; $$(".prov").forEach((n) => n.classList.toggle("hover", n.dataset.prov === pr.dataset.prov)); } else { tip.hidden = true; $$(".prov.hover").forEach((n) => n.classList.remove("hover")); } });
  root.addEventListener("pointerleave", () => { tip.hidden = true; });
  root.addEventListener("pointerdown", (e) => { if (e.target.closest(".atlas-card, .atlas-zoom, .atlas-crumb, button")) return; const [ux, uy] = toUser(e.clientX, e.clientY); drag = { ux, uy, vx: view.x, vy: view.y, moved: false, id: e.pointerId }; root._dragged = false; });
  root.addEventListener("pointermove", (e) => { if (drag) { const [ux, uy] = toUser(e.clientX, e.clientY); const dx = ux - drag.ux, dy = uy - drag.uy; if (!drag.moved && Math.hypot(dx, dy) > 3) { drag.moved = true; root._dragged = true; try { root.setPointerCapture(drag.id); } catch {} } if (!drag.moved) return; view.x = drag.vx + dx; view.y = drag.vy + dy; apply(false); }
    const [mx, my] = svgPt(e.clientX, e.clientY); const lon = mx / KXX + 33.5, lat = 33.2 - my / S; read.innerHTML = `<span>LAT</span> ${lat.toFixed(4)}° N<br><span>LON</span> ${lon.toFixed(4)}° E<br><span>${esc(s("zoom"))}</span> <b>×${view.k.toFixed(1)}</b>`; });
  root.addEventListener("pointerup", () => { drag = null; setTimeout(() => { root._dragged = false; }, 0); });
  root.addEventListener("pointercancel", () => { drag = null; });
  root.addEventListener("wheel", (e) => { e.preventDefault(); const [cx, cy] = toUser(e.clientX, e.clientY); zoomAt(cx, cy, view.k * (e.deltaY < 0 ? 1.25 : .8)); apply(false); }, { passive: false });
  $$(".atlas-zoom button", root).forEach((b) => b.addEventListener("click", () => { const z = +b.dataset.z; if (!z) { setLevel(0); } else { zoomAt(W / 2, H / 2, view.k * (z > 0 ? 1.6 : .62)); apply(); } }));
  const setTheme = () => { root.classList.toggle("fx-on", filter !== "all"); root.dataset.theme = filter; root.style.setProperty("--tc", (THEMES[filter] || THEMES.planning).c); };
  $$("[data-af]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.af; setTheme(); $$("[data-af]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); if (level === 2 && !cityIndex().has(curCity.key)) setLevel(1, curProv); else { closeCard(); draw(); } }));
  // الجولة التلقائية: تمرّ على المشاريع مدينةً مدينة
  const tourBtn = $("#atlas-tour"); const stopTour = () => { clearInterval(tour); tour = null; tourBtn.textContent = "▸ " + s("tour"); tourBtn.setAttribute("aria-pressed", "false"); };
  tourBtn.addEventListener("click", () => { if (tour) { stopTour(); return; } const list = visible(); if (!list.length) return; tourBtn.textContent = "■ " + s("stop"); tourBtn.setAttribute("aria-pressed", "true"); const step = () => { goProject(list[tourStep % list.length]); tourStep++; }; step(); tour = setInterval(step, 5200); });
  root.addEventListener("pointerdown", () => { if (tour) stopTour(); }, true);
  document.addEventListener("langchange", () => { if (tour) stopTour(); });
  // الرحلة عبر السنوات: منزلق + تشغيل تلقائي
  const tlr = $("#tl-range"), tly = $("#tl-year"), tlp = $("#tl-play"); let tlTimer = null;
  const setYear = (i) => { i = +i; yearMax = i >= YEARS.length ? Infinity : (i <= 0 ? YEARS[0] - 1 : YEARS[i - 1]); tlr.value = i; tly.textContent = i >= YEARS.length ? s("yearsAll") : i <= 0 ? "—" : `${s("upto")} ${YEARS[i - 1]}`; $("#atlas-tl").style.setProperty("--p", i / YEARS.length); if (level === 2 && !cityIndex().has(curCity.key)) setLevel(1, curProv); else { closeCard(); draw(); } };
  const stopTl = () => { clearInterval(tlTimer); tlTimer = null; tlp.textContent = "▸"; tlp.setAttribute("aria-pressed", "false"); };
  tlr.addEventListener("input", () => { stopTl(); setYear(tlr.value); });
  tlp.addEventListener("click", () => { if (tlTimer) { stopTl(); return; } let i = 0; setYear(0); tlp.textContent = "❚❚"; tlp.setAttribute("aria-pressed", "true"); tlTimer = setInterval(() => { i++; setYear(i); if (i >= YEARS.length) stopTl(); }, 1500); });
  // تشغيل
  setLevel(0, null, null, false); addEventListener("resize", () => { clearTimeout(root._rt); root._rt = setTimeout(() => { if (level === 0) { fitView(); apply(false); } }, 150); });
  root.classList.add("boot"); const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("in"); io.disconnect(); setTimeout(() => root.classList.remove("boot"), 3200); } }), { threshold: .2 }); io.observe(root);
  // فتح مشروع من الخارج (مثلاً من بطاقة في قسم المشاريع)
  document.addEventListener("atlas:open", (e) => { const p = projects.find((x) => x.id === e.detail); if (p && meta.has(p.id)) { root.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => goProject(p), 500); } });
}
