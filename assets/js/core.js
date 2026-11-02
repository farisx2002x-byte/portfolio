/* ─────────────────────────────────────────────
   النواة المشتركة: تحميل المحتوى، اللغة، الوضع، الشبكة،
   وأدوات DOM صغيرة. لا يوجد نص محتوى هنا، فقط نصوص واجهة.
   ───────────────────────────────────────────── */
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
root.classList.add("js");

/* ── نصوص الواجهة (عربي/إنجليزي) ── */
export const UI = {
  ar: {
    nav_model: "النموذج", nav_atlas: "الخريطة", on_map: "اعرضه على الخريطة", cert_list_view: "كل الشهادات كقائمة", lib_kicker: "00 · المكتبة", lib_h: "مكتبة <em>الأعمال</em>.", nav_library: "المكتبة", atlas_kicker: "00 · الأطلس", atlas_h: "خريطة <em>المشاريع</em>.", nav_about: "عني", nav_projects: "المشاريع", nav_skills: "المهارات", nav_certs: "الشهادات",
    nav_exp: "الخبرات", nav_gis: "مختبر GIS", nav_services: "الخدمات", nav_contact: "تواصل", nav_tools: "أدوات", nav_cv: "السيرة الذاتية", nav_notes: "الدفتر",
    theme: "تبديل الوضع الداكن والفاتح", lang: "EN", skip: "تخطّ إلى المحتوى",
    hero_kicker: "نموذج ملاءمة · Weighted Overlay", ask: "ماذا تبحث عنه؟", custom: "أحدد الأوزان بنفسي",
    available: "متاح لمشاريع جديدة", unavailable: "مشغول حالياً",
    model_kicker: "01 · الطبقات والأوزان", model_h: "رتّب أعمالي <em>حسب ما تحتاجه</em>.",
    model_lead: "كل مهارة معيار بوزن، وكل مشروع موقع مرشّح. حرّك الأوزان فيتغيّر الترتيب — كما في تحليل الملاءمة الحقيقي.",
    weights_h: "أوزان المعايير", weights_sub: "من 0 (مهمل) إلى 5 (حاسم)", reset: "أوزان متساوية", equal: "متساوية",
    overlay_h: "التراكب المرجّح", overlay_sub: "كل صف معيار، وكل عمود مشروع. الصف الأخير هو الناتج.",
    total: "الناتج", legend_low: "منخفض", legend_high: "مرتفع", eq: "النتيجة = Σ (الوزن × المطابقة) ÷ Σ الوزن × 100",
    ranked_h: "المشاريع مرتبة بالملاءمة", all: "الكل", why: "لماذا هذه الدرجة؟", show_more: "عرض الباقي", show_less: "عرض أقل",
    fit: "ملاءمة لطلبك", no_projects: "لا توجد مشاريع بهذا التصنيف.",
    cat: { planning: "تخطيط", transport: "نقل", gis: "GIS", "urban-design": "تصميم حضري", regional: "إقليمي", geomatics: "جيوماتكس", digital: "رقمي", heritage: "تراث", design: "تصميم", sustainability: "استدامة" },
    type: { graduation: "مقرر التخرج URP477", course: "مشروع مقرر", personal: "مشروع شخصي", freelance: "عمل حر", competition: "مسابقة" },
    status: { completed: "مكتمل", "in-progress": "قيد التنفيذ" },
    now_kicker: "02 · الآن", now_h: "أعمل الآن <em>مع</em>", now_lead: "عملان مستمران إلى جانب الدراسة، والعدّاد يحسب المدة من بداية كل عقد إلى اليوم.", about_kicker: "02 · المحلل", about_h: "مخطط يفكر بالخرائط <em>ويكتب الكود</em>.", languages: "اللغات", highlights: "أرقام",
    skills_kicker: "03 · المعايير", skills_h: "المهارات، <em>والدليل خلفها</em>.", skills_lead: "كل مهارة معيار في النموذج. اضغط الدليل لترى المشاريع والشهادات التي تثبتها.",
    core: "أساسي", support: "مساند", tools_h: "الأدوات", evidence_projects: "مشروع", evidence_certs: "شهادة", evidence_exp: "خبرة", level: "المستوى",
    certs_kicker: "05 · التحقق", certs_h: "الشهادات <em>كمصادر تحقق</em>.", cert_cat: { honors: "تكريم", volunteer: "تطوع", gis: "GIS", planning: "تخطيط", software: "برمجيات", language: "لغة", professional: "مهني", other: "أخرى" },
    verify: "تحقق", pdf: "PDF", covers: "تغطي", credential: "المعرّف", cert_nofile: "الملف غير منشور حماية للبيانات الشخصية", req_title: "طلب إذن التحميل", req_p: "الملفات لا تُحمَّل مباشرة من الموقع. اكتب بياناتك وسبب الطلب، وبعد الموافقة أرسل لك الملف على بريدك أو واتسابك.", req_file: "الملف المطلوب", req_why: "سبب الطلب", req_why_ph: "مثال: أدرس حالة مشابهة وأرغب في الاطلاع على المنهجية", req_send: "أرسل الطلب", req_sent: "وصل طلبك، وسأرد عليك بعد المراجعة.", req_mail: "سيُفتح بريدك لإرسال الطلب.", gate_tag: "بإذن", req_need: "اكتب اسمك ووسيلة تواصل.", guide_h: "كيف تستخدم هذه الصفحة؟", guide_1: "اختر ما تبحث عنه من الأزرار في الأعلى، أو حرّك المنزلقات بنفسك.", guide_2: "الموقع يعيد ترتيب المشاريع فوراً حسب الأقرب لطلبك، ويعطي كل مشروع درجة من 100.", guide_3: "افتح أي مشروع لتتصفح ملخصه صفحة صفحة، ثم اطلب العرض الكامل إن أردت.", guide_plain: "ببساطة: هذا الموقع يرتّب أعمالي حسب حاجتك، بالطريقة نفسها التي يرتّب بها المخططون المواقع المناسبة لمشروع ما.", posters_kicker: "04 · اللوحات", posters_h: "البوسترات <em>واللوحات</em>.", posters_lead: "لوحات المشاريع والبوسترات بحجمها الأصلي؛ ما لا يُنشر منها يُعرض ملخصه.", poster_kinds: { poster: "بوستر", board: "لوحة", hand: "لوحات يدوية" }, poster_withheld: "لا يُنشر", view_project: "المشروع", request_full: "اطلب العرض الكامل", full_on_request: "العرض الكامل عند الطلب", full_pages: "صفحة", summary_pdf: "ملخص المشروع (PDF)", team_note: "عمل جماعي: يُعرض دوري فقط، ولا تُنشر صور الزملاء أو أسماؤهم.", no_summary_yet: "قيد العمل: لا ملخص منشور بعد.", level_unset: "المستوى غير محدد بعد",
    exp_kicker: "06 · خط الرحلة", exp_h: "محطات <em>الرحلة</em>.", exp_lead: "كل محطة تاريخ: دراسة أو عمل أو تطوع أو تكريم. مرّر على محطة لتقرأها، والتفاصيل الكاملة تحتها.", exp_details: "التفاصيل الكاملة", exp_types: { training: "تدريب", job: "وظيفة", volunteer: "تطوع", freelance: "عمل حر" }, present: "حتى الآن", expected: "التخرج المتوقع", education: "التعليم", experience: "الخبرات والتدريب",
    gis_kicker: "07 · مختبر GIS", gis_h: "طبقات حية، <em>لا صور ثابتة</em>.", gis_lead: "خرائط ويب تفاعلية لطبقات المشاريع، مع مفتاح تلقائي ونافذة بيانات وشريط مقارنة.",
    layers: "الطبقات", metadata: "بطاقة البيانات الوصفية", swipe: "مقارنة", tilt: "عرض مائل ثلاثي الأبعاد", fit_layers: "ملاءمة العرض للطبقات",
    md_source: "المصدر", md_crs: "نظام الإحداثيات", md_date: "التاريخ", md_acc: "الدقة", md_con: "القيود", map_unavail: "تعذّر تحميل خريطة الأساس (يلزم اتصال بالإنترنت).",
    stats_kicker: "08 · أرقام مرجعية", stats_h: "قبل أي مخطط: <em>الأرقام</em>.", stats_lead: "إحصاءات عامة ذات صلة بالتخطيط، ولكل رقم مصدره وتاريخه.", source: "المصدر",
    ds_kicker: "09 · بيانات مفتوحة", ds_h: "بيانات <em>للتنزيل</em>.", ds_lead: "مجموعات البيانات التي أتيحها بترخيص واضح.", download: "تنزيل", license: "الترخيص",
    notes_kicker: "10 · دفتر المخطط", notes_h: "ملاحظات <em>ومقالات قصيرة</em>.", read_min: "دقائق قراءة", related_projects: "مشاريع مرتبطة",
    services_kicker: "11 · الوجهة", services_h: "الخدمة <em>الأنسب لطلبك</em>.", services_lead: "الخدمات أدناه مرتبة بالأوزان نفسها التي اخترتها في النموذج.", recommended: "الأنسب لك", order: "اطلب", from: "يبدأ من", on_request: "السعر حسب الطلب", delivery: "التسليم",
    testi_kicker: "12 · آراء", testi_h: "ما قاله <em>من عملت معهم</em>.",
    contact_kicker: "13 · لنبدأ", contact_h: "لنعمل <em>معاً</em>.", name: "الاسم", phone: "الجوال أو البريد", service: "نوع الخدمة", details: "التفاصيل", other: "شيء آخر", send: "أرسل الطلب",
    name_ph: "اسمك الكريم", phone_ph: "05xxxxxxxx أو بريدك", details_ph: "صف ما تحتاجه والموعد المطلوب",
    wa_h: "الأسرع: واتساب", wa_p: "رسالة جاهزة تذكر الخدمة التي اخترتها.", wa_btn: "افتح واتساب", wa_msg: "السلام عليكم، أرغب في طلب خدمة: {service}.",
    form_demo: "عند الإرسال يُفتح بريدك برسالة جاهزة، أو تواصل مباشرة عبر واتساب.", form_sent: "تم إرسال الطلب، شكراً لك.", form_err: "تعذّر الإرسال، جرّب واتساب.", form_req: "أدخل الاسم ووسيلة التواصل.",
    booking: "احجز موعداً", vcard: "بطاقة عمل (vCard)", qr_cv: "رمز QR لصفحة السيرة", qr_this: "رمز QR لهذه الصفحة", copy_link: "نسخ الرابط", copied: "تم النسخ",
    based_in: "المقر", remote: "أعمل عن بُعد مع أي مدينة", last_update: "آخر تحديث", new: "جديد", owner: "المالك", nav: "الأعلى", rev: "النسخة",
    project: "المشروع", projects: "المشاريع", back: "كل المشاريع", summary: "الملخص", problem: "المشكلة", method: "المنهجية", result: "النتيجة", location: "الموقع", gallery: "معرض الصور", deck: "عرض مصغر", files: "الملفات المرفقة", links: "روابط", tools_skills: "الأدوات والمهارات", prev: "السابق", next: "التالي", year: "السنة", course: "المقرر", role: "الدور", team: "الفريق", print_case: "طباعة دراسة الحالة", live_map: "خريطة حية", story: "القصة بالتمرير", of: "من",
    cv_title: "السيرة الذاتية", cv_print: "طباعة / حفظ PDF", cv_download: "تنزيل ملف CV", cv_skills: "المهارات", cv_tools: "الأدوات", cv_projects: "مشاريع مختارة", cv_certs: "الشهادات",
    not_found: "لم يتم العثور على هذا العنصر.", loading: "جارٍ التحميل…",
  },
  en: {
    nav_model: "Model", nav_atlas: "Map", on_map: "Show on the map", cert_list_view: "All certificates as a list", lib_kicker: "00 · Library", lib_h: "The <em>library</em>.", nav_library: "Library", atlas_kicker: "00 · Atlas", atlas_h: "The project <em>atlas</em>.", nav_about: "About", nav_projects: "Projects", nav_skills: "Skills", nav_certs: "Certificates",
    nav_exp: "Experience", nav_gis: "GIS Lab", nav_services: "Services", nav_contact: "Contact", nav_tools: "Tools", nav_cv: "CV", nav_notes: "Notes",
    theme: "Toggle dark / light mode", lang: "ع", skip: "Skip to content",
    hero_kicker: "Suitability model · Weighted Overlay", ask: "What are you looking for?", custom: "Set my own weights",
    available: "Available for new projects", unavailable: "Currently busy",
    model_kicker: "01 · Layers & weights", model_h: "Rank my work <em>by what you need</em>.",
    model_lead: "Every skill is a weighted criterion; every project a candidate site. Move the weights and the ranking changes — as in a real suitability analysis.",
    weights_h: "Criteria weights", weights_sub: "0 (ignored) to 5 (decisive)", reset: "Equal weights", equal: "equal",
    overlay_h: "Weighted overlay", overlay_sub: "Each row is a criterion, each column a project. The last row is the output.",
    total: "Output", legend_low: "low", legend_high: "high", eq: "score = Σ (weight × match) ÷ Σ weight × 100",
    ranked_h: "Projects ranked by suitability", all: "All", why: "Why this score?", show_more: "Show more", show_less: "Show less",
    fit: "fit to your request", no_projects: "No projects in this category.",
    cat: { planning: "Planning", transport: "Transport", gis: "GIS", "urban-design": "Urban design", regional: "Regional", geomatics: "Geomatics", digital: "Digital", heritage: "Heritage", design: "Design", sustainability: "Sustainability" },
    type: { graduation: "Graduation course URP477", course: "Course project", personal: "Personal project", freelance: "Freelance", competition: "Competition" },
    status: { completed: "Completed", "in-progress": "In progress" },
    now_kicker: "02 · Now", now_h: "Currently working <em>with</em>", now_lead: "Two ongoing roles alongside my studies; the counter measures each from its start to today.", about_kicker: "02 · The analyst", about_h: "A planner who thinks in maps <em>and writes code</em>.", languages: "Languages", highlights: "Numbers",
    skills_kicker: "03 · Criteria", skills_h: "Skills, <em>and the evidence behind them</em>.", skills_lead: "Every skill is a criterion in the model. Open the evidence to see the projects and certificates that back it.",
    core: "core", support: "support", tools_h: "Tools", evidence_projects: "project(s)", evidence_certs: "certificate(s)", evidence_exp: "experience", level: "level",
    certs_kicker: "05 · Verification", certs_h: "Certificates <em>as verification sources</em>.", cert_cat: { honors: "Honours", volunteer: "Volunteering", gis: "GIS", planning: "Planning", software: "Software", language: "Language", professional: "Professional", other: "Other" },
    verify: "Verify", pdf: "PDF", covers: "Covers", credential: "Credential", cert_nofile: "File not published to protect personal data", req_title: "Request download permission", req_p: "Files are not downloaded directly. Leave your details and the reason, and I will send the file by email or WhatsApp after approval.", req_file: "Requested file", req_why: "Reason", req_why_ph: "e.g. I am studying a similar case and would like to see the method", req_send: "Send request", req_sent: "Request received — I will reply after review.", req_mail: "Your mail app will open to send the request.", gate_tag: "on request", req_need: "Please add your name and a contact.", guide_h: "How to use this page", guide_1: "Pick what you are looking for from the buttons above, or move the sliders yourself.", guide_2: "The site instantly re-orders my projects by fit and scores each one out of 100.", guide_3: "Open any project to flip through its summary, then request the full deck if you need it.", guide_plain: "In short: this site ranks my work by your need — the same way planners rank suitable sites for a project.", posters_kicker: "04 · Boards", posters_h: "Posters <em>and boards</em>.", posters_lead: "Project boards and posters at original size; withheld ones show their summary instead.", poster_kinds: { poster: "Poster", board: "Board", hand: "Hand-drawn" }, poster_withheld: "Withheld", view_project: "Project", request_full: "Request the full deck", full_on_request: "Full deck on request", full_pages: "pages", summary_pdf: "Project summary (PDF)", team_note: "Team project: only my role is shown; no teammates’ photos or names are published.", no_summary_yet: "In progress: no summary published yet.", level_unset: "Level not set yet",
    exp_kicker: "06 · The journey line", exp_h: "Stations of <em>the journey</em>.", exp_lead: "Every station is a date: study, work, volunteering or an honour. Hover a station to read it; full details below.", exp_details: "Full details", exp_types: { training: "Training", job: "Job", volunteer: "Volunteer", freelance: "Freelance" }, present: "present", expected: "Expected graduation", education: "Education", experience: "Experience & training",
    gis_kicker: "07 · GIS Lab", gis_h: "Live layers, <em>not static images</em>.", gis_lead: "Interactive web maps of project layers, with an automatic legend, feature popups and a swipe comparison.",
    layers: "Layers", metadata: "Metadata card", swipe: "Swipe", tilt: "Tilted 3D view", fit_layers: "Fit to layers",
    md_source: "Source", md_crs: "CRS", md_date: "Date", md_acc: "Accuracy", md_con: "Constraints", map_unavail: "The basemap could not load (internet connection required).",
    stats_kicker: "08 · Reference numbers", stats_h: "Before any plan: <em>the numbers</em>.", stats_lead: "Planning-related public statistics, each with its source and date.", source: "Source",
    ds_kicker: "09 · Open data", ds_h: "Data <em>for download</em>.", ds_lead: "Datasets I publish under a clear licence.", download: "Download", license: "Licence",
    notes_kicker: "10 · Planner's notebook", notes_h: "Notes <em>and short articles</em>.", read_min: "min read", related_projects: "Related projects",
    services_kicker: "11 · Destination", services_h: "The service <em>that fits your request</em>.", services_lead: "Services below are ordered by the same weights you chose in the model.", recommended: "Best fit", order: "Request", from: "From", on_request: "Price on request", delivery: "Delivery",
    testi_kicker: "12 · Testimonials", testi_h: "What <em>clients said</em>.",
    contact_kicker: "13 · Let's start", contact_h: "Let's work <em>together</em>.", name: "Name", phone: "Phone or email", service: "Service", details: "Details", other: "Something else", send: "Send request",
    name_ph: "Your name", phone_ph: "05xxxxxxxx or your email", details_ph: "Describe what you need and the deadline",
    wa_h: "Fastest: WhatsApp", wa_p: "A ready message mentioning the service you chose.", wa_btn: "Open WhatsApp", wa_msg: "Hello, I would like to request: {service}.",
    form_demo: "Sending opens your mail app with a ready message, or reach me on WhatsApp.", form_sent: "Request sent, thank you.", form_err: "Could not send, try WhatsApp.", form_req: "Enter your name and a contact.",
    booking: "Book a meeting", vcard: "Business card (vCard)", qr_cv: "QR code for the CV page", qr_this: "QR code for this page", copy_link: "Copy link", copied: "Copied",
    based_in: "Based in", remote: "Working remotely with any city", last_update: "Last update", new: "New", owner: "Owner", nav: "Top", rev: "Revision",
    project: "Project", projects: "Projects", back: "All projects", summary: "Summary", problem: "Problem", method: "Method", result: "Result", location: "Location", gallery: "Gallery", deck: "Mini deck", files: "Attached files", links: "Links", tools_skills: "Tools & skills", prev: "Previous", next: "Next", year: "Year", course: "Course", role: "Role", team: "Team", print_case: "Print case study", live_map: "Live map", story: "Scroll story", of: "of",
    cv_title: "Curriculum Vitae", cv_print: "Print / Save PDF", cv_download: "Download CV file", cv_skills: "Skills", cv_tools: "Tools", cv_projects: "Selected projects", cv_certs: "Certificates",
    not_found: "This item was not found.", loading: "Loading…",
  }
};

