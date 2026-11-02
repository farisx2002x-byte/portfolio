# DEPLOY.md · النشر المجاني خطوة بخطوة

الموقع ثابت (HTML/CSS/JS) بلا خادم ولا قاعدة بيانات، فيُنشر مجاناً على GitHub Pages أو Vercel. الخيار الأول موصى به لأن نظام المزامنة التلقائية مبني عليه.

## قبل النشر (مرة واحدة)

1. افتح `content/site.json` وضع رابط الموقع المتوقع في `siteUrl` (يُستخدم في وسوم المشاركة وsitemap). مثال: `https://USERNAME.github.io/portfolio`.
2. ضع معرّف Formspree في `formspreeId` إن أردت تفعيل النموذج (الخطوة 4 أدناه).
3. شغّل `node scripts/build.mjs` إن كان Node مثبتاً عندك (اختياري؛ GitHub يشغّله تلقائياً).

## الخيار 1: GitHub Pages (موصى به)

### 1. أنشئ المستودع
1. سجّل في [github.com](https://github.com) وأنشئ حساباً.
2. اضغط **New repository**، سمّه `portfolio`، واجعله **Public**، ثم **Create repository**.

### 2. ارفع الملفات
الطريقة الأسهل بلا أوامر:
1. في صفحة المستودع اضغط **uploading an existing file**.
2. اسحب **كل** محتويات مجلد المشروع (الملفات والمجلدات معاً: `index.html`, `assets`, `content`, `media`, `scripts`, `.github` …).
3. اكتب رسالة مثل «النسخة الأولى» واضغط **Commit changes**.

> إذا لم يظهر مجلد `.github` عند السحب فهو مخفي في نظامك؛ أظهر الملفات المخفية أو ارفعه عبر GitHub Desktop.

الطريقة الثانية بالأوامر (إن كان git مثبتاً):
```bash
cd portfolio
git init && git add . && git commit -m "النسخة الأولى"
git branch -M main
git remote add origin https://github.com/USERNAME/portfolio.git
git push -u origin main
```

### 3. فعّل Pages
1. **Settings** → **Pages**.
2. تحت **Build and deployment** اختر **Source: GitHub Actions**.
3. انتظر دقيقة ثم افتح تبويب **Actions**: ستجد `deploy-pages` يعمل. عند اكتماله يظهر الرابط `https://USERNAME.github.io/portfolio/`.

كل دفع (push) إلى `main` ينشر تلقائياً.

### 4. فعّل نموذج التواصل (Formspree)
1. سجّل في [formspree.io](https://formspree.io) (الخطة المجانية تكفي).
2. **New form** → انسخ المعرّف من الرابط `https://formspree.io/f/xxxxxxxx`.
3. ضعه في `content/site.json` → `"formspreeId": "xxxxxxxx"` (أو في تبويب `settings` بالجدول إن كنت تستخدم المزامنة).

### 5. ربط دومين خاص (لاحقاً)
1. اشترِ الدومين من أي مسجّل (مثل Namecheap أو GoDaddy).
2. في GitHub: **Settings → Pages → Custom domain** واكتب `www.yourname.com` واحفظ، وفعّل **Enforce HTTPS** بعد التحقق.
3. عند المسجّل أضف سجلات DNS:
   - `CNAME` للاسم `www` يشير إلى `USERNAME.github.io`
   - أربعة سجلات `A` للجذر `@` إلى: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. حدّث `siteUrl` في `site.json` إلى الدومين الجديد.
5. انتظر من دقائق إلى ساعات حتى ينتشر DNS.

## الخيار 2: Vercel

1. سجّل في [vercel.com](https://vercel.com) بحساب GitHub.
2. **Add New → Project** واختر مستودع `portfolio`.
3. اترك الإعدادات كما هي (Framework: **Other**، بلا أمر بناء)، واضغط **Deploy**.
4. الرابط يظهر فوراً `https://portfolio-xxxx.vercel.app`. ولربط دومين: **Settings → Domains** واتبع التعليمات.

ملاحظة: نظام المزامنة يكتب في مستودع GitHub، وVercel يعيد النشر تلقائياً عند كل commit، فالطريقتان متوافقتان.

## التحقق بعد النشر

- افتح الرابط من الجوال والكمبيوتر، وجرّب تبديل اللغة والوضع.
- شارك رابط مشروع (مثل `projects/brt-jeddah.html`) في واتساب وتأكد من ظهور الصورة والعنوان.
- افتح `https://الرابط/sitemap.xml` وتأكد أنه يعمل، ثم أضفه في [Google Search Console](https://search.google.com/search-console).
- شغّل [PageSpeed Insights](https://pagespeed.web.dev) على الرابط؛ الهدف فوق 90 في المحاور الأربعة.

## أسئلة شائعة

- **تغيّر المحتوى محلياً ولم يتغير على الموقع؟** المتصفح يخزّن مؤقتاً؛ افتح بنافذة خاصة أو انتظر دقيقة.
- **الخرائط لا تظهر؟** خرائط الأساس من OpenFreeMap تحتاج اتصالاً بالإنترنت ولا تحتاج مفتاحاً؛ تأكد أن `data/*.geojson` موجودة.
- **أريد إخفاء قسم؟** احذفه من `sections` في `site.json`.
