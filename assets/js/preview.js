/* صفحة المعاينة: تعرض تقرير آخر مزامنة (content/_sync-report.json): ما أُضيف وعُدّل وحُذف، وأخطاء التحقق */
import { boot, state, L, esc, $, base } from "./core.js";

const S = { ar: { h: "معاينة آخر مزامنة", none: "لا يوجد تقرير مزامنة بعد. شغّل scripts/sync.mjs أو انتظر التشغيل اليومي.", ok: "نجح التحقق", fail: "فشل التحقق، لم يُنشر شيء", add: "أُضيف", mod: "عُدّل", del: "حُذف", errors: "ما يجب إصلاحه", warnings: "تنبيهات", when: "وقت المزامنة", nochange: "لا تغييرات منذ آخر نشر." },
  en: { h: "Last sync preview", none: "No sync report yet. Run scripts/sync.mjs or wait for the daily run.", ok: "Validation passed", fail: "Validation failed, nothing published", add: "added", mod: "modified", del: "deleted", errors: "To fix", warnings: "Warnings", when: "Synced at", nochange: "No changes since last publish." } };
const s = (k) => (S[state.lang] || S.ar)[k];
async function render() {
  let r = null; try { const x = await fetch(base() + "content/_sync-report.json", { cache: "no-cache" }); if (x.ok) r = await x.json(); } catch {}
  const app = $("#app");
  if (!r) { app.innerHTML = `<div class="wrap page-head"><h1 class="h2">${esc(s("h"))}</h1><div class="empty">${esc(s("none"))}</div></div>`; return; }
  const ch = r.changes || {}; const rows = (k, cls) => (ch[k] || []).map((x) => `<div class="d ${cls}"><i>${esc(s(k))}</i><span>${esc(x.file)} · <b>${esc(x.id)}</b>${x.title ? ` · ${esc(L(x.title))}` : ""}${x.fields ? ` <span class="mono" style="font-size:11px;color:var(--dim)">${esc(x.fields.join(", "))}</span>` : ""}</span></div>`).join("");
  app.innerHTML = `<div class="wrap page-head"><div class="kicker">preview.html</div><h1 class="h2">${esc(s("h"))}</h1><p class="lead"><span class="pill ${r.ok ? "on" : ""}">${esc(r.ok ? s("ok") : s("fail"))}</span> <span class="updated">${esc(s("when"))}: ${esc(r.time || "")}</span></p>
    ${(r.errors || []).length ? `<h3 class="sub-h">${esc(s("errors"))}</h3><div class="diff">${r.errors.map((e) => `<div class="d del"><i>!</i><span>${esc(e)}</span></div>`).join("")}</div>` : ""}
    ${(r.warnings || []).length ? `<h3 class="sub-h">${esc(s("warnings"))}</h3><div class="diff">${r.warnings.map((e) => `<div class="d mod"><i>?</i><span>${esc(e)}</span></div>`).join("")}</div>` : ""}
    <h3 class="sub-h">${esc(s("add"))} / ${esc(s("mod"))} / ${esc(s("del"))}</h3><div class="diff">${rows("add", "add") + rows("mod", "mod") + rows("del", "del") || `<div class="empty">${esc(s("nochange"))}</div>`}</div></div>`;
}
(async () => { await boot("preview"); render(); document.addEventListener("langchange", render); })();
