#!/usr/bin/env node
// الفحص الأسبوعي: روابط مكسورة (محلية وخارجية) وأحجام الصور الكبيرة. يطبع تقريراً بالعربي ويخرج بـ 1 إن وُجدت مشاكل.
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd(), MAX_IMG = 400 * 1024, issues = [];
const J = (f) => { try { return JSON.parse(readFileSync(join(ROOT, "content", f + ".json"), "utf8")); } catch { return null; } };
const localRefs = new Set(), external = new Set();
const walk = (v, where) => { if (typeof v === "string") { if (/^https?:\/\//.test(v)) external.add(v); else if (/^(media|files|data)\//.test(v)) localRefs.add(v + "|" + where); } else if (Array.isArray(v)) v.forEach((x) => walk(x, where)); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, where + "." + k); };
for (const f of ["site", "profile", "projects", "certificates", "experience", "services", "gis", "datasets", "stats", "notes"]) walk(J(f), f);
for (const ref of localRefs) { const [p, where] = ref.split("|"); if (!existsSync(join(ROOT, p))) issues.push(`ملف مفقود: ${p} (${where})`); }
const scan = (d) => { if (!existsSync(d)) return; for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) scan(p); else if (/\.(webp|png|jpe?g|gif)$/i.test(f) && statSync(p).size > MAX_IMG) issues.push(`صورة كبيرة (${Math.round(statSync(p).size / 1024)} KB): ${p.replace(ROOT + "/", "")}`); } };
scan(join(ROOT, "media"));
const ctl = new AbortController(); setTimeout(() => ctl.abort(), 60000);
await Promise.all([...external].map(async (u) => { if (/example\.com/.test(u)) return; try { const r = await fetch(u, { method: "HEAD", redirect: "follow", signal: ctl.signal }); if (r.status >= 400) issues.push(`رابط خارجي مكسور (${r.status}): ${u}`); } catch { issues.push(`تعذّر الوصول: ${u}`); } }));
const md = issues.length ? `## الفحص الأسبوعي: ${issues.length} مشكلة\n\n${issues.map((i) => `- ${i}`).join("\n")}\n` : "## الفحص الأسبوعي: لا مشاكل ✅\n";
console.log(md); if (process.argv.includes("--out")) (await import("node:fs")).writeFileSync(process.argv[process.argv.indexOf("--out") + 1], md);
process.exit(issues.length ? 1 : 0);