/* ── الحالة ── */
export const state = { lang: "ar", content: null, graph: null };
export const t = (k) => { const d = UI[state.lang] || UI.ar; return k.split(".").reduce((o, p) => (o && o[p] != null ? o[p] : null), d) ?? k; };
/* نص ثنائي اللغة: يعرض لغة الواجهة، ويعود للعربية إن غابت */
export const L = (o) => { if (o == null) return ""; if (typeof o !== "object") return String(o); return (o[state.lang] && String(o[state.lang]).trim()) || o.ar || o.en || ""; };
/* هل الحقل موجود فعلاً؟ (نص فارغ أو مصفوفة فارغة أو {ar:"",en:""} = غائب) */
export const has = (v) => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") { if ("ar" in v || "en" in v) return !!(String(v.ar || "").trim() || String(v.en || "").trim()); return Object.keys(v).length > 0; }
  return true;
};
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const el = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v != null) e.setAttribute(k, v); } if (html) e.innerHTML = html; return e; };
export const pad2 = (n) => String(n).padStart(2, "0");
export const fmtDate = (s) => { if (!s) return ""; if (s === "present") return t("present"); const [y, m] = String(s).split("-"); if (!m) return y; return state.lang === "ar" ? `${m}/${y}` : `${y}-${m}`; };
export const isNew = (d) => d && (Date.now() - new Date(d).getTime()) < 30 * 86400000;
export const base = () => { const p = location.pathname; return p.includes("/projects/") ? "../" : ""; };

