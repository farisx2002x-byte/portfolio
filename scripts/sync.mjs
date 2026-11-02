#!/usr/bin/env node
// ─────────────────────────────────────────────
// المزامنة: Google Sheet + مجلد Drive → content/*.json + media/ + files/ + data/
// الاستخدام: node scripts/sync.mjs   (يحتاج GOOGLE_SERVICE_ACCOUNT_JSON و SHEET_ID و DRIVE_FOLDER_ID)
//   --dry   : لا يكتب شيئاً، يطبع التقرير فقط
// المبدأ: نبني كل شيء في مجلد مؤقت، نتحقق، ثم ننقل إلى المستودع. إن فشل التحقق لا يُنشر شيء.
// ─────────────────────────────────────────────
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, cpSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { readTab, sheetTabs, tree, download, exportDoc, appendRows } from "./lib/google.mjs";
import { CONVERT, isPublished, profileFrom, settingsFrom, clean } from "./lib/rows.mjs";
import { SIZES, isImage, isPdf, slug, toWebp, toPng, pdfToSlides, simplifyGis } from "./lib/media.mjs";
import { linkedinDrafts } from "./lib/linkedin.mjs";
import { validate } from "./lib/validate.mjs";
import { classify, inboxSuggestion } from "./lib/drive-layout.mjs";
import { importMedia } from "./import-media.mjs";

const ROOT = process.cwd(), DRY = process.argv.includes("--dry");
const SHEET = process.env.SHEET_ID, FOLDER = process.env.DRIVE_FOLDER_ID;
if (!SHEET || !FOLDER) { console.error("يلزم SHEET_ID و DRIVE_FOLDER_ID"); process.exit(2); }
const OUT = join(tmpdir(), "fa-sync-" + Date.now()); mkdirSync(OUT, { recursive: true });
const report = { time: new Date().toISOString(), ok: false, errors: [], warnings: [], changes: { add: [], mod: [], del: [] }, stats: {} };
const warn = (m) => report.warnings.push(m);
const log = (m) => console.log("· " + m);
const w = (rel, data) => { const p = join(OUT, rel); mkdirSync(join(p, ".."), { recursive: true }); writeFileSync(p, typeof data === "string" || Buffer.isBuffer(data) ? data : JSON.stringify(data, null, 2) + "\n"); };

/* ─ 1. الجدول ─ */
log("قراءة الجدول…");
const tabs = new Set(await sheetTabs(SHEET));
const rows = async (tab) => (tabs.has(tab) ? await readTab(SHEET, tab) : (warn(`التبويب «${tab}» غير موجود في الجدول`), []));
const T = {}; for (const tab of ["profile", "settings", "projects", "certificates", "skills", "experience", "education", "services", "testimonials", "gis", "datasets", "stories", "stats"]) T[tab] = await rows(tab);
const conv = (tab) => T[tab].filter(isPublished).map(CONVERT[tab]).filter((x) => x.id || tab === "stories");
const content = {};
content.profile = profileFrom(T.profile);
content.site = settingsFrom(T.settings);
if (!content.site.sections?.length) content.site.sections = ["hero", "model", "about", "projects", "skills", "certificates", "experience", "education", "gis", "stats", "datasets", "notes", "services", "testimonials", "contact"];
content.projects = conv("projects").map((p, i) => ({ ...p, order: p.order ?? i + 1 }));
content.certificates = conv("certificates"); content.experience = conv("experience"); content.education = conv("education"); content.services = conv("services"); content.testimonials = conv("testimonials"); content.datasets = conv("datasets"); content.stats = conv("stats");
// المهارات: صفوف → مجموعات + أدوات
{ const groups = new Map(), tools = [];
  for (const s of conv("skills")) { if (s.isTool) { tools.push({ id: s.id, name: s.name?.en || s.name?.ar || s.id, level: s.level ?? 3 }); continue; }
    if (!groups.has(s.group)) groups.set(s.group, { id: s.group, tier: s.groupTier || "core", title: s.groupTitle || { ar: s.group }, items: [] });
    const g = groups.get(s.group); if (s.groupTitle) g.title = s.groupTitle; if (s.groupTier) g.tier = s.groupTier; g.items.push({ id: s.id, name: s.name, level: s.level ?? 3 }); }
  content.skills = { groups: [...groups.values()], tools }; }
