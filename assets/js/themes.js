/* ─────────────────────────────────────────────
   ثيمات التصنيفات: لكل تصنيف لون ومشهد متحرك (Canvas) ودخول قصير.
   تُستدعى في صفحة المشروع حسب التصنيف الأول، وفي الواجهة عند اختيار زر.
   كل المشاهد ترسم بخطوط خفيفة فوق خلفية الموقع، وتتوقف مع prefers-reduced-motion.
   ───────────────────────────────────────────── */
import { state, t, $, el, reduce } from "./core.js";

/* تعريف الثيمات: اللون، الاسم، والأيقونة */
export const THEMES = {
  planning:      { c: "#28A085", c2: "#C9B23A", ar: "تخطيط حضري", en: "Urban planning", icon: "grid" },
  transport:     { c: "#C9B23A", c2: "#28A085", ar: "تخطيط النقل", en: "Transport planning", icon: "route" },
  gis:           { c: "#2D6F8E", c2: "#5FD1B4", ar: "نظم المعلومات الجغرافية", en: "GIS & spatial analysis", icon: "layers" },
  geomatics:     { c: "#5FD1B4", c2: "#2D6F8E", ar: "الجيوماتكس والمسح", en: "Geomatics & surveying", icon: "drone" },
  "urban-design":{ c: "#B8864A", c2: "#28A085", ar: "التصميم الحضري", en: "Urban design", icon: "city" },
  heritage:      { c: "#B8513A", c2: "#C9B23A", ar: "التراث العمراني", en: "Built heritage", icon: "pattern" },
  design:        { c: "#7E6BD1", c2: "#5FD1B4", ar: "التصميم والنمذجة", en: "Design & 3D modelling", icon: "cube" },
  digital:       { c: "#5FD1B4", c2: "#7E6BD1", ar: "الأدوات الرقمية", en: "Digital tools", icon: "code" },
  sustainability:{ c: "#3FA66A", c2: "#2D6F8E", ar: "الاستدامة", en: "Sustainability", icon: "leaf" },
  regional:      { c: "#2D6F8E", c2: "#C9B23A", ar: "التخطيط الإقليمي", en: "Regional planning", icon: "grid" },
};
const K = (cat) => THEMES[cat] ? cat : "planning";

