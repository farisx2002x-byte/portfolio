/* ─────────────────────────────────────────────
   «الطابع الأرشيفي» واللمسات الأخيرة: زخارف خرائطية بين الأقسام، مسطرة مسّاحين على جانبي الشاشة
   الكبيرة، حبيبات ورق، كشف الكلمات في العناوين، أختام، وتهيئة الجوال (كاروسيل، طيّ، أكورديون).
   كل الحركات تحترم prefers-reduced-motion، والثقيل منها لا يعمل على اللمس.
   ───────────────────────────────────────────── */
import { state, $, $$, reduce, esc, fmtDate } from "./core.js";
import { journeyItems } from "./infographic.js";

const fine = matchMedia("(pointer: fine)").matches;
const narrow = () => matchMedia("(max-width: 720px)").matches;
const AR = () => (document.documentElement.lang || state.lang) !== "en";

/* ── زخرفة قسم: خط مسح بعلامات قياس ونجمة بوصلة صغيرة ورقم اللوحة ── */
function ornament(no) {
  const ticks = Array.from({ length: 31 }, (_, k) => `<line x1="${k * 20}" y1="${k % 5 ? 9 : 5}" x2="${k * 20}" y2="${k % 5 ? 13 : 17}"/>`).join("");
  return `<div class="orn" aria-hidden="true"><svg viewBox="0 0 600 22" preserveAspectRatio="none" class="orn-rule"><g class="orn-ticks">${ticks}</g><line x1="0" y1="11" x2="600" y2="11" pathLength="1" class="orn-line"/></svg>
    <svg viewBox="-20 -20 40 40" class="orn-star"><path d="M0 -18 L3.2 -3.2 18 0 3.2 3.2 0 18 -3.2 3.2 -18 0 -3.2 -3.2Z"/><path d="M0 -9 L1.6 -1.6 9 0 1.6 1.6 0 9 -1.6 1.6 -9 0 -1.6 -1.6Z" class="in2"/><circle r="1.6"/></svg>
    ${no ? `<span class="orn-no mono">PL. ${no}</span>` : ""}</div>`;
}

/* ── ختم مطاطي ── */
function stamp(text, cls = "") { return `<span class="stamp ${cls}" aria-hidden="true"><span>${text}</span></span>`; }

