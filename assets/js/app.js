/* ─────────────────────────────────────────────
   الصفحة الرئيسية: تُبنى الأقسام من content/ حسب ترتيب site.sections،
   ويختفي أي قسم بياناته فارغة.
   ───────────────────────────────────────────── */
import { boot, state, t, L, has, esc, el, $, $$, fmtDate, isNew, openModal, closeModal, toast, initReveal, injectJsonLd, personLd, setMeta, drawQR, vcard, reduce } from "./core.js";
import { ICONS, ico, kicker, projectHref, svgPh, wipPh, evidenceModal, certModal, metaCard, gateBtn, bindRequests } from "./app-shared.js";
import { weights, initWeights, setWeights, equalWeights, onWeights, groups, score, rankProjects, rankServices, classOf } from "./model.js";
import { THEMES, pulseHero, applyTheme } from "./themes.js";
import { atlasHtml, initAtlas } from "./atlas.js";
import { dossierHtml, initDossier } from "./dossier.js";
import { shelfHtml, initShelf } from "./shelf.js";
import { initTour } from "./tour.js";
import { numbersHtml, heroNumsHtml, initCounters, radarHtml, journeyHtml, initJourney, initDotsNav, collapseLists, nowHtml } from "./infographic.js";
import { heroScene, bindHeroScene, ticker, stackHtml, fillStack, bindStack, flip, countUp, compassRose, initCursorFx, cycler, initProgress, staggerCards, introSplash } from "./fx.js";

let c, app, rankedCache = [], catFilter = "all", showAll = false;

/* ═════ البطل ═════ */
function hero() {
  const p = c.profile, name = L(p.name) || "—", parts = name.split(" ");
  const first = parts.slice(0, Math.ceil(parts.length / 2)).join(" "), rest = parts.slice(Math.ceil(parts.length / 2)).join(" ");
  const presets = c.site.presets || [];
  const edu = c.education[0];
  const words = [L(p.title), ...groups().map((g) => L(g.title))].filter(Boolean);
  const tick = [...c.skills.tools.map((x) => x.name), ...groups().flatMap((g) => (g.items || []).slice(0, 3).map((x) => L(x.name)))];
  return `<section class="hero wrap" id="hero">
    <div class="strip"><span>${esc(t("hero_kicker"))}</span><i></i><span class="mono">21.4858° N · 39.1925° E</span></div>
    <div class="hero-grid"><div class="hero-copy">
    <div class="hero-top">${p.availability ? `<span class="pill ${p.availability.open ? "on" : ""}"><span class="pulse"></span>${esc(has(p.availability.note) ? L(p.availability.note) : t(p.availability.open ? "available" : "unavailable"))}</span>` : ""}${words.length ? `<span class="pill"><span class="disc" id="disc"><span>${esc(words[0])}</span></span></span>` : ""}</div>
    <h1><span class="l">${esc(first)}</span>${rest ? `<span class="l">${esc(rest)}</span>` : ""}</h1>
    ${has(p.tagline) ? `<p class="tagline">${esc(L(p.tagline))}</p>` : ""}
    ${c.projects.length ? `<div class="ask"><p class="ask-q" id="askq">${esc(t("ask"))}</p><div class="presets" role="group" aria-labelledby="askq">
      ${presets.map((pr, i) => `<button class="preset rv" type="button" data-preset="${esc(pr.id)}" aria-pressed="false" style="--i:${i}"><span class="sw" aria-hidden="true">${sw(pr.weights)}</span><b>${esc(L(pr.label))}</b></button>`).join("")}
      <button class="preset rv" type="button" data-preset="custom" aria-pressed="false" style="--i:${presets.length}"><span class="sw" aria-hidden="true"><i style="background:var(--h1)"></i><i style="background:var(--h2)"></i><i style="background:var(--h3)"></i><i style="background:var(--h4)"></i></span><b>${esc(t("custom"))}</b></button></div></div>` : ""}
    ${heroNumsHtml(c)}
    <div class="hero-meta">${has(p.title) ? `<div><b>${esc(L(p.title))}</b>${edu ? esc(L(edu.institution)) : ""}</div>` : ""}${c.skills.tools.length ? `<div><b>${esc(c.skills.tools.slice(0, 3).map((x) => x.name).join(" · "))}</b>${esc(t("tools_h"))}</div>` : ""}${has(p.location) ? `<div><b>${esc(L(p.location))}</b>${esc(t("based_in"))}</div>` : ""}</div>
    </div>${heroScene(p, c.meta)}</div>
    ${ticker(tick)}
  </section>`;
}
function sw(w) { const vals = Object.values(w || {}).slice(0, 4); while (vals.length < 4) vals.push(2); return vals.map((v) => `<i style="background:var(--h${Math.min(4, Math.round((v / 5) * 4))})"></i>`).join(""); }

