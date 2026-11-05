/* ─────────────────────────────────────────────
   الحركة والحياة: أرضية كنتور، لوحة المخطط الحية، رفّ الطبقات ثلاثي الأبعاد،
   شريط متحرك، FLIP للترتيب، عدّادات، بوصلة، إمالة البطاقات وبقعة الضوء.
   كل الحركات transform/opacity وتحترم prefers-reduced-motion.
   ───────────────────────────────────────────── */
import { reduce, $, $$, el, esc, L, state } from "./core.js";

/* ── عشوائية ثابتة ── */
export function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ── نسيج مدينة إجرائي (بلوكات) ── */
export function fabric(seed, W, H, coast, cls = "") {
  const r = rng(seed); let s = ""; let y = 6;
  while (y < H) { const bh = 24 + r() * 30; let x = 6;
    while (x < W) { const bw = 22 + r() * 42; const cx = coast ? coast(y + bh / 2) : -1;
      if (x > cx + 14) { if (r() < .18) s += `<rect class="${cls}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="var(--block)" stroke="var(--line)" stroke-dasharray="2 3"/>`;
        else if (r() < .4) { const h2 = bh * (.35 + r() * .3); s += `<rect class="${cls}" x="${x}" y="${y}" width="${bw}" height="${h2 - 2}" rx="2" fill="var(--block)"/><rect class="${cls}" x="${x}" y="${y + h2 + 1}" width="${bw}" height="${bh - h2 - 1}" rx="2" fill="var(--block)"/>`; }
        else s += `<rect class="${cls}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="var(--block)"/>`; }
      x += bw + (r() < .12 ? 14 : 5); }
    y += bh + (r() < .2 ? 14 : 5); }
  return s;
}

