/* ─────────────────────────────────────────────
   الأرشيف المرئي: تلفزيون قديم (CRT) وأشرطة VHS. كل فيديو شريط أسود بملصق؛
   اضغط الشريط يُسحب من الرف، واضغطه ثانية يدخل في فتحة الفيديو فيشتغل التلفزيون ويعرض الفيديو.
   البيانات من content/videos.json: { id, title{ar,en}, year, kind, youtube | src | drive, poster, note }
   ───────────────────────────────────────────── */
import { state, L, has, esc, $, $$, reduce } from "./core.js";

const UI = {
  ar: { kicker: "الأرشيف المرئي", h: "أشرطة <em>الفيديو</em>.", lead: "فيديوهات صنعتها للجامعة وفعالياتها. اختر شريطاً من الرف فيُسحب، ثم اضغطه ثانية ليدخل الجهاز ويعمل التلفزيون.", eject: "إخراج", play: "تشغيل", empty: "لا أشرطة بعد.", demo: "عينة", hint: "اضغط شريطاً مرتين", kinds: { promo: "ترويجي", event: "فعالية", doc: "توثيقي", edu: "تعليمي", aerial: "جوي" } },
  en: { kicker: "Video archive", h: "The <em>tapes</em>.", lead: "Videos I made for the university and its events. Pick a tape, then press it again to load it into the VCR.", eject: "Eject", play: "Play", empty: "No tapes yet.", demo: "sample", hint: "Press a tape twice", kinds: { promo: "promo", event: "event", doc: "documentary", edu: "tutorial", aerial: "aerial" } },
};
const s = (k) => (UI[state.lang] || UI.ar)[k];
const COLORS = { promo: "#C9B23A", event: "#28A085", doc: "#5C7CFA", edu: "#B8513A", aerial: "#7FE6CC" };