/* ═════ أعمل الآن مع ═════ */
function now() { const h = nowHtml(c); if (!h) return ""; return `<section class="wrap" id="now">${kicker(t("now_kicker"))}<h2 class="h2 rv">${t("now_h")}</h2><p class="lead">${esc(t("now_lead"))}</p>${h}</section>`; }
/* ═════ النموذج ═════ */
function model() {
  if (!c.projects.length || !groups().length) return "";
  const gs = groups();
  return `<section class="wrap" id="model">${kicker(t("model_kicker"))}<h2 class="h2 rv">${t("model_h")}</h2><p class="lead">${esc(t("model_lead"))}</p>
    <details class="guide rv"><summary><b>${esc(t("guide_h"))}</b></summary><ol><li>${esc(t("guide_1"))}</li><li>${esc(t("guide_2"))}</li><li>${esc(t("guide_3"))}</li></ol><p class="note">${esc(t("guide_plain"))}</p></details>
    <div class="model-grid">
      <div class="card weights"><h3>${esc(t("weights_h"))}</h3><p class="sub">${esc(t("weights_sub"))}</p>
        ${gs.map((g) => `<div class="wrow"><label for="w-${esc(g.id)}">${esc(L(g.title))}</label><span class="wv" id="wv-${esc(g.id)}">${weights[g.id]}</span><input type="range" min="0" max="5" step="1" id="w-${esc(g.id)}" data-w="${esc(g.id)}" value="${weights[g.id]}"><small>${esc((g.items || []).map((s) => L(s.name)).slice(0, 4).join(" · "))}${(g.items || []).length > 4 ? " …" : ""}</small></div>`).join("")}
        <div class="weights-foot"><button class="btn btn-ghost btn-sm" type="button" id="w-reset">${esc(t("reset"))}</button></div></div>
      <div class="overlay-wrap">
        <div class="overlay"><div class="raster-head"><div><h3>${esc(t("overlay_h"))}</h3><p class="sub" style="margin:0">${esc(t("overlay_sub"))}</p></div><span class="mono" id="stack-dims"></span></div>
        ${stackHtml(gs)}
        <div class="legend"><span>${esc(t("legend_low"))}</span>${[0, 1, 2, 3, 4].map((k) => `<i style="background:var(--h${k})"></i>`).join("")}<span>${esc(t("legend_high"))}</span><span class="eq">${esc(t("eq"))}</span></div></div>
      </div></div>
      <div class="ranked" id="ranked"></div></section>`;
}
function renderRaster() {
  if (!$("#stack")) return; const gs = groups(); const ranked = rankedCache.filter(okCat).slice(0, 25);
  fillStack(ranked, gs, weights, (id) => { $$(".pc").forEach((x) => x.classList.toggle("hl", !!id && x.dataset.p === id)); $$(".pcard").forEach((x) => x.classList.toggle("rank-1", !!id && x.dataset.p === id)); });
  const d = $("#stack-dims"); if (d) d.textContent = `${gs.length} × ${ranked.length}`; const o = $("#out-tn"); if (o) o.textContent = t("total");
}
const okCat = (r) => catFilter === "all" || (r.p.categories || []).includes(catFilter);
function renderRanked() {
  const host = $("#ranked"); if (!host) return;
  const cats = [...new Set(c.projects.flatMap((p) => p.categories || []))];
  const all = rankedCache.filter(okCat); const LIMIT = 6; const list = showAll ? all : all.slice(0, LIMIT);
  const build = () => host.innerHTML = `<div class="rank-head"><h3 id="projects">${esc(t("ranked_h"))}</h3><div class="filters" role="group"><button class="chip" aria-pressed="${catFilter === "all"}" data-cat="all">${esc(t("all"))}</button>${cats.map((k) => `<button class="chip" aria-pressed="${catFilter === k}" data-cat="${esc(k)}">${esc(t("cat." + k) === "cat." + k ? k : t("cat." + k))}</button>`).join("")}</div></div>
    ${list.length ? list.map((r, i) => pcard(r, i)).join("") : `<div class="empty">${esc(t("no_projects"))}</div>`}
    ${all.length > LIMIT ? `<div class="ranked-more"><button class="btn btn-ghost btn-sm" type="button" id="more">${esc(showAll ? t("show_less") : t("show_more"))} (${all.length})</button></div>` : ""}`;
  flip(host, ".pcard", build);
  $$(".pcard .score", host).forEach((e) => countUp(e, +e.dataset.to));
  initCursorFx(host);
  $$("[data-cat]", host).forEach((b) => b.addEventListener("click", () => { catFilter = b.dataset.cat; renderRanked(); renderRaster(); }));
  $("#more", host)?.addEventListener("click", () => { showAll = !showAll; renderRanked(); });
}
function pcard(r, i) {
  const p = r.p; const cat = (p.categories || []).map((k) => t("cat." + k) === "cat." + k ? k : t("cat." + k)).join(" · ");
  const totalW = r.parts.reduce((a, b) => a + b.w, 0) || 1;
  const why = r.top.map((x) => `<span>${esc(L(x.group.title))}<b>+${Math.round((x.contrib / totalW) * 100)}</b></span>`).join("");
  const th = THEMES[(p.categories || [])[0]] || THEMES.planning;
  return `<a class="pcard rv in" href="${projectHref(p)}" data-p="${esc(p.id)}" data-tacc style="--i:${i};--pc:${th.c}">
    <div class="thumb ${has(p.cover) ? "" : "none"}" style="view-transition-name:cv-${esc(p.id)}">${has(p.cover) ? `<img src="${esc(p.cover)}" alt="${esc(L(p.title))}" loading="lazy" decoding="async">` : wipPh(p)}</div>
    <div class="body"><div class="row1"><span class="score k${r.k}" data-to="${r.score}" data-v="0">0<small>/100</small></span><span class="cat">${esc(cat)}${p.year ? ` · ${p.year}` : ""}${isNew(p.added) ? ` <span class="tag tag-new">${esc(t("new"))}</span>` : ""}</span></div>
      <h4>${esc(L(p.title))}</h4>${has(p.summary) ? `<p>${esc(L(p.summary))}</p>` : ""}
      <div class="bar"><i style="transform:scaleX(${r.score / 100})"></i></div>
      ${why ? `<div class="why" aria-label="${esc(t("why"))}">${why}</div>` : ""}${p.location && typeof p.location.lat === "number" ? `<button class="onmap" type="button" data-onmap="${esc(p.id)}" title="${esc(t("on_map"))}">${ico("map", 14)}<span>${esc(L(p.location.name))}</span></button>` : ""}</div></a>`;
}
function bindModel() {
  if (!$("#model")) return;
  $$("input[data-w]").forEach((inp) => inp.addEventListener("input", () => { $("#wv-" + inp.dataset.w).textContent = inp.value; setWeights({ [inp.dataset.w]: +inp.value }, "custom"); }));
  $("#w-reset")?.addEventListener("click", () => equalWeights());
  bindStack(groups());
  $$("[data-preset]").forEach((b) => b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%"); b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%"); }));
  $$("[data-preset]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.preset;
    if (id === "custom") { $("#model")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); $$("[data-preset]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); setTimeout(() => $("input[data-w]")?.focus({ preventScroll: true }), 600); return; }
    const pr = (c.site.presets || []).find((x) => x.id === id); if (!pr) return;
    pulseHero(pr.theme || id, b); applyTheme(pr.theme || id, { intro: false }); setWeights(pr.weights, id); setTimeout(() => $("#model")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), reduce ? 0 : 1100);
  }));
  onWeights((w, presetId) => {
    $$("input[data-w]").forEach((inp) => { inp.value = w[inp.dataset.w]; $("#wv-" + inp.dataset.w).textContent = w[inp.dataset.w]; });
    $$("[data-preset]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.preset === presetId)));
    recompute();
  });
}
function recompute() { rankedCache = rankProjects(); renderRaster(); renderRanked(); renderServicesList(); }