// القصص → داخل المشاريع
{ const st = conv("stories"); for (const p of content.projects) { const steps = st.filter((s) => s.project === p.id).sort((a, b) => (a.step ?? 0) - (b.step ?? 0)); if (steps.length) p.story = steps.map(({ project, ...s }) => s); } }
content.gis = conv("gis");

/* ─ 2. مجلد Drive ─ */
log("قراءة مجلد Drive…");
const root = await tree(FOLDER, "Portfolio");
/* التخطيط الحقيقي (المرحلة الثانية): مجلدات مرقّمة 00..05 وأسماء عربية. نعتمد على المعرّفات المحفوظة في content/drive-map.json
   والمشاريع (summaryDriveId/driveFolder). ننزّل القابل للنشر فقط إلى مجلد مؤقت بأسمائه، ثم نمرره على المستورد نفسه. */
const V2 = Object.keys(root.dirs).some((k) => /^01 /.test(k)) && Object.keys(root.dirs).some((k) => /^02 /.test(k));
if (V2) {
  log("تخطيط المرحلة الثانية: تنزيل القابل للنشر فقط…");
  const dl = join(OUT, "_drive"); mkdirSync(dl, { recursive: true }); let n = 0;
  const grab = async (node) => { for (const f of node.files) { const c = classify(f.name); if (!c.publishable || ["full", "original", "booklet", "cv"].includes(c.kind) && !(c.kind === "cv" && c.publishable)) continue; if (Number(f.size || 0) > 60e6) { warn(`${f.name}: أكبر من 60 ميغابايت، تُخطّى`); continue; } writeFileSync(join(dl, f.name), await download(f.id)); n++; } };
  for (const k of Object.keys(root.dirs)) if (/^0[1-5] /.test(k)) { await grab(root.dirs[k]); for (const sub of Object.values(root.dirs[k].dirs)) await grab(sub); }
  log(`${n} ملف نُزّل`);
  // صندوق الوارد: اقتراح فرز لكل ملف (لا نقل تلقائياً، الدرايف للقراءة فقط)
  const inboxKey = Object.keys(root.dirs).find((k) => /^00 /.test(k)); const inbox = inboxKey ? root.dirs[inboxKey].files : [];
  report.inbox = inbox.map((f) => ({ name: f.name, ...inboxSuggestion(f.name) }));
  for (const i of report.inbox) warn(`صندوق الوارد: «${i.name}» → انقله إلى ${i.dest}${i.note ? " · " + i.note : ""}`);
  // المحتوى الحالي أساس (المشاريع المكتوبة يدوياً من الملخصات)؛ الجدول يُستخدم إن كان فيه صفوف منشورة
  for (const f of ["projects", "posters", "certificates", "profile", "drive-map"]) { const cur = join(ROOT, "content", f + ".json"); if (existsSync(cur)) cpSync(cur, join(OUT, "content", f + ".json")); }
  if (!content.projects.length) content.projects = JSON.parse(readFileSync(join(OUT, "content/projects.json"), "utf8"));
  if (!content.certificates.length) content.certificates = JSON.parse(readFileSync(join(OUT, "content/certificates.json"), "utf8"));
  content.posters = JSON.parse(readFileSync(join(OUT, "content/posters.json"), "utf8"));
  if (!T.profile.length) content.profile = JSON.parse(readFileSync(join(OUT, "content/profile.json"), "utf8"));
  for (const [k, v] of Object.entries({ projects: content.projects, posters: content.posters, certificates: content.certificates, profile: content.profile })) w(`content/${k}.json`, v);
  await importMedia(dl, OUT);
  for (const k of ["projects", "posters", "certificates", "profile"]) content[k] = JSON.parse(readFileSync(join(OUT, `content/${k}.json`), "utf8"));
  rmSync(dl, { recursive: true, force: true }); content.notes ??= [];
}
if (!V2) {
const dir = (...path) => path.reduce((n, k) => (n ? n.dirs[k] : null), root);
const fileOf = (node, base) => node?.files.find((f) => slug(f.name) === base || f.name.toLowerCase().startsWith(base + "."));
const webpName = (name) => slug(name) + ".webp";
async function imagesOf(node, outRel, maxW) { const out = []; if (!node) return out; for (const f of node.files.filter((f) => isImage(f.name)).sort((a, b) => a.name.localeCompare(b.name))) { const r = await toWebp(await download(f.id), join(OUT, outRel, webpName(f.name)), maxW); out.push(`${outRel}/${r.path.split("/").pop()}`); } return out; }

// الملف الشخصي
{ const pr = dir("profile"); if (pr) { const photo = pr.files.find((f) => isImage(f.name)); if (photo) { const r = await toWebp(await download(photo.id), join(OUT, "media/profile.webp"), SIZES.profile); content.profile.photo = "media/" + r.path.split("/").pop(); }
    const cv = pr.files.find((f) => isPdf(f.name)); if (cv) { w("files/cv.pdf", await download(cv.id)); content.profile.cvFile = "files/cv.pdf"; }
    const og = pr.files.find((f) => /^og\./i.test(f.name)); if (og) { await toPng(await download(og.id), join(OUT, "media/og.png"), SIZES.og); content.site.seo = { ...(content.site.seo || {}), ogImage: "media/og.png" }; } } }
// المشاريع
for (const p of content.projects) {
  const n = dir("projects", p.id); if (!n) { warn(`projects/${p.id}: لا يوجد مجلد له في Drive (سيُعرض بلا وسائط)`); continue; }
  const cover = n.files.find((f) => isImage(f.name) && /^cover\./i.test(f.name)); if (cover) { const r = await toWebp(await download(cover.id), join(OUT, `media/projects/${p.id}/cover.webp`), SIZES.cover); p.cover = `media/projects/${p.id}/` + r.path.split("/").pop(); }
  const g = await imagesOf(n.dirs.gallery, `media/projects/${p.id}/gallery`, SIZES.gallery); if (g.length) p.gallery = g.map((src) => ({ src }));
  const sn = n.dirs.slides; if (sn) { const pdf = sn.files.find((f) => isPdf(f.name)); let slides = await imagesOf(sn, `media/projects/${p.id}/slides`, SIZES.slides);
    if (!slides.length && pdf) { const r = await pdfToSlides(await download(pdf.id), join(OUT, `media/projects/${p.id}/slides`)); if (r.ok) slides = r.files.map((f) => `media/projects/${p.id}/slides/` + f.split("/").pop()); else warn(`projects/${p.id}: تعذّر تحويل PDF الشرائح (${r.reason})`); }
    if (slides.length) p.slides = slides.map((src, i) => ({ src, caption: { ar: `الشريحة ${i + 1}`, en: `Slide ${i + 1}` } })); }
  const fn = n.dirs.files; if (fn) { p.files = []; for (const f of fn.files) { const rel = `files/projects/${p.id}/${f.name}`; w(rel, await download(f.id)); p.files.push({ label: { ar: f.name, en: f.name }, href: rel }); } }
}
// الشهادات
{ const cn = dir("certificates"); for (const c of content.certificates) { const f = cn && fileOf(cn, c.id); if (!f) { warn(`certificates/${c.id}: لا يوجد ملف صورة/PDF باسم ${c.id} في Drive/certificates`); continue; }
    const buf = await download(f.id);
    if (isPdf(f.name)) { w(`files/certificates/${c.id}.pdf`, buf); c.pdf = `files/certificates/${c.id}.pdf`; const r = await pdfToSlides(buf, join(OUT, "media/certificates/_tmp_" + c.id), SIZES.certificates); if (r.ok && r.files[0]) { cpSync(r.files[0], join(OUT, `media/certificates/${c.id}.webp`)); rmSync(join(OUT, "media/certificates/_tmp_" + c.id), { recursive: true, force: true }); c.image = `media/certificates/${c.id}.webp`; } }
    else if (isImage(f.name)) { const r = await toWebp(buf, join(OUT, `media/certificates/${c.id}.webp`), SIZES.certificates); c.image = "media/certificates/" + r.path.split("/").pop(); } } }
// طبقات GIS
{ const gn = dir("gis"); for (const g of content.gis) { const n = gn?.dirs[g.id]; const f = n?.files.find((x) => /\.(geojson|json|zip)$/i.test(x.name)); if (!f) continue;
    const tmp = join(OUT, "_gis_in", g.id + extname(f.name)); mkdirSync(join(tmp, ".."), { recursive: true }); writeFileSync(tmp, await download(f.id));
    const r = simplifyGis(tmp, join(OUT, `data/${g.id}.geojson`)); if (r.ok) { g.src = `data/${g.id}.geojson`; if (!r.simplified) warn(`gis/${g.id}: لم تُبسّط الطبقة (mapshaper غير مثبت)`); } else warn(`gis/${g.id}: فشل التحويل (${r.reason})`); }
  rmSync(join(OUT, "_gis_in"), { recursive: true, force: true }); }
// مجموعات البيانات المفتوحة: من طبقة منشورة فقط
for (const d of content.datasets) { const g = content.gis.find((x) => x.id === d.source_layer); if (!g?.src) { warn(`datasets/${d.id}: لا توجد طبقة منشورة «${d.source_layer}»`); continue; }
  const geo = JSON.parse(readFileSync(join(OUT, g.src), "utf8")); d.formats = [{ format: "GeoJSON", href: `data/${d.id}.geojson` }]; w(`data/${d.id}.geojson`, geo);
  const pts = (geo.features || []).filter((f) => f.geometry?.type === "Point"); if (pts.length) { const keys = [...new Set(pts.flatMap((f) => Object.keys(f.properties || {})))]; const csv = [[...keys, "lon", "lat"].join(","), ...pts.map((f) => [...keys.map((k) => JSON.stringify(f.properties?.[k] ?? "")), ...f.geometry.coordinates].join(","))].join("\n"); w(`data/${d.id}.csv`, csv); d.formats.push({ format: "CSV", href: `data/${d.id}.csv` }); }
  delete d.source_layer; }
// الدفتر: مستندات Google Docs → مقالات
{ const nn = dir("notes"); content.notes = []; if (nn) for (const f of nn.files.filter((x) => x.mimeType === "application/vnd.google-apps.document")) {
    let html = await exportDoc(f.id, "text/html"); const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1];
    const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); const words = text.split(" ").length;
    const clean = body.replace(/<(style|script)[\s\S]*?<\/\1>/gi, "").replace(/\s(class|style|id|dir|lang)="[^"]*"/g, "").replace(/<span>|<\/span>/g, "");
    const tags = (text.match(/#([\w؀-ۿ-]+)/g) || []).map((x) => x.slice(1)).slice(0, 8);
    content.notes.push({ id: slug(f.name), title: { ar: f.name }, date: f.modifiedTime.slice(0, 10), readingMinutes: Math.max(1, Math.round(words / 180)), tags, excerpt: { ar: text.slice(0, 180) }, html: { ar: clean } }); } }
// LinkedIn: ملفات CSV → مسودات تُلحق بالجدول بحالة publish=لا (الجدول له الأولوية دائماً)
{ const ln = dir("linkedin"); if (ln) { const files = []; for (const f of ln.files.filter((x) => /\.csv$/i.test(x.name))) files.push({ name: f.name, text: (await download(f.id)).toString("utf8") });
    const drafts = linkedinDrafts(files); const known = { experience: new Set(T.experience.map((r) => r.id)), education: new Set(T.education.map((r) => r.id)), certificates: new Set(T.certificates.map((r) => r.id)), skills: new Set(T.skills.map((r) => r.id)) };
    for (const [tab, list] of Object.entries(drafts)) { const fresh = list.filter((r) => !known[tab].has(r.id)); if (!fresh.length || !tabs.has(tab)) continue;
      const head = Object.keys(T[tab][0] || fresh[0]); if (!DRY) await appendRows(SHEET, tab, head, fresh); log(`LinkedIn: أُضيفت ${fresh.length} مسودة إلى تبويب ${tab} (publish=لا)`); report.stats[`linkedin_${tab}`] = fresh.length; } } }

} // نهاية التخطيط القديم
/* ─ 3. الكتابة والتحقق ─ */
content.meta = { lastSync: report.time, version: 2 };
for (const [k, v] of Object.entries(content)) w(`content/${k}.json`, v);
const { errors, warnings } = validate(content, OUT); report.errors.push(...errors); report.warnings.push(...warnings);
/* ─ 4. الفروق مقابل النسخة الحالية ─ */
const cur = (f) => { try { return JSON.parse(readFileSync(join(ROOT, "content", f + ".json"), "utf8")); } catch { return null; } };
for (const f of ["projects", "certificates", "experience", "education", "services", "gis", "datasets", "stats", "notes", "testimonials"]) {
  const a = cur(f) || [], b = content[f] || []; const A = new Map(a.map((x) => [x.id, x])), B = new Map(b.map((x) => [x.id, x]));
  for (const [id, x] of B) { if (!A.has(id)) report.changes.add.push({ file: f, id, title: x.title || x.role }); else if (JSON.stringify(A.get(id)) !== JSON.stringify(x)) report.changes.mod.push({ file: f, id, title: x.title || x.role, fields: Object.keys(x).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(A.get(id)[k])) }); }
  for (const [id, x] of A) if (!B.has(id)) report.changes.del.push({ file: f, id, title: x.title || x.role });
}
for (const f of ["profile", "site", "skills"]) if (JSON.stringify(cur(f)) !== JSON.stringify(content[f])) report.changes.mod.push({ file: f, id: f });
report.ok = report.errors.length === 0;
report.stats = { ...report.stats, projects: content.projects.length, certificates: content.certificates.length, gis: content.gis.length, notes: content.notes.length };
const md = [`# تقرير المزامنة`, ``, `- الوقت: ${report.time}`, `- الحالة: ${report.ok ? "✅ نجح التحقق" : "❌ فشل التحقق، لم يُنشر شيء"}`, `- التغييرات: +${report.changes.add.length} ~${report.changes.mod.length} −${report.changes.del.length}`, ``,
  ...(report.errors.length ? ["## ما يجب إصلاحه", ...report.errors.map((e) => `- ${e}`), ""] : []), ...(report.warnings.length ? ["## تنبيهات", ...report.warnings.map((e) => `- ${e}`), ""] : [])].join("\n");