/* ── أرضية كنتور حية (marching squares) ── */
export function initContourGround() {
  const host = $(".raster-bg"); if (!host) return;
  host.innerHTML = ""; const cv = el("canvas"); host.appendChild(cv); const ctx = cv.getContext("2d");
  const root = document.documentElement; let W, H, DPR = 1, col = "#28A085", t0 = 0;
  const nz = (x, y, t) => Math.sin(x * .8 + t) * Math.cos(y * 1.05 - t * .6) + Math.sin((x + y) * .55 + t * .4) * .6 + Math.cos(x * 1.6 - y * .45) * .3;
  const size = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); col = getComputedStyle(root).getPropertyValue("--accent-2").trim() || col; };
  const draw = (t) => {
    const st = 14, cols = Math.ceil(W / st) + 1, rows = Math.ceil(H / st) + 1, sc = 1 / 200, F = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) F[j * cols + i] = nz(i * st * sc, j * st * sc, t);
    ctx.clearRect(0, 0, W, H); ctx.strokeStyle = col; ctx.lineJoin = "round"; ctx.lineCap = "round"; let n = 0;
    for (let lv = -1.5; lv <= 1.51; lv += .25, n++) { const idx = n % 4 === 0; ctx.globalAlpha = idx ? .13 : .06; ctx.lineWidth = idx ? 1.2 : .8; ctx.beginPath();
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) { const a = F[j * cols + i] - lv, b = F[j * cols + i + 1] - lv, c = F[(j + 1) * cols + i + 1] - lv, d = F[(j + 1) * cols + i] - lv; const code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0); if (code === 0 || code === 15) continue;
        const x = i * st, y = j * st, T = [x + st * a / (a - b), y], R = [x + st, y + st * b / (b - c)], B = [x + st * d / (d - c), y + st], Lf = [x, y + st * a / (a - d)]; const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (code) { case 1: case 14: seg(Lf, B); break; case 2: case 13: seg(B, R); break; case 3: case 12: seg(Lf, R); break; case 4: case 11: seg(T, R); break; case 5: seg(Lf, T); seg(B, R); break; case 6: case 9: seg(T, B); break; case 7: case 8: seg(Lf, T); break; case 10: seg(T, R); seg(Lf, B); break; } }
      ctx.stroke(); }
  };
  size(); draw(0); addEventListener("resize", () => { size(); draw(t0); });
  document.addEventListener("themechange", () => { size(); draw(t0); });
  if (!reduce) { let last = 0; const loop = (ts) => { if (ts - last > 80 && !document.hidden) { t0 = ts / 15000; draw(t0); last = ts; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
}

/* ── لوحة المخطط الحية في البطل ── */
export function heroScene(profile, meta = {}) {
  const W = 600, H = 560, coast = (y) => 140 + 36 * Math.sin(y / 95) + 14 * Math.sin(y / 31 + 1);
  let sea = "M0 0"; for (let y = 0; y <= H; y += 8) sea += ` L${coast(y).toFixed(1)} ${y}`; sea += ` L0 ${H}Z`;
  let shore = `M${coast(0)} 0`; for (let y = 8; y <= H; y += 8) shore += ` L${coast(y).toFixed(1)} ${y}`;
  // خلايا الحرارة: شبكة 12×11 فوق اليابسة، قيمها من نواة ملاءمة + ضجيج
  const r = rng(21); const cs = 30; let cells = ""; let k = 0;
  for (let y = 10; y < H - cs; y += cs + 4) for (let x = 170; x < W - cs; x += cs + 4) { const v = Math.max(0, 1 - Math.hypot(x - 420, y - 300) / 330) * .8 + r() * .35; const c = Math.min(4, Math.floor(v * 5)); const d = (Math.hypot(x - 420, y - 300) / 420 * 1.6 + 1.2).toFixed(2); cells += `<rect class="hc" x="${x}" y="${y}" width="${cs}" height="${cs}" rx="5" fill="var(--h${c})" style="--d:${d}s;--o:${(.10 + c * .09).toFixed(2)}"/>`; k++; }
  const brt = "M205 30 C240 110 325 115 335 190 C345 270 265 300 285 380 C305 460 420 470 470 540";
  const st = [[205, 30], [325, 150], [314, 262], [285, 380], [375, 470], [470, 540]];
  const date = new Date(meta.lastSync || Date.now()).getFullYear();
  const svg = `<svg class="map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="${W}" height="${H}" fill="var(--panel)"/>
    <g id="heroBlocks">${fabric(11, W, H, coast, "block")}</g>
    <g class="heat">${cells}</g>
    <path d="${sea}" fill="var(--sea)"/>${[1, 2, 3].map((i) => `<path d="${shore}" transform="translate(${-i * 11} 0)" stroke="var(--accent-2)" stroke-opacity="${.2 - i * .05}" fill="none"/>`).join("")}<path d="${shore}" stroke="var(--accent-2)" stroke-opacity=".75" stroke-width="1.5" fill="none"/>
    <g class="rd" stroke="var(--muted)" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"><path pathLength="1" d="M245 0 C258 200 236 420 258 560"/><path pathLength="1" style="animation-delay:1.05s" d="M395 0 C388 220 416 430 402 560"/><path pathLength="1" style="animation-delay:1.2s" d="M170 170 C320 180 460 160 600 175"/><path pathLength="1" style="animation-delay:1.35s" d="M150 430 C320 418 470 445 600 430"/></g>
    <path class="brt-glow" d="${brt}" stroke="var(--h3)" stroke-opacity=".22" stroke-width="18" fill="none" stroke-linecap="round"/><path class="brt-path" d="${brt}" stroke="var(--h3)" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${st.map(([x, y], i) => `<circle class="ring" cx="${x}" cy="${y}" r="8" fill="none" stroke="var(--h3)" stroke-width="2" style="animation-delay:${2.6 + i * .4}s"/><circle class="stn" cx="${x}" cy="${y}" r="7" fill="var(--panel)" stroke="var(--h3)" stroke-width="4" style="animation-delay:${2.1 + i * .4}s"/>`).join("")}
    ${reduce ? "" : `<g visibility="hidden"><set attributeName="visibility" to="visible" begin="4.4s" fill="freeze"/><rect x="-11" y="-6" width="22" height="12" rx="4" fill="var(--h3)" stroke="var(--panel)" stroke-width="2"/><rect x="-6" y="-3" width="4" height="3" rx="1" fill="var(--panel)"/><rect x="1" y="-3" width="4" height="3" rx="1" fill="var(--panel)"/><animateMotion dur="11s" begin="4.4s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear" path="${brt}"/></g>`}
    <g class="zn"><circle cx="455" cy="300" r="58" fill="var(--accent-2)" fill-opacity=".08" stroke="var(--accent-2)" stroke-dasharray="5 6"/><circle cx="455" cy="300" r="26" fill="var(--accent-2)" fill-opacity=".14"/><circle cx="455" cy="300" r="5" fill="var(--accent-2)"/></g>
    <g class="lb"><text transform="translate(66 330) rotate(-82)" fill="var(--accent-2)" fill-opacity=".75" font-family="IBM Plex Sans Arabic" font-size="14" letter-spacing="6">${esc(state.lang === "ar" ? "البحر" : "SEA")}</text>
    <g transform="translate(36 486)"><rect width="120" height="6" fill="none" stroke="var(--fg)" stroke-opacity=".6"/><rect width="30" height="6" fill="var(--fg)" fill-opacity=".6"/><rect x="60" width="30" height="6" fill="var(--fg)" fill-opacity=".6"/><text y="-6" fill="var(--muted)" font-family="IBM Plex Mono" font-size="10">0</text><text x="110" y="-6" fill="var(--muted)" font-family="IBM Plex Mono" font-size="10">2 km</text></g></g></svg>`;
  const name = L(profile.name) || "";
  return `<div class="plan" id="plan"><div class="scan" aria-hidden="true"></div>${svg}<div class="frame"></div><div class="ch-x" id="chx"></div><div class="ch-y" id="chy"></div>
    <div class="readout mono" id="readout"><span>LAT</span> 21.5432° N<br><span>LON</span> 39.1728° E<br><span>CELL</span> —</div>
    <svg class="north" viewBox="0 0 44 60" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="20" stroke="var(--line-2)"/><path d="M22 6 L29 30 L22 25 L15 30 Z" fill="var(--fg)"/><path d="M22 25 L29 30 L22 38 L15 30Z" fill="var(--dim)"/><text x="22" y="56" text-anchor="middle" fill="var(--fg)" font-family="IBM Plex Mono" font-size="10">N</text></svg>
    <div class="plan-legend"><b>${esc(state.lang === "ar" ? "الملاءمة" : "Suitability")}</b><span>${[0, 1, 2, 3, 4].map((i) => `<i style="background:var(--h${i})"></i>`).join("")}</span></div>
    <div class="tblock"><div><small>MODEL</small><b>Weighted Overlay</b></div><div><small>ANALYST</small><b>${esc(name)}</b></div><div><small>CRS</small><b>WGS 84 · UTM 37N</b></div><div><small>DATE</small><b>${date}</b></div></div></div>`;
}
export function bindHeroScene() {
  const plan = $("#plan"); if (!plan) return;
  const chx = $("#chx"), chy = $("#chy"), ro = $("#readout");
  $$("#heroBlocks rect").forEach((r) => { const x = +r.getAttribute("x"), y = +r.getAttribute("y"); r.style.animationDelay = (.15 + Math.hypot(x - 420, y - 300) / 520 * 1.2).toFixed(2) + "s"; });
  plan.addEventListener("pointermove", (e) => { const b = plan.getBoundingClientRect(), px = e.clientX - b.left, py = e.clientY - b.top; chx.style.top = py + "px"; chy.style.left = px + "px";
    const lat = (21.74 - (py / b.height) * .36).toFixed(4), lon = (39.08 + (px / b.width) * .22).toFixed(4); const v = Math.max(0, 1 - Math.hypot(px / b.width - .7, py / b.height - .54) / .6); const k = Math.min(4, Math.floor(v * 5));
    ro.innerHTML = `<span>LAT</span> ${lat}° N<br><span>LON</span> ${lon}° E<br><span>CELL</span> ${Math.round(v * 100)} · <i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--h${k});vertical-align:middle"></i>`; });
}

/* ── شريط متحرك ── */
export function ticker(items) { if (!items.length) return ""; const half = items.map((t) => `<span>${esc(t)}</span>`).join(""); return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${half}${half}</div></div>`; }

/* ── رفّ الطبقات ثلاثي الأبعاد لنموذج الملاءمة ── */

/* زخرفة خفيفة لكل معيار تظهر فوق خلاياه عند التحديد */
const TX = {
  planning: `<svg viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 50h200M0 100h200M0 150h200M50 0v200M100 0v200M150 0v200"/><path d="M0 100C60 70 140 130 200 100" stroke-width="2.5" stroke-dasharray="6 5"/></g><g fill="currentColor" opacity=".5"><rect x="12" y="12" width="26" height="26" rx="3"/><rect x="112" y="62" width="26" height="26" rx="3"/><rect x="62" y="162" width="26" height="26" rx="3"/><rect x="162" y="112" width="26" height="26" rx="3"/></g></svg>`,
  gis: `<svg viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 40h200M0 80h200M0 120h200M0 160h200M40 0v200M80 0v200M120 0v200M160 0v200" opacity=".6"/></g><g fill="currentColor"><path d="M60 50c0-10 16-10 16 0 0 8-8 14-8 22-0-8-8-14-8-22Z"/><path d="M130 110c0-10 16-10 16 0 0 8-8 14-8 22 0-8-8-14-8-22Z"/><path d="M90 150c0-10 16-10 16 0 0 8-8 14-8 22 0-8-8-14-8-22Z"/></g><circle cx="100" cy="100" r="46" fill="none" stroke="currentColor" stroke-dasharray="4 4"/></svg>`,
  geomatics: `<svg viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1.3"><path d="M0 60C40 30 80 90 120 60s60-10 80 20"/><path d="M0 100c40-30 80 30 120 0s60-10 80 20"/><path d="M0 140c40-30 80 30 120 0s60-10 80 20"/><path d="M0 180c40-30 80 30 120 0s60-10 80 20"/></g><g fill="currentColor"><path d="M40 30l6 10h-12Z"/><path d="M150 50l6 10h-12Z"/><path d="M100 120l6 10h-12Z"/><path d="M30 160l6 10h-12Z"/></g><g stroke="currentColor" stroke-width="2.5" fill="none"><path d="M158 150l12 12m0-12-12 12"/></g></svg>`,
  design: `<svg viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M100 30l50 28v56l-50 28-50-28V58Z"/><path d="M50 58l50 28 50-28M100 86v56"/><path d="M20 150l30 17v20M180 150l-30 17v20" opacity=".6"/></g></svg>`,
  digital: `<svg viewBox="0 0 200 200" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M30 40L90 70 150 40 170 110 110 150 50 130Z"/><path d="M90 70L110 150M150 40L50 130"/></g><g fill="currentColor"><circle cx="30" cy="40" r="5"/><circle cx="90" cy="70" r="5"/><circle cx="150" cy="40" r="5"/><circle cx="170" cy="110" r="5"/><circle cx="110" cy="150" r="5"/><circle cx="50" cy="130" r="5"/></g></svg>`,
};
const TXC = { planning: "#28A085", gis: "#2D6F8E", geomatics: "#5FD1B4", design: "#7E6BD1", digital: "#5FD1B4" };
export function stackHtml(groups) {
  const planes = groups.map((g, i) => `<div class="plane" data-g="${esc(g.id)}" style="--i:${groups.length - i};--pcol:${TXC[g.id] || "var(--accent)"}"><div class="pgrid" data-grid="${esc(g.id)}"></div><span class="tx" style="color:${TXC[g.id] || "var(--accent)"}" aria-hidden="true">${TX[g.id] || TX.planning}</span><span class="tg mono">L${groups.length - i}</span><span class="tn">${esc(L(g.title))}</span></div>`).join("");
  const ar = state.lang === "ar";
  const side = `<aside class="stage-side" id="stage-side"><div class="ls-head">${ar ? "الطبقات" : "Layers"}<small>${ar ? "اضغط طبقة لعزلها" : "Click a layer to isolate it"}</small></div><div class="layer-list">${groups.map((g, i) => `<button type="button" class="ll" data-ll="${esc(g.id)}" style="--pcol:${TXC[g.id] || "var(--accent)"}"><i></i><span class="mono">L${groups.length - i}</span><b>${g.id === "planning" ? "★ " : ""}${esc(L(g.title))}</b><em class="mono" data-llw="${esc(g.id)}"></em></button>`).join("")}<button type="button" class="ll out" data-ll="__out" style="--pcol:var(--fg)"><i></i><span class="mono">L0</span><b>${ar ? "الناتج النهائي" : "Final output"}</b><em class="mono">Σ</em></button></div><div class="ls-info" id="ls-info">${ar ? "كل طبقة = معيار من معاييرك، وكل مربع فيها = مشروع. كلما كان المربع أفتح كان المشروع أقرب إلى ذلك المعيار. الطبقة السفلية تجمع الطبقات مرجّحةً بأوزانك فتعطي كل مشروع درجته من 100." : "Each layer is one of your criteria and each square is a project; the lighter the square, the better the project fits that criterion. The bottom layer sums the layers by your weights into a score out of 100."}</div></aside>`;
  return `<div class="stage-wrap"><div class="stage" id="stage"><div class="stack" id="stack">${planes}<div class="plane out" data-g="__out" style="--i:0"><div class="pgrid" data-grid="__out"></div><span class="tg mono">L0 · Σ</span><span class="tn" id="out-tn"></span></div></div><button type="button" class="stage-clear" id="stage-clear" hidden>✕ ${ar ? "إظهار كل الطبقات" : "Show all layers"}</button></div>${side}</div>`;
}
let CUR = null;
/* ملء شبكات الطبقات: ranked = [{p, score, k, parts}], weights */
export function fillStack(ranked, groups, weights, onHover) {
  CUR = { ranked, groups, weights };
  const n = ranked.length; const cols = Math.ceil(Math.sqrt(n)) || 1;
  const cell = (r, k, extra = "", txt = "") => `<div class="pc" data-p="${esc(r.p.id)}" data-k="${k}" style="${extra}" title="${esc(L(r.p.title))}">${txt}</div>`;
  for (const g of groups) { const host = $(`[data-grid="${CSS.escape(g.id)}"]`); if (!host) continue; const w = weights[g.id] ?? 0;
    host.style.setProperty("--cols", cols); host.style.setProperty("--rows", Math.ceil(n / cols) || 1); host.innerHTML = ranked.map((r, i) => { const part = r.parts.find((x) => x.group.id === g.id); const m = part ? part.m : 0; return cell(r, Math.min(4, Math.floor(m * 5)), `--wo:${w ? (0.3 + 0.7 * w / 5).toFixed(2) : 0.12};--d:${(i * 28)}ms`); }).join("");
    const plane = host.closest(".plane"); plane.style.setProperty("--w", w / 5); plane.classList.toggle("muted", !w); const lw = $(`[data-llw="${CSS.escape(g.id)}"]`); if (lw) lw.textContent = `w${w}`; const ll = $(`[data-ll="${CSS.escape(g.id)}"]`); if (ll) ll.classList.toggle("muted", !w); }
  const out = $('[data-grid="__out"]'); if (out) { out.style.setProperty("--cols", cols); out.style.setProperty("--rows", Math.ceil(n / cols) || 1); out.innerHTML = ranked.map((r, i) => cell(r, r.k, `--wo:1;--d:${i * 28 + 200}ms`, `<b>${r.score}</b>`)).join(""); }
  $$(".pc").forEach((c) => { c.addEventListener("pointerenter", () => onHover(c.dataset.p)); c.addEventListener("pointerleave", () => onHover(null)); });
  // تشغيل الكشف
  const stack = $("#stack"); if (stack) { stack.classList.remove("pop"); void stack.offsetWidth; stack.classList.add("pop"); }
  if (bindStack.refresh) bindStack.refresh();
}
export function bindStack(groups) {
  const stage = $("#stage"), stack = $("#stack"); if (!stage) return;
  const planes = $$(".plane", stack), ar = state.lang === "ar"; let sticky = null;
  const info = (id) => { const box = $("#ls-info"); if (!box || !CUR) return; if (!id) { box.innerHTML = ar ? "كل طبقة = معيار من معاييرك، وكل مربع فيها = مشروع. كلما كان المربع أفتح كان المشروع أقرب إلى ذلك المعيار. الطبقة السفلية تجمع الطبقات مرجّحةً بأوزانك فتعطي كل مشروع درجته من 100." : "Each layer is one of your criteria and each square is a project; the lighter the square, the better the project fits that criterion. The bottom layer sums the layers by your weights into a score out of 100."; return; }
    if (id === "__out") { const top = CUR.ranked.slice(0, 3); box.innerHTML = `<b>${ar ? "الناتج: الدرجة من 100" : "Output: score out of 100"}</b><p>${ar ? "مجموع كل طبقة × وزنها، مقسوماً على مجموع الأوزان." : "Sum of each layer × its weight, divided by the total weight."}</p><ol>${top.map((r) => `<li><span>${esc(L(r.p.title))}</span><em class="mono">${r.score}</em></li>`).join("")}</ol>`; return; }
    const g = CUR.groups.find((x) => x.id === id); if (!g) return; const w = CUR.weights[id] ?? 0; const top = [...CUR.ranked].map((r) => ({ r, m: (r.parts.find((x) => x.group.id === id) || { m: 0 }).m })).sort((a, b) => b.m - a.m).slice(0, 3);
    box.innerHTML = `<b>${esc(L(g.title))}</b><p>${ar ? `الوزن الحالي ${w} من 5${w ? "" : " — الطبقة معطّلة ولا تؤثر في الناتج"}. الأفتح = مطابقة أعلى لهذا المعيار.` : `Current weight ${w} of 5${w ? "" : " — this layer is off and does not affect the output"}. Lighter = better fit for this criterion.`}</p><ol>${top.map(({ r, m }) => `<li><span>${esc(L(r.p.title))}</span><em class="mono">${Math.round(m * 100)}%</em></li>`).join("")}</ol>`; };
  const on = (id) => { planes.forEach((p) => p.classList.toggle("on", p.dataset.g === id)); stack.classList.toggle("has-focus", !!id); $$(".ll").forEach((b) => b.classList.toggle("on", b.dataset.ll === id)); $("#stage-clear").hidden = !sticky; info(id); };
  const hover = (id) => { if (!sticky) on(id); };
  $$("[data-w]").forEach((inp) => { const row = inp.closest(".wrow"); row.addEventListener("pointerenter", () => hover(inp.dataset.w)); row.addEventListener("focusin", () => hover(inp.dataset.w)); row.addEventListener("pointerleave", () => hover(null)); });
  planes.forEach((p) => { p.addEventListener("pointerenter", () => hover(p.dataset.g)); p.addEventListener("pointerleave", () => hover(null)); p.addEventListener("click", (e) => { e.stopPropagation(); sticky = sticky === p.dataset.g ? null : p.dataset.g; on(sticky); }); });
  $$(".ll").forEach((b) => { b.addEventListener("click", () => { sticky = sticky === b.dataset.ll ? null : b.dataset.ll; on(sticky); }); b.addEventListener("pointerenter", () => hover(b.dataset.ll)); b.addEventListener("pointerleave", () => hover(null)); });
  $("#stage-clear").addEventListener("click", () => { sticky = null; on(null); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sticky) { sticky = null; on(null); } });
  bindStack.refresh = () => info(sticky);
  // تتباعد الطبقات مع التمرير
  let tick = false; const spread = () => { tick = false; const b = stage.getBoundingClientRect(), vh = innerHeight; const t = Math.max(0, Math.min(1, (vh - b.top) / (vh * .85))); const e = 1 - Math.pow(1 - t, 3); const maxG = innerWidth < 600 ? 22 : 40; stack.style.setProperty("--gap", (reduce ? maxG : 12 + e * maxG).toFixed(1) + "px"); };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(spread); } }, { passive: true }); spread();
  // دوران خفيف بالمؤشر
  if (!reduce && matchMedia("(hover:hover)").matches) stage.addEventListener("pointermove", (e) => { const b = stage.getBoundingClientRect(); stack.style.setProperty("--rz", (((e.clientX - b.left) / b.width - .5) * 14).toFixed(1) + "deg"); stack.style.setProperty("--rx", (((e.clientY - b.top) / b.height - .5) * -8).toFixed(1) + "deg"); });
  stage.addEventListener("pointerleave", () => { stack.style.setProperty("--rz", "0deg"); stack.style.setProperty("--rx", "0deg"); });
}