/* ── زخارف المشاريع: رموز صغيرة (مسارات 24×24) تطفو في خلفية كل مشروع بحسب موضوعه ── */
export const MOTIFS = {
  bus: "M4 6h16v10H4zM4 11h16M7 16v2M17 16v2M7 13.5h.01M17 13.5h.01", train: "M6 3h12v12H6zM6 9h12M9 15l-2 5M15 15l2 5M9 12h.01M15 12h.01", station: "M3 20h18M6 20V9l6-5 6 5v11M9 20v-6h6v6",
  drone: "M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M9 9h6v6H9zM7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2",
  droplet: "M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z", arch: "M4 21V11a8 8 0 0 1 16 0v10M8 21v-8a4 4 0 0 1 8 0v8", building: "M5 21V5h9v16M14 21V10h5v11M8 8h2M8 12h2M8 16h2M5 21h14",
  house: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6", car: "M3 14l2-5h14l2 5v4H3zM6 18v2M18 18v2M6 15h.01M18 15h.01", tree: "M12 3l5 7h-3l4 5h-5v6h-2v-6H6l4-5H7z",
  compass: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M15 9l-2 5-5 2 2-5z", ruler: "M3 17l14-14 4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2", wave: "M2 12c3-4 5-4 8 0s5 4 8 0 3-2 4 0M2 18c3-4 5-4 8 0s5 4 8 0 3-2 4 0",
  sun: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2", pin: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11ZM12 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
  grid: "M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18", leaf: "M4 20c0-9 6-15 16-16-1 10-7 16-16 16ZM4 20c4-5 8-8 12-10", bridge: "M2 16h20M4 16V9M20 16V9M4 9c4-4 12-4 16 0M8 16v-4M12 16v-5M16 16v-4",
  road: "M6 21L10 3h4l4 18M12 6v3M12 12v3M12 18v3", walker: "M13 5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M10 21l2-7 3 3v4M9 12l2-4h3l2 3 2 1M12 14l-3 4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0", anchor: "M12 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 7v14M5 13c0 5 3 8 7 8s7-3 7-8M8 13H5M19 13h-3",
  mountain: "M2 20L9 7l4 7 2-3 7 9zM9 7l1 3", palm: "M12 21V9M12 9c-4-4-8-2-9 1 3-1 6 0 9-1M12 9c4-4 8-2 9 1-3-1-6 0-9-1M12 9c-2-5 0-7 1-7 0 2 1 4-1 7", pattern: "M12 2l10 10-10 10L2 12zM12 7l5 5-5 5-5-5z",
  cube: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10", code: "m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16", layers: "M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 18l10 5 10-5",
  clipboard: "M8 4h8v3H8zM6 6H5v15h14V6h-1M9 12h6M9 16h4", camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0", tripod: "M12 3v6M9 6h6M12 9l-6 12M12 9l6 12M8 17h8",
  school: "M3 10l9-5 9 5-9 5zM7 12v5c3 2 7 2 10 0v-5M21 10v6", parking: "M5 3h14v18H5zM9 17V7h4a3 3 0 0 1 0 6H9", window: "M6 3h12v18H6zM6 9h12M6 15h12M12 3v18M9 6v3M15 6v3",
};
export const PROJECT_MOTIFS = {
  "al-jamea-local-unit": ["house", "tree", "walker"], "urp244-tod-neighbourhood": ["train", "station", "walker", "building"], "khobar-hackathon": ["wave", "bridge", "walker", "anchor"],
  "ruwais-regeneration": ["arch", "house", "tree"], "fawaz-urban-survey": ["clipboard", "eye", "house", "pin"], "urp244-density-far2": ["building", "grid", "cube"], "urp244-density-far07": ["house", "tree", "grid"],
  "asir-architecture-hawra": ["pattern", "mountain", "house"], "hawra-poster-a1": ["mountain", "pattern", "pin"], "jeddah-albalad-poster": ["window", "arch", "anchor"], "geom300-uav-office-profile": ["drone", "camera", "layers"],
  "residential-water-saving": ["droplet", "leaf", "house"], "kau-campus-survey": ["tripod", "ruler", "compass"], "cad-revit-portfolio": ["cube", "ruler", "house"], "brt-jeddah": ["bus", "road", "station"],
  "smart-school-mobility": ["school", "bus", "walker"], "madinah-gis": ["layers", "pin", "grid"], "multipolar-development": ["compass", "pin", "wave", "sun"], "tabuk-alula-studio": ["mountain", "sun", "palm"],
  "lynch-waterfront": ["eye", "wave", "anchor", "pin"], "jeddah-removals": ["building", "grid", "pin"], "taxi-rank-priority": ["car", "parking", "pin"], "transport-toolbox": ["code", "bus", "layers"], "urp233-building-survey": ["building", "clipboard", "grid"],
};
const hash = (str) => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const shiftHue = (hex, deg, sat = 0) => { const n = parseInt(hex.slice(1), 16); let r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0, l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  h = (h + deg / 360 + 1) % 1; s = Math.min(1, Math.max(0, s + sat)); const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return "#" + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join(""); };
/** ثيم مشتق لمشروع بعينه: نفس المجال، لكن لون وإيقاع وزخارف خاصة به */
export function projectTheme(cat, project) {
  const key = K(cat), base = THEMES[key]; if (!project) return { ...base, key, seed: 1, speed: 1, density: 1, motifs: [] };
  const h = hash(project.id || project), v = h % 7; const deg = (v - 3) * 9, sat = ((h >> 3) % 3 - 1) * .06;
  return { ...base, key, c: shiftHue(base.c, deg, sat), c2: shiftHue(base.c2, -deg * .6, sat), seed: 3 + (h % 97), speed: .75 + ((h >> 5) % 5) * .12, density: .8 + ((h >> 8) % 4) * .15, mirror: !!((h >> 11) & 1), motifs: PROJECT_MOTIFS[project.id] || [], variant: v, secondary: (project.categories || []).slice(1).find((c) => SCENES[c] && c !== key) || null };
}
let motifPaths = {}; const motifPath = (k) => motifPaths[k] || (motifPaths[k] = new Path2D(MOTIFS[k]));
/* طبقة الزخارف: رموز تطفو ببطء وتدور قليلاً */
function drawMotifs(ctx, W, H, t, th) {
  if (!th.motifs || !th.motifs.length) return; const r = rng(th.seed * 7 + 1); const n = 18;
  for (let i = 0; i < n; i++) { const k = th.motifs[i % th.motifs.length]; const bx = r() * W, by = r() * H, sz = 1.6 + r() * 1.8, ph = r() * 6.28, sp = .5 + r();
    const x = bx + Math.sin(t * .25 * sp + ph) * 22, y = (by - t * 6 * sp + H) % (H + 80) - 40, rot = Math.sin(t * .2 + ph) * .25;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sz, sz); ctx.translate(-12, -12); ctx.globalAlpha = .22 + .14 * Math.sin(t * .6 + ph); ctx.strokeStyle = i % 3 ? th.c : th.c2; ctx.lineWidth = 1.6 / sz; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(motifPath(k)); ctx.restore(); }
}