/* ═════ عني ═════ */
function about() {
  const p = c.profile; if (!has(p.bio) && !has(p.name)) return "";
  const hl = (p.highlights || []).filter((h) => h && h.value != null && has(h.label));
  const langs = (p.languages || []).filter((l) => has(l.name));
  return `<section class="wrap" id="about">${kicker(t("about_kicker"))}<h2 class="h2 rv">${t("about_h")}</h2>
    <div class="about-grid"><div class="card bio rv">${has(p.photo) ? `<img src="${esc(p.photo)}" alt="${esc(L(p.name))}" loading="lazy">` : ""}<div><h3>${esc(L(p.name))}</h3>${has(p.title) ? `<div class="role">${esc(L(p.title))}</div>` : ""}${has(p.bio) ? `<p>${esc(L(p.bio))}</p>` : ""}</div></div>
    <div class="side-stack">${numbersHtml(c)}
    ${langs.length ? `<div class="card rv"><div class="kicker" style="margin-bottom:10px">${esc(t("languages"))}</div><div class="langs">${langs.map((l) => `<span class="pill">${esc(L(l.name))}${has(l.level) ? ` · ${esc(L(l.level))}` : ""}</span>`).join("")}</div></div>` : ""}
    ${c.education.length ? `<div class="card rv"><div class="kicker" style="margin-bottom:10px">${esc(t("education"))}</div>${c.education.map((e) => `<div><b>${esc(L(e.degree))}</b><div style="color:var(--muted);font-size:14px">${esc(L(e.institution))}${e.start || e.end ? ` · <span class="mono">${e.start ? esc(e.start) + (e.end ? "–" + esc(e.end) : "") : `${esc(t("expected"))} ${esc(e.end)}`}</span>` : ""}</div></div>`).join("")}</div>` : ""}</div></div></section>`;
}

