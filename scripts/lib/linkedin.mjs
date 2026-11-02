// استيراد ملفات تصدير LinkedIn (CSV) من مجلد linkedin/ في Drive.
// لا يسحب أي صفحة من LinkedIn؛ يقرأ الملفات التي يصدّرها المستخدم بنفسه فقط.
export function parseCsv(text, { detectHeader = true } = {}) {
  const rows = []; let row = [], cell = "", q = false; text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; } else cell += ch; }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  // LinkedIn يضع أحياناً ملاحظات قبل الترويسة؛ نبحث عن أول صف فيه ترويسة معروفة
  const H = new Set(["company name", "title", "name", "school name", "started on", "start date", "url", "authority", "first name"]);
  const hi = detectHeader ? rows.findIndex((r) => r.some((c) => H.has(c.trim().toLowerCase()))) : 0;
  if (hi < 0) return [];
  const head = rows[hi].map((h) => h.trim());
  return rows.slice(hi + 1).filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}
const kind = (name) => { const n = name.toLowerCase(); if (/position|experience/.test(n)) return "positions"; if (/education/.test(n)) return "education"; if (/skill/.test(n)) return "skills"; if (/certif|license/.test(n)) return "certifications"; if (/^profile/.test(n)) return "profile"; return null; };
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
const ym = (s) => { if (!s) return ""; const m = String(s).match(/(\d{4})/); const mo = String(s).match(/^(\w{3})\s/); const MM = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" }; return m ? `${m[1]}${mo && MM[mo[1]] ? "-" + MM[mo[1]] : ""}` : ""; };
/* files: [{name, text}] → مسودات بصيغة صفوف الجدول (publish=لا) */
export function linkedinDrafts(files) {
  const out = { experience: [], education: [], certificates: [], skills: [] };
  for (const f of files) { const k = kind(f.name); if (!k) continue; const rows = parseCsv(f.text);
    if (k === "positions") for (const r of rows) out.experience.push({ id: `li-${slug(r["Company Name"] || r.Company)}-${slug(r.Title)}`, role_en: r.Title || "", org_en: r["Company Name"] || r.Company || "", type: "job", start: ym(r["Started On"]), end: r["Finished On"] ? ym(r["Finished On"]) : "present", location_en: r.Location || "", summary_en: r.Description || "", publish: "لا", source: "linkedin" });
    if (k === "education") for (const r of rows) out.education.push({ id: `li-${slug(r["School Name"] || r.School)}`, degree_en: [r["Degree Name"], r.Notes].filter(Boolean).join(" · "), institution_en: r["School Name"] || r.School || "", start: ym(r["Start Date"]), end: ym(r["End Date"]), publish: "لا", source: "linkedin" });
    if (k === "certifications") for (const r of rows) out.certificates.push({ id: `li-${slug(r.Name)}`, title_en: r.Name || "", issuer_en: r.Authority || "", date: ym(r["Started On"]), credential_id: r["License Number"] || "", verify_url: r.Url || "", category: "other", publish: "لا", source: "linkedin" });
    if (k === "skills") for (const r of rows) out.skills.push({ group: "linkedin", group_title_en: "Imported from LinkedIn", id: `li-${slug(r.Name)}`, name_en: r.Name || "", level: "3", publish: "لا", source: "linkedin" });
  }
  return out;
}