/* ── الوضع الداكن/الفاتح ── */
export function initTheme() {
  try { const s = localStorage.getItem("fa-theme"); if (s) root.dataset.theme = s; } catch {}
  $$("[data-theme-btn]").forEach((b) => b.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem("fa-theme", root.dataset.theme); } catch {}
    document.dispatchEvent(new CustomEvent("themechange"));
  }));
}

/* ── اللغة ── */
export function initLang(defaultLang = "ar") {
  let lang = defaultLang;
  const q = new URLSearchParams(location.search).get("lang");
  try { lang = q || localStorage.getItem("fa-lang") || defaultLang; } catch { lang = q || defaultLang; }
  setLang(lang, false);
  $$("[data-lang-btn]").forEach((b) => b.addEventListener("click", () => setLang(state.lang === "ar" ? "en" : "ar")));
}
export function setLang(lang, rerender = true) {
  state.lang = lang === "en" ? "en" : "ar";
  root.lang = state.lang; root.dir = state.lang === "ar" ? "rtl" : "ltr";
  try { localStorage.setItem("fa-lang", state.lang); } catch {}
  $$("[data-lang-btn]").forEach((b) => (b.textContent = t("lang")));
  $$("[data-theme-btn]").forEach((b) => b.setAttribute("aria-label", t("theme")));
  if (rerender) document.dispatchEvent(new CustomEvent("langchange"));
}