export function initPolish(c) {
  const app = $("#app"); if (!app || app.querySelector(".orn, .h2[data-split]")) return;
  const secs = $$("#app > section[id]").filter((s) => s.querySelector(".kicker"));
  // 1) زخارف بين الأقسام
  secs.forEach((s, i) => { if (i === 0) return; const k = s.querySelector(".kicker"); if (!k || s.querySelector(".orn")) return; const m = k.textContent.match(/^\s*(\d\d)\s*·/); k.insertAdjacentHTML("beforebegin", ornament(m ? m[1] : "")); });
  // 2) أختام أرشيفية في زوايا بعض الأقسام
  const year = new Date().getFullYear();
  const st = { certificates: [AR() ? `مُتحقَّق · ${year}` : `VERIFIED · ${year}`, "st-teal"], posters: ["ARCHIVE · A1", "st-gold"], library: [AR() ? "مكتبة الأعمال" : "WORKS LIBRARY", "st-gold"], tapes: ["VHS · " + year, "st-rust"] };
  for (const [id, [txt, cls]] of Object.entries(st)) { const s = document.getElementById(id) || document.getElementById(id + "-sec"); const o = s && s.querySelector(".orn"); if (o && !s.querySelector(".stamp")) o.insertAdjacentHTML("afterbegin", stamp(txt, cls)); }
  // 3) كشف الكلمات في العناوين الكبيرة
  $$(".h2.rv", app).forEach((h) => { if (h.dataset.split) return; h.dataset.split = "1"; let n = 0; const walk = (node) => { [...node.childNodes].forEach((ch) => { if (ch.nodeType === 3) { const frag = document.createDocumentFragment(); ch.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; } const sp = document.createElement("span"); sp.className = "w"; sp.style.setProperty("--w", n++); sp.textContent = w; frag.appendChild(sp); }); ch.replaceWith(frag); } else if (ch.nodeType === 1 && !ch.classList.contains("w")) walk(ch); }); }; walk(h); });
  // 4) حبيبات ورق + مسطرة المسّاح (شاشات عريضة) + بوصلة البطل
  if (!$(".grain")) document.body.insertAdjacentHTML("beforeend", `<div class="grain" aria-hidden="true"></div>`);
  if (!$(".ruler")) document.body.insertAdjacentHTML("beforeend", `<div class="ruler ruler-l" aria-hidden="true"><b class="mono" id="ruler-n">N 2 383 000</b></div><div class="ruler ruler-r" aria-hidden="true"><b class="mono" id="ruler-e">E 0 520 000</b></div>`);
  const hero = $("#hero"); if (hero && !$(".hero-rose", hero)) hero.insertAdjacentHTML("afterbegin", heroRose());
  // 5) الإحصاءات: حلقة للنِسَب، وشريط نسبي
  $$(".stat", app).forEach((el) => { const v = el.querySelector(".v span"); if (!v) return; const raw = String(v.dataset.count || v.textContent); if (/%/.test(raw) && !el.querySelector(".ring")) { const p = Math.min(100, parseFloat(raw.replace(/[^\d.]/g, "")) || 0); el.classList.add("has-ring"); el.insertAdjacentHTML("afterbegin", `<div class="ring" style="--p:${p}"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" class="ring-bg"/><circle cx="18" cy="18" r="15.5" class="ring-fg" pathLength="100"/></svg></div>`); } });
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .2 }) : null;
  // 5b) خط الرحلة على الجوال: قائمة عمودية بدل المنحنى الأفقي
  const j = $("#journey", app); if (j && !$(".jlist", app)) { const items = journeyItems(c); const K = AR() ? { work: "عمل", study: "دراسة", volunteer: "تطوع", honor: "تكريم", course: "دورة", now: "الآن", soon: "متوقع" } : { work: "work", study: "study", volunteer: "volunteer", honor: "honor", course: "course", now: "now", soon: "expected" };
    j.insertAdjacentHTML("afterend", `<ol class="jlist" aria-label="timeline">${[...items].reverse().map((it, i) => `<li class="jl jl-${it.kind}${it.future ? " jl-future" : ""}" style="--i:${i}"><i class="jl-dot"></i><div class="jl-b"><span class="jl-k mono">${esc(fmtDate(it.d))}${it.end ? ` → ${esc(it.end === "present" ? K.now : fmtDate(it.end))}` : ""} · ${esc(it.future ? K.soon : K[it.kind] || "")}</span><b>${esc(it.title)}</b>${it.org ? `<span class="jl-o">${esc(it.org)}</span>` : ""}</div></li>`).join("")}</ol>`); $$(".jl", app).forEach((el) => io && io.observe(el)); }
  // 6) الجوال: كاروسيل اللوحات، أكورديون المهارات والخدمات، طيّ الأوزان
  initMobile(app);
  // 7) الكشف عند الظهور للزخارف والحلقات، مع احتياط زمني للعناصر الظاهرة أصلاً
  $$(".orn, .stamp, .stat, .ring", app).forEach((el) => io ? io.observe(el) : el.classList.add("in"));
  setTimeout(() => { $$(".rv:not(.in), .orn:not(.in)", app).forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("in"); }); }, 2200);
  // 8) تمرير مرتبط: بارالاكس خفيف للبطل وتحديث المسطرة (سطح المكتب فقط)
  if (fine && !reduce && !window.__sfx) { window.__sfx = 1; initScrollFx(); }
}

