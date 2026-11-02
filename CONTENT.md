# CONTENT.md · عقد البيانات

كل محتوى الموقع يُقرأ من مجلد `content/`. لا يوجد نص ولا رقم ولا مشروع مكتوب داخل HTML. استبدل الملفات التجريبية بملفاتك فيتغير الموقع كاملاً.

## القواعد العامة

| القاعدة | التفصيل |
|---|---|
| الصيغة | JSON صالح (تحقق منه في `preview.html` أو أي محرر JSON) |
| النص ثنائي اللغة | `{"ar": "...", "en": "..."}`. إذا غاب `en` يُعرض `ar`، والعكس |
| الحقول الإلزامية | `id` و`title` فقط (وفي الخبرات `role`). كل ما عداها اختياري ويختفي مكانه إن غاب |
| المعرّف `id` | أحرف إنجليزية صغيرة وأرقام وشرطات: `brt-jeddah` |
| التواريخ | `YYYY-MM` أو `YYYY`، و`present` للمستمر |
| الوسائط | `media/` للصور، `files/` للملفات، `data/` لطبقات GIS |
| الروابط بين المحتوى | `skills` في المشاريع والشهادات والخبرات والخدمات تشير إلى `id` في `skills.json`، والموقع يبني الشبكة تلقائياً في الاتجاهين |
| وسم «جديد» | أي عنصر فيه `added: "YYYY-MM-DD"` خلال آخر 30 يوماً يظهر عليه وسم جديد |

> عند استخدام نظام المزامنة لا تحتاج تعديل JSON بيدك إطلاقاً؛ الجدول هو المصدر، وهذه الملفات تُولَّد. راجع `SYNC.md`.

## مقاسات الصور المقترحة

| الاستخدام | المقاس | الصيغة | الحجم المستهدف |
|---|---|---|---|
| غلاف المشروع `cover` | 1600 × 1000 (16:10) | WebP | < 200 KB |
| معرض الصور `gallery` | 1600 عرضاً | WebP | < 250 KB |
| شرائح العرض `slides` | 1920 × 1080 (16:9) | WebP | < 300 KB |
| الشهادات | 1400 عرضاً | WebP (أو PDF مع صورة) | < 250 KB |
| الصورة الشخصية | 800 × 800 | WebP | < 100 KB |
| صورة المشاركة `og` | 1200 × 630 | **PNG** (واتساب وX) | < 300 KB |

نظام المزامنة يحوّل أي JPG/PNG إلى هذه المقاسات تلقائياً.

---

## `content/site.json`

```json
{
  "defaultLang": "ar",
  "siteUrl": "https://USERNAME.github.io/REPO",
  "sections": ["hero","model","about","projects","skills","certificates","experience","education","gis","stats","datasets","notes","services","testimonials","contact"],
  "formspreeId": "",
  "analytics": { "provider": "cloudflare | goatcounter | \"\"", "id": "" },
  "bookingUrl": "",
  "reviewBeforePublish": false,
  "seo": { "title": {"ar":"","en":""}, "description": {"ar":"","en":""}, "ogImage": "media/og.png" },
  "presets": [
    { "id": "transport", "label": {"ar":"أبحث عن مخطط نقل","en":"I need a transport planner"}, "weights": { "planning": 5, "gis": 3, "geomatics": 1, "digital": 1, "design": 1 } }
  ]
}
```

| الحقل | الشرح |
|---|---|
| `sections` | ترتيب الأقسام وإظهارها. أي قسم غير مذكور لا يظهر، وأي قسم بياناته فارغة يختفي تلقائياً حتى لو ذُكر |
| `formspreeId` | معرّف نموذج Formspree (مثل `xabcdefg`). فارغ = النموذج يعرض تنبيهاً ولا يرسل |
| `analytics` | `cloudflare` مع token، أو `goatcounter` مع اسم الحساب |
| `reviewBeforePublish` | `true` = المزامنة تفتح Pull Request بدل النشر المباشر |
| `presets` | الأزرار الجاهزة في البطل. `weights` مفاتيحها معرّفات مجموعات المهارات، وقيمها 0–5 |

## `content/profile.json`

```json
{
  "name": {"ar":"فارس الأسمري","en":"Fares Al-Asmari"},
  "title": {"ar":"","en":""}, "tagline": {"ar":"","en":""}, "bio": {"ar":"","en":""}, "location": {"ar":"","en":""},
  "photo": "media/profile.webp",
  "availability": { "open": true, "note": {"ar":"","en":""} },
  "contact": { "email":"", "whatsapp":"9665XXXXXXXX", "linkedin":"", "x":"", "github":"", "behance":"" },
  "cvFile": "files/cv.pdf",
  "languages": [ { "name": {"ar":"العربية","en":"Arabic"}, "level": {"ar":"اللغة الأم","en":"Native"} } ],
  "highlights": [ { "value": "10", "label": {"ar":"مشاريع","en":"Projects"} } ]
}
```

