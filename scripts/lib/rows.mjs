// تحويل صفوف الجدول إلى كائنات عقد البيانات، وقواعد الأعمدة المشتركة.
// القواعد: حقل نصي = عمودان x_ar/x_en، القوائم مفصولة بـ |، publish = نعم/لا.
export const YES = new Set(["نعم", "yes", "y", "true", "1", "✓"]);
export const isPublished = (r) => YES.has(String(r.publish ?? "نعم").trim().toLowerCase());
const s = (v) => (v == null ? "" : String(v).trim());
export const bi = (r, k) => { const a = s(r[`${k}_ar`]), e = s(r[`${k}_en`]); if (!a && !e) return undefined; const o = {}; if (a) o.ar = a; if (e) o.en = e; return o; };
export const list = (v) => s(v).split("|").map((x) => x.trim()).filter(Boolean);
export const biList = (r, k) => { const a = list(r[`${k}_ar`]), e = list(r[`${k}_en`]); const n = Math.max(a.length, e.length); if (!n) return undefined; return Array.from({ length: n }, (_, i) => { const o = {}; if (a[i]) o.ar = a[i]; if (e[i]) o.en = e[i]; return o; }); };
export const num = (v) => { const x = s(v); if (!x) return undefined; const n = Number(x); return isNaN(n) ? undefined : n; };
export const bool = (v) => YES.has(s(v).toLowerCase());
export const strOr = (v) => s(v) || undefined;
/* "label=href|label=href" → [{label:{ar},href}] ، و"label_ar~label_en=href" للثنائي */
export const pairs = (v) => list(v).map((x) => { const i = x.lastIndexOf("="); const label = i > 0 ? x.slice(0, i).trim() : x, href = i > 0 ? x.slice(i + 1).trim() : x; const [ar, en] = label.split("~").map((y) => y.trim()); const o = { label: {}, href }; if (ar) o.label.ar = ar; if (en) o.label.en = en; return o; });
/* "name_ar~name_en=lat,lon|…" → نقاط */
export const points = (v) => list(v).map((x) => { const [label, ll] = x.split("=").map((y) => y.trim()); const [lat, lon] = (ll || label).split(",").map(Number); const [ar, en] = (ll ? label : "").split("~"); const o = { name: {}, lat, lon }; if (ar) o.name.ar = ar.trim(); if (en) o.name.en = en.trim(); return o; }).filter((p) => !isNaN(p.lat) && !isNaN(p.lon));
/* "value=label_ar~label_en|…" → مقاييس */
export const metrics = (v) => list(v).map((x) => { const [value, label = ""] = x.split("=").map((y) => y.trim()); const [ar, en] = label.split("~"); const o = { value, label: {} }; if (ar) o.label.ar = ar.trim(); if (en) o.label.en = en.trim(); return o; });
export const clean = (o) => { for (const k of Object.keys(o)) { const v = o[k]; if (v === undefined || v === "" || (Array.isArray(v) && !v.length) || (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length)) delete o[k]; } return o; };