function heroRose() {
  let t = ""; for (let i = 0; i < 72; i++) { const a = i * 5 * Math.PI / 180, r1 = i % 18 === 0 ? 150 : i % 2 ? 176 : 168, r2 = 186; t += `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * r2).toFixed(1)}" y2="${(-Math.cos(a) * r2).toFixed(1)}"/>`; }
  const star = (r, w) => [0, 90, 180, 270].map((d) => `<path transform="rotate(${d})" d="M0 ${-r} L${w} 0 L0 ${w * .6} L${-w} 0Z"/>`).join("");
  return `<div class="hero-rose" aria-hidden="true"><svg viewBox="-200 -200 400 400" fill="none"><circle r="196"/><circle r="120" stroke-dasharray="2 6"/><g class="hr-ticks">${t}</g><g class="hr-star">${star(140, 14)}<g transform="rotate(45)" class="hr-s2">${star(90, 9)}</g></g><circle r="5"/></svg></div>`;
}

function initMobile(app) {
  const mq = matchMedia("(max-width: 720px)");
  const apply = () => {
    const on = mq.matches; app.classList.toggle("is-narrow", on);
    // كاروسيل اللوحات: نقاط التمرير
    const pg = $(".poster-grid", app); if (pg && on && !pg.dataset.snap) { pg.dataset.snap = "1"; const n = pg.children.length; const dots = document.createElement("div"); dots.className = "snap-dots"; dots.innerHTML = Array.from({ length: n }, (_, i) => `<i${i === 0 ? ' class="on"' : ""}></i>`).join(""); pg.after(dots); let raf = 0;
      pg.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const w = pg.firstElementChild?.getBoundingClientRect().width || 1; const i = Math.round(Math.abs(pg.scrollLeft) / (w + 12)); [...dots.children].forEach((d, k) => d.classList.toggle("on", k === Math.min(n - 1, i))); }); }, { passive: true }); }
    // أكورديون المهارات: الأولى مفتوحة
    $$(".sgroup", app).forEach((g, i) => { if (g.dataset.acc) return; g.dataset.acc = "1"; const h = g.querySelector("h3"); if (!h) return; if (i > 0) g.classList.add("folded"); h.setAttribute("role", "button"); h.tabIndex = 0; const tg = () => { if (!app.classList.contains("is-narrow")) return; g.classList.toggle("folded"); }; h.addEventListener("click", tg); h.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(); } }); });
    // الخدمات: البطاقة مطوية، تُفتح باللمس (زر الطلب يبقى ظاهراً)
    $$(".svc", app).forEach((s) => { if (s.dataset.acc) return; s.dataset.acc = "1"; s.addEventListener("click", (e) => { if (!app.classList.contains("is-narrow") || e.target.closest("a, button")) return; s.classList.toggle("open"); }); });
    // الأوزان: مطوية خلف عنوانها
    const w = $(".card.weights", app); if (w && !w.dataset.acc) { w.dataset.acc = "1"; const h = w.querySelector("h3"); if (h) { h.setAttribute("role", "button"); h.tabIndex = 0; w.classList.add("folded"); const tg = () => { if (app.classList.contains("is-narrow")) w.classList.toggle("folded"); }; h.addEventListener("click", tg); h.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(); } }); } }
  };
  apply(); mq.addEventListener("change", apply);
}

function initScrollFx() {
  const scene = $("#plan"); const rose = $(".hero-rose"); const rn = $("#ruler-n"), re = $("#ruler-e"); const rl = $(".ruler-l"), rr = $(".ruler-r");
  let raf = 0; const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const tick = () => { raf = 0; const y = scrollY; if (scene && y < innerHeight * 1.2) scene.style.setProperty("--py", (y * .08).toFixed(1) + "px"); if (rose) rose.style.setProperty("--rot", (y * .04).toFixed(2) + "deg");
    if (rn) rn.textContent = "N " + fmt(2383000 - y * 1.2); if (re) re.textContent = "E " + fmt(520000 + y * .7); if (rl) rl.style.setProperty("--off", (-(y % 200)).toFixed(0) + "px"); if (rr) rr.style.setProperty("--off", (-(y % 200)).toFixed(0) + "px"); };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true }); tick();
}