/* ── FLIP لإعادة الترتيب ── */
export function flip(container, selector, mutate) {
  const before = new Map($$(selector, container).map((e) => [e.dataset.p, e.getBoundingClientRect()]));
  mutate();
  if (reduce) return;
  $$(selector, container).forEach((e) => { const b = before.get(e.dataset.p); if (!b) { e.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.16,.84,.24,1)" }); return; } const a = e.getBoundingClientRect(); const dy = b.top - a.top; if (Math.abs(dy) > 1) e.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.16,.84,.24,1)" }); });
}
/* ── عدّاد ── */
export function countUp(elm, to, dur = 900, suffix = "") {
  const from = +elm.dataset.v || 0; elm.dataset.v = to; if (reduce || from === to) { elm.firstChild ? (elm.firstChild.nodeValue = to) : (elm.textContent = to); return; }
  const t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (elm.firstChild && elm.firstChild.nodeType === 3) elm.firstChild.nodeValue = v; else elm.textContent = v + suffix; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f);
}
/* ── وردة البوصلة ── */
export function compassRose() {
  let t = ""; for (let i = 0; i < 72; i++) { const a = i * 5 * Math.PI / 180, r1 = i % 18 === 0 ? 150 : i % 2 ? 176 : 168, r2 = 186; t += `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * r2).toFixed(1)}" y2="${(-Math.cos(a) * r2).toFixed(1)}" stroke="var(--accent-2)" stroke-opacity="${i % 18 === 0 ? .7 : .35}" stroke-width="${i % 18 === 0 ? 2 : 1}"/>`; }
  const deg = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => `<text x="${(Math.sin(d * Math.PI / 180) * 134).toFixed(1)}" y="${(-Math.cos(d * Math.PI / 180) * 134 + 4).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="var(--dim)">${String(d).padStart(3, "0")}°</text>`).join("");
  const star = (r, w, op) => [0, 90, 180, 270].map((d) => `<path transform="rotate(${d})" d="M0 ${-r} L${w} 0 L0 ${w * .6} L${-w} 0Z" fill="var(--accent-2)" fill-opacity="${op}"/>`).join("");
  return `<div class="rose" aria-hidden="true"><svg viewBox="-200 -200 400 400" fill="none"><circle r="196" stroke="var(--line-2)"/><circle r="186" stroke="var(--line)"/><g class="spin">${t}${deg}</g><g class="spin2"><circle r="112" stroke="var(--line-2)" stroke-dasharray="2 6"/></g><g transform="rotate(45)">${star(78, 10, .25)}</g>${star(112, 16, .45)}<circle r="6" fill="var(--accent)"/></svg></div>`;
}
/* ── بقعة ضوء، إمالة، مغناطيس ── */
export function initCursorFx(root = document) {
  if (reduce || !matchMedia("(hover:hover)").matches) return;
  root.addEventListener("pointermove", (e) => { const elx = e.target.closest && e.target.closest(".card,.svc,.pcard,.preset,.cert"); if (!elx) return; const b = elx.getBoundingClientRect(); elx.style.setProperty("--mx", (e.clientX - b.left) + "px"); elx.style.setProperty("--my", (e.clientY - b.top) + "px"); }, { passive: true });
  $$(".pcard", root).forEach((c) => { c.addEventListener("pointermove", (e) => { const b = c.getBoundingClientRect(); c.style.setProperty("--ry", (((e.clientX - b.left) / b.width - .5) * 5).toFixed(2) + "deg"); c.style.setProperty("--rx", (((e.clientY - b.top) / b.height - .5) * -4).toFixed(2) + "deg"); }); c.addEventListener("pointerleave", () => { c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); }); });
  $$(".btn-primary,.btn-accent", root).forEach((b) => { b.classList.add("mag"); b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.setProperty("--tx", (((e.clientX - r.left) / r.width - .5) * 10).toFixed(1) + "px"); b.style.setProperty("--ty", (((e.clientY - r.top) / r.height - .5) * 8).toFixed(1) + "px"); }); b.addEventListener("pointerleave", () => { b.style.setProperty("--tx", "0px"); b.style.setProperty("--ty", "0px"); }); });
}
/* ── تبديل كلمات في البطل ── */
export function cycler(elm, words, every = 2600) {
  if (!elm || reduce || words.length < 2) return; let i = 0;
  setInterval(() => { const cur = elm.querySelector("span:not(.out)"); i = (i + 1) % words.length; const n = el("span", { class: "next" }, esc(words[i])); elm.appendChild(n); requestAnimationFrame(() => requestAnimationFrame(() => { n.classList.remove("next"); cur && cur.classList.add("out"); })); setTimeout(() => cur && cur.remove(), 800); }, every);
}

