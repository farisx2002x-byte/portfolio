/* ─────────────────────────────────────────────
   المكتبة: كل عرض تقديمي كتاب على رف؛ الرف = المجال، لون الكعب = التصنيف،
   سُمك الكتاب = عدد صفحاته. اسحب كتاباً (بالنقر) فيفتح أمامك غلافه وخلاصته.
   ───────────────────────────────────────────── */
import { state, t, L, has, esc, $, $$, reduce } from "./core.js";
import { projectHref } from "./app-shared.js";
import { THEMES, MOTIFS, projectTheme } from "./themes.js";

const SHELVES = [
  { id: "planning", theme: "planning", motif: "grid", cats: ["planning", "regional"], ar: "التخطيط الحضري والإقليمي", en: "Urban & regional planning" },
  { id: "transport", theme: "transport", motif: "bus", cats: ["transport"], ar: "تخطيط النقل", en: "Transport planning" },
  { id: "gis", theme: "gis", motif: "layers", cats: ["gis", "geomatics", "digital"], ar: "GIS والجيوماتكس والأدوات", en: "GIS, geomatics & tools" },
  { id: "design", theme: "urban-design", motif: "arch", cats: ["urban-design", "heritage", "design", "sustainability"], ar: "التصميم والتراث والاستدامة", en: "Design, heritage & sustainability" },
];
const micon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${MOTIFS[k]}"/></svg>`;
const UI = {
  ar: { lead: "كل عرض تقديمي كتاب على رفّه: الرف هو المجال، ولون الكعب تصنيف المشروع، وسُمك الكتاب عدد صفحاته. اضغط كتاباً فيُسحب ويُفتح أمامك بالعرض: الغلاف ثم صفحات الملخص، وتقلّب بالسهمين أو بالضغط على الصفحة.", hint: "اضغط كتاباً يُفتح أمامك", pages: "صفحة", open: "افتح المشروع", map: "على الخريطة", wip: "قيد العمل", team: "عمل جماعي", close: "أعد الكتاب", books: "كتاب", shelf: "رف" },
  en: { lead: "Every presentation is a book on its shelf: the shelf is the field, the spine colour the category, the thickness its page count. Click a book: it pulls out and opens in front of you — cover, then summary pages; flip with the arrows or by clicking a page.", hint: "Pull a book from the shelf", pages: "pages", open: "Open project", map: "On the map", wip: "in progress", team: "team work", close: "Put it back", books: "books", shelf: "shelf" },
};
const s = (k) => (UI[state.lang] || UI.ar)[k];
const DECOR = [
  `<svg viewBox="0 0 64 64" class="decor globe"><circle cx="32" cy="26" r="18" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="32" cy="26" rx="8" ry="18" fill="none" stroke="currentColor" stroke-width="1"/><path d="M14 26h36M18 17h28M18 35h28" stroke="currentColor" stroke-width="1" opacity=".7"/><path d="M32 44v8M22 56h20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M46 10 50 6" stroke="currentColor" stroke-width="2"/></svg>`,
  `<svg viewBox="0 0 64 64" class="decor plant"><path d="M22 40h20l-3 18H25z" fill="currentColor" opacity=".7"/><path d="M32 40c0-14-10-20-18-20 2 10 8 16 18 20Zm0 0c0-14 10-20 18-20-2 10-8 16-18 20Zm0 0V18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M32 40c-2-8 2-16 6-22" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
  `<svg viewBox="0 0 64 64" class="decor tube"><rect x="12" y="14" width="40" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="26" width="32" height="32" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M22 34h20M22 40h14M22 46h18" stroke="currentColor" stroke-width="1.5" opacity=".7"/></svg>`,
  `<svg viewBox="0 0 64 64" class="decor drone"><circle cx="14" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l8 6h8l8-6M28 26v6h8v-6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="26" y="32" width="12" height="8" rx="2" fill="currentColor" opacity=".7"/><path d="M20 58h24M32 40v18" stroke="currentColor" stroke-width="2"/></svg>`,
];
const hash = (str) => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pagesOf = (p) => p.fullDeck?.pages || (p.slides || []).length * 3 || 16;
const catOf = (p) => (p.categories || [])[0] || "planning";
const shelfOf = (p) => SHELVES.find((sh) => (p.categories || []).some((c) => sh.cats.includes(c))) || SHELVES[0];