/* ═════ المهارات = المعايير + الدليل ═════ */
function skills() {
  const gs = groups(); if (!gs.length) return "";
  const G = state.graph;
  return `<section class="wrap" id="skills">${kicker(t("skills_kicker"))}<h2 class="h2 rv">${t("skills_h")}</h2><p class="lead">${esc(t("skills_lead"))}</p>
    ${radarHtml(gs, G)}
    <div class="skill-groups">${gs.map((g) => `<div class="card sgroup rv"><div class="tier">${esc((g.tier === "support" ? t("support") : t("core")).toUpperCase())} · ${esc(g.id.toUpperCase())}</div><h3>${esc(L(g.title))}</h3><ul>
      ${(g.items || []).map((s) => { const n = G.skills.get(s.id); const ev = [[n.projects.length, "evidence_projects"], [n.certificates.length, "evidence_certs"], [n.experience.length, "evidence_exp"]].filter(([k]) => k);
        return `<li class="sk"><span class="name">${esc(L(s.name))}</span>${s.level ? `<span class="lv" aria-label="${esc(t("level"))} ${s.level}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= s.level ? "on" : ""}"></i>`).join("")}</span>` : ""}
        ${ev.length ? `<span class="ev"><button type="button" data-ev="${esc(s.id)}">${ev.map(([k, key]) => `<b>${k}</b> ${esc(t(key))}`).join(" · ")}</button></span>` : ""}</li>`; }).join("")}</ul></div>`).join("")}</div>
    ${c.skills.tools.length ? `<h3 class="sub-h" style="margin-top:28px;font-size:18px">${esc(t("tools_h"))}</h3><div class="tools-row rv">${c.skills.tools.map((x) => `<span class="tool">${esc(x.name)}${x.level ? `<span class="lv">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= x.level ? "on" : ""}"></i>`).join("")}</span>` : ""}</span>`).join("")}</div>` : ""}</section>`;
}
/* ═════ الشهادات ═════ */
let certCat = "all";
function certificates() {
  if (!c.certificates.length) return "";
  return `<section class="wrap" id="certificates">${kicker(t("certs_kicker"))}<h2 class="h2 rv">${t("certs_h")}</h2>${dossierHtml(c.certificates)}<details class="cert-list"><summary class="btn btn-ghost btn-sm">${esc(t("cert_list_view"))}</summary><div id="cert-host"></div></details></section>`;
}
function renderCerts() {
  const host = $("#cert-host"); if (!host) return;
  const cats = [...new Set(c.certificates.map((x) => x.category || "other"))];
  const list = c.certificates.filter((x) => certCat === "all" || (x.category || "other") === certCat);
  host.innerHTML = `<div class="filters" style="margin-top:18px;width:max-content;max-width:100%"><button class="chip" aria-pressed="${certCat === "all"}" data-cc="all">${esc(t("all"))}</button>${cats.map((k) => `<button class="chip" aria-pressed="${certCat === k}" data-cc="${esc(k)}">${esc(t("cert_cat." + k) === "cert_cat." + k ? k : t("cert_cat." + k))}</button>`).join("")}</div>
    <div class="cert-grid">${list.map((x) => `<article class="card cert rv in" id="cert-${esc(x.id)}">${isNew(x.added) ? `<span class="tag tag-new badge-new">${esc(t("new"))}</span>` : ""}
      ${has(x.image) ? `<button class="img" type="button" data-zoom="${esc(x.id)}" aria-label="${esc(L(x.title))}"><img src="${esc(x.image)}" alt="${esc(L(x.title))}" loading="lazy" decoding="async"></button>` : `<div class="img none">${ico("file", 28)}</div>`}
      <div class="b"><h4>${esc(L(x.title))}</h4>${has(x.issuer) ? `<div class="is">${esc(L(x.issuer))}</div>` : ""}${has(x.note) ? `<p class="note" style="font-size:12.5px;margin:6px 0 0">${esc(L(x.note))}</p>` : ""}${x.noFile ? `<p class="note" style="font-size:11.5px;margin:4px 0 0;color:var(--dim)">${esc(t("cert_nofile"))}</p>` : ""}<div class="meta"><span class="tag">${esc(t("cert_cat." + (x.category || "other")))}</span>${x.date ? `<span class="mono" style="font-size:11.5px;color:var(--dim)">${esc(fmtDate(x.date))}</span>` : ""}</div>
      <div class="acts">${has(x.verifyUrl) ? `<a href="${esc(x.verifyUrl)}" target="_blank" rel="noopener">${esc(t("verify"))} ↗</a>` : ""}${has(x.pdf) ? gateBtn(L(x.title), "certificate", "chip-link") : ""}${(x.skills || []).length ? `<a href="#skills" data-zoom="${esc(x.id)}" style="color:var(--muted)">${esc(t("covers"))} ${x.skills.length}</a>` : ""}</div></div></article>`).join("")}</div>`;
  $$("[data-cc]", host).forEach((b) => b.addEventListener("click", () => { certCat = b.dataset.cc; renderCerts(); }));
  $$("[data-zoom]", host).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); certModal(b.dataset.zoom); })); bindRequests(host);
}

