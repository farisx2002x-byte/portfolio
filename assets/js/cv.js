/* صفحة السيرة الذاتية: تُولَّد من ملفات المحتوى نفسها، وجاهزة للطباعة */
import { boot, state, t, L, has, esc, $, fmtDate, setMeta, drawQR, injectJsonLd, personLd } from "./core.js";
import { gateBtn, bindRequests } from "./app-shared.js";

let c;
/* النسختان الرسميتان PDF (عربي/إنجليزي): معاينة + عرض + تنزيل. الرابط /cv يفتح هذه الصفحة مباشرة. */
const PDFS = [
  { k: "ar", file: "files/cv/Faris-AlAsmari-CV-AR.pdf", img: "media/cv/cv-ar.webp", h: { ar: "العربية", en: "Arabic" }, sub: { ar: "Arabic", en: "العربية" } },
  { k: "en", file: "files/cv/Faris-AlAsmari-CV-EN.pdf", img: "media/cv/cv-en.webp", h: { ar: "الإنجليزية", en: "English" }, sub: { ar: "English", en: "الإنجليزية" } },
];
const PDF_UI = {
  ar: { kicker: "النسختان الرسميتان", h: "السيرة بصيغة PDF", lead: "نسختان جاهزتان للطباعة على صفحة A4 واحدة لكلٍّ منهما: اعرضها مباشرة أو نزّلها.", view: "عرض", dl: "تنزيل PDF", upd: "تحديث: نوفمبر 2026" },
  en: { kicker: "Official versions", h: "CV as PDF", lead: "Two print-ready versions, one A4 page each: open them directly or download.", view: "View", dl: "Download PDF", upd: "Updated: November 2026" },
};
function pdfBlock() {
  const u = PDF_UI[state.lang] || PDF_UI.ar;
  const eye = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const dl = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;
  return `<section class="cv-pdfs no-print" id="pdf" aria-label="${esc(u.h)}"><div class="kicker">${esc(u.kicker)}</div><h2 class="h2">${esc(u.h)}</h2><p class="lead">${esc(u.lead)}</p>
    <div class="cv-pdf-grid">${PDFS.map((x) => `<article class="cv-pdf" ${x.k === "en" ? 'dir="ltr"' : ""}>
      <div class="k"><h3>${esc(x.h[state.lang] || x.h.ar)} <span>${esc(x.sub[state.lang] || x.sub.ar)}</span></h3><span class="pill mono">PDF · A4</span></div>
      <a class="prev" href="${x.file}" target="_blank" rel="noopener"><img src="${x.img}" alt="${esc(x.h[state.lang] || x.h.ar)}" loading="lazy" width="595" height="842"></a>
      <div class="acts"><a class="btn btn-primary" href="${x.file}" target="_blank" rel="noopener">${eye}${esc(u.view)}</a><a class="btn btn-ghost" href="${x.file}" download="${x.file.split("/").pop()}">${dl}${esc(u.dl)}</a></div>
      <div class="meta"><span>${esc(u.upd)}</span><span class="mono">${x.k.toUpperCase()} · 1 page</span></div></article>`).join("")}</div></section>`;
}