- `whatsapp` بالصيغة الدولية بلا `+` ولا مسافات.
- `highlights` اتركها `[]` إن لم ترد أرقاماً؛ لا يُعرض شيء مخترع.
- `cvFile` فارغ = يختفي زر تنزيل CV، وتبقى صفحة `cv.html` المولّدة.

## `content/projects.json` (مصفوفة)

```json
[{
  "id": "brt-jeddah", "order": 1, "featured": true, "added": "2026-10-20",
  "title": {"ar":"","en":""}, "summary": {"ar":"","en":""},
  "categories": ["planning","transport","gis","urban-design","regional","geomatics","digital"],
  "type": "graduation | course | personal | freelance | competition",
  "course": "URP477", "year": 2026, "status": "completed | in-progress",
  "role": {"ar":"","en":""}, "team": {"ar":"","en":""},
  "location": { "name": {"ar":"جدة","en":"Jeddah"}, "lat": 21.54, "lon": 39.17,
                "points": [ { "name": {"ar":"","en":""}, "lat": 21.57, "lon": 39.19 } ] },
  "problem": {"ar":"","en":""}, "method": {"ar":"","en":""}, "result": {"ar":"","en":""},
  "tools": ["ArcGIS Pro"], "skills": ["transport-planning"],
  "metrics": [ { "value": "12 كم", "label": {"ar":"طول الممر","en":"Corridor length"} } ],
  "cover": "media/projects/brt-jeddah/cover.webp",
  "gallery": [ { "src": "media/projects/brt-jeddah/gallery/01.webp", "caption": {"ar":"","en":""} } ],
  "slides":  [ { "src": "media/projects/brt-jeddah/slides/slide-01.webp", "caption": {"ar":"","en":""} } ],
  "files":   [ { "label": {"ar":"","en":""}, "href": "files/projects/brt-jeddah/brief.pdf" } ],
  "links":   [ { "label": {"ar":"","en":""}, "href": "https://…" } ],
  "gisLayers": ["brt-corridor"],
  "story": [ { "step": 1, "lat": 21.54, "lon": 39.17, "zoom": 11, "pitch": 0, "bearing": 0, "layers": ["brt-corridor"], "text": {"ar":"","en":""} } ]
}]
```

| الحقل | الشرح |
|---|---|
| `order` | ترتيب الظهور عند تساوي الدرجات |
| `featured` | يظهر أولاً في السيرة الذاتية |
| `location` | إن غابت أو غاب `lat/lon` لا تظهر خريطة ولا بطاقة موقع (مشروع رقمي مثلاً) |
| `skills` | معرّفات من `skills.json`. هي ما يحسب **درجة الملاءمة** في النموذج، فاجعلها دقيقة |
| `gisLayers` | معرّفات من `gis.json`؛ تجعل صفحة المشروع تعرض خريطة حية بدل الصورة |
| `story` | خطوات خريطة قصصية بالتمرير؛ `layers` ما يظهر في كل خطوة |

حالات مختبرة: مشروع بلا صور، بلا إحداثيات، بعنوان طويل جداً، كلها تعمل بأناقة.

## `content/certificates.json` (مصفوفة)

```json
[{
  "id": "arcgis-fundamentals", "added": "2026-10-15",
  "title": {"ar":"","en":""}, "issuer": {"ar":"","en":""}, "date": "2025-06",
  "category": "gis | planning | software | language | professional | other",
  "credentialId": "", "verifyUrl": "",
  "image": "media/certificates/arcgis-fundamentals.webp", "pdf": "files/certificates/arcgis-fundamentals.pdf",
  "skills": ["spatial-analysis"]
}]
```

`verifyUrl` فارغ = لا يظهر زر التحقق. `image` فارغ = بطاقة بأيقونة بدل الصورة.

## `content/skills.json`

```json
{
  "groups": [ {
    "id": "planning", "tier": "core | support", "title": {"ar":"التخطيط الحضري والنقل","en":"Urban & transport planning"},
    "items": [ { "id": "transport-planning", "name": {"ar":"تخطيط النقل","en":"Transport planning"}, "level": 5 } ]
  } ],
  "tools": [ { "id": "arcgis-pro", "name": "ArcGIS Pro", "level": 5 } ]
}
```

- **كل مجموعة = معيار في نموذج الملاءمة** له منزلق وزن. من 4 إلى 7 مجموعات مثالية.
- `level` من 1 إلى 5 ويدخل في حساب الدرجة.
- معادلة الدرجة: لكل مجموعة `مطابقة = 0.75 × (أعلى مستوى مهارة مستخدمة ÷ 5) + 0.25 × (نسبة مهارات المجموعة المستخدمة)`، ثم `الدرجة = Σ(الوزن × المطابقة) ÷ Σ(الوزن) × 100`.

## `content/experience.json` (مصفوفة)