export function shelfHtml(projects) {
  const byShelf = SHELVES.flatMap((sh) => { const items = projects.filter((p) => shelfOf(p).id === sh.id); if (!items.length) return []; const per = Math.ceil(items.length / Math.ceil(items.length / 9)); const chunks = []; for (let i = 0; i < items.length; i += per) chunks.push(items.slice(i, i + per)); return chunks.map((it, k) => ({ ...sh, items: it, part: chunks.length > 1 ? k + 1 : 0 })); });
  const book = (p, i) => { const th = projectTheme(catOf(p), p); const h = hash(p.id); const w = Math.round(Math.min(78, Math.max(42, 34 + pagesOf(p) * .5))); const ht = 196 + (h % 5) * 9; const lean = i === 0 && h % 3 === 0; const motif = (th.motifs || [])[0]; const v = th.variant || 0;
    return `<button class="book v${v}${lean ? " lean" : ""}${p.noSummary ? " wip" : ""}" type="button" data-book="${esc(p.id)}" style="--w:${w}px;--h:${ht}px;--c:${th.c};--c2:${th.c2};--i:${i}" aria-label="${esc(L(p.title))}"><span class="spine">${has(p.cover) ? `<span class="cov" style="background-image:url('${esc(p.cover)}')"></span>` : `<span class="cov none"></span>`}${motif ? `<span class="mo">${micon(motif)}</span>` : ""}<span class="ttl">${esc(L(p.title))}</span><span class="yr mono">${esc(String(p.year || ""))}</span><i class="mark">F</i></span><span class="top"></span>${p.noSummary ? `<span class="slip">${esc(s("wip"))}</span>` : ""}</button>`; };
  return `<p class="lead">${esc(s("lead"))}</p>
  <div class="library" id="library">
    <div class="shelves">${byShelf.map((sh, k) => { const th = THEMES[sh.theme] || THEMES.planning; return `<div class="shelf" data-shelf="${esc(sh.id)}" style="--k:${k};--sc:${th.c};--sc2:${th.c2}"><div class="shelf-bg" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--j:${i}">${micon(sh.motif)}</i>`).join("")}</div><div class="shelf-label"><span class="sl-ic">${micon(sh.motif)}</span><b>${esc(state.lang === "ar" ? sh.ar : sh.en)}${sh.part ? ` · ${sh.part}` : ""}</b><small class="mono">${sh.items.length} ${esc(s("books"))}</small></div><div class="books">${sh.items.map(book).join("")}<span class="decor-slot" aria-hidden="true">${DECOR[k % DECOR.length]}</span></div><div class="plank"><i class="sheen"></i></div></div>`; }).join("")}</div>
    <div class="reading" id="reading"><div class="read-hint"><i></i>${esc(s("hint"))}</div></div>
  </div>`;
}

export function initShelf(projects) {
  const root = $("#library"); if (!root) return; const reading = $("#reading"); let cur = null, lb = null, page = 0, pages = [], spread = 2;
  const isNarrow = () => innerWidth < 760;
  const pageImg = (pg, cls) => pg ? `<div class="pg ${cls}${pg.cover ? " cover" : ""}" style="--c:${pg.c};--c2:${pg.c2}">${pg.src ? `<img src="${esc(pg.src)}" alt="${esc(pg.alt || "")}" decoding="async">` : `<div class="pg-blank"><span class="pg-ttl">${esc(pg.title || "")}</span></div>`}<span class="pg-n mono">${pg.n}</span></div>` : `<div class="pg empty"></div>`;
  const render = () => {
    if (!lb) return; const n = pages.length; spread = isNarrow() ? 1 : 2; const i = Math.max(0, Math.min(page, n - 1));
    const view = $(".ob-view", lb); const closed = spread === 2 && i === 0 && n > 1; const a = pages[i], b = spread === 2 && !closed ? pages[i + 1] : null;
    view.innerHTML = closed ? pageImg(a, "single closed") : spread === 2 ? `${pageImg(a, "r")}${pageImg(b, "l")}` : pageImg(a, "single");
    view.classList.toggle("is-closed", closed); view.classList.remove("flip"); void view.offsetWidth; view.classList.add("flip");
    $(".ob-count", lb).textContent = b ? `${i + 1}–${i + 2} / ${n}` : `${i + 1} / ${n}`;
    $("[data-ob=prev]", lb).disabled = i <= 0; $("[data-ob=next]", lb).disabled = closed ? false : i + spread >= n;
    const last = b ? i + 1 : i; $$(".ob-dots i", lb).forEach((d, k) => d.classList.toggle("on", k >= i && k <= last)); $$(".ob-th", lb).forEach((d, k) => d.classList.toggle("on", k >= i && k <= last));
    const th = $(".ob-th.on", lb); if (th) th.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  };
  const go = (d) => { const n = pages.length; if (spread === 2) { if (page === 0) page = d > 0 ? 1 : 0; else { page = page + d * 2; if (page < 1) page = 0; } page = Math.min(page, n - 1); if (page > 0 && page % 2 === 0) page -= 1; } else page = Math.max(0, Math.min(n - 1, page + d)); render(); };
  const jump = (k) => { page = spread === 2 ? (k === 0 ? 0 : (k % 2 ? k : k - 1)) : k; render(); };
  const open = (id) => {
    const p = projects.find((x) => x.id === id); if (!p) return;
    if (cur === id) { close(); return; } if (cur) closeNow(); cur = id; root.dataset.open = id;
    $$(".book", root).forEach((b) => b.classList.toggle("pulled", b.dataset.book === id));
    const th = THEMES[catOf(p)] || THEMES.planning; const located = p.location && typeof p.location.lat === "number";
    const sl = (p.slides || []).map((x, k) => ({ src: x.src, alt: L(x.caption) || "", n: k + 2, c: th.c, c2: th.c2 }));
    pages = sl.length ? sl.map((x, k) => ({ ...x, n: k + 1, cover: k === 0 })) : [{ src: p.cover || "", title: L(p.title), cover: true, n: 1, c: th.c, c2: th.c2 }]; page = 0;
    lb = document.createElement("div"); lb.className = "ob"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", L(p.title));
    lb.innerHTML = `<div class="ob-bg"></div><div class="ob-box" style="--c:${th.c};--c2:${th.c2}">
      <div class="ob-top"><div class="ob-meta"><span class="mono">${esc(String(p.year || ""))}${p.course ? ` · ${esc(p.course)}` : ""} · ${esc(String(pagesOf(p)))} ${esc(s("pages"))}${has(p.team) ? ` · ${esc(s("team"))}` : ""}${p.noSummary ? ` · ${esc(s("wip"))}` : ""}</span><h3>${esc(L(p.title))}</h3></div><button class="ob-x" type="button" data-ob="close" aria-label="${esc(s("close"))}">×</button></div>
      <div class="ob-stage"><button class="ob-nav" type="button" data-ob="prev" aria-label="prev">‹</button><div class="ob-book"><div class="ob-view"></div><i class="ob-spine"></i></div><button class="ob-nav" type="button" data-ob="next" aria-label="next">›</button></div>
      <div class="ob-thumbs" aria-label="pages">${pages.map((pg, k) => `<button type="button" class="ob-th" data-th="${k}" aria-label="${k + 1}">${pg.src ? `<img src="${esc(pg.src)}" alt="" loading="lazy" decoding="async">` : `<i style="--c:${pg.c}"></i>`}<span class="mono">${k + 1}</span></button>`).join("")}</div>
      <div class="ob-foot"><div class="ob-dots">${pages.map(() => "<i></i>").join("")}</div><span class="ob-count mono"></span><div class="ob-acts"><a class="btn btn-primary btn-sm" href="${projectHref(p)}">${esc(s("open"))} ↗</a>${located ? `<button class="btn btn-ghost btn-sm" type="button" data-onmap="${esc(p.id)}">${esc(s("map"))}</button>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-ob="close">${esc(s("close"))}</button></div></div>
      <p class="ob-sum">${esc(L(p.summary) || "")}</p></div>`;
    document.body.appendChild(lb); document.body.classList.add("ob-open");
    lb.addEventListener("click", (e) => { const th = e.target.closest("[data-th]"); if (th) { jump(+th.dataset.th); return; } const t = e.target.closest("[data-ob]"); if (t) { const a = t.dataset.ob; if (a === "close") close(); else if (a === "prev") go(-1); else if (a === "next") go(1); return; } if (e.target.classList.contains("ob-bg")) close(); const pg = e.target.closest(".pg"); if (pg && !isNarrow()) { if (pg.classList.contains("l")) go(1); else if (pg.classList.contains("r")) go(-1); } });
    // سحب/تمرير بالإصبع على الجوال
    let x0 = null; lb.addEventListener("pointerdown", (e) => { x0 = e.clientX; }); lb.addEventListener("pointerup", (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { const rtl = document.documentElement.dir === "rtl"; go((dx < 0) === rtl ? -1 : 1); } });
    lb._key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(document.documentElement.dir === "rtl" ? -1 : 1); if (e.key === "ArrowLeft") go(document.documentElement.dir === "rtl" ? 1 : -1); }; document.addEventListener("keydown", lb._key);
    lb._rs = () => render(); addEventListener("resize", lb._rs);
    const bookEl = root.querySelector(`[data-book="${CSS.escape(id)}"]`); const box = $(".ob-box", lb);
    if (bookEl && !reduce) { const r0 = bookEl.getBoundingClientRect(); const r1 = box.getBoundingClientRect(); const dx = (r0.left + r0.width / 2) - (r1.left + r1.width / 2), dy = (r0.top + r0.height / 2) - (r1.top + r1.height / 2); const sx = Math.max(.04, r0.width / r1.width), sy = Math.max(.04, r0.height / r1.height); box.style.transition = "none"; box.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`; box.style.opacity = ".4"; void box.offsetWidth; box.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1), opacity .4s"; box.style.transform = ""; box.style.opacity = ""; }
    requestAnimationFrame(() => { lb.classList.add("in"); render(); $(".ob-x", lb).focus({ preventScroll: true }); });
    if (reading) reading.innerHTML = `<div class="read-hint"><i></i>${esc(s("hint"))}</div>`;
  };
  const closeNow = () => { if (lb) { document.removeEventListener("keydown", lb._key); removeEventListener("resize", lb._rs); lb.remove(); lb = null; } document.body.classList.remove("ob-open"); $$(".book.pulled", root).forEach((b) => b.classList.remove("pulled")); cur = null; delete root.dataset.open; };
  const close = () => { if (!lb) { closeNow(); return; } const el = lb; el.classList.remove("in"); el.classList.add("out"); const bookEl = cur && root.querySelector(`[data-book="${CSS.escape(cur)}"]`); const box = $(".ob-box", el); if (bookEl && box && !reduce) { const r0 = bookEl.getBoundingClientRect(); const r1 = box.getBoundingClientRect(); box.style.transition = "transform .32s cubic-bezier(.4,0,.6,1), opacity .3s"; box.style.transform = `translate(${(r0.left + r0.width / 2) - (r1.left + r1.width / 2)}px, ${(r0.top + r0.height / 2) - (r1.top + r1.height / 2)}px) scale(${Math.max(.04, r0.width / r1.width)}, ${Math.max(.04, r0.height / r1.height)})`; box.style.opacity = "0"; } const b = root.querySelector(".book.pulled"); if (b) b.classList.remove("pulled"); setTimeout(() => { if (lb === el) closeNow(); }, reduce ? 0 : 320); };
  $$(".book", root).forEach((b) => b.addEventListener("click", () => open(b.dataset.book)));
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("in"); io.disconnect(); } }), { threshold: .2 }); io.observe(root); } else root.classList.add("in");
  document.addEventListener("library:open", (e) => open(e.detail));
}