function render() {
  const p = c.profile, ct = p.contact || {}, G = state.graph;
  const contactLines = [ct.email, ct.whatsapp ? `+${String(ct.whatsapp).replace(/\D/g, "")}` : "", has(p.location) ? L(p.location) : "", ct.linkedin ? ct.linkedin.replace(/^https?:\/\//, "") : ""].filter(Boolean);
  const feat = c.projects.filter((x) => x.featured).concat(c.projects.filter((x) => !x.featured)).slice(0, 6);
  $("#app").innerHTML = `<div class="wrap"><div class="cv-actions no-print" style="margin-top:20px"><button class="btn btn-primary btn-sm" type="button" onclick="print()">${esc(t("cv_print"))}</button>${has(p.cvFile) ? (p.cvFile === "request" || c.site.downloadsRequireApproval ? gateBtn(t("cv_download"), "CV") : `<a class="btn btn-ghost btn-sm" href="${esc(p.cvFile)}" download>${esc(t("cv_download"))}</a>`) : ""}<a class="btn btn-ghost btn-sm" href="#pdf">PDF ↓</a><a class="btn btn-ghost btn-sm" href="index.html">← ${esc(L(p.name))}</a></div>
    <div class="cv" id="cv"><div class="cv-head"><div><h1>${esc(L(p.name))}</h1>${has(p.title) ? `<div class="t">${esc(L(p.title))}</div>` : ""}</div><div class="c">${contactLines.map(esc).join("<br>")}<canvas id="cvqr" width="72" height="72" style="width:72px;height:72px;margin-top:8px;margin-inline-start:auto;background:#fff;padding:3px;border-radius:6px"></canvas></div></div>
    ${has(p.bio) ? `<p style="margin:18px 0 0;font-size:14.5px">${esc(L(p.bio))}</p>` : ""}
    ${c.education.length ? `<h2>${esc(t("education"))}</h2>${c.education.map((e) => `<div class="item"><b>${esc(L(e.degree))}</b><span class="d">${esc(e.start || "")}${e.end ? "–" + esc(e.end) : ""}</span>${has(e.institution) ? `<span class="o">${esc(L(e.institution))}</span>` : ""}${has(e.notes) ? `<p>${esc(L(e.notes))}</p>` : ""}</div>`).join("")}` : ""}
    ${c.experience.length ? `<h2>${esc(t("experience"))}</h2>${c.experience.map((e) => `<div class="item"><b>${esc(L(e.role))}</b><span class="d">${esc(fmtDate(e.start))}–${esc(fmtDate(e.end || "present"))}</span>${has(e.org) ? `<span class="o">${esc(L(e.org))}${has(e.location) ? ` · ${esc(L(e.location))}` : ""}</span>` : ""}${has(e.summary) ? `<p>${esc(L(e.summary))}</p>` : ""}${(e.bullets || []).filter(has).length ? `<ul>${e.bullets.filter(has).map((b) => `<li>${esc(L(b))}</li>`).join("")}</ul>` : ""}</div>`).join("")}` : ""}
    ${feat.length ? `<h2>${esc(t("cv_projects"))}</h2>${feat.map((x) => `<div class="item"><b>${esc(L(x.title))}</b><span class="d">${x.year || ""}${x.type ? ` · ${esc(t("type." + x.type))}` : ""}</span>${has(x.summary) ? `<p>${esc(L(x.summary))}</p>` : ""}${(x.tools || []).length ? `<p class="mono" style="font-size:11.5px">${esc(x.tools.join(" · "))}</p>` : ""}</div>`).join("")}` : ""}
    ${c.skills.groups.length ? `<h2>${esc(t("cv_skills"))}</h2>${c.skills.groups.map((g) => `<div class="item" style="grid-template-columns:1fr"><b>${esc(L(g.title))}</b><div class="sk-line">${(g.items || []).map((s) => `<span>${esc(L(s.name))} <b>${s.level || 3}/5</b></span>`).join("")}</div></div>`).join("")}` : ""}
    ${c.skills.tools.length ? `<h2>${esc(t("cv_tools"))}</h2><div class="sk-line">${c.skills.tools.map((x) => `<span>${esc(x.name)} <b>${x.level || 3}/5</b></span>`).join("")}</div>` : ""}
    ${c.certificates.length ? `<h2>${esc(t("cv_certs"))}</h2>${c.certificates.map((x) => `<div class="item"><b>${esc(L(x.title))}</b><span class="d">${esc(fmtDate(x.date))}</span>${has(x.issuer) ? `<span class="o">${esc(L(x.issuer))}${has(x.credentialId) ? ` · ${esc(x.credentialId)}` : ""}</span>` : ""}</div>`).join("")}` : ""}
    ${(p.languages || []).filter((l) => has(l.name)).length ? `<h2>${esc(t("languages"))}</h2><div class="sk-line">${p.languages.filter((l) => has(l.name)).map((l) => `<span>${esc(L(l.name))}${has(l.level) ? ` <b>${esc(L(l.level))}</b>` : ""}</span>`).join("")}</div>` : ""}
    </div>
    ${pdfBlock()}</div>`;
  const q = $("#cvqr"); if (q) drawQR(q, location.href.split("#")[0]).then((ok) => { if (!ok) q.remove(); }); bindRequests();
  setMeta(`${t("cv_title")} · ${L(p.name)}`, L(p.tagline), c.site.seo?.ogImage); injectJsonLd(personLd());
}
(async () => { c = await boot("cv"); render(); document.addEventListener("langchange", render); })();