/* ── تحميل المحتوى ── */
const FILES = ["site", "profile", "projects", "posters", "certificates", "skills", "experience", "education", "services", "testimonials", "gis", "datasets", "stats", "notes", "meta"];
export async function loadContent() {
  if (state.content) return state.content;
  const b = base();
  const out = {};
  await Promise.all(FILES.map(async (f) => {
    try { const r = await fetch(`${b}content/${f}.json`, { cache: "no-cache" }); out[f] = r.ok ? await r.json() : null; } catch { out[f] = null; }
  }));
  // قيم افتراضية آمنة
  out.site ??= {}; out.profile ??= {}; out.projects = (out.projects || []).filter((p) => p && p.id && p.title).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  out.posters = (out.posters || []).filter((x) => x && x.id && x.title);
  out.certificates = (out.certificates || []).filter((c) => c && c.id && c.title).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  out.skills ??= { groups: [], tools: [] }; out.skills.groups ??= []; out.skills.tools ??= [];
  out.experience = (out.experience || []).filter((e) => e && e.id).sort((a, b) => String(b.start || "").localeCompare(String(a.start || "")));
  out.education = (out.education || []).filter((e) => e && e.id).sort((a, b) => String(b.start || "").localeCompare(String(a.start || "")));
  out.services = (out.services || []).filter((s) => s && s.id && s.title);
  out.testimonials = (out.testimonials || []).filter((x) => x && (x.quote || x.text));
  out.gis = (out.gis || []).filter((g) => g && g.id && g.src);
  out.datasets = (out.datasets || []).filter((d) => d && d.id && d.title);
  out.stats = (out.stats || []).filter((s) => s && s.id && s.value != null && has(s.source)); // لا رقم بلا مصدر
  out.notes = (out.notes || []).filter((n) => n && n.id && n.title);
  out.meta ??= {};
  state.content = out; state.graph = buildGraph(out);
  return out;
}