/* مولّد عشوائي ثابت */
const rng = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
const SEED = (th, d) => (th.seed || 1) * 31 + d;

/* ── المشاهد: دالة ترسم إطاراً عند الزمن t (ثوانٍ) ── */
const SCENES = {
  /* تخطيط: كتل مدينة تنمو على شبكة شوارع */
  planning(ctx, W, H, t, th) {
    const r = rng(SEED(th, 7)), cs = Math.round(64 / (th.density || 1)), cols = Math.ceil(W / cs) + 1, rows = Math.ceil(H / cs) + 1;
    ctx.strokeStyle = th.c; ctx.globalAlpha = .08; ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, H); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * cs); ctx.lineTo(W, j * cs); ctx.stroke(); }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const v = r(); if (v < .55) continue; const ph = (r() * 6 + t * .35) % 6, g = Math.min(1, Math.max(0, (Math.sin(ph) + 1) / 2)); const s = cs * (.3 + .4 * g);
      ctx.globalAlpha = .05 + .12 * g; ctx.fillStyle = v > .9 ? th.c2 : th.c; ctx.fillRect(i * cs + (cs - s) / 2, j * cs + (cs - s) / 2, s, s); }
    // شريان رئيسي متحرك
    ctx.globalAlpha = .25; ctx.strokeStyle = th.c2; ctx.lineWidth = 2; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.moveTo(0, H * .62); ctx.bezierCurveTo(W * .3, H * .5, W * .6, H * .75, W, H * .58); ctx.stroke(); ctx.setLineDash([]);
  },
  /* نقل: مسارات وحافلات تتحرك ومحطات تنبض */
  transport(ctx, W, H, t, th) {
    const routes = [[0, H * .3, W * .35, H * .2, W * .7, H * .45, W, H * .35], [0, H * .75, W * .3, H * .85, W * .65, H * .6, W, H * .8], [W * .2, 0, W * .35, H * .4, W * .55, H * .6, W * .6, H]];
    routes.forEach((p, k) => { ctx.strokeStyle = k === 1 ? th.c2 : th.c; ctx.globalAlpha = .18; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]); ctx.stroke();
      for (let n = 0; n < 3; n++) { const u = ((t * .08) + n / 3 + k * .17) % 1; const q = bez(p, u); ctx.globalAlpha = .9; ctx.fillStyle = k === 1 ? th.c2 : th.c; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(q[0], q[1], 10 + 4 * Math.sin(t * 4 + n), 0, 7); ctx.fill(); }
      for (let n = 1; n < 5; n++) { const q = bez(p, n / 5); ctx.globalAlpha = .5; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, 7); ctx.stroke(); } });
  },
  /* GIS: طبقات راستر تتنفس وشبكة إحداثيات */
  gis(ctx, W, H, t, th) {
    const cs = Math.round(26 / (th.density || 1)), r = rng(SEED(th, 3)); ctx.lineWidth = 1;
    for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cs) { const v = (Math.sin(x / 140 + t * .4) + Math.cos(y / 110 - t * .3) + r() * .6) / 2.6; if (v < .35) continue; ctx.globalAlpha = .04 + v * .16; ctx.fillStyle = v > .75 ? th.c2 : th.c; ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4); }
    ctx.globalAlpha = .12; ctx.strokeStyle = th.c; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(W * i / 6, 0); ctx.lineTo(W * i / 6, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, H * i / 6); ctx.lineTo(W, H * i / 6); ctx.stroke(); }
    ctx.globalAlpha = .5; ctx.fillStyle = th.c2; ctx.font = "11px ui-monospace, monospace"; for (let i = 1; i < 6; i++) ctx.fillText((21.3 + i * .08).toFixed(2) + "°", 6, H * i / 6 - 4);
    // خط مسح أفقي
    const sy = (t * 60) % (H + 40); ctx.globalAlpha = .35; ctx.strokeStyle = th.c2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
  },
  /* جيوماتكس: كنتور + درون يطير ويمسح + نقاط رفع */
  geomatics(ctx, W, H, t, th) {
    ctx.strokeStyle = th.c; ctx.lineWidth = 1;
    for (let k = 0; k < 9; k++) { ctx.globalAlpha = k % 3 === 0 ? .18 : .08; ctx.beginPath(); for (let x = 0; x <= W; x += 10) { const y = H * .5 + Math.sin(x / 160 + k) * 40 + Math.cos(x / 70 - k * .7) * 18 + (k - 4) * 42; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    const r = rng(SEED(th, 11)); ctx.fillStyle = th.c2; for (let i = 0; i < 18; i++) { const x = r() * W, y = r() * H; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill(); }
    const dx = ((t * 90) % (W + 200)) - 100, dy = H * .22 + Math.sin(t * 1.3) * 14;
    ctx.globalAlpha = .18; ctx.fillStyle = th.c2; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx - 90, H); ctx.lineTo(dx + 90, H); ctx.closePath(); ctx.fill(); // مخروط المسح
    ctx.globalAlpha = .9; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx - 14, dy - 8); ctx.lineTo(dx + 14, dy + 8); ctx.moveTo(dx + 14, dy - 8); ctx.lineTo(dx - 14, dy + 8); ctx.stroke();
    ctx.fillStyle = th.c2; for (const [ox, oy] of [[-14, -8], [14, -8], [-14, 8], [14, 8]]) { ctx.beginPath(); ctx.arc(dx + ox, dy + oy, 4 + Math.sin(t * 30 + ox) * 1, 0, 7); ctx.fill(); }
  },
  /* تصميم حضري: خط سماء ونوافذ تضيء */
  "urban-design"(ctx, W, H, t, th) {
    const r = rng(SEED(th, 5)); let x = 0; ctx.lineWidth = 1;
    while (x < W) { const w = 40 + r() * 70, h = H * (.25 + r() * .45); ctx.globalAlpha = .07; ctx.fillStyle = th.c; ctx.fillRect(x, H - h, w, h); ctx.globalAlpha = .2; ctx.strokeStyle = th.c; ctx.strokeRect(x + .5, H - h + .5, w, h);
      for (let wy = H - h + 12; wy < H - 10; wy += 16) for (let wx = x + 8; wx < x + w - 8; wx += 14) { const on = Math.sin(wx * .3 + wy * .2 + t * 1.5) > .55; ctx.globalAlpha = on ? .55 : .08; ctx.fillStyle = th.c2; ctx.fillRect(wx, wy, 6, 8); }
      x += w + 8 + r() * 20; }
    ctx.globalAlpha = .3; ctx.strokeStyle = th.c2; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(0, H - 2); ctx.lineTo(W, H - 2); ctx.stroke(); ctx.setLineDash([]);
  },
  /* تراث: نقش هندسي يُرسم تدريجياً */
  heritage(ctx, W, H, t, th) {
    const s = 72, prog = Math.min(1, t / 6); ctx.strokeStyle = th.c; ctx.lineWidth = 1; let n = 0, total = Math.ceil(W / s) * Math.ceil(H / s);
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) { n++; if (n / total > prog + .02) continue; ctx.globalAlpha = .12 + .06 * Math.sin(t + x * .01 + y * .013);
      ctx.beginPath(); const cx = x + s / 2, cy = y + s / 2; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + t * .05; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * s / 2, cy + Math.sin(a) * s / 2); } ctx.rect(x + s * .2, y + s * .2, s * .6, s * .6); ctx.stroke();
      ctx.globalAlpha = .18; ctx.strokeStyle = th.c2; ctx.beginPath(); ctx.arc(cx, cy, s * .22, 0, 7); ctx.stroke(); ctx.strokeStyle = th.c; }
  },
  /* تصميم ونمذجة: مكعب سلكي أيزومتري يدور + شبكة */
  design(ctx, W, H, t, th) {
    ctx.strokeStyle = th.c; ctx.globalAlpha = .07; ctx.lineWidth = 1; const g = 48;
    for (let x = 0; x < W + H; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H * .6, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - H, 0); ctx.lineTo(x - H + H * .6, H); ctx.stroke(); }
    const cx = W * .72, cy = H * .5, R = Math.min(W, H) * .22, a = t * .35;
    const P = []; for (let i = 0; i < 8; i++) { const x = (i & 1 ? 1 : -1), y = (i & 2 ? 1 : -1), z = (i & 4 ? 1 : -1); const X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a); const Y = y * Math.cos(.5) - Z * Math.sin(.5); P.push([cx + X * R, cy + Y * R * .9]); }
    ctx.globalAlpha = .55; ctx.strokeStyle = th.c2; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (((i ^ j) & ((i ^ j) - 1)) === 0) { ctx.moveTo(...P[i]); ctx.lineTo(...P[j]); } ctx.stroke();
    ctx.fillStyle = th.c2; for (const p of P) { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); }
  },
  /* رقمي: عقد تتصل ونبضات بيانات */
  digital(ctx, W, H, t, th) {
    const r = rng(SEED(th, 9)), N = 42, pts = []; for (let i = 0; i < N; i++) pts.push([r() * W + Math.sin(t * .4 + i) * 12, r() * H + Math.cos(t * .3 + i * 1.3) * 12]);
    ctx.lineWidth = 1; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d > 170) continue; ctx.globalAlpha = .18 * (1 - d / 170); ctx.strokeStyle = th.c; ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); ctx.stroke(); }
    ctx.fillStyle = th.c2; for (const p of pts) { ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fill(); }
    ctx.globalAlpha = .35; ctx.fillStyle = th.c; ctx.font = "12px ui-monospace, monospace"; for (let i = 0; i < 6; i++) { const y = ((t * 40 + i * 140) % (H + 60)) - 30; ctx.fillText(["arcpy.Buffer_analysis()", "SELECT * FROM parcels", "for row in cursor:", "np.where(score>0.6)", "geojson.dump(fc)", "df.groupby('zone')"][i], 30 + i * (W / 6.5), y); }
  },
  /* استدامة: أمواج ماء وأوراق تطفو */
  sustainability(ctx, W, H, t, th) {
    ctx.lineWidth = 1.5; for (let k = 0; k < 7; k++) { ctx.globalAlpha = .1 + k * .02; ctx.strokeStyle = k % 2 ? th.c2 : th.c; ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const y = H * .55 + k * 34 + Math.sin(x / 90 + t * .9 + k) * 12 + Math.sin(x / 37 - t * 1.4) * 5; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    const r = rng(SEED(th, 13)); ctx.fillStyle = th.c; for (let i = 0; i < 14; i++) { const x = (r() * W + t * 18 * (1 + r())) % W, y = r() * H * .5 + Math.sin(t + i) * 10; ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(x, y, 10, 5, (t + i) * .3, 0, 7); ctx.fill(); }
  },
};
SCENES.regional = SCENES.planning;
function bez(p, u) { const m = 1 - u; return [m * m * m * p[0] + 3 * m * m * u * p[2] + 3 * m * u * u * p[4] + u * u * u * p[6], m * m * m * p[1] + 3 * m * m * u * p[3] + 3 * m * u * u * p[5] + u * u * u * p[7]]; }

