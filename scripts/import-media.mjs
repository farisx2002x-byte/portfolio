#!/usr/bin/env node
// ─────────────────────────────────────────────
// استيراد الوسائط من نسخة محلية لملفات Drive (المرحلة الثانية)
//   node scripts/import-media.mjs --from <مجلد فيه الملفات بأسمائها كما في Drive>
// يتعرف على كل ملف باسمه (نفس قواعد التسمية) ويربطه بالمشروع عبر content/drive-map.json،
// يرفض كل ما يحمل تحذيراً في اسمه، ويولّد: الأغلفة، شرائح الملخصات، المعارض، البوسترات، الشهادات، الصورة الشخصية.
// ─────────────────────────────────────────────
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";
import { classify, galleryFiles, captionOf } from "./lib/drive-layout.mjs";
import { SIZES, toWebp, pdfToSlides, isImage, isPdf } from "./lib/media.mjs";

export async function importMedia(FROM, ROOT = process.cwd()) {

const J = (f) => JSON.parse(readFileSync(join(ROOT, "content", f + ".json"), "utf8"));
const save = (f, d) => writeFileSync(join(ROOT, "content", f + ".json"), JSON.stringify(d, null, 1) + "\n");
const log = (m) => console.log("· " + m), warn = (m) => console.log("! " + m);

/* 1. كل الملفات المحلية بأسمائها */
const local = new Map();
(function walk(d) { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else local.set(e.name.normalize("NFC"), p); } })(FROM);
log(`${local.size} ملف محلي`);

/* 2. خريطة Drive: اسم ← (معرّف، المجلد الأب) */
const map = J("drive-map"); const byName = new Map(), folderOf = new Map();
(function walk(f, path) { for (const x of f.files || []) { byName.set(String(x.title).normalize("NFC"), { ...x, folder: f.id, folderTitle: f.title }); folderOf.set(x.id, f.id); } for (const s of f.subfolders || []) walk(s, path); })({ files: [], subfolders: map.folders });

const projects = J("projects"), posters = J("posters"), certs = J("certificates"), profile = J("profile");
const findLocal = (title) => local.get(String(title).normalize("NFC"));
const skipped = [];
const okToPublish = (title) => { const c = classify(title); if (!c.publishable) { skipped.push(`${title} → ${c.privateFlag ? "تحذير في الاسم" : "أصل كامل/مصدر"}`); return false; } return true; };

/* 3. المشاريع: الملخص (غلاف + شرائح + PDF) والمعرض من مجلد المشروع */
for (const p of projects) {
  // الملخص
  const sum = p.files?.find((f) => f.driveId);
  if (sum) { const d = [...byName.values()].find((x) => x.id === sum.driveId); const lp = d && findLocal(d.title);
    if (!lp) warn(`${p.id}: ملخص «${d?.title || sum.driveId}» غير موجود محلياً`);
    else if (okToPublish(d.title)) { const buf = readFileSync(lp);
      sum.request = true; delete sum.href; // لا يُرفع PDF الملخص للموقع: التصفح كصور داخل الصفحة، والتحميل بإذن
      const r = await pdfToSlides(buf, join(ROOT, "media", "projects", p.id, "slides")); if (r.ok) { p.slides = r.files.map((f, i) => ({ src: `media/projects/${p.id}/slides/${basename(f)}`, caption: { ar: `الشريحة ${i + 1} من الملخص`, en: `Summary slide ${i + 1}` } }));
        const c = await toWebp(readFileSync(r.files[0]), join(ROOT, "media", "projects", p.id, "cover.webp"), SIZES.cover); p.cover = `media/projects/${p.id}/cover.webp`; log(`${p.id}: غلاف + ${r.files.length} شرائح`); } } }
  // المعرض: رندرات وصور درون من مجلد المشروع في Drive
  if (p.driveFolder) { const node = findFolder(map.folders, p.driveFolder); const imgs = galleryFiles((node?.files || []).map((x) => ({ ...x, name: x.title })));
    const g = []; for (const f of imgs) { const lp = findLocal(f.title); if (!lp) continue; const r = await toWebp(readFileSync(lp), join(ROOT, "media", "projects", p.id, "gallery", `${g.length + 1}`.padStart(2, "0") + ".webp"), SIZES.gallery); const cap = captionOf(f.title); g.push({ src: `media/projects/${p.id}/gallery/${basename(r.path)}`, caption: cap ? { ar: cap, en: cap } : undefined }); }
    if (g.length) { p.gallery = g; log(`${p.id}: معرض ${g.length} صورة`); } }
}
function findFolder(list, id) { for (const f of list) { if (f.id === id) return f; const r = findFolder(f.subfolders || [], id); if (r) return r; } return null; }