export const CONVERT = {
  projects: (r) => clean({ id: s(r.id), order: num(r.order), featured: bool(r.featured), added: strOr(r.added), title: bi(r, "title"), summary: bi(r, "summary"), categories: list(r.categories), type: strOr(r.type), course: strOr(r.course), year: num(r.year), status: strOr(r.status), role: bi(r, "role"), team: bi(r, "team"),
    location: clean({ name: bi(r, "location_name"), lat: num(r.lat), lon: num(r.lon), points: points(r.points) }), problem: bi(r, "problem"), method: bi(r, "method"), result: bi(r, "result"), tools: list(r.tools), skills: list(r.skills), metrics: metrics(r.metrics), links: pairs(r.links), gisLayers: list(r.gis_layers) }),
  certificates: (r) => clean({ id: s(r.id), added: strOr(r.added), title: bi(r, "title"), issuer: bi(r, "issuer"), date: strOr(r.date), category: strOr(r.category) || "other", credentialId: strOr(r.credential_id), verifyUrl: strOr(r.verify_url), skills: list(r.skills) }),
  skills: (r) => clean({ group: s(r.group), groupTier: strOr(r.group_tier), groupTitle: bi(r, "group_title"), id: s(r.id), name: bi(r, "name"), level: num(r.level), isTool: bool(r.is_tool) }),
  experience: (r) => clean({ id: s(r.id), role: bi(r, "role"), org: bi(r, "org"), type: strOr(r.type), start: strOr(r.start), end: strOr(r.end), location: bi(r, "location"), summary: bi(r, "summary"), bullets: biList(r, "bullets"), projects: list(r.projects), skills: list(r.skills) }),
  education: (r) => clean({ id: s(r.id), degree: bi(r, "degree"), institution: bi(r, "institution"), start: strOr(r.start), end: strOr(r.end), notes: bi(r, "notes") }),
  services: (r) => clean({ id: s(r.id), title: bi(r, "title"), description: bi(r, "description"), includes: biList(r, "includes"), priceFrom: num(r.price_from) ?? null, currency: strOr(r.currency) || "SAR", delivery: bi(r, "delivery"), icon: strOr(r.icon), skills: list(r.skills) }),
  testimonials: (r) => clean({ id: s(r.id), quote: bi(r, "quote"), name: bi(r, "name"), role: bi(r, "role"), date: strOr(r.date) }),
  gis: (r) => clean({ id: s(r.id), title: bi(r, "title"), description: bi(r, "description"), project: strOr(r.project), geometry: strOr(r.geometry), style: styleOf(r), popupFields: list(r.popup_fields), swipeWith: strOr(r.swipe_with), metadata: meta(r) }),
  datasets: (r) => clean({ id: s(r.id), title: bi(r, "title"), description: bi(r, "description"), project: strOr(r.project), license: strOr(r.license), source_layer: strOr(r.gis_layer), metadata: meta(r) }),
  stories: (r) => clean({ project: s(r.project), step: num(r.step), lat: num(r.lat), lon: num(r.lon), zoom: num(r.zoom), pitch: num(r.pitch), bearing: num(r.bearing), layers: list(r.layers), text: bi(r, "text") }),
  stats: (r) => clean({ id: s(r.id), value: strOr(r.value), unit: bi(r, "unit"), label: bi(r, "label"), source: bi(r, "source"), sourceUrl: strOr(r.source_url), date: strOr(r.date) }),
};
function meta(r) { return clean({ source: bi(r, "md_source"), crs: strOr(r.md_crs), date: strOr(r.md_date), accuracy: bi(r, "md_accuracy"), constraints: bi(r, "md_constraints") }); }
function styleOf(r) {
  const type = s(r.style_type) || "single";
  if (type === "categories") return { type, field: s(r.style_field), classes: list(r.style_classes).map((x) => { const [value, color, lab = ""] = x.split("=").map((y) => y.trim()); const [ar, en] = lab.split("~"); const o = { value, color, label: {} }; if (ar) o.label.ar = ar.trim(); if (en) o.label.en = en.trim(); return o; }) };
  if (type === "graduated") return { type, field: s(r.style_field), breaks: list(r.style_breaks).map(Number), colors: list(r.style_colors) };
  return clean({ type: "single", color: strOr(r.style_color), width: num(r.style_width), radius: num(r.style_radius), opacity: num(r.style_opacity) });
}
/* profile و settings: صف واحد مفتاح/قيمة (key, value_ar, value_en) */
export function kv(rows) { const o = {}; for (const r of rows) { const k = s(r.key); if (!k) continue; o[k] = { ar: s(r.value_ar), en: s(r.value_en), v: s(r.value ?? r.value_ar) }; } return o; }
export function profileFrom(rows) {
  const k = kv(rows); const b = (n) => (k[n] && (k[n].ar || k[n].en) ? clean({ ar: k[n].ar || undefined, en: k[n].en || undefined }) : undefined); const v = (n) => k[n]?.v || undefined;
  const langs = list(v("languages")).map((x) => { const [name, level = ""] = x.split("=").map((y) => y.trim()); const [na, ne] = name.split("~"), [la, le] = level.split("~"); return clean({ name: clean({ ar: na?.trim(), en: ne?.trim() }), level: clean({ ar: la?.trim(), en: le?.trim() }) }); });
  return clean({ name: b("name"), title: b("title"), tagline: b("tagline"), bio: b("bio"), location: b("location"), availability: clean({ open: bool(v("available")), note: b("availability_note") }), contact: clean({ email: v("email"), whatsapp: v("whatsapp"), linkedin: v("linkedin"), x: v("x"), github: v("github"), behance: v("behance") }), languages: langs, highlights: metrics(v("highlights")) });
}
export function settingsFrom(rows) {
  const k = kv(rows); const v = (n) => k[n]?.v || ""; const b = (n) => (k[n] && (k[n].ar || k[n].en) ? clean({ ar: k[n].ar || undefined, en: k[n].en || undefined }) : undefined);
  return clean({ defaultLang: v("default_lang") || "ar", siteUrl: v("site_url"), sections: list(v("sections")), formspreeId: v("formspree_id"), analytics: clean({ provider: v("analytics_provider"), id: v("analytics_id") }), bookingUrl: v("booking_url"), reviewBeforePublish: bool(v("review_before_publish")), seo: clean({ title: b("seo_title"), description: b("seo_description"), ogImage: v("og_image") || "media/og.png" }), presets: list(v("presets")).map((x) => { const [id, rest = ""] = x.split(":").map((y) => y.trim()); const [label = "", w = ""] = rest.split("="); const [la, le] = label.split("~"); const weights = {}; for (const kvp of w.split(",")) { const [g, n] = kvp.split(" ").filter(Boolean); if (g) weights[g] = Number(n) || 0; } return { id, label: clean({ ar: la?.trim(), en: le?.trim() }), weights }; }) });
}
