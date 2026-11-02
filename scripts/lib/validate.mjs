// التحقق من المحتوى قبل النشر. يعيد {errors, warnings} بالعربي.
import { existsSync } from "node:fs";
import { join } from "node:path";

const ok = (v) => v != null && (typeof v !== "object" || Object.keys(v).length) && v !== "";
export function validate(c, root = process.cwd()) {
  const errors = [], warnings = [];
  const skillIds = new Set(); for (const g of c.skills?.groups || []) for (const s of g.items || []) skillIds.add(s.id);
  const projIds = new Set((c.projects || []).map((p) => p.id)), gisIds = new Set((c.gis || []).map((g) => g.id));
  const uniq = (list, name) => { const seen = new Set(); for (const x of list || []) { if (!x.id) errors.push(`${name}: صف بلا معرّف id`); else if (seen.has(x.id)) errors.push(`${name}: المعرّف «${x.id}» مكرر`); seen.add(x.id); } };
  uniq(c.projects, "projects"); uniq(c.certificates, "certificates"); uniq(c.experience, "experience"); uniq(c.services, "services"); uniq(c.gis, "gis"); uniq(c.datasets, "datasets"); uniq(c.notes, "notes");
  const file = (p, where) => { if (p && p !== "request" && !/^https?:/.test(p) && !existsSync(join(root, p))) errors.push(`${where}: الملف «${p}» غير موجود`); };
  const skillsOf = (x, where) => { for (const s of x.skills || []) if (!skillIds.has(s)) errors.push(`${where}: المهارة «${s}» غير معرّفة في skills`); };
  for (const p of c.projects || []) { const w = `projects/${p.id}`; if (!ok(p.title)) errors.push(`${w}: العنوان title مطلوب`); if (!p.summary) warnings.push(`${w}: لا يوجد ملخص summary`); skillsOf(p, w);
    if (p.location && (p.location.lat != null || p.location.lon != null) && !(typeof p.location.lat === "number" && typeof p.location.lon === "number")) errors.push(`${w}: الإحداثيات lat/lon غير صالحة`);
    if (p.location && typeof p.location.lat === "number" && (Math.abs(p.location.lat) > 90 || Math.abs(p.location.lon) > 180)) errors.push(`${w}: الإحداثيات خارج النطاق`);
    file(p.cover, w); for (const g of p.gallery || []) file(g.src, w + "/gallery"); for (const s of p.slides || []) file(s.src, w + "/slides"); for (const f of p.files || []) file(f.href, w + "/files");
    for (const l of p.gisLayers || []) if (!gisIds.has(l)) errors.push(`${w}: الطبقة «${l}» غير معرّفة في gis`);
    for (const s of p.story || []) { if (typeof s.lat !== "number" || typeof s.lon !== "number") errors.push(`${w}/story: خطوة بلا إحداثيات`); for (const l of s.layers || []) if (!gisIds.has(l)) errors.push(`${w}/story: الطبقة «${l}» غير معرّفة`); } }
  for (const x of c.certificates || []) { const w = `certificates/${x.id}`; if (!ok(x.title)) errors.push(`${w}: العنوان مطلوب`); if (!x.image && !x.pdf) warnings.push(`${w}: لا توجد صورة ولا PDF للشهادة`); file(x.image, w); file(x.pdf, w); skillsOf(x, w); if (x.date && !/^\d{4}(-\d{2})?$/.test(x.date)) warnings.push(`${w}: التاريخ «${x.date}» ليس بصيغة YYYY-MM`); }
  for (const x of c.experience || []) { const w = `experience/${x.id}`; if (!ok(x.role)) errors.push(`${w}: الدور role مطلوب`); skillsOf(x, w); for (const p of x.projects || []) if (!projIds.has(p)) errors.push(`${w}: المشروع «${p}» غير موجود`); }
  for (const x of c.services || []) { const w = `services/${x.id}`; if (!ok(x.title)) errors.push(`${w}: العنوان مطلوب`); skillsOf(x, w); }
  for (const g of c.gis || []) { const w = `gis/${g.id}`; if (!g.src) errors.push(`${w}: لا يوجد ملف طبقة (ضع GeoJSON أو zip في Drive/gis/${g.id}/)`); else file(g.src, w); if (g.project && !projIds.has(g.project)) errors.push(`${w}: المشروع «${g.project}» غير موجود`); if (g.swipeWith && !gisIds.has(g.swipeWith)) errors.push(`${w}: طبقة المقارنة «${g.swipeWith}» غير موجودة`); if (g.style?.type === "graduated" && (!g.style.breaks?.length || !g.style.colors?.length)) errors.push(`${w}: التدرج يحتاج breaks وcolors`); }
  for (const d of c.datasets || []) { const w = `datasets/${d.id}`; if (!d.license) warnings.push(`${w}: لا يوجد ترخيص license`); for (const f of d.formats || []) file(f.href, w); }
  for (const s of c.stats || []) if (!ok(s.source)) errors.push(`stats/${s.id}: الرقم بلا مصدر، لن يُنشر`);
  for (const g of c.skills?.groups || []) for (const s of g.items || []) if (s.level != null && (s.level < 1 || s.level > 5)) errors.push(`skills/${s.id}: المستوى يجب أن يكون بين 1 و5`);
  if (!ok(c.profile?.name)) errors.push("profile: الاسم مطلوب");
  return { errors, warnings };
}