/* ═════ المكتبة ═════ */
function library() {
  if (!c.projects.length) return "";
  return `<section class="wrap" id="library-sec">${kicker(t("lib_kicker"))}<h2 class="h2 rv">${t("lib_h")}</h2>${shelfHtml(c.projects)}</section>`;
}
/* ═════ البوسترات واللوحات ═════ */
function posters() {
  if (!c.posters.length) return "";
  const G = state.graph;
  return `<section class="wrap" id="posters">${kicker(t("posters_kicker"))}<h2 class="h2 rv">${t("posters_h")}</h2><p class="lead">${esc(t("posters_lead"))}</p>
    <div class="poster-grid">${c.posters.map((x, i) => { const p = G.projects[x.project]; return `<article class="card poster rv" style="--i:${i}">
      ${has(x.image) ? `<a class="img" href="${p ? projectHref(p) : "#"}"><img src="${esc(x.image)}" alt="${esc(L(x.title))}" loading="lazy" decoding="async"></a>` : `<div class="img none">${svgPh(x.id, x.kind === "hand" ? "sketch" : "poster")}</div>`}
      <div class="b"><div class="meta"><span class="tag">${esc(t("poster_kinds." + (x.kind || "poster")))}</span>${x.size ? `<span class="tag">${esc(x.size)}</span>` : ""}${x.course ? `<span class="mono" style="font-size:11.5px;color:var(--dim)">${esc(x.course)}</span>` : ""}${x.publishable === false ? `<span class="tag tag-warn">${esc(t("poster_withheld"))}</span>` : ""}</div>
      <h4>${esc(L(x.title))}</h4>${has(x.note) ? `<p class="note" style="font-size:12.5px">${esc(L(x.note))}</p>` : ""}
      <div class="acts">${p ? `<a href="${projectHref(p)}">${esc(t("view_project"))} ↗</a>` : ""}${has(x.pdf) ? gateBtn("PDF", L(x.title), "chip-link") : ""}</div></div></article>`; }).join("")}</div></section>`;
}
/* ═════ الأطلس: خريطة المشاريع ═════ */
function atlas() {
  if (!c.projects.some((p) => p.location && typeof p.location.lat === "number")) return "";
  return `<section class="wrap" id="atlas">${kicker(t("atlas_kicker"))}<h2 class="h2 rv">${t("atlas_h")}</h2>${atlasHtml(c.projects)}</section>`;
}
/* ═════ الخبرات والتعليم ═════ */
function experience() {
  if (!c.experience.length && !c.education.length) return "";
  const G = state.graph;
  const expHtml = c.experience.length ? `<div><h3 class="sub-h" style="margin-top:0" id="experience">${esc(t("experience"))}</h3><div class="timeline">${c.experience.map((e) => `<div class="card tl rv"><div class="when">${esc(fmtDate(e.start))} → ${esc(fmtDate(e.end || "present"))}${e.type ? ` · ${esc(t("exp_types." + e.type))}` : ""}</div><h4>${esc(L(e.role))}</h4>${has(e.org) ? `<div class="org">${esc(L(e.org))}${has(e.location) ? ` · ${esc(L(e.location))}` : ""}</div>` : ""}${has(e.summary) ? `<p>${esc(L(e.summary))}</p>` : ""}${(e.bullets || []).filter(has).length ? `<ul>${e.bullets.filter(has).map((b) => `<li>${esc(L(b))}</li>`).join("")}</ul>` : ""}
    <div class="links">${(e.projects || []).map((id) => G.projects[id]).filter(Boolean).map((p) => `<a class="chip-link" href="${projectHref(p)}">${esc(L(p.title)).slice(0, 40)}</a>`).join("")}${(e.skills || []).map((id) => G.skills.get(id)).filter(Boolean).map((s) => `<button class="chip-link" type="button" data-ev="${esc(s.id)}">${esc(L(s.name))}</button>`).join("")}</div></div>`).join("")}</div></div>` : "";
  const eduHtml = c.education.length ? `<div><h3 class="sub-h" style="margin-top:0" id="education">${esc(t("education"))}</h3><div class="timeline">${c.education.map((e) => `<div class="card tl rv"><div class="when">${e.start ? `${esc(e.start)}${e.end ? ` → ${esc(e.end)}` : ""}` : e.end ? `${esc(t("expected"))} ${esc(e.end)}` : ""}</div><h4>${esc(L(e.degree))}</h4>${has(e.institution) ? `<div class="org">${esc(L(e.institution))}</div>` : ""}${has(e.notes) ? `<p>${esc(L(e.notes))}</p>` : ""}</div>`).join("")}</div></div>` : "";
  return `<section class="wrap" id="experience-section">${kicker(t("exp_kicker"))}<h2 class="h2 rv">${t("exp_h")}</h2><p class="lead">${esc(t("exp_lead"))}</p>${journeyHtml(c)}<details class="exp-details rv"><summary class="btn btn-ghost btn-sm">${esc(t("exp_details"))}</summary><div class="two-col" style="margin-top:26px">${expHtml}${eduHtml}</div></details></section>`;
}

/* ═════ مختبر GIS ═════ */
function gis() {
  if (!c.gis.length) return "";
  const G = state.graph;
  return `<section class="wrap" id="gis">${kicker(t("gis_kicker"))}<h2 class="h2 rv">${t("gis_h")}</h2><p class="lead">${esc(t("gis_lead"))}</p>
    <div class="lab"><div class="card lab-panel"><div class="kicker">${esc(t("layers"))}</div><div id="layer-list">${c.gis.map((g, i) => `<div class="layer-row"><input type="checkbox" id="ly-${esc(g.id)}" data-layer="${esc(g.id)}" ${i < 2 ? "checked" : ""}><label for="ly-${esc(g.id)}"><b>${esc(L(g.title))}</b>${G.projects[g.project] ? `<small>${esc(L(G.projects[g.project].title)).slice(0, 48)}</small>` : ""}</label><button class="md" type="button" data-md="${esc(g.id)}">${esc(t("metadata"))}</button></div>`).join("")}</div>
      <div class="weights-foot"><button class="btn btn-ghost btn-sm" type="button" id="gis-fit">${esc(t("fit_layers"))}</button>${c.gis.some((g) => g.swipeWith) ? `<button class="btn btn-ghost btn-sm" type="button" id="gis-swipe" aria-pressed="false">${esc(t("swipe"))}</button>` : ""}<button class="btn btn-ghost btn-sm" type="button" id="gis-3d" aria-pressed="false">${esc(t("tilt"))}</button></div></div>
    <div class="map-box" id="gis-box"><div class="map" id="gis-map"></div><div class="legend-box" id="gis-legend"></div><div class="map-fallback" id="gis-fb">${esc(t("loading"))}</div></div></div></section>`;
}
async function initGis() {
  const box = $("#gis-box"); if (!box) return;
  const start = async () => {
    let M; try { M = await import("./maps.js"); } catch { $("#gis-fb").textContent = t("map_unavail"); return; }
    let map; try { map = await M.createMap("gis-map"); await M.whenReady(map); } catch { $("#gis-fb").textContent = t("map_unavail"); return; }
    $("#gis-fb").remove();
    const active = () => c.gis.filter((g) => $(`#ly-${CSS.escape(g.id)}`)?.checked);
    const refresh = async () => { for (const g of c.gis) { const on = $(`#ly-${CSS.escape(g.id)}`)?.checked; if (on) await M.addLayer(map, g); M.setVisible(map, g.id, !!on); } $("#gis-legend").innerHTML = M.legendHtml(active()); };
    await refresh(); await M.fitTo(map, active());
    $$("[data-layer]").forEach((i) => i.addEventListener("change", refresh));
    $("#gis-fit")?.addEventListener("click", () => M.fitTo(map, active()));
    $("#gis-3d")?.addEventListener("click", (e) => { const on = e.currentTarget.getAttribute("aria-pressed") !== "true"; e.currentTarget.setAttribute("aria-pressed", String(on)); M.toggle3D(map, on); });
    let sw = null;
    $("#gis-swipe")?.addEventListener("click", async (e) => {
      const on = e.currentTarget.getAttribute("aria-pressed") !== "true"; e.currentTarget.setAttribute("aria-pressed", String(on));
      if (sw) { sw.destroy(); sw = null; }
      if (on) { const a = c.gis.find((g) => g.swipeWith && state.graph.gis[g.swipeWith]); if (!a) return; const b = state.graph.gis[a.swipeWith]; await M.addLayer(map, a); M.setVisible(map, a.id, true); M.setVisible(map, b.id, false); sw = await M.createSwipe(box, map, a, b); }
    });
  };
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "300px" }); io.observe(box); } else start();
}
function mdModal(id) { const g = state.graph.gis[id]; if (!g) return; openModal(`<div class="mbody"><div class="kicker">${esc(t("metadata"))}</div><h3 style="margin:8px 0 4px;font-size:22px">${esc(L(g.title))}</h3>${has(g.description) ? `<p class="note" style="font-size:14px">${esc(L(g.description))}</p>` : ""}${metaCard(g.metadata)}${state.graph.projects[g.project] ? `<p style="margin-top:14px"><a class="chip-link" href="${projectHref(state.graph.projects[g.project])}">${esc(L(state.graph.projects[g.project].title)).slice(0, 60)}</a></p>` : ""}</div>`); }