/* 4. البوسترات واللوحات: الصفحة الأولى معاينة */
for (const x of posters) { if (x.publishable === false || !x.driveId) continue; const d = [...byName.values()].find((y) => y.id === x.driveId); const lp = d && findLocal(d.title); if (!lp) { warn(`poster ${x.id}: غير موجود محلياً`); continue; } if (!okToPublish(d.title)) continue;
  const buf = readFileSync(lp); let img;
  if (isPdf(d.title)) { const r = await pdfToSlides(buf, join(ROOT, "media", "posters", "_tmp"), 1600); if (r.ok) { const c = await toWebp(readFileSync(r.files[0]), join(ROOT, "media", "posters", `${x.id}.webp`), 1600); img = c.path; }
    x.pdf = "request"; }
  else if (isImage(d.title)) { const c = await toWebp(buf, join(ROOT, "media", "posters", `${x.id}.webp`), 1600); img = c.path; }
  if (img) { x.image = `media/posters/${x.id}.webp`; log(`poster ${x.id}: معاينة`); } }
try { const { rmSync } = await import("node:fs"); rmSync(join(ROOT, "media", "posters", "_tmp"), { recursive: true, force: true }); } catch {}

/* 5. الشهادات: بالاسم في Drive (driveName)؛ ما عليه تحذير لا يُنشر */
for (const c of certs) { if (c.noFile || !c.driveName) continue; const d = [...byName.values()].find((y) => String(y.title).normalize("NFC").startsWith(c.driveName.normalize("NFC"))); const lp = d && findLocal(d.title); if (!lp) { warn(`cert ${c.id}: «${c.driveName}» غير موجود محلياً`); continue; } if (!okToPublish(d.title)) continue;
  const buf = readFileSync(lp);
  if (isPdf(d.title)) { const r = await pdfToSlides(buf, join(ROOT, "media", "certificates", "_tmp"), SIZES.certificates); if (r.ok) { await toWebp(readFileSync(r.files[0]), join(ROOT, "media", "certificates", `${c.id}.webp`), SIZES.certificates); c.image = `media/certificates/${c.id}.webp`; } c.pdf = "request"; }
  else if (isImage(d.title)) { await toWebp(buf, join(ROOT, "media", "certificates", `${c.id}.webp`), SIZES.certificates); c.image = `media/certificates/${c.id}.webp`; }
  log(`cert ${c.id}: ${c.image ? "صورة" : ""}${c.pdf ? " + PDF" : ""}`); }
try { const { rmSync } = await import("node:fs"); rmSync(join(ROOT, "media", "certificates", "_tmp"), { recursive: true, force: true }); } catch {}

/* 6. الملف الشخصي: الصورة الشخصية فقط (السيرة الذاتية الحالية فيها الجوال → لا تُنشر) */
{ const ph = findLocal("الصورة الشخصية.png") || findLocal("الصورة الشخصية.jpg"); if (ph) { await toWebp(readFileSync(ph), join(ROOT, "media", "profile.webp"), SIZES.profile); profile.photo = "media/profile.webp"; log("الصورة الشخصية"); }
  profile.cvFile = "request"; /* السيرة الذاتية تُرسل بإذن، لا تُرفع */ }

save("projects", projects); save("posters", posters); save("certificates", certs); save("profile", profile);
if (skipped.length) { console.log("\nمُستبعد (لن يُنشر):"); for (const s of skipped) console.log("  × " + s); }
log("تم.");
return { skipped };
}

/* تشغيل مباشر من سطر الأوامر */
if (process.argv[1] && process.argv[1].endsWith("import-media.mjs")) {
  const FROM = process.argv[process.argv.indexOf("--from") + 1];
  if (!FROM || !existsSync(FROM)) { console.error("الاستخدام: node scripts/import-media.mjs --from <مجلد>"); process.exit(2); }
  await importMedia(FROM);
}
