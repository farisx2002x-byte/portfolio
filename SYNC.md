# SYNC.md · التحديث التلقائي من Google Drive

الفكرة: جدول Google Sheets واحد اسمه `portfolio-content` + مجلد Drive اسمه `Portfolio/`. تضيف صفاً أو ملفاً، فتُشغَّل المزامنة يومياً (أو بزر) وتحدّث الموقع. كل شيء مجاني: Google Cloud (حساب خدمة)، وGitHub Actions.

## ماذا يفعل السكربت `scripts/sync.mjs`

1. يقرأ تبويبات الجدول عبر Google API بحساب خدمة.
2. يحوّل الصفوف إلى `content/*.json` بعقد البيانات (راجع `CONTENT.md`).
3. ينزّل الوسائط من Drive ويحوّلها WebP بالمقاسات المناسبة، ويحوّل PDF الشرائح إلى صور.
4. يبسّط طبقات GIS (GeoJSON/Shapefile) إلى GeoJSON خفيف بإسقاط WGS 84.
5. يحوّل مستندات Google Docs في `notes/` إلى مقالات.
6. يقرأ ملفات تصدير LinkedIn في `linkedin/` ويضيف الجديد منها إلى الجدول كمسودات `publish=لا`.
7. **يتحقق** من البيانات. إن فشل التحقق لا يُنشر شيء ويبقى الموقع على آخر نسخة سليمة، ويُكتب `SYNC-REPORT.md` بما يجب إصلاحه.
8. يحسب الفروق (أُضيف/عُدّل/حُذف) ويكتبها في `content/_sync-report.json` لصفحة `preview.html`.
9. إن لم يتغير شيء لا يُنشئ أي commit.

## الإعداد خطوة بخطوة (مرة واحدة، 20 دقيقة)