```json
[{
  "id": "", "role": {"ar":"","en":""}, "org": {"ar":"","en":""},
  "type": "training | job | volunteer | freelance",
  "start": "2025-06", "end": "2025-08 | present",
  "location": {"ar":"","en":""}, "summary": {"ar":"","en":""},
  "bullets": [ {"ar":"","en":""} ],
  "projects": ["project-id"], "skills": ["skill-id"]
}]
```

## `content/education.json` (مصفوفة)

```json
[{ "id": "", "degree": {"ar":"","en":""}, "institution": {"ar":"","en":""}, "start": "2021", "end": "2026", "notes": {"ar":"","en":""} }]
```

## `content/services.json` (مصفوفة)

```json
[{
  "id": "gis-maps", "title": {"ar":"","en":""}, "description": {"ar":"","en":""},
  "includes": [ {"ar":"","en":""} ],
  "priceFrom": null, "currency": "SAR", "delivery": {"ar":"","en":""},
  "icon": "map | presentation | file | code | user | qr",
  "skills": ["spatial-analysis"]
}]
```

`skills` هنا تجعل الخدمات تُرتَّب بأوزان الزائر نفسها، ويظهر وسم «الأنسب لك» على الأعلى. `priceFrom: null` = «السعر حسب الطلب».

## `content/testimonials.json` (مصفوفة، اختيارية)

```json
[{ "id": "", "quote": {"ar":"","en":""}, "name": {"ar":"","en":""}, "role": {"ar":"","en":""}, "date": "2026-01" }]
```

فارغة = يختفي القسم. لا يُكتب أي رأي من عند الموقع أبداً.

## `content/gis.json` (مصفوفة) · مختبر GIS

```json
[{
  "id": "brt-corridor", "title": {"ar":"","en":""}, "description": {"ar":"","en":""},
  "project": "brt-jeddah",
  "src": "data/brt-corridor.geojson",
  "geometry": "point | line | polygon",
  "style": { "type": "single", "color": "#E3B23C", "width": 4, "radius": 7, "opacity": 0.55 },
  "popupFields": ["name","phase"],
  "swipeWith": "existing-route",
  "metadata": { "source": {"ar":"","en":""}, "crs": "EPSG:4326 (WGS 84)", "date": "2026-10", "accuracy": {"ar":"","en":""}, "constraints": {"ar":"","en":""} }
}]
```

أنواع الترميز:

```json
{ "type": "categories", "field": "type", "classes": [ { "value": "interchange", "color": "#E3B23C", "label": {"ar":"تبادلية","en":"Interchange"} } ] }
{ "type": "graduated",  "field": "density", "breaks": [20,40,60,80], "colors": ["#2A1E5C","#2D6F8E","#28A085","#C9B23A","#FFF3C4"] }
```

- `src` ملف GeoJSON بإسقاط WGS 84 (المزامنة تحوّل Shapefile وتبسّط الهندسة تلقائياً).
- `swipeWith` معرّف طبقة أخرى تظهر في الجهة الثانية من شريط المقارنة.
- `metadata` هي بطاقة البيانات الوصفية التي تظهر في المختبر وصفحة المشروع.

## `content/datasets.json` (مصفوفة) · بيانات مفتوحة

```json
[{
  "id": "", "title": {"ar":"","en":""}, "description": {"ar":"","en":""}, "project": "", "license": "CC BY 4.0",
  "formats": [ { "format": "GeoJSON", "href": "data/x.geojson" }, { "format": "CSV", "href": "data/x.csv" } ],
  "metadata": { "source": {}, "crs": "", "date": "", "accuracy": {}, "constraints": {} }
}]
```

## `content/stats.json` (مصفوفة) · أرقام مرجعية

```json
[{ "id": "", "value": "32.2", "unit": {"ar":"مليون","en":"million"}, "label": {"ar":"","en":""}, "source": {"ar":"","en":""}, "sourceUrl": "", "date": "2022" }]
```

**أي رقم بلا `source` لا يُعرض أبداً** (مُختبر).

## `content/notes.json` (مصفوفة) · دفتر المخطط

```json
[{ "id": "", "title": {"ar":"","en":""}, "date": "2026-10-10", "tags": ["gis"], "projects": ["project-id"], "readingMinutes": 3,
   "excerpt": {"ar":"","en":""}, "html": {"ar":"<p>…</p>","en":""} }]
```

`html` يُنظَّف قبل العرض (وسوم نصية فقط). المزامنة تولّده من Google Docs.

## `content/meta.json`

```json
{ "lastSync": "2026-10-23T00:00:00Z", "version": 1 }
```

تُكتب تلقائياً، وتغذّي شارة «آخر تحديث» في التذييل.

---

## صفحة التحرير

افتح `edit.html` محلياً، املأ النموذج، وانسخ JSON الناتج إلى داخل المصفوفة في الملف المناسب. تعمل بلا خادم ولا قاعدة بيانات.