/* ═════ الأرقام المرجعية ═════ */
function stats() {
  if (!c.stats.length) return "";
  const nums = c.stats.map((s) => parseFloat(String(s.value).replace(/[^\d.]/g, ""))).filter((n) => !isNaN(n)); const max = Math.max(...nums, 1);
  return `<section class="wrap" id="stats">${kicker(t("stats_kicker"))}<h2 class="h2 rv">${t("stats_h")}</h2><p class="lead">${esc(t("stats_lead"))}</p>
    <div class="stats-grid">${c.stats.map((s) => { const n = parseFloat(String(s.value).replace(/[^\d.]/g, "")); return `<div class="card stat rv"><div class="v"><span data-count="${esc(s.value)}">${esc(s.value)}</span>${has(s.unit) ? `<small>${esc(L(s.unit))}</small>` : ""}</div><div class="bar"><i style="width:100%"></i></div><div class="l">${esc(L(s.label))}</div><div class="s">${esc(t("source"))}: ${has(s.sourceUrl) ? `<a href="${esc(s.sourceUrl)}" target="_blank" rel="noopener">${esc(L(s.source))}</a>` : esc(L(s.source))}${s.date && !String(L(s.source)).includes(String(s.date)) ? ` · ${esc(s.date)}` : ""}</div></div>`; }).join("")}</div></section>`;
}

/* ═════ البيانات المفتوحة ═════ */
function datasets() {
  if (!c.datasets.length) return ""; const G = state.graph;
  return `<section class="wrap" id="datasets">${kicker(t("ds_kicker"))}<h2 class="h2 rv">${t("ds_h")}</h2><p class="lead">${esc(t("ds_lead"))}</p>
    <div class="grid cards-3" style="margin-top:24px">${c.datasets.map((d) => `<div class="card ds rv"><h4 style="margin:0;font-size:17px">${esc(L(d.title))}</h4>${has(d.description) ? `<p class="note" style="font-size:14px">${esc(L(d.description))}</p>` : ""}${d.license ? `<div class="lic">${esc(t("license"))}: ${esc(d.license)}</div>` : ""}<div class="fmts">${(d.formats || []).filter((f) => f && f.href).map((f) => `<a class="btn btn-ghost btn-sm" href="${esc(f.href)}" download>${esc(t("download"))} ${esc(f.format || "")}</a>`).join("")}</div>${metaCard(d.metadata)}${G.projects[d.project] ? `<a class="chip-link" href="${projectHref(G.projects[d.project])}">${esc(L(G.projects[d.project].title)).slice(0, 60)}</a>` : ""}</div>`).join("")}</div></section>`;
}

