/* ─────────────────────────────────────────────
   صفحة المشروع: project.html?id=…
   الملخص، الخطوات الثلاث، الموقع (خريطة حية إن وُجدت طبقات)، المعرض،
   العرض المصغر، الملفات، الروابط، الأدوات والمهارات، القصة، السابق/التالي.
   ───────────────────────────────────────────── */
import { boot, state, t, L, has, esc, $, $$, isNew, openModal, injectJsonLd, setMeta, initReveal, drawQR, toast, reduce } from "./core.js";
import { evidenceModal, metaCard, gateBtn, bindRequests } from "./app-shared.js";
import { applyTheme } from "./themes.js";

let c, p;
const projectHref = (x) => `project.html?id=${encodeURIComponent(x.id)}`;
const catLabel = (k) => (t("cat." + k) === "cat." + k ? k : t("cat." + k));

function render() {
  const app = $("#app"); const G = state.graph;
  const id = new URLSearchParams(location.search).get("id"); p = G.projects[id];
  if (!p) { app.innerHTML = `<section class="wrap"><div class="empty">${esc(t("not_found"))}</div><p style="text-align:center;margin-top:16px"><a class="btn btn-ghost" href="index.html#projects">${esc(t("back"))}</a></p></section>`; return; }
  const list = c.projects; const i = list.findIndex((x) => x.id === p.id); const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const layers = (p.gisLayers || []).map((l) => G.gis[l]).filter(Boolean).concat(c.gis.filter((g) => g.project === p.id && !(p.gisLayers || []).includes(g.id)));
  const hasLoc = p.location && typeof p.location.lat === "number" && typeof p.location.lon === "number";
  const skills = (p.skills || []).map((s) => G.skills.get(s)).filter(Boolean);
  const facts = [[t("year"), p.year], [t("type.graduation") && p.type ? (state.lang === "ar" ? "النوع" : "Type") : "", p.type ? t("type." + p.type) : ""], [t("course"), p.course], [state.lang === "ar" ? "الحالة" : "Status", p.status ? t("status." + p.status) : ""], [t("role"), has(p.role) ? L(p.role) : ""], [t("team"), has(p.team) ? L(p.team) : ""], [t("location"), hasLoc && has(p.location.name) ? L(p.location.name) : ""]].filter(([k, v]) => k && v);
  const steps = [["problem", p.problem], ["method", p.method], ["result", p.result]].filter(([, v]) => has(v));
  const gallery = (p.gallery || []).filter((g) => g && g.src), slides = (p.slides || []).filter((s) => s && s.src), files = (p.files || []).filter((f) => f && (f.href || f.request)), links = (p.links || []).filter((l) => l && l.href);
  const story = (p.story || []).filter((s) => typeof s.lat === "number");
  app.innerHTML = `<div class="wrap page-head"><div class="breadcrumb"><a href="index.html">${esc(L(c.profile.name))}</a><span>/</span><a href="index.html#projects">${esc(t("projects"))}</a></div>
    <div class="proj-hero"><div><div class="hero-top">${(p.categories || []).map((k) => `<span class="pill">${esc(catLabel(k))}</span>`).join("")}${isNew(p.added) ? `<span class="tag tag-new">${esc(t("new"))}</span>` : ""}</div><h1>${esc(L(p.title))}</h1>${has(p.summary) ? `<p class="lead" style="font-size:17px">${esc(L(p.summary))}</p>` : ""}
      ${facts.length ? `<div class="facts">${facts.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>` : ""}
      ${has(p.team) ? `<p class="note team-note">${esc(t("team_note"))}</p>` : ""}${p.noSummary ? `<p class="note" style="color:var(--dim)">${esc(t("no_summary_yet"))}</p>` : ""}
      ${p.fullDeck && p.fullDeck.onRequest ? `<div class="req-full rv"><div><b>${esc(t("full_on_request"))}</b>${p.fullDeck.pages ? ` · <span class="mono">${esc(String(p.fullDeck.pages))} ${esc(t("full_pages"))}</span>` : ""}${has(p.fullDeck.note) ? `<p class="note" style="margin:4px 0 0">${esc(L(p.fullDeck.note))}</p>` : ""}</div><button class="btn btn-primary btn-sm no-print" id="req-full" type="button" data-req="${esc((state.lang === "ar" ? "العرض الكامل: " : "Full deck: ") + L(p.title))}" data-ctx="${esc(L(p.title))}">${esc(t("request_full"))} ✉</button></div>` : ""}
      <div class="share-row"><button class="btn btn-ghost btn-sm no-print" type="button" id="copy">${esc(t("copy_link"))}</button><button class="btn btn-ghost btn-sm no-print" type="button" id="print">${esc(t("print_case"))}</button><canvas id="qr" width="64" height="64" class="no-print" style="width:64px;height:64px;border-radius:8px;background:#fff;padding:3px" aria-label="${esc(t("qr_this"))}"></canvas></div></div>
      ${has(p.cover) ? `<div class="cover" style="view-transition-name:cv-${esc(p.id)}"><img src="${esc(p.cover)}" alt="${esc(L(p.title))}" decoding="async"></div>` : ""}</div>
    ${(p.metrics || []).filter((m) => m && m.value != null && has(m.label)).length ? `<div class="metrics">${p.metrics.filter((m) => m && m.value != null && has(m.label)).map((m) => `<div class="m"><b>${esc(m.value)}</b><span>${esc(L(m.label))}</span></div>`).join("")}</div>` : ""}
    ${steps.length ? `<ol class="steps">${steps.map(([k, v]) => `<li class="rv"><b>${esc(t(k).toUpperCase())}</b><p>${esc(L(v))}</p></li>`).join("")}</ol>` : ""}
    ${hasLoc || layers.length ? `<h2 class="sub-h">${esc(layers.length ? t("live_map") : t("location"))}</h2><div class="map-box no-print" id="pmap-box" style="height:52vh;min-height:360px"><div class="map" id="pmap"></div>${layers.length ? `<div class="legend-box" id="pmap-legend"></div>` : ""}<div class="map-fallback" id="pmap-fb">${esc(t("loading"))}</div></div>${layers.length ? layers.map((l) => metaCard(l.metadata)).join("") : ""}` : ""}
    ${story.length ? `<h2 class="sub-h no-print">${esc(t("story"))}</h2><div class="story no-print" id="story"><div class="steps-col">${story.map((s, k) => `<div class="step" data-step="${k}"><b>STEP ${String(s.step ?? k + 1).padStart(2, "0")}</b>${esc(L(s.text))}</div>`).join("")}</div><div class="sticky"><div class="map" id="smap"></div></div></div>` : ""}
    ${gallery.length ? `<h2 class="sub-h">${esc(t("gallery"))}</h2><div class="gallery">${gallery.map((g, k) => `<button type="button" data-g="${k}"><img src="${esc(g.src)}" alt="${esc(L(g.caption) || L(p.title))}" loading="lazy" decoding="async"></button>`).join("")}</div>` : ""}
    ${slides.length ? `<h2 class="sub-h">${esc(t("deck"))}</h2><div class="deck" id="deck" tabindex="0" aria-roledescription="carousel"><div class="stage">${slides.map((s, k) => `<img src="${esc(s.src)}" alt="${esc(L(s.caption) || "")}" class="${k === 0 ? "on" : ""}" loading="${k < 2 ? "eager" : "lazy"}" decoding="async">`).join("")}</div><div class="bar"><button class="icon-btn" type="button" data-d="-1" aria-label="${esc(t("prev"))}">‹</button><span class="cap" id="deck-cap">${esc(L(slides[0].caption) || "")}</span><span class="cnt mono" id="deck-cnt">1 / ${slides.length}</span><button class="icon-btn" type="button" data-d="1" aria-label="${esc(t("next"))}">›</button></div><div class="dots">${slides.map((_, k) => `<button type="button" data-k="${k}" aria-current="${k === 0}" aria-label="${k + 1}"></button>`).join("")}</div></div>` : ""}
    ${files.length || links.length ? `<div class="two-col" style="margin-top:44px">${files.length ? `<div><h2 class="sub-h" style="margin-top:0">${esc(t("files"))}</h2><div class="filelist">${files.map((f) => f.request || c.site.downloadsRequireApproval ? gateBtn(L(f.label) || "file", L(p.title)) : `<a href="${esc(f.href)}" target="_blank" rel="noopener">⤓ <span>${esc(L(f.label) || f.href)}</span></a>`).join("")}</div></div>` : ""}${links.length ? `<div><h2 class="sub-h" style="margin-top:0">${esc(t("links"))}</h2><div class="filelist">${links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">↗ <span>${esc(L(l.label) || l.href)}</span></a>`).join("")}</div></div>` : ""}</div>` : ""}
    ${(p.tools || []).length || skills.length ? `<h2 class="sub-h">${esc(t("tools_skills"))}</h2><div class="share-row" style="margin-top:0">${(p.tools || []).map((x) => `<span class="tool">${esc(x)}</span>`).join("")}${skills.map((s) => `<button class="chip-link" type="button" data-ev="${esc(s.id)}">${esc(L(s.name))}</button>`).join("")}</div>` : ""}
    <div class="prevnext no-print"><a class="prev" href="${projectHref(prev)}"><small>← ${esc(t("prev"))}</small><b>${esc(L(prev.title))}</b></a><a class="next" href="${projectHref(next)}"><small>${esc(t("next"))} →</small><b>${esc(L(next.title))}</b></a></div></div>`;

  // التفاعلات
  $("#copy")?.addEventListener("click", () => navigator.clipboard?.writeText(location.href).then(() => toast(t("copied"))));
  $("#print")?.addEventListener("click", () => print());
  const qr = $("#qr"); if (qr) drawQR(qr, location.href.split("#")[0]).then((ok) => { if (!ok) qr.remove(); });
  $$("[data-g]").forEach((b) => b.addEventListener("click", () => { const g = gallery[+b.dataset.g]; openModal(`<img src="${esc(g.src)}" alt="${esc(L(g.caption) || "")}">${has(g.caption) ? `<div class="mbody"><p class="note" style="font-size:14px">${esc(L(g.caption))}</p></div>` : ""}`); }));
  $$("[data-ev]").forEach((b) => b.addEventListener("click", () => evidenceModal(b.dataset.ev)));
  initDeck(slides); initReveal(); bindRequests();
  if (!render._themed) { render._themed = true; applyTheme((p.categories || [])[0], { intro: true, project: p }); }
  if (hasLoc || layers.length) initMap(layers, hasLoc); if (story.length) initStory(story, layers);
  setMeta(`${L(p.title)} · ${L(c.profile.name)}`, L(p.summary), p.cover || c.site.seo?.ogImage);
  injectJsonLd({ "@context": "https://schema.org", "@type": "CreativeWork", name: L(p.title), description: L(p.summary), image: p.cover ? new URL(p.cover, location.href).href : undefined, dateCreated: p.year ? String(p.year) : undefined, author: { "@type": "Person", name: L(c.profile.name) }, keywords: [...(p.categories || []), ...(p.tools || [])].join(", "), url: location.href.split("#")[0] });
}

function initDeck(slides) {
  const d = $("#deck"); if (!d || !slides.length) return; let k = 0;
  const go = (n) => { k = (n + slides.length) % slides.length; $$(".stage img", d).forEach((im, i) => im.classList.toggle("on", i === k)); $$(".dots button", d).forEach((b, i) => b.setAttribute("aria-current", String(i === k))); $("#deck-cap").textContent = L(slides[k].caption) || ""; $("#deck-cnt").textContent = `${k + 1} / ${slides.length}`; };
  $$("[data-d]", d).forEach((b) => b.addEventListener("click", () => go(k + (+b.dataset.d) * (state.lang === "ar" ? -1 : 1))));
  $$("[data-k]", d).forEach((b) => b.addEventListener("click", () => go(+b.dataset.k)));
  d.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") go(k + (state.lang === "ar" ? 1 : -1)); if (e.key === "ArrowRight") go(k + (state.lang === "ar" ? -1 : 1)); });
  let sx = null; d.addEventListener("pointerdown", (e) => (sx = e.clientX)); d.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(k + (dx < 0 ? 1 : -1)); });
}
async function initMap(layers, hasLoc) {
  let M; try { M = await import("./maps.js"); } catch { $("#pmap-fb").textContent = t("map_unavail"); return; }
  let map; try { map = await M.createMap("pmap", { center: hasLoc ? [p.location.lon, p.location.lat] : undefined, zoom: 11 }); await M.whenReady(map); } catch { $("#pmap-fb").textContent = t("map_unavail"); return; }
  $("#pmap-fb")?.remove();
  for (const l of layers) await M.addLayer(map, l);
  if (layers.length) { $("#pmap-legend").innerHTML = M.legendHtml(layers); await M.fitTo(map, layers); }
  if (hasLoc) { const ml = window.maplibregl; const mk = (lon, lat, label, color) => { const e = document.createElement("div"); e.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #0E1216;box-shadow:0 0 0 4px ${color}55`; new ml.Marker({ element: e }).setLngLat([lon, lat]).setPopup(new ml.Popup({ offset: 14 }).setHTML(`<b>${esc(label)}</b>`)).addTo(map); };
    mk(p.location.lon, p.location.lat, L(p.location.name) || L(p.title), "#C9B23A"); for (const pt of p.location.points || []) if (typeof pt.lat === "number") mk(pt.lon, pt.lat, L(pt.name) || "", "#28A085");
    if (!layers.length && (p.location.points || []).length) { const pts = [[p.location.lon, p.location.lat], ...p.location.points.map((x) => [x.lon, x.lat])]; map.fitBounds([[Math.min(...pts.map((x) => x[0])), Math.min(...pts.map((x) => x[1]))], [Math.max(...pts.map((x) => x[0])), Math.max(...pts.map((x) => x[1]))]], { padding: 60, duration: 0, maxZoom: 12 }); } }
}
async function initStory(story, layers) {
  let M; try { M = await import("./maps.js"); } catch { return; }
  const s0 = story[0]; let map; try { map = await M.createMap("smap", { center: [s0.lon, s0.lat], zoom: s0.zoom ?? 11, pitch: s0.pitch ?? 0, bearing: s0.bearing ?? 0, cooperative: false, noCtl: true, map: { interactive: false } }); await M.whenReady(map); } catch { return; }
  for (const l of layers) { await M.addLayer(map, l); M.setVisible(map, l.id, false); }
  const steps = $$("#story .step"); let cur = -1;
  const go = (k) => { if (k === cur) return; cur = k; const s = story[k]; steps.forEach((e, i) => e.classList.toggle("on", i === k)); map.easeTo({ center: [s.lon, s.lat], zoom: s.zoom ?? map.getZoom(), pitch: s.pitch ?? 0, bearing: s.bearing ?? 0, duration: reduce ? 0 : 1400, essential: true }); for (const l of layers) M.setVisible(map, l.id, (s.layers || []).includes(l.id)); };
  const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) go(+e.target.dataset.step); }); }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
  steps.forEach((e) => io.observe(e)); go(0);
}

(async () => { c = await boot("project"); render(); document.addEventListener("langchange", render); })();