### 1. أنشئ الجدول
1. افتح [Google Sheets](https://sheets.google.com) وأنشئ جدولاً جديداً، وسمّه `portfolio-content`.
2. **File → Import → Upload** وارفع `templates/portfolio-content.xlsx` واختر **Replace spreadsheet**. ستظهر كل التبويبات بالأعمدة الصحيحة وصف مثال في كل تبويب.
   - بديل: ارفع ملفات `templates/sheets/*.csv` تبويباً تبويباً بالاسم نفسه.
3. انسخ معرّف الجدول من الرابط: `https://docs.google.com/spreadsheets/d/`**`المعرّف`**`/edit`.

قواعد الأعمدة باختصار:
- كل نص له عمودان `x_ar` و`x_en`.
- القوائم مفصولة بـ `|`.
- العمود `publish`: `نعم` يُنشر، `لا` يبقى مسودة.
- الأزواج: `label=href|label=href`، والثنائي `label_ar~label_en=href`.
- النقاط: `name_ar~name_en=lat,lon|…`. المقاييس: `value=label_ar~label_en|…`.
- تبويبا `profile` و`settings` بصيغة مفتاح/قيمة: `key, value_ar, value_en`.

### 2. أنشئ مجلد Drive
أنشئ مجلداً اسمه `Portfolio/` وبداخله:

```
Portfolio/
├─ profile/        الصورة الشخصية (أي اسم، jpg/png) + cv.pdf + og.png (1200×630)
├─ projects/
│  └─ <project-id>/
│     ├─ cover.jpg            الغلاف
│     ├─ gallery/             صور المعرض
│     ├─ slides/              صور الشرائح أو ملف PDF واحد
│     └─ files/               ملفات مرفقة
├─ certificates/   <certificate-id>.pdf أو .jpg (الاسم = id في الجدول)
├─ gis/
│  └─ <layer-id>/  ملف .geojson أو .zip (Shapefile)
├─ notes/          مستندات Google Docs (كل مستند مقالة)
└─ linkedin/       ملفات CSV من تصدير بيانات LinkedIn
```

انسخ معرّف المجلد من الرابط: `https://drive.google.com/drive/folders/`**`المعرّف`**.

### 3. أنشئ حساب الخدمة في Google Cloud (مجاني)
1. افتح [console.cloud.google.com](https://console.cloud.google.com) وأنشئ مشروعاً جديداً (أي اسم).
2. **APIs & Services → Enable APIs** وفعّل: **Google Sheets API** و**Google Drive API**.
3. **IAM & Admin → Service Accounts → Create service account**. سمّه `portfolio-sync`. لا تمنحه أي دور. أكمل.
4. افتح الحساب → تبويب **Keys → Add key → Create new key → JSON**. سيُنزَّل ملف JSON. **احتفظ به سراً**.
5. انسخ بريد الحساب (ينتهي بـ `@…iam.gserviceaccount.com`).

### 4. شارك الجدول والمجلد مع حساب الخدمة
- في الجدول: **Share** → الصق بريد حساب الخدمة → صلاحية **Editor** (ليتمكن من إضافة مسودات LinkedIn).
- في مجلد `Portfolio/`: **Share** → البريد نفسه → **Viewer** يكفي.

### 5. ضع المفاتيح في GitHub Secrets
في المستودع: **Settings → Secrets and variables → Actions → New repository secret**، وأضف ثلاثة أسرار:

| الاسم | القيمة |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | محتوى ملف JSON كاملاً (الصقه كما هو) |
| `SHEET_ID` | معرّف الجدول |
| `DRIVE_FOLDER_ID` | معرّف المجلد |

### 6. شغّل أول مزامنة
1. تبويب **Actions** → **sync-content** → **Run workflow**.
2. انتظر دقيقتين. افتح التشغيل لترى ملخص التقرير بالعربي.
3. إن نجح، سيظهر commit جديد باسم `sync: content update …`، ثم ينشر `deploy-pages` الموقع.
4. افتح `preview.html` على موقعك لترى ما أُضيف وعُدّل وحُذف.

تعمل المزامنة بعد ذلك تلقائياً كل يوم (03:17 UTC). ولتغيير الوقت عدّل `cron` في `.github/workflows/sync.yml`.

### 7. وضع المراجعة قبل النشر (اختياري)
في تبويب `settings` اجعل `review_before_publish = نعم`. ستفتح المزامنة **Pull Request** باسم «مراجعة تحديث المحتوى» بدل النشر المباشر، تراجعه وتضغط **Merge** بضغطة.

## ماذا أفعل إذا ظهر خطأ؟

| الرسالة | السبب والحل |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON غير موجود` | لم يُضف السر أو اسمه مختلف |
| `Google API 403` | لم تُشارك الجدول/المجلد مع بريد حساب الخدمة، أو لم تُفعَّل الواجهات في الخطوة 3 |
| `Google API 404` | المعرّف خطأ (انسخه من الرابط مجدداً) |
| `فشل التحقق، لم يُنشر شيء` | افتح ملخص التشغيل أو `SYNC-REPORT.md`: كل سطر يحدد الصف والحقل، مثل «المهارة x غير معرّفة في skills» |
| `لا يوجد ملف صورة/PDF باسم …` | اسم ملف الشهادة في Drive يجب أن يساوي `id` في الجدول |
| `تعذّر تحويل PDF الشرائح` | نادر؛ ارفع الشرائح كصور بدل PDF |
| لا شيء يتغير بعد المزامنة | طبيعي إن لم تتغير البيانات («لا تغييرات»)، أو أن `publish = لا` |

للتجربة محلياً (إن كان Node مثبتاً):
```bash
npm install
export GOOGLE_SERVICE_ACCOUNT_JSON="$(cat key.json)" SHEET_ID=… DRIVE_FOLDER_ID=…
npm run sync:dry     # تقرير فقط بلا كتابة
npm run sync         # مزامنة فعلية
npm run build        # sitemap وصفحات OG
npm test             # اختبارات المعادلات والمحتوى
```

## LinkedIn (استيراد شبه تلقائي)

LinkedIn لا يتيح قراءة ملفك عبر واجهته البرمجية، لذلك:
1. في LinkedIn: **Settings → Data privacy → Get a copy of your data** واختر الملفات: Positions, Education, Skills, Certifications.
2. ضع ملفات CSV الناتجة في `Portfolio/linkedin/` (بأي اسم فيه الكلمة الدالة).
3. المزامنة التالية تضيف ما ليس في الجدول كصفوف جديدة بحالة `publish=لا` ومعرّف يبدأ بـ `li-`، وعمود `source=linkedin`.
4. راجعها في الجدول، أضف النص العربي، وغيّر `publish` إلى `نعم`.

**الجدول له الأولوية دائماً**: ما تكتبه فيه لا يُستبدل أبداً من LinkedIn. ولا يوجد أي كود يسحب صفحة LinkedIn.

## الفحص الأسبوعي والإضافات

- `weekly-check.yml` يفحص كل جمعة الروابط المكسورة وأحجام الصور، ويفتح **Issue** عند وجود مشاكل.
- **الطلبات (الأولوية 3)**: تبويب `leads` جاهز في القالب. لربطه: أنشئ Google Apps Script بخدمة ويب `doPost` تكتب الصف وترسل رداً آلياً، وضع رابطها في Formspree كـ webhook أو استخدمها بدل Formspree في `site.json`. الهيكل جاهز والتوثيق هنا؛ التنفيذ خارج هذه النسخة.
- **التوصيات (الأولوية 2)**: رابط نموذج Google Form يكتب في تبويب `testimonials` بحالة `publish=لا`؛ لا يظهر شيء إلا بعد تغييرك إياه إلى `نعم`.
- **الحجز (الأولوية 3)**: ضع رابط Calendly أو Cal.com في `booking_url` بتبويب `settings` فيظهر زر «احجز موعداً» في التواصل.