const ytId = (v) => v.youtube ? String(v.youtube).replace(/^.*(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/, "$1") : null;
const embedOf = (v) => {
  const y = ytId(v); if (y) return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(y)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(L(v.title))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  if (v.drive) return `<iframe src="https://drive.google.com/file/d/${esc(v.drive)}/preview" title="${esc(L(v.title))}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  if (v.src) return `<video src="${esc(v.src)}" ${v.poster ? `poster="${esc(v.poster)}"` : ""} controls autoplay playsinline></video>`;
  return `<div class="tv-static-only"><span>${esc(state.lang === "ar" ? "لا إشارة · أرسل الفيديو ليظهر هنا" : "NO SIGNAL · send the video to show it here")}</span></div>`;
};

export function tapesHtml(videos) {
  const vids = (videos || []).filter((v) => v && has(v.title)); if (!vids.length) return "";
  const kinds = s("kinds");
  const tape = (v, i) => `<button type="button" class="tape${v.demo ? " demo" : ""}" data-tape="${esc(v.id)}" style="--i:${i};--c:${COLORS[v.kind] || COLORS.promo}" aria-label="${esc(L(v.title))}">
      <span class="shell"><span class="reel r1"><i></i></span><span class="reel r2"><i></i></span><span class="win"></span></span>
      <span class="sticker"><b>${esc(L(v.title))}</b><small class="mono">${esc(String(v.year || ""))}${v.kind ? ` · ${esc(kinds[v.kind] || v.kind)}` : ""}${v.demo ? ` · ${esc(s("demo"))}` : ""}</small></span>
      <span class="spine-lbl">${esc(L(v.title))}</span></button>`;
  return `<section class="wrap" id="tapes"><div class="kicker">${esc(s("kicker"))}</div><h2 class="h2 rv">${s("h")}</h2><p class="lead">${esc(s("lead"))}</p>
    <div class="tv-room rv" id="tv-room">
      <div class="tv" id="tv"><div class="tv-top"><i></i><i></i></div>
        <div class="tv-body"><div class="screen" id="tv-screen"><div class="tv-off-glow"></div><div class="static"></div><div class="scan"></div><div class="glass"></div><div class="tv-media" id="tv-media"></div><div class="tv-osd mono" id="tv-osd"></div></div>
          <div class="tv-side"><span class="knob k1"></span><span class="knob k2"></span><span class="speaker">${Array.from({ length: 6 }, () => "<i></i>").join("")}</span><span class="led" id="tv-led"></span></div></div>
        <div class="vcr"><div class="slot" id="vcr-slot"><i class="flap"></i></div><button type="button" class="eject" id="tv-eject" hidden>⏏ ${esc(s("eject"))}</button><span class="vcr-txt mono" id="vcr-txt">VHS · HQ</span></div>
        <div class="tv-feet"><i></i><i></i></div></div>
      <div class="tape-hint"><i></i>${esc(s("hint"))}</div>
      <div class="rack" id="tape-rack"><div class="rack-shelf"></div>${vids.map(tape).join("")}</div>
    </div></section>`;
}

export function initTapes(videos) {
  const room = $("#tv-room"); if (!room) return; const vids = videos || []; const tv = $("#tv", room), media = $("#tv-media", room), osd = $("#tv-osd", room), eject = $("#tv-eject", room), slot = $("#vcr-slot", room), led = $("#tv-led", room), txt = $("#vcr-txt", room);
  let pulled = null, loaded = null, flying = null;
  const tapes = $$(".tape", room);
  const setPulled = (id) => { pulled = id; tapes.forEach((t) => t.classList.toggle("pulled", t.dataset.tape === id)); };
  const insert = (id) => {
    const el = tapes.find((t) => t.dataset.tape === id); const v = vids.find((x) => x.id === id); if (!el || !v || flying) return;
    flying = id; room.classList.add("loading");
    const r0 = el.getBoundingClientRect(), r1 = slot.getBoundingClientRect(); const dx = (r1.left + r1.width / 2) - (r0.left + r0.width / 2), dy = (r1.top + r1.height / 2) - (r0.top + r0.height / 2);
    el.classList.add("flying"); el.style.setProperty("--dx", dx + "px"); el.style.setProperty("--dy", dy + "px");
    const after = () => { el.classList.add("in-vcr"); el.classList.remove("flying", "pulled"); slot.classList.add("busy"); tv.classList.add("on"); led.classList.add("on"); txt.textContent = "PLAY ▶"; osd.textContent = `▶ ${L(v.title)}${v.year ? ` · ${v.year}` : ""}`;
      setTimeout(() => { media.innerHTML = embedOf(v); tv.classList.add("playing"); room.classList.remove("loading"); eject.hidden = false; flying = null; loaded = id; pulled = null; }, reduce ? 50 : 900); };
    if (reduce) after(); else setTimeout(after, 700);
  };
  const doEject = () => { if (!loaded) return; const el = tapes.find((t) => t.dataset.tape === loaded); media.innerHTML = ""; tv.classList.remove("playing"); osd.textContent = ""; txt.textContent = "STOP ■"; slot.classList.remove("busy"); eject.hidden = true;
    if (el) { el.classList.add("ejecting"); setTimeout(() => { el.classList.remove("in-vcr", "ejecting"); el.style.removeProperty("--dx"); el.style.removeProperty("--dy"); }, reduce ? 0 : 600); }
    setTimeout(() => { tv.classList.remove("on"); led.classList.remove("on"); txt.textContent = "VHS · HQ"; }, reduce ? 0 : 1200); loaded = null; };
  tapes.forEach((t) => t.addEventListener("click", () => { const id = t.dataset.tape; if (loaded === id) { doEject(); return; } if (loaded) doEject(); if (pulled === id) { insert(id); } else setPulled(id); }));
  eject.addEventListener("click", doEject);
  $("#tv-screen", room).addEventListener("click", () => { if (!loaded && pulled) insert(pulled); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && loaded && room.matches(":hover, :focus-within")) doEject(); });
  // الشريط المسحوب يعود إذا ضغط الزائر في مكان آخر
  document.addEventListener("click", (e) => { if (pulled && !e.target.closest("#tv-room")) setPulled(null); });
}