/* ── مشغّل المشهد على لوحة ثابتة خلف الصفحة ── */
let runner = null;
export function runScene(cat, host, opts = {}) {
  const key = K(typeof cat === "object" ? cat.key : cat), th = typeof cat === "object" ? cat : THEMES[key], scene = SCENES[key];
  if (runner) { cancelAnimationFrame(runner.raf); runner.cv.remove(); if (runner.cv2) runner.cv2.remove(); runner = null; }
  const cv = el("canvas", { class: "theme-canvas" }); host.appendChild(cv); const ctx = cv.getContext("2d");
  const scene2 = th.secondary && SCENES[th.secondary]; const cv2 = scene2 ? el("canvas", { class: "theme-canvas sec" }) : null; if (cv2) host.appendChild(cv2); const ctx2 = cv2 && cv2.getContext("2d"); const th2 = scene2 ? { ...THEMES[th.secondary], seed: th.seed + 5, speed: th.speed } : null;
  const mobile = innerWidth < 700; if (mobile) opts = { ...opts, fps: Math.min(opts.fps || 24, 15) };
  let W, H, DPR; const size = () => { DPR = mobile ? 1 : Math.min(devicePixelRatio || 1, 1.5); W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); if (cv2) { cv2.width = W * DPR; cv2.height = H * DPR; ctx2.setTransform(DPR, 0, 0, DPR, 0, 0); } };
  size(); const t0 = performance.now(); let last = 0;
  const frame = (ts) => { if (!document.hidden && ts - last > (opts.fps ? 1000 / opts.fps : 33)) { ctx.clearRect(0, 0, W, H); const tt = (ts - t0) / 1000 * (th.speed || 1); if (th.mirror) { ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); } scene(ctx, W, H, tt, th); if (th.mirror) ctx.restore(); drawMotifs(ctx, W, H, tt, th); if (scene2) { ctx2.clearRect(0, 0, W, H); scene2(ctx2, W, H, tt * .8, th2); } last = ts; } if (!reduce) runner.raf = requestAnimationFrame(frame); };
  runner = { cv, cv2, raf: 0, key }; ctx.clearRect(0, 0, W, H); scene(ctx, W, H, reduce ? 3 : 0, th); drawMotifs(ctx, W, H, reduce ? 3 : 0, th); if (!reduce) runner.raf = requestAnimationFrame(frame);
  const onR = () => size(); addEventListener("resize", onR); runner.stop = () => { cancelAnimationFrame(runner.raf); removeEventListener("resize", onR); cv.remove(); if (cv2) cv2.remove(); runner = null; };
  return runner;
}