/* ── شبكة الربط: المهارة ↔ المشروع/الشهادة/الخبرة/الخدمة ── */
export function buildGraph(c) {
  const skills = new Map(); const groupOf = new Map();
  for (const g of c.skills.groups) for (const s of g.items || []) { skills.set(s.id, { ...s, group: g.id, groupTitle: g.title, projects: [], certificates: [], experience: [], services: [] }); groupOf.set(s.id, g.id); }
  const link = (list, key) => { for (const item of list) for (const sid of item.skills || []) { const s = skills.get(sid); if (s) s[key].push(item.id); } };
  link(c.projects, "projects"); link(c.certificates, "certificates"); link(c.experience, "experience"); link(c.services, "services");
  const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
  return { skills, groupOf, projects: byId(c.projects), certificates: byId(c.certificates), experience: byId(c.experience), services: byId(c.services), gis: byId(c.gis), notes: byId(c.notes) };
}

/* ── الشريط العلوي والتذييل (مشتركان) ── */
export function renderNav(active = "") {
  const c = state.content, b = base();
  const name = L(c.profile.name) || "—", title = L(c.profile.title);
  const secs = c.site.sections || [];
  const links = [];
  const here = active === "home"; const add = (id, label, href) => links.push(`<a href="${here && href.includes("index.html#") ? "#" + href.split("#")[1] : href}">${esc(label)}</a>`);
  if (secs.includes("model") && c.projects.length) add("model", t("nav_model"), `${b}index.html#model`);
  if (secs.includes("atlas") && c.projects.some((p) => p.location && typeof p.location.lat === "number")) add("atlas", t("nav_atlas"), `${b}index.html#atlas`);
  if (c.projects.length) add("projects", t("nav_projects"), `${b}index.html#projects`);
  if (secs.includes("library") && c.projects.length) add("library", t("nav_library"), `${b}index.html#library-sec`);
  if (c.skills.groups.length) add("skills", t("nav_skills"), `${b}index.html#skills`);
  if (c.certificates.length) add("certificates", t("nav_certs"), `${b}index.html#certificates`);
  if (c.gis.length && secs.includes("gis")) add("gis", t("nav_gis"), `${b}index.html#gis`);
  if (c.services.length) add("services", t("nav_services"), `${b}index.html#services`);
  if (c.site.showTools) add("tools", t("nav_tools"), `${b}tools.html`); add("cv", t("nav_cv"), `${b}cv.html`);
  const host = $("#nav-host"); if (!host) return;
  host.innerHTML = `<div class="wrap"><nav class="nav" aria-label="${state.lang === "ar" ? "القائمة الرئيسية" : "Main navigation"}">
    <a class="brand" href="${b}index.html"><img class="mark" src="${b}media/logo.svg" alt="" width="38" height="38" decoding="async"><span><strong>${esc(name)}</strong>${title ? `<small>${esc(title)}</small>` : ""}</span></a>
    <div class="nav-links">${links.join("")}</div>
    <div class="nav-tools">
      <a class="btn btn-primary btn-sm" href="${b}index.html#contact">${t("nav_contact")}</a>
      <button class="icon-btn lang-btn" type="button" data-lang-btn aria-label="Switch language">${t("lang")}</button>
      <button class="icon-btn" type="button" data-theme-btn aria-label="${t("theme")}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <button class="icon-btn menu-btn" type="button" data-menu aria-label="${state.lang === "ar" ? "القائمة" : "Menu"}" aria-expanded="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div></nav><div class="nav-sheet" id="nav-sheet" hidden><button class="icon-btn sheet-close" type="button" data-sheet-close aria-label="close">✕</button><div class="sheet-links">${links.join("")}<a class="sheet-tour" href="#tour" data-sheet-tour>▸ ${state.lang === "ar" ? "ابدأ الجولة" : "Start the tour"}</a></div></div></div>`;
  $$("[data-lang-btn]", host).forEach((btn) => btn.addEventListener("click", () => setLang(state.lang === "ar" ? "en" : "ar")));
  $$("[data-theme-btn]", host).forEach((btn) => btn.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem("fa-theme", root.dataset.theme); } catch {}
    document.dispatchEvent(new CustomEvent("themechange"));
  }));
  const mb = $("[data-menu]", host), sheet = $("#nav-sheet", host);
  if (mb && sheet) { const toggle = (open) => { sheet.hidden = !open; mb.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("menu-open", open); };
    mb.addEventListener("click", () => toggle(sheet.hidden)); $$("a", sheet).forEach((a) => a.addEventListener("click", (e) => { toggle(false); if (a.dataset.sheetTour !== undefined) { e.preventDefault(); const tb = $("#tour-btn"); if (tb) setTimeout(() => tb.click(), 250); } })); $("[data-sheet-close]", sheet).addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) toggle(false); }); }
}
export function renderFooter() {
  const c = state.content, f = $("#footer-host"); if (!f) return;
  const name = L(c.profile.name) || "—";
  const upd = c.meta?.lastSync ? new Date(c.meta.lastSync) : null;
  f.innerHTML = `<div class="wrap"><div class="fblock">
    <div><small>${t("owner").toUpperCase()}</small><b>${esc(name)}</b></div>
    <div><small>${t("last_update").toUpperCase()}</small><b class="updated">${upd ? upd.toISOString().slice(0, 10) : "—"}</b></div>
    <div><small>${t("rev").toUpperCase()}</small><b>© ${new Date().getFullYear()}</b></div>
    <div><small>NAV</small><b><a href="#top">↑ ${esc(t("nav"))}</a></b></div></div></div>`;
}
export function renderFab() {
  const c = state.content; const wa = c.profile.contact?.whatsapp; if (!wa) return;
  const a = el("a", { class: "fab", href: `https://wa.me/${wa.replace(/\D/g, "")}`, target: "_blank", rel: "noopener", "aria-label": "WhatsApp" }, `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z"/></svg>`);
  $(".fab")?.remove(); document.body.appendChild(a);
}