/* ═════ دفتر المخطط ═════ */
function notes() {
  if (!c.notes.length) return "";
  return `<section class="wrap" id="notes">${kicker(t("notes_kicker"))}<h2 class="h2 rv">${t("notes_h")}</h2>
    <div class="notes-grid">${c.notes.map((n) => `<a class="card notecard rv" href="note.html?id=${encodeURIComponent(n.id)}"><div class="meta">${esc(n.date || "")}${n.readingMinutes ? ` · ${n.readingMinutes} ${esc(t("read_min"))}` : ""}${isNew(n.date) ? ` · ${esc(t("new"))}` : ""}</div><h4>${esc(L(n.title))}</h4>${has(n.excerpt) ? `<p>${esc(L(n.excerpt))}</p>` : ""}${(n.tags || []).length ? `<div class="share-row" style="margin-top:4px">${n.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}</a>`).join("")}</div></section>`;
}

/* ═════ الخدمات ═════ */
function services() {
  if (!c.services.length) return "";
  return `<section class="wrap" id="services">${kicker(t("services_kicker"))}<h2 class="h2 rv">${t("services_h")}</h2><p class="lead">${esc(c.projects.length ? t("services_lead") : "")}</p><div class="services" id="svc-host"></div></section>`;
}
function renderServicesList() {
  const host = $("#svc-host"); if (!host) return;
  const ranked = c.projects.length && groups().length ? rankServices() : c.services.map((s) => ({ s, score: null }));
  host.innerHTML = ranked.map((r, i) => { const s = r.s; return `<article class="svc ${i === 0 && r.score ? "rec" : ""}">${i === 0 && r.score ? `<span class="tag tag-new rec-tag">${esc(t("recommended"))}</span>` : ""}<div class="ic">${ico(s.icon || "default")}</div><h3>${esc(L(s.title))}</h3>${has(s.description) ? `<p>${esc(L(s.description))}</p>` : ""}${(s.includes || []).filter(has).length ? `<ul>${s.includes.filter(has).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ul>` : ""}${r.score != null ? `<div class="fit"><b>${r.score}</b>/100 ${esc(t("fit"))}</div>` : ""}
    <div class="row"><span class="price">${s.priceFrom != null && s.priceFrom !== "" ? `${esc(t("from"))} <b>${esc(s.priceFrom)}</b> ${esc(s.currency || "SAR")}` : esc(t("on_request"))}${has(s.delivery) ? ` · ${esc(L(s.delivery))}` : ""}</span><button class="btn btn-ghost btn-sm" type="button" data-order="${esc(s.id)}">${esc(t("order"))}</button></div></article>`; }).join("");
  $$("[data-order]", host).forEach((b) => b.addEventListener("click", () => { const sel = $("#svc"); if (sel) sel.value = b.dataset.order; updateWa(); $("#contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); setTimeout(() => $("#name")?.focus({ preventScroll: true }), 700); }));
}

/* ═════ الآراء ═════ */
function testimonials() {
  if (!c.testimonials.length) return "";
  return `<section class="wrap" id="testimonials">${kicker(t("testi_kicker"))}<h2 class="h2 rv">${t("testi_h")}</h2><div class="grid cards-3" style="margin-top:24px">${c.testimonials.map((x) => `<div class="card testi rv"><blockquote>“${esc(L(x.quote || x.text))}”</blockquote><div class="who">${esc(L(x.name))}${has(x.role) ? ` · ${esc(L(x.role))}` : ""}</div></div>`).join("")}</div></section>`;
}

/* ═════ التواصل ═════ */
function contact() {
  const p = c.profile, ct = p.contact || {}; const fs = c.site.formspreeId;
  const socials = [["linkedin", "LinkedIn"], ["x", "X"], ["github", "GitHub"], ["behance", "Behance"]].filter(([k]) => has(ct[k]));
  return `<section class="wrap" id="contact">${compassRose()}${kicker(t("contact_kicker"))}<p class="closing rv">${t("contact_h")}</p>
    <div class="contact"><form class="card" id="form" novalidate ${fs ? `action="https://formspree.io/f/${esc(fs)}" method="POST"` : ""}>
      <div class="f"><label for="name">${esc(t("name"))}</label><input id="name" name="name" placeholder="${esc(t("name_ph"))}" autocomplete="name" required></div>
      <div class="f"><label for="phone">${esc(t("phone"))}</label><input id="phone" name="contact" placeholder="${esc(t("phone_ph"))}" autocomplete="tel" required></div>
      <div class="f full"><label for="svc">${esc(t("service"))}</label><select id="svc" name="service">${c.services.map((s) => `<option value="${esc(s.id)}">${esc(L(s.title))}</option>`).join("")}<option value="other">${esc(t("other"))}</option></select></div>
      <div class="f full"><label for="msg">${esc(t("details"))}</label><textarea id="msg" name="message" placeholder="${esc(t("details_ph"))}"></textarea></div>
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none">
      <div class="f full"><button class="btn btn-primary" type="submit">${esc(t("send"))}</button></div>${fs ? "" : `<p class="note f full">${esc(t("form_demo"))}</p>`}</form>
    <div class="side">${has(ct.whatsapp) ? `<div class="card wa"><h3>${esc(t("wa_h"))}</h3><p>${esc(t("wa_p"))}</p><a class="btn btn-accent" id="wa-btn" href="#" target="_blank" rel="noopener">${esc(t("wa_btn"))}</a></div>` : ""}
      ${socials.length || has(ct.email) ? `<div class="socials">${has(ct.email) ? `<a href="mailto:${esc(ct.email)}">✉ ${esc(ct.email)}</a>` : ""}${socials.map(([k, n]) => `<a href="${esc(ct[k])}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>` : ""}
      ${has(c.site.bookingUrl) ? `<a class="btn btn-ghost" href="${esc(c.site.bookingUrl)}" target="_blank" rel="noopener">${esc(t("booking"))}</a>` : ""}
      <div class="card"><div class="kicker" style="margin-bottom:10px">${esc(t("vcard"))}</div><div class="qr-row"><canvas id="qr-cv" width="96" height="96" aria-label="${esc(t("qr_cv"))}"></canvas><div class="share-row" style="margin:0"><button class="btn btn-ghost btn-sm" type="button" id="vcard-btn">${esc(t("vcard"))}</button><a class="btn btn-ghost btn-sm" href="cv.html">${esc(t("nav_cv"))}</a></div></div></div>
      ${has(p.location) ? `<div class="card"><div class="kicker">${esc(t("based_in"))}</div><div style="margin-top:6px;font-weight:600">${esc(L(p.location))}</div><div style="color:var(--muted);font-size:14px">${esc(t("remote"))}</div></div>` : ""}</div></div></section>`;
}
function updateWa() {
  const a = $("#wa-btn"); if (!a) return; const ct = c.profile.contact || {}; const sel = $("#svc"); const svc = sel && sel.value !== "other" ? L(state.graph.services[sel.value]?.title) : (sel?.selectedOptions[0]?.textContent || "");
  a.href = `https://wa.me/${String(ct.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(t("wa_msg").replace("{service}", svc))}`;
}
function bindContact() {
  const f = $("#form"); if (!f) return; updateWa(); $("#svc")?.addEventListener("change", updateWa);
  f.addEventListener("submit", async (e) => {
    e.preventDefault(); const n = $("#name"), ph = $("#phone"); const ok = n.value.trim() && ph.value.trim();
    n.setAttribute("aria-invalid", String(!n.value.trim())); ph.setAttribute("aria-invalid", String(!ph.value.trim()));
    if (!ok) { toast(t("form_req")); return; }
    if (!f.action || !c.site.formspreeId) { toast(t("form_demo")); return; }
    try { const r = await fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } }); if (r.ok) { toast(t("form_sent")); f.reset(); } else toast(t("form_err")); } catch { toast(t("form_err")); }
  });
  $("#vcard-btn")?.addEventListener("click", vcard);
  const cv = $("#qr-cv"); if (cv) drawQR(cv, new URL("cv.html", location.href).href).then((ok) => { if (!ok) cv.remove(); });
}

