/* صفحة المقالة: note.html?id=… (دفتر المخطط) */
import { boot, state, t, L, has, esc, $, setMeta, injectJsonLd } from "./core.js";
import { projectHref } from "./app-shared.js";

let c;
/* تنظيف HTML القادم من المحتوى: يُسمح بوسوم نصية بسيطة فقط */
function clean(html) {
  const d = document.createElement("div"); d.innerHTML = html || "";
  const ok = new Set(["P", "H2", "H3", "H4", "UL", "OL", "LI", "STRONG", "EM", "B", "I", "A", "CODE", "PRE", "BLOCKQUOTE", "BR", "IMG", "FIGURE", "FIGCAPTION", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]);
  for (const e of [...d.querySelectorAll("*")]) { if (!ok.has(e.tagName)) { e.replaceWith(...e.childNodes); continue; } for (const a of [...e.attributes]) if (!["href", "src", "alt", "title"].includes(a.name) || /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name); if (e.tagName === "A") { e.setAttribute("rel", "noopener"); e.setAttribute("target", "_blank"); } if (e.tagName === "IMG") e.setAttribute("loading", "lazy"); }
  return d.innerHTML;
}
function render() {
  const app = $("#app"); const id = new URLSearchParams(location.search).get("id"); const n = state.graph.notes[id];
  if (!n) { app.innerHTML = `<section class="wrap"><div class="empty">${esc(t("not_found"))}</div></section>`; return; }
  const G = state.graph; const rel = (n.projects || []).map((p) => G.projects[p]).filter(Boolean);
  app.innerHTML = `<div class="wrap page-head"><div class="breadcrumb"><a href="index.html">${esc(L(c.profile.name))}</a><span>/</span><a href="index.html#notes">${esc(t("nav_notes"))}</a></div>
    <article class="article"><div class="kicker" style="margin-top:14px">${esc(n.date || "")}${n.readingMinutes ? ` · ${n.readingMinutes} ${esc(t("read_min"))}` : ""}</div><h1 class="h2" style="font-size:clamp(28px,4.5vw,44px)">${esc(L(n.title))}</h1>
    ${(n.tags || []).length ? `<div class="share-row" style="margin-top:0">${n.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
    <div style="margin-top:24px">${clean(L(n.html) || (has(n.excerpt) ? `<p>${esc(L(n.excerpt))}</p>` : ""))}</div>
    ${rel.length ? `<h2>${esc(t("related_projects"))}</h2><div class="share-row">${rel.map((p) => `<a class="chip-link" href="${projectHref(p)}">${esc(L(p.title)).slice(0, 60)}</a>`).join("")}</div>` : ""}</article></div>`;
  setMeta(`${L(n.title)} · ${L(c.profile.name)}`, L(n.excerpt), c.site.seo?.ogImage);
  injectJsonLd({ "@context": "https://schema.org", "@type": "Article", headline: L(n.title), datePublished: n.date, author: { "@type": "Person", name: L(c.profile.name) } });
}
(async () => { c = await boot("note"); render(); document.addEventListener("langchange", render); })();