/* ── تطبيق الثيم على الصفحة: لون + خلفية + دخول ── */
export function applyTheme(cat, { intro = true, project = null } = {}) {
  const key = K(cat), th = projectTheme(key, project), root = document.documentElement;
  root.setAttribute("data-cat", key); root.style.setProperty("--tacc", th.c); root.style.setProperty("--tacc2", th.c2); if (project) root.setAttribute("data-variant", th.variant);
  let bg = $(".theme-bg"); if (!bg) { bg = el("div", { class: "theme-bg", "aria-hidden": "true" }); document.body.prepend(bg); }
  runScene(th, bg, { fps: 24 });
  if (intro && !reduce) showIntro(th);
}

/* شاشة الدخول: اسم التصنيف يُكشف ثم تنزاح الستارة */
export function showIntro(key) {
  const th = typeof key === "object" ? key : projectTheme(key); const label = state.lang === "ar" ? th.ar : th.en;
  const motifs = (th.motifs || []).map((m, i) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="--i:${i}"><path d="${MOTIFS[m]}"/></svg>`).join("");
  const ov = el("div", { class: "intro", role: "presentation" }, `<div class="intro-bg"></div><div class="intro-in"><span class="intro-ic">${ICON[th.icon] || ""}</span><span class="intro-k">${state.lang === "ar" ? "مجال" : "Field"}</span><b class="intro-t">${label}</b><i class="intro-line"></i>${motifs ? `<span class="intro-m">${motifs}</span>` : ""}</div>`);
  document.body.appendChild(ov); const bg = ov.querySelector(".intro-bg"); runScene(th, bg, { fps: 30 });
  const done = () => { ov.classList.add("out"); setTimeout(() => { if (runner && runner.cv.parentNode === bg) runner.stop(); ov.remove(); const host = $(".theme-bg"); if (host && !host.querySelector("canvas")) runScene(th, host, { fps: 24 }); }, 650); };
  ov.addEventListener("click", done, { once: true }); setTimeout(done, 1500);
}

/* نبضة الواجهة: عند اختيار زر في البطل يتغير وضع الخريطة مؤقتاً */
export function pulseHero(cat, origin) {
  const key = K(cat), th = THEMES[key]; const plan = $(".plan"); if (plan) { plan.dataset.mode = key; plan.style.setProperty("--tacc", th.c); }
  document.documentElement.style.setProperty("--tacc", th.c);
  if (reduce || !origin) return;
  const r = origin.getBoundingClientRect(); const rp = el("span", { class: "ripple" }); rp.style.left = r.left + r.width / 2 + "px"; rp.style.top = r.top + r.height / 2 + "px"; rp.style.setProperty("--c", th.c); document.body.appendChild(rp); setTimeout(() => rp.remove(), 900);
}

const ICON = {
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="5" r="2.5"/><path d="M7 18c6 0 4-12 10-12"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 13 10 5 10-5"/><path d="m2 18 10 5 10-5"/></svg>`,
  drone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/><path d="M7 7l2 2m8-2-2 2M7 17l2-2m8 2-2-2"/></svg>`,
  city: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V9h5v12M8 21V4h6v17M14 21v-8h7v8M3 21h18"/></svg>`,
  pattern: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l10 10-10 10L2 12Z"/><path d="M12 7l5 5-5 5-5-5Z"/></svg>`,
  cube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z"/><path d="M4 20c4-5 8-8 12-10"/></svg>`,
};
