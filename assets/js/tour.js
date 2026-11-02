/* ─────────────────────────────────────────────
   الجولة الموجَّهة: زر «جولة» يأخذ الزائر (أو لجنة التقييم) قسماً قسماً،
   مع شرح قصير لكل قسم وتشغيل تلقائي لتفاعله (اختيار زر، فتح منطقة على الخريطة، سحب كتاب، فتح ملف…).
   ───────────────────────────────────────────── */
import { state, $, $$, esc, reduce } from "./core.js";

const STEPS = [
  { id: "top", sel: "#hero", ar: ["البداية", "هذا الموقع ليس قائمة مشاريع؛ هو نموذج ملاءمة: تقول ما تبحث عنه، فيرتّب أعمالي حسب الأقرب لطلبك — بالطريقة نفسها التي يرتّب بها المخططون المواقع."], en: ["Start", "This is not a project list; it is a suitability model: say what you need and my work re-ranks itself, the way planners rank sites."],
    demo: () => { const b = $("[data-preset]"); if (b) b.click(); } },
  { id: "now", sel: "#now", ar: ["الآن", "عملان مستمران إلى جانب الدراسة: حافل للنقل وحلول المعلومات الجوية. الشريط يبدأ من بداية كل عقد والعدّاد يحسب المدة حتى اليوم."], en: ["Now", "Two ongoing roles alongside my studies: Hafil and Air Information Solutions. Each bar starts at the contract start and the counter runs to today."] },
  { id: "model", sel: "#model", ar: ["النموذج", "خمس طبقات (معايير) بأوزان من 0 إلى 5؛ كل مربع مشروع، والطبقة السفلية تجمعها مرجّحة لتعطي الدرجة من 100. جرّب تحريك وزن."], en: ["The model", "Five weighted layers; every square is a project and the bottom layer sums them into a score out of 100."],
    demo: () => { const b = $$(".ll")[1]; if (b) b.click(); } },
  { id: "atlas", sel: "#atlas", ar: ["الخريطة", "كل مشروع في موقعه: المملكة ← المنطقة ومشاريعها ← المدينة وأحياؤها. اضغط الدبوس مرتين يفتح المشروع، واختر تصنيفاً تطلع رموزه من الدبابيس."], en: ["The atlas", "Every project in place: Kingdom → province and its projects → city and districts. Tap a pin twice to open it; pick a category and its motifs rise from the pins."],
    demo: () => { const p = $('.prov[data-prov="makkah"]'); if (p) { p.dispatchEvent(new MouseEvent("click", { bubbles: true })); setTimeout(() => { const c = $("#atlas-pins .cluster, #atlas-pins .pin"); if (c) c.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, 1400); } } },
  { id: "projects", sel: "#projects", ar: ["المشاريع", "البطاقات مرتبة بالدرجة الحالية؛ افتح أي مشروع لتتصفح ملخصه صفحة صفحة، والعرض الكامل يُرسل بإذن."], en: ["Projects", "Cards ranked by the current score; open one to flip its summary, full decks on request."] },
  { id: "library", sel: "#library-sec", ar: ["المكتبة", "كل عرض تقديمي كتاب على رفّ مجاله: لون الكعب من ثيمه، وسُمكه من صفحاته. اسحب كتاباً."], en: ["The library", "Every deck is a book on its field's shelf; pull one out."],
    demo: () => { const b = $$(".book").find((x) => !x.classList.contains("wip")) || $(".book"); if (b) b.click(); } },
  { id: "posters", sel: "#posters", ar: ["اللوحات", "البوسترات واللوحات بحجمها الأصلي، وما لا يُنشر منها يُعرض ملخصه."], en: ["Boards", "Posters and boards at full size; withheld ones show a summary."] },
  { id: "certificates", sel: "#certificates", ar: ["الشهادات", "ملفات على مكتب: افتح ملفاً فتتطاير شهاداته، والبيانات الشخصية مغطّاة في الصور."], en: ["Certificates", "Folders on a desk: open one and the certificates fan out; personal data is masked."],
    demo: () => { const f = $(".folder"); if (f) f.click(); } },
  { id: "journey", sel: "#experience-section", ar: ["خط الرحلة", "محطات مرتبة بالتاريخ: دراسة وعمل وتطوع وتكريم، كلها مأخوذة من ملفات الموقع نفسها. مرّر على أي محطة."], en: ["The journey line", "Stations in date order — study, work, volunteering, honours — all drawn from the site's own data."],
    demo: () => { const st = $$(".journey .st"); const g = st[Math.max(0, st.length - 3)]; if (g) g.dispatchEvent(new Event("pointerenter")); } },
  { id: "skills", sel: "#skills", ar: ["المهارات", "كل مهارة مربوطة بدليلها: المشاريع والشهادات التي استُخدمت فيها."], en: ["Skills", "Every skill linked to its evidence: the projects and certificates behind it."] },
  { id: "contact", sel: "#contact", ar: ["تواصل", "واتساب وبريد، وطلب أي ملف يصل إليّ للموافقة. شكراً لوقتكم."], en: ["Contact", "WhatsApp and email; any file request comes to me for approval. Thank you."] },
];
const UI = { ar: { tour: "جولة", of: "من", next: "التالي", prev: "السابق", end: "إنهاء", auto: "تلقائي", hint: "← → للتنقل · Esc للخروج" }, en: { tour: "Tour", of: "of", next: "Next", prev: "Back", end: "End", auto: "Auto", hint: "← → to move · Esc to exit" } };
const s = (k) => (UI[state.lang] || UI.ar)[k];

export function initTour() {
  const steps = STEPS.filter((st) => $(st.sel)); if (!steps.length) return;
  let i = -1, timer = null, box = null;
  const closeAll = () => { $$(".tour-focus").forEach((e) => e.classList.remove("tour-focus")); };
  const render = () => { const st = steps[i]; const tx = state.lang === "ar" ? st.ar : st.en;
    box.innerHTML = `<div class="tour-k mono">${i + 1} ${esc(s("of"))} ${steps.length}</div><b>${esc(tx[0])}</b><p>${esc(tx[1])}</p><div class="tour-dots">${steps.map((_, k) => `<i class="${k === i ? "on" : k < i ? "done" : ""}"></i>`).join("")}</div><div class="tour-acts"><button type="button" data-t="prev" ${i === 0 ? "disabled" : ""}>‹ ${esc(s("prev"))}</button><button type="button" data-t="auto" aria-pressed="${!!timer}">▸ ${esc(s("auto"))}</button><button type="button" class="pri" data-t="next">${i === steps.length - 1 ? esc(s("end")) : esc(s("next")) + " ›"}</button></div><small>${esc(s("hint"))}</small>`;
    $$("[data-t]", box).forEach((b) => b.addEventListener("click", () => { const a = b.dataset.t; if (a === "prev") go(i - 1); else if (a === "next") { if (i === steps.length - 1) stop(); else go(i + 1); } else toggleAuto(); })); };
  const go = (n) => { if (n < 0 || n >= steps.length) return; i = n; const st = steps[i]; const el = $(st.sel); closeAll(); el.classList.add("tour-focus");
    const y = el.getBoundingClientRect().top + scrollY - 72; scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); render();
    if (st.demo) setTimeout(() => { try { st.demo(); } catch {} }, reduce ? 50 : 900); };
  const toggleAuto = () => { if (timer) { clearInterval(timer); timer = null; } else { timer = setInterval(() => { if (i >= steps.length - 1) stop(); else go(i + 1); }, 9000); } render(); };
  const stop = () => { if (!box) return; clearInterval(timer); timer = null; box.classList.add("out"); setTimeout(() => { box.remove(); box = null; }, 400); closeAll(); document.body.classList.remove("touring"); i = -1; };
  const start = () => { if (box) { stop(); return; } box = document.createElement("div"); box.className = "tour-box"; document.body.appendChild(box); document.body.classList.add("touring"); go(0); };
  document.addEventListener("keydown", (e) => { if (!box) return; if (e.key === "Escape") stop(); const rtl = document.documentElement.dir === "rtl"; if (e.key === "ArrowRight") go(i + (rtl ? -1 : 1)); if (e.key === "ArrowLeft") go(i + (rtl ? 1 : -1)); });
  // زر في القائمة
  const mount = () => { const tools = $(".nav-tools"); if (!tools || $("#tour-btn")) return; const b = document.createElement("button"); b.id = "tour-btn"; b.className = "btn btn-ghost btn-sm tour-btn"; b.type = "button"; b.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9z"/></svg> ${esc(s("tour"))}`; b.addEventListener("click", start); tools.prepend(b); };
  mount(); document.addEventListener("langchange", () => { stop(); setTimeout(mount, 50); });
  if (location.hash === "#tour") setTimeout(start, 2800);
}