/* ── توست ومودال ── */
let toastT;
export function toast(msg) { let e = $("#toast"); if (!e) { e = el("div", { id: "toast", class: "toast", role: "status" }); document.body.appendChild(e); } e.textContent = msg; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (e.hidden = true), 2800); }
export function openModal(html) {
  closeModal();
  const m = el("div", { class: "modal", id: "modal", role: "dialog", "aria-modal": "true" }, `<div class="mcard"><button class="icon-btn mclose" type="button" aria-label="Close">✕</button>${html}</div>`);
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".mclose")) closeModal(); });
  document.body.appendChild(m); document.body.style.overflow = "hidden";
  const onKey = (e) => { if (e.key === "Escape") closeModal(); }; document.addEventListener("keydown", onKey); m._onKey = onKey;
  $(".mclose", m).focus();
}
export function closeModal() { const m = $("#modal"); if (!m) return; document.removeEventListener("keydown", m._onKey); m.remove(); document.body.style.overflow = ""; }

/* ── كشف تدريجي ── */
export function initReveal() {
  if (reduce || !("IntersectionObserver" in window)) { $$(".rv").forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  $$(".rv").forEach((e) => io.observe(e));
}

/* ── خلفية راستر خافتة (canvas) تتنفس ببطء ── */
export function initRasterBg() {
  const host = $(".raster-bg"); if (!host) return;
  const cv = el("canvas"); host.appendChild(cv); const ctx = cv.getContext("2d");
  const cols = ["#2A1E5C", "#2D6F8E", "#28A085", "#C9B23A", "#FFF3C4"];
  let W, H, t0 = 0;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const draw = (tm) => {
    const s = 28, cx = Math.ceil(W / s), cy = Math.ceil(H / s); ctx.clearRect(0, 0, W, H);
    for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
      const v = (Math.sin(i * .35 + tm) * Math.cos(j * .41 - tm * .7) + Math.sin((i + j) * .18 + tm * .4)) / 2;
      if (v < 0.25) continue; const k = Math.min(4, Math.floor((v - .25) / .75 * 5));
      ctx.fillStyle = cols[k]; ctx.globalAlpha = .035 + k * .012; ctx.fillRect(i * s, j * s, s - 2, s - 2);
    }
  };
  size(); draw(0); addEventListener("resize", () => { size(); draw(t0); });
  if (!reduce) { let last = 0; const loop = (ts) => { if (ts - last > 120) { t0 = ts / 9000; draw(t0); last = ts; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
}

/* ── QR و vCard ── */
export async function drawQR(canvas, text) {
  if (!window.QRCode) { await new Promise((res, rej) => { const s = el("script", { src: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" }); s.onload = res; s.onerror = rej; document.head.appendChild(s); }).catch(() => null); }
  if (!window.QRCode) return false;
  const tmp = el("div"); new window.QRCode(tmp, { text, width: 240, height: 240, correctLevel: window.QRCode.CorrectLevel.M });
  const img = tmp.querySelector("canvas") || tmp.querySelector("img");
  if (img && img.tagName === "CANVAS") { canvas.width = 240; canvas.height = 240; canvas.getContext("2d").drawImage(img, 0, 0); return true; }
  return false;
}
export function vcard() {
  const p = state.content.profile, c = p.contact || {};
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${L(p.name)}`, `N:${L(p.name)};;;;`, p.title ? `TITLE:${L(p.title)}` : "", c.email ? `EMAIL:${c.email}` : "", c.whatsapp ? `TEL;TYPE=CELL:+${c.whatsapp.replace(/\D/g, "")}` : "", c.linkedin ? `URL:${c.linkedin}` : "", `URL:${location.origin}${location.pathname.replace(/[^/]*$/, "")}`, "END:VCARD"].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard" }); const a = el("a", { href: URL.createObjectURL(blob), download: "contact.vcf" }); document.body.appendChild(a); a.click(); a.remove();
}

/* ── SEO: JSON-LD + تحليلات ── */
export function injectJsonLd(obj) { $("#jsonld")?.remove(); const s = el("script", { type: "application/ld+json", id: "jsonld" }); s.textContent = JSON.stringify(obj); document.head.appendChild(s); }
export function personLd() {
  const p = state.content.profile, c = p.contact || {};
  return { "@context": "https://schema.org", "@type": "Person", name: L(p.name), jobTitle: L(p.title), description: L(p.bio), image: p.photo ? new URL(base() + p.photo, location.href).href : undefined, email: c.email || undefined, sameAs: [c.linkedin, c.x, c.github, c.behance].filter(Boolean), address: L(p.location) ? { "@type": "PostalAddress", addressLocality: L(p.location) } : undefined };
}
export function initAnalytics() {
  const a = state.content.site.analytics; if (!a || !a.id) return;
  if (a.provider === "cloudflare") document.head.appendChild(el("script", { defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": JSON.stringify({ token: a.id }) }));
  if (a.provider === "goatcounter") document.head.appendChild(el("script", { async: "", src: "https://gc.zgo.at/count.js", "data-goatcounter": `https://${a.id}.goatcounter.com/count` }));
}
export function setMeta(title, desc, image) {
  if (title) document.title = title;
  const set = (sel, attr, v) => { if (!v) return; let m = $(sel); if (!m) { m = el("meta"); const [k, val] = sel.replace(/meta\[|\]/g, "").split("="); m.setAttribute(k, val.replace(/"/g, "")); document.head.appendChild(m); } m.setAttribute(attr, v); };
  set('meta[name="description"]', "content", desc); set('meta[property="og:title"]', "content", title); set('meta[property="og:description"]', "content", desc);
  if (image) set('meta[property="og:image"]', "content", new URL(image, location.href).href);
  set('meta[property="og:url"]', "content", location.href.split("#")[0]);
}

/* ── تهيئة مشتركة لكل صفحة ── */
export async function boot(activeNav) {
  const c = await loadContent();
  initLang(c.site.defaultLang || "ar");
  initTheme(); initAnalytics(); import("./fx.js").then((m) => m.initContourGround());
  renderNav(activeNav); renderFooter(); renderFab();
  document.addEventListener("langchange", () => { renderNav(activeNav); renderFooter(); });
  document.body.classList.remove("preload");
  return c;
}