writeFileSync(join(ROOT, "SYNC-REPORT.md"), md); writeFileSync(join(ROOT, "content", "_sync-report.json"), JSON.stringify(report, null, 2));
console.log(md);
if (!report.ok) { rmSync(OUT, { recursive: true, force: true }); process.exit(1); }
const changed = report.changes.add.length + report.changes.mod.length + report.changes.del.length;
if (DRY) { log("وضع التجربة: لم يُكتب شيء."); process.exit(0); }
if (!changed && !process.argv.includes("--force")) { log("لا تغييرات."); rmSync(OUT, { recursive: true, force: true }); process.exit(0); }
/* ─ 5. النقل إلى المستودع (الوسائط المولّدة تُستبدل بالكامل) ─ */
for (const d of ["content", "media/projects", "media/certificates", "media/posters", "data", "files/projects", "files/certificates", "files/summaries", "files/posters"]) if (existsSync(join(OUT, d))) { rmSync(join(ROOT, d), { recursive: true, force: true }); cpSync(join(OUT, d), join(ROOT, d), { recursive: true }); }
for (const f of ["media/profile.webp", "media/og.png", "files/cv.pdf"]) if (existsSync(join(OUT, f))) cpSync(join(OUT, f), join(ROOT, f));
writeFileSync(join(ROOT, "content", "_sync-report.json"), JSON.stringify(report, null, 2));
rmSync(OUT, { recursive: true, force: true });
log(`تمت المزامنة: ${changed} تغيير.`);