/* شريط تقدم القراءة أعلى الصفحة */
export function initProgress() {
  if (document.querySelector(".progress")) return; const bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  const upd = () => { const h = document.documentElement; const p = h.scrollHeight - h.clientHeight; bar.style.width = (p > 0 ? (h.scrollTop / p) * 100 : 0) + "%"; };
  addEventListener("scroll", upd, { passive: true }); upd();
}
/* تأخير متدرج لبطاقات كل قسم */
export function staggerCards(root = document) { for (const sel of [".cert-grid", ".poster-grid", ".timeline", ".svc-grid", ".services"]) root.querySelectorAll(sel).forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty("--i", i))); }

/* ── مقدمة قصيرة عند أول فتح (مرة لكل جلسة): الشعار يُرسم والراستر يمتلئ ── */
export function introSplash(name, sub) {
  if (reduce || location.search.includes("nointro")) return;
  const r = rng(7), COLS = 20, ROWS = 12; const cells = Array.from({ length: COLS * ROWS }, (_, i) => { const cx = i % COLS, cy = Math.floor(i / COLS); const d = Math.hypot(cx - COLS / 2 + .5, (cy - ROWS / 2 + .5) * 1.6) / 11; return `<i class="h${Math.floor(r() * 5)}" style="--d:${(d * .55 + r() * .12).toFixed(2)}s"></i>`; }).join("");
  const F = ['M32 74V26h36', 'M32 49h26'];
  const ar = (document.documentElement.lang || state.lang || "ar") !== "en"; const layers = ar ? ["طبقة التخطيط", "طبقة النقل", "طبقة GIS", "نموذج الملاءمة"] : ["Planning layer", "Transport layer", "GIS layer", "Suitability model"];
  const d = document.createElement("div"); d.className = "splash"; d.id = "splash"; d.setAttribute("aria-hidden", "true");
  d.innerHTML = `<div class="sp-grid">${cells}</div><div class="sp-scan"></div><div class="sp-c"><svg class="sp-logo" viewBox="0 0 96 96"><defs><linearGradient id="spg" gradientUnits="userSpaceOnUse" x1="28" y1="22" x2="72" y2="78"><stop offset="0" stop-color="#7FE6CC"/><stop offset=".55" stop-color="#3FBFA0"/><stop offset="1" stop-color="#C9B23A"/></linearGradient><linearGradient id="spbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17313A"/><stop offset="1" stop-color="#0A1217"/></linearGradient><clipPath id="sprc"><rect width="96" height="96" rx="24"/></clipPath></defs><rect class="sp-bg" width="96" height="96" rx="24" fill="url(#spbg)"/><g clip-path="url(#sprc)" class="sp-ct" fill="none" stroke="#5FD1B4" stroke-opacity=".22" stroke-width="1.2"><path d="M-10 70c18-14 30-8 44-18s22-26 48-24"/><path d="M-10 80c20-16 34-10 50-22s24-28 52-26"/><path d="M-10 90c22-18 38-12 56-26s26-30 56-28"/><path d="M-10 60c16-12 26-6 38-14s20-24 44-22"/><path d="M-10 50c14-10 22-4 32-10s18-22 40-20"/></g>${F.map((p, i) => `<path class="sp-f" d="${p}" stroke="url(#spg)" style="--i:${i}"/>`).join("")}<path class="sp-dash" d="M32 70V30h32M34 49h22"/><circle class="sp-pin2" cx="70" cy="72" r="10"/><circle class="sp-pin" cx="70" cy="72" r="6"/><circle class="sp-pin3" cx="68" cy="70" r="2"/></svg><div class="sp-name">${esc(name).split(" ").map((w, i) => `<span style="--i:${i}">${w}</span>`).join(" ")}</div><div class="sp-sub">${esc(sub)}</div><ul class="sp-log mono">${layers.map((l, i) => `<li style="--i:${i}"><i></i>${esc(l)}</li>`).join("")}</ul><div class="sp-bar"><b></b></div></div><div class="sp-coord mono"><span>LAT</span> <b data-to="21.5433">0.0000</b>° N &nbsp; <span>LON</span> <b data-to="39.1728">0.0000</b>° E</div><button class="sp-skip" type="button">skip</button>`;
  document.body.prepend(d); const end = () => { if (d._done) return; d._done = true; d.classList.add("out"); setTimeout(() => d.remove(), 900); };
  // عدّاد الإحداثيات نحو جدة
  const t0 = performance.now(); const cs = d.querySelectorAll(".sp-coord b"); const tick = (ts) => { const u = Math.min(1, (ts - t0) / 1700); const e = 1 - Math.pow(1 - u, 3); cs.forEach((b) => { b.textContent = (+b.dataset.to * e).toFixed(4); }); if (u < 1 && !d._done) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  d.querySelector(".sp-skip").addEventListener("click", end); d.addEventListener("click", end); setTimeout(end, 2600);
}