/* ═════ التجميع ═════ */
const SECTIONS = { hero, now, model, about, atlas, projects: () => "", library, posters, skills, certificates, experience, education: () => "", gis, stats, datasets, notes, services, testimonials, contact };
function render() {
  const order = (c.site.sections || Object.keys(SECTIONS)).filter((s) => SECTIONS[s]);
  for (const k of Object.keys(SECTIONS)) if (!order.includes(k)) {} // أقسام غير مذكورة لا تُعرض
  app.innerHTML = order.map((k) => SECTIONS[k]()).join("");
  // خلفية كنتورية هادئة تتنفس خلف الصفحة كلها (تحويل واحد فقط، بلا فلاتر)
  if (!$(".contour-bg")) { const bg = document.createElement("div"); bg.className = "contour-bg"; bg.setAttribute("aria-hidden", "true"); bg.innerHTML = `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<path d="M-100 ${120 + i * 95}C300 ${60 + i * 95} 500 ${220 + i * 95} 900 ${110 + i * 95}S1400 ${180 + i * 95} 1700 ${90 + i * 95}" opacity="${(.25 - i * .02).toFixed(2)}"/>`).join("")}</g></svg>`; document.body.prepend(bg); }
  // ترقيم الأقسام الظاهرة فقط بالتسلسل (الأقسام الفارغة تختفي فلا تترك فجوات)
  let n = 0; $$("#app > section > .kicker").forEach((k) => { if (/^\d\d\s*·/.test(k.textContent)) k.textContent = k.textContent.replace(/^\d\d/, String(++n).padStart(2, "0")); });
  // ربط التفاعلات
  bindModel(); if ($("#model")) recompute(); initAtlas(c.projects); initDossier(c.certificates, (id) => certModal(id)); initShelf(c.projects); initTour(); document.addEventListener("atlas:pick", (e) => $$(".pcard").forEach((x) => x.classList.toggle("rank-1", x.dataset.p === e.detail)), { once: false }); renderCerts(); renderServicesList(); bindContact(); initGis(); initReveal(); bindRequests(); initProgress(); staggerCards();
  bindHeroScene(); initCursorFx(app); initCounters(app); initJourney(c); initDotsNav(); collapseLists(".sgroup ul", 5);
  const disc = $("#disc"); if (disc) cycler(disc, [L(c.profile.title), ...groups().map((g) => L(g.title))].filter(Boolean));
  if ("IntersectionObserver" in window) { const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); so.unobserve(e.target); } }), { threshold: .4 }); $$(".strip, .kicker").forEach((e) => so.observe(e)); } else $$(".strip, .kicker").forEach((e) => e.classList.add("in"));
  app.addEventListener("click", (e) => { const om = e.target.closest("[data-onmap]"); if (om) { e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("atlas:open", { detail: om.dataset.onmap })); return; } const ev = e.target.closest("[data-ev]"); if (ev) { e.preventDefault(); evidenceModal(ev.dataset.ev); } const md = e.target.closest("[data-md]"); if (md) mdModal(md.dataset.md); });
  // حدث عند فتح الشهادة من الرابط #cert-id
  if (location.hash.startsWith("#cert-")) setTimeout(() => certModal(location.hash.slice(6)), 300);
  const seo = c.site.seo || {}; setMeta(L(seo.title) || L(c.profile.name), L(seo.description) || L(c.profile.tagline), seo.ogImage);
  injectJsonLd(personLd());
}

(async () => {
  const ar0 = (document.documentElement.lang || "ar") !== "en"; introSplash(ar0 ? "فارس الأسمري" : "Faris Al-Asmari", ar0 ? "نموذج الملاءمة · تخطيط و GIS" : "SUITABILITY MODEL · PLANNING & GIS");
  c = await boot("home"); app = $("#app"); initWeights(); render();
  document.addEventListener("langchange", () => { render(); });
  addEventListener("resize", () => { clearTimeout(render.t); render.t = setTimeout(renderRaster, 200); });
})();
