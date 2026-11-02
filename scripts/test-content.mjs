// اختبار محلي بلا Google: صحة ملفات content/ + تحويل قالب الجدول (CSV) عبر قواعد الأعمدة + مستورد LinkedIn.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { validate } from "./lib/validate.mjs";
import { CONVERT, profileFrom, settingsFrom, isPublished } from "./lib/rows.mjs";
import { parseCsv, linkedinDrafts } from "./lib/linkedin.mjs";
const ROOT = process.cwd(); let bad = 0;
const J = (f) => JSON.parse(readFileSync(join(ROOT, "content", f + ".json"), "utf8"));
const c = {}; for (const f of readdirSync(join(ROOT, "content"))) if (f.endsWith(".json") && !f.startsWith("_")) c[f.replace(".json", "")] = J(f.replace(".json", ""));
const r = validate(c, ROOT); console.log("content/: errors", r.errors.length, "warnings", r.warnings.length); r.errors.forEach((e) => console.log("  ✗", e)); r.warnings.forEach((e) => console.log("  !", e));
// الخطأ المتوقع الوحيد: الإحصاء بلا مصدر (حالة اختبار متعمدة)
const expected = r.errors.filter((e) => e.includes("example-stat-no-source")); if (r.errors.length !== expected.length) bad++;
// تحويل القالب
const csv = (n) => parseCsv(readFileSync(join(ROOT, "templates/sheets", n + ".csv"), "utf8"), { detectHeader: false });
const out = { profile: profileFrom(csv("profile")), site: settingsFrom(csv("settings")) };
for (const t of ["projects", "certificates", "skills", "experience", "education", "services", "gis", "datasets", "stories", "stats"]) out[t] = csv(t).filter(isPublished).map(CONVERT[t]);
if (!out.projects[0].location?.points?.length || !out.projects[0].metrics?.length || !out.gis[1].style.classes?.length || out.site.presets?.length !== 3 || !out.profile.languages?.length) { console.log("✗ template conversion incomplete", JSON.stringify(out.projects[0]).slice(0, 300)); bad++; } else console.log("template conversion ok:", Object.entries(out).map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : "obj"}`).join(" "));
// LinkedIn
const li = linkedinDrafts([{ name: "Positions.csv", text: 'Company Name,Title,Description,Location,Started On,Finished On\n"Acme Planning","GIS Intern","Did maps","Jeddah","Jun 2025","Aug 2025"\n' }, { name: "Skills.csv", text: "Name\nArcGIS Pro\nPython\n" }, { name: "Certifications.csv", text: "Name,Url,Authority,Started On,Finished On,License Number\nGIS Basics,https://x.y/1,Esri,May 2024,,ABC\n" }]);
if (li.experience.length !== 1 || li.skills.length !== 2 || li.certificates.length !== 1 || li.experience[0].start !== "2025-06" || li.experience[0].publish !== "لا") { console.log("✗ linkedin import", JSON.stringify(li)); bad++; } else console.log("linkedin import ok (drafts, publish=لا)");
if (bad) { console.error("FAILED"); process.exit(1); } console.log("ALL CONTENT TESTS PASSED");
