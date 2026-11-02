# -*- coding: utf-8 -*-
"""يبني content/*.json من بيانات الدرايف والجدول (المرحلة الثانية).
المصدر: الملخصات في مجلد 01 + جدول portfolio-content. لا أرقام إلا مما كتبه فارس في ملخصاته."""
import json, os
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
EMAIL = "farisx2002x@gmail.com"
DRIVE = lambda i: f"https://drive.google.com/file/d/{i}/view"
ADDED = "2026-10-23"

def bi(ar, en=""): return {"ar": ar, "en": en or ar}

# ملخص ← (معرّف درايف، عدد صفحات الملخص)
SUM = {
 "urp244-tod-neighbourhood": ("1t2pcqKFIEKb0QXIB8SumUbpX8h-jm7xW", 5),
 "al-jamea-local-unit": ("1LJyuhr7sB-0GQ97VGfaKaXgf3AopIxuv", 5),
 "khobar-hackathon": ("1DQPjlyteQ6SgVR-7AdPYnvUgWry0mtMm", 5),
 "ruwais-regeneration": ("1Chi9gu2tLxeRmsL-uD10hdUBpsiPgIVb", 5),
 "fawaz-urban-survey": ("1Y01J8rD4V2YtoYUjGscWjKdu4e43DLGi", 5),
 "urp244-density-far2": ("1MkD4pI6IFhtUPhnsyyjmBMBltlnDikLj", 3),
 "urp244-density-far07": ("18vg8wyk1d23iyuYwDZ3RhivUKu5jKdnd", 3),
 "asir-architecture-hawra": ("1Yr0t_LHgKdYgY8D_16PLkwpPvWcw13-2", 4),
 "hawra-poster-a1": ("1jSr1iaPQkm9RNKfAYtdtd6PD-MUYaoLB", 4),
 "jeddah-albalad-poster": ("11_RhAQogRXMl4OqtT3I4JRbaqLyiy6Ve", 3),
 "geom300-uav-office-profile": ("1yrevi3T6Dc6Ac7WGebHNT_dv5m9hmC4Y", 3),
 "residential-water-saving": ("1fQ18zDcBorEIcLmLwGKabw-7rUC62zV1", 3),
 "kau-campus-survey": ("1-porl1xZOVgfcU8PceL4vXMalBy2FvpT", 3),
 "cad-revit-portfolio": ("1Tda8luP-7TwI5joWAHFLTX8fBR_H6InD", 3),
}
CERT_SUMMARY = "1MwAp9HAXiWaUaw5xiJYzxXd5rq2l3WH4"
# مجلد كل مشروع داخل «02 المشاريع» (بالمعرّف)
FOLDERS = {
 "al-jamea-local-unit": "1fJ3uyI_nqlB4AQLgH82YuBPCFOsqK9jh", "urp244-tod-neighbourhood": "1S7GYZ14NHAqOchZ92OHR1QMcNWpct90G",
 "residential-water-saving": "1XJK_b3pkPlP7woSvjHEPinuL0Tnd0D6L", "jeddah-albalad-poster": "1_vHnVmE8xkedIUMnq6slxEtqvYp_HTA-",
 "khobar-hackathon": "15EKUKbh9VSMRxZ-mO5BHf2TmScOwG8tW", "kau-campus-survey": "1338kcwf4z25sx6HZmek7y4uwj02itutU",
 "asir-architecture-hawra": "1cXSxFPaiURD3VeLNkkOXWBhTDwIlD0Eh", "geom300-uav-office-profile": "1-p77c7AcFvj2d8jurmDUZipMdvIqxNLE",
 "hawra-poster-a1": "1YU13YUIjPmoYqptIuZmr1m82QMOb9hrA", "fawaz-urban-survey": "14qkfQ8NBTyStQqYWXVqCboC2uz3tff6G",
 "ruwais-regeneration": "1zYITnIHHvhpnTI-MUAyjkrOmU4bAc8HG", "urp244-density-far2": "1KT_lffn-p-pnGF8jnNaD-xKEq8vYpHhX",
 "urp244-density-far07": "1KT_lffn-p-pnGF8jnNaD-xKEq8vYpHhX", "cad-revit-portfolio": "1Wj8CcbhtB2LAEyfU5CmtMmbc1Q7seorj",
 "urp233-building-survey": "1EXWuk0kjo3rJwnWBfNUYlheUTr8O4HQ7",
}

def proj(id, order, title_ar, title_en, summary_ar, summary_en, cats, type_, course, year, status, role_ar, role_en, team_ar, team_en,
         loc=None, problem=None, method=None, result=None, tools=(), skills=(), metrics=(), full=None, featured=False, extra=None):
    p = {"id": id, "order": order, "featured": featured, "added": ADDED, "title": bi(title_ar, title_en), "summary": bi(summary_ar, summary_en),
         "categories": list(cats), "type": type_, "course": course, "year": year, "status": status,
         "role": bi(role_ar, role_en), "team": bi(team_ar, team_en) if team_ar else None,
         "tools": list(tools), "skills": list(skills),
         "metrics": [{"value": v, "label": bi(a, e)} for v, a, e in metrics],
         "cover": "", "gallery": [], "slides": [], "files": [], "links": []}
    if loc: p["location"] = loc
    if problem: p["problem"] = bi(*problem)
    if method: p["method"] = bi(*method)
    if result: p["result"] = bi(*result)
    if id in SUM:
        did, pages = SUM[id]
        p["summaryDriveId"] = did
        p["summaryPages"] = pages
        p["files"].append({"label": bi("ملخص المشروع (PDF)", "Project summary (PDF)"), "request": True, "driveId": did})  # لا رابط مباشر: التحميل بإذن
    if id in FOLDERS: p["driveFolder"] = FOLDERS[id]
    if full: p["fullDeck"] = {"onRequest": True, "pages": full[0], "note": bi(full[1], full[2] if len(full) > 2 else full[1]), "email": EMAIL}
    if extra: p.update(extra)
    return p

P = []
P.append(proj("al-jamea-local-unit", 1, "حي الجامعة: وحدة محلية تتنفس", "Al-Jamiah: a local unit that breathes",
  "مخطط سكني بمساحة 22.2 هكتار في قلب جدة، صُمّم ليتجاوب مع حرارة المدينة ورياحها الشمالية، ويجمع الخدمات والمسجد والحدائق في قلب الحي.",
  "A 22.2-ha residential local unit in Jeddah designed to respond to heat and northerly winds, with services, the mosque and parks at its heart.",
  ["planning", "urban-design"], "course", "استديو التخطيط 3-1 · 2025", 2025, "completed", "عمل فردي: التحليل والفكرة والمخطط العام والإظهار", "Individual: analysis, concept, master plan and renders", "", "",
  loc={"name": bi("حي الجامعة، جدة", "Al-Jamiah, Jeddah"), "lat": 21.464, "lon": 39.256},
  problem=("أرض أُزيلت ضمن مشاريع الإزالة على طريق مكة القديم قرب الجامعة، تحتاج إعادة تخطيط تراعي مناخ جدة: حرارة عالية، رياح شمالية وشمالية غربية سائدة، وتعرّض للسيول.", "A cleared site on Old Makkah Road near the university that needed re-planning for Jeddah's climate: heat, prevailing north/north-west winds and flash-flood exposure."),
  method=("قراءة الموقع والمناخ (الرياح، الحرارة، الأمطار، الشمس، المناسيب) ثم ترجمتها إلى أربعة قرارات: التوجيه، المواد، التصريف، والظل. تطوّرت الفكرة على ثلاث مراحل من رسم يدوي إلى محور قطري يشبه الرقم 8 يربط الحدائق.", "Site and climate reading (wind, heat, rain, sun, levels) translated into four decisions: orientation, materials, drainage and shade. The concept evolved in three stages from a hand sketch to a figure-8 diagonal axis linking the parks."),
  result=("شوارع متدرجة بعروض 10 و15 و20 م، نسبة بناء 70%، ثلاثة نماذج مبانٍ (مستطيل، شبه مربع، سداسي) تلتف حول الحدائق، وخدمات ومسجد جامع في القلب. التقرير الكامل 42 صفحة.", "Hierarchical streets of 10/15/20 m, 70% building ratio, three building types (rectangular, near-square, hexagonal) wrapped around parks, with services and the main mosque at the centre. Full report: 42 pages."),
  tools=["AutoCAD", "Lumion", "ArcGIS Pro"], skills=["urban-design", "land-use", "site-selection", "terrain-analysis", "rendering"],
  metrics=[("22.2", "هكتار مساحة الموقع", "ha site area"), ("70%", "نسبة البناء", "building ratio"), ("3", "نماذج مبانٍ", "building types"), ("42", "صفحة في التقرير الكامل", "pages in the full report")],
  full=(42, "التقرير الكامل: البيانات والتحليل والجداول والمراحل.", "Full report: data, analysis, tables and phases."), featured=True))

P.append(proj("urp244-tod-neighbourhood", 2, "مجاورة سكنية تدور حول النقل (TOD)", "Transit-oriented residential neighbourhood (TOD)",
  "تصميم حي بمبادئ التنمية الموجّهة بالنقل: كثافة حول المحطات، شبكة مشاة ودراجات، ومركبات PRT ذاتية بدل الاعتماد الكلي على السيارة.",
  "A neighbourhood designed on TOD principles: density around stations, a walking and cycling network, and autonomous PRT vehicles instead of full car dependence.",
  ["planning", "transport", "urban-design"], "course", "URP-244 · الفصل الثاني 1447", 2026, "completed",
  "عضو فريق من ستة طلاب: صمّمت المنطقة الفرعية رقم 2 (الركن الشمالي الشرقي) وشاركت في المخطط العام ودليل PRT", "Member of a six-student team: designed sub-area 2 (north-east corner) and contributed to the master plan and PRT guide",
  "عمل جماعي · فريق من 6 طلاب", "Team project · 6 students",
  problem=("كيف نصمم مجاورة بمساحة 168 هكتاراً لنحو 40 ألف نسمة دون أن تكون السيارة الخاصة هي الوسيلة الوحيدة؟", "How to design a 168-ha neighbourhood for ~40,000 residents without the private car as the only mode?"),
  method=("أربع غايات وثمانية مبادئ TOD (المشي، الدراجات، الربط، النقل العام، المزيج، التكثيف، التضام، التحول). قُسّم المخطط إلى ست مناطق فرعية، صمّم كل طالب واحدة، وتلتقي كلها على شبكة PRT واحدة.", "Four goals and the eight TOD principles (walk, cycle, connect, transit, mix, densify, compact, shift). The plan was split into six sub-areas, one per student, all meeting on a single PRT network."),
  result=("مخطط نهائي بنحو 8,100 وحدة سكنية و240 نسمة/هكتار و195 خدمة، ومحطات PRT في قلب الحي. منطقتي (25 هكتاراً): 66 مبنى و1,188 وحدة حول ساحة مركزية وحدائق متصلة، وشارع رئيسي يعطي 12 م للمشاة والدراجات مقابل 8 م للسيارات.", "Final plan of ~8,100 units, 240 p/ha and 195 services with PRT stations at the core. My sub-area (25 ha): 66 buildings and 1,188 units around a central square and linked parks; the main street gives 12 m to pedestrians/cyclists versus 8 m to cars."),
  tools=["AutoCAD", "ArcGIS Pro", "Photoshop"], skills=["tod", "transport-planning", "urban-design", "land-use"],
  metrics=[("168", "هكتار مساحة الموقع", "ha site"), ("8,100", "وحدة سكنية في المخطط", "housing units"), ("240", "نسمة/هكتار", "people per ha"), ("1,188", "وحدة في منطقتي", "units in my sub-area")],
  full=(23, "العرض الكامل: المناطق الست ودليل PRT والمخطط النهائي.", "Full deck: the six sub-areas, PRT guide and final plan."), featured=True))

P.append(proj("khobar-hackathon", 3, "هاكاثون الخبر: نعيد وصل الحي ببحره", "Khobar hackathon: reconnecting the district to its sea",
  "مقترح لتحسين الترابط العمراني بين وسط الخبر والواجهة البحرية بشبكة محاور للمشاة تتجاوز حاجز طريق شرياني بعرض 80 م.",
  "A proposal to reconnect Khobar's centre with its waterfront through a network of pedestrian axes crossing an 80-m arterial barrier.",
  ["planning", "urban-design", "transport"], "competition", "هاكاثون التنمية الحضرية 2026 · هيئة تطوير المنطقة الشرقية", 2026, "completed",
  "عضو الفريق: تحليل الموقع، منهجية اختيار المحاور، وتقييم البدائل", "Team member: site analysis, axis-selection method and alternatives evaluation", "عمل جماعي", "Team project",
  loc={"name": bi("حي الخبر الشمالية، الخبر", "Al Khobar Al Shamaliyah, Khobar"), "lat": 26.3, "lon": 50.21},
  problem=("ضعف الترابط العمراني والحركي بين وسط المدينة والكورنيش بسبب طريق شرياني بعرض 80 م يعطي الأولوية للسيارة؛ والجذر، بتحليل «لماذا» الخمس، رؤية تخطيطية وظيفية بحتة لا تقوم على مدينة صديقة للمشاة.", "Weak urban and movement links between the centre and the corniche because of an 80-m car-first arterial; the root cause (five-whys) is a purely functional planning vision rather than a walkable city."),
  method=("قراءة الموقع طبقة طبقة، تحليل SWOT على الخريطة، معايير لاختيار المحاور (لا تعطل المداخل، شوارع حيوية، استثمار الأراضي الفضاء، توزيع متوازن)، ثم تقييم ثلاثة بدائل بستة معايير من 5: معابر سطحية 25/30، ممر معلق ونفق 23/30، جسر مشاة 21/30.", "Layered site reading, mapped SWOT, criteria for choosing the axes, then three alternatives scored on six criteria: at-grade crossings 25/30, deck and tunnel 23/30, pedestrian bridge 21/30."),
  result=("البديل المختار: أربعة محاور مشاة نحو البحر، بولاردات هيدروليكية تحوّل شارع الكورنيش إلى ممشى في نهاية الأسبوع، أرصفة 3–4 م، عبور مرتفع عند التقاطعات، وتشجير خطي. الأثر المقدّر من الفريق: اتصالية ×4 و20 ألف م² مسارات مشاة.", "Chosen alternative: four pedestrian axes to the sea, hydraulic bollards turning the corniche street into a weekend promenade, 3–4 m sidewalks, raised crossings and linear planting. Team-estimated impact: ×4 connectivity and 20,000 m² of pedestrian paths."),
  tools=["ArcGIS Pro", "Photoshop", "PowerPoint"], skills=["urban-design", "field-survey", "site-selection"],
  metrics=[("315", "هكتار منطقة الدراسة", "ha study area"), ("80 م", "عرض الطريق الفاصل", "barrier road width"), ("4", "محاور مشاة نحو البحر", "pedestrian axes"), ("25/30", "درجة البديل المختار", "chosen alternative score")],
  full=(20, "العرض الكامل: زيارة الموقع، الموجهات، البدائل كاملة ومقاطع الشوارع.", "Full deck: site visit, guidelines, all alternatives and street sections."), featured=True))

P.append(proj("ruwais-regeneration", 4, "حي الرويس: تجديد بلا محو الهوية", "Al-Ruwais: regeneration without erasing identity",
  "نسيج عمراني متدهور وبنية تحتية قاصرة وفراغات عامة قليلة؛ المشروع يعيد تنظيم الحي ويضيف الخدمات والحدائق مع الحفاظ على طابعه المحلي.",
  "A deteriorating fabric with weak infrastructure and few public spaces; the project reorganises the district and adds services and parks while keeping its local character.",
  ["planning", "urban-design"], "course", "التجديد الحضري · قسم التخطيط الحضري والإقليمي", 2026, "completed",
  "ضمن المجموعة الرابعة: الوضع الراهن، التحليل الرباعي على الخريطة، وتصميم منطقة المجموعة", "Group 4: existing conditions, mapped SWOT and the group's area design", "عمل جماعي · المجموعة الرابعة", "Team project · Group 4",
  loc={"name": bi("حي الرويس، جدة", "Al-Ruwais, Jeddah"), "lat": 21.53, "lon": 39.17},
  problem=("حي سكني بنسبة 80.4% إيجار، مبانٍ متوسطة الحالة في الوسط، طرق داخلية مختنقة، تكدس نفايات في الأراضي الفضاء، وضعف إنارة وتشجير.", "A largely rental district (80.4%), mid-condition buildings at the core, congested internal streets, waste on vacant land, poor lighting and greenery."),
  method=("مسح ميداني واستبيان وعدّ مروري (6,210 مركبة/س على طريق المدينة)، ثم تحليل رباعي موقّع على الخريطة، وثلاثة قرارات للمباني: إزالة، ترميم، إعادة إعمار.", "Field survey, questionnaire and traffic counts (6,210 veh/h on Madinah Road), a mapped SWOT, and three building decisions: demolish, restore, rebuild."),
  result=("خدمات أكثر (17 حديقة جديدة) وارتفاعات تتدرج 4–12 دوراً نحو الواجهة البحرية، وشارع السيد ممراً عمرانياً. في منطقة مجموعتنا حُفظ 76.5% من المباني وأُزيل 23.5% لصالح الفراغات والخدمات، مع ممشى ومسار دراجات في كل اتجاه.", "More services (17 new parks), heights stepping 4–12 floors towards the waterfront, Al-Sayed Street as an urban corridor. In our group's area 76.5% of buildings were kept and 23.5% removed for open space and services, with walking and cycling paths in each direction."),
  tools=["ArcGIS Pro", "AutoCAD", "Photoshop"], skills=["land-use", "field-survey", "urban-design"],
  metrics=[("175", "هكتار منطقة الدراسة", "ha study area"), ("34 ألف", "نسمة تقريباً", "residents approx."), ("3 → 20", "حديقة قبل وبعد", "parks before → after"), ("76.5%", "من المباني حُفظت في منطقتنا", "buildings kept in our area")],
  full=(4, "أربع لوحات كبيرة: التحليل والموجهات وكل المجموعات.", "Four large boards: analysis, guidelines and all groups.")))

P.append(proj("fawaz-urban-survey", 5, "حي الأمير فواز: قراءة حي من الداخل", "Prince Fawaz district: reading a district from within",
  "مسح ميداني شامل لجزء من الحي: كل قطعة وكل مبنى، مقابلات مع الأسر، عدّ للحركة المرورية، وقراءة لصورته البصرية.",
  "A comprehensive field survey of part of the district: every plot and building, household interviews, traffic counts and a visual reading.",
  ["planning"], "course", "URP-122 · 2025", 2025, "completed",
  "ضمن المجموعة الثانية (6 طلاب): المسح العمراني والمروري وتحليل النتائج", "Group 2 (6 students): urban and traffic survey and analysis", "عمل جماعي · 6 طلاب", "Team project · 6 students",
  loc={"name": bi("حي الأمير فواز الجنوبي، جدة", "Prince Fawaz South, Jeddah"), "lat": 21.41, "lon": 39.27},
  method=("أربعة مسوح: عمراني (176 قطعة، 13 تحليلاً)، اقتصادي واجتماعي (90 أسرة و321 فرداً)، مروري (562 موقفاً، 29 تقاطعاً، أوقات الذروة الأربع)، وبصري (خط السماء والطرز ونطاقات الخدمة).", "Four surveys: urban (176 plots, 13 analyses), socio-economic (90 households, 321 people), traffic (562 parking spaces, 29 junctions, four peaks) and visual (skyline, styles, service catchments)."),
  result=("82% استعمال سكني و81% مبانٍ قديمة بحالة ممتازة غالباً؛ 88% من الحدائق المخططة لم تُنشأ؛ منطقة العمائر الجنوبية بلا مواقف؛ و71% غير راضين عن الطرق بسبب الحفريات. التوصيات: إكمال الحدائق، مواقف نظامية، صيانة الشوارع، ورفع الوعي المالي للأسر.", "82% residential and 81% older buildings mostly in excellent condition; 88% of planned parks never built; the southern apartment zone has no parking; 71% dissatisfied with roads due to works. Recommendations: complete the parks, formal parking, street maintenance and household financial awareness."),
  tools=["ArcGIS Pro", "Excel", "PowerPoint"], skills=["field-survey", "land-use", "transport-planning"],
  metrics=[("176", "قطعة أرض مُسحت", "plots surveyed"), ("90", "أسرة في الاستبيان", "households interviewed"), ("88%", "حدائق مخططة لم تُنفّذ", "planned parks not built"), ("96", "صفحة في العرض الكامل", "pages in the full deck")],
  full=(96, "العرض الكامل: كل الخرائط والجداول والتحليلات.", "Full deck: all maps, tables and analyses.")))

P.append(proj("urp244-density-far2", 6, "بلوك سكني مكثّف (معامل بناء 2)", "Dense residential block (FAR 2)",
  "تمرين تصميم على قطعة 100×100 م: استيعاب 77 وحدة سكنية مع استعمالات أخرى، وترك معظم الأرض مفتوحة للمشاة والخضرة.",
  "A design exercise on a 100×100 m plot: fitting 77 units plus other uses while leaving most of the ground open for pedestrians and greenery.",
  ["planning", "urban-design"], "course", "URP-244 · تمرين الكثافة العمرانية", 2026, "completed", "عمل فردي", "Individual", "", "",
  method=("الكثافة ترتفع بالارتفاع لا بالانتشار: نوعان من المباني بمسطح 210 م² للدور حول ساحة مركزية حرة، ومحاور مشاة تربط المداخل بالساحة من كل الجهات.", "Density goes up, not out: two building types of 210 m² per floor around a free central square, with pedestrian axes linking every entrance to it."),
  result=("معامل بناء 2 ونسبة تغطية 0.37: المباني تغطي ثلث الأرض تقريباً و62.7% من القطعة مفتوحة (مشاة 17.4%، خضرة 25.7%، مواقف 19.5%). إجمالي مسطحات البناء 20,060 م².", "FAR 2 with 0.37 coverage: buildings cover about a third, 62.7% of the plot is open (paths 17.4%, green 25.7%, parking 19.5%). Total floor area 20,060 m²."),
  tools=["AutoCAD", "Photoshop"], skills=["land-use", "urban-design"],
  metrics=[("2", "معامل البناء FAR", "FAR"), ("77", "وحدة سكنية", "units"), ("385", "نسمة/هكتار", "people per ha"), ("0.37", "نسبة التغطية", "coverage")],
  full=(2, "لوحتا المسقط والكتل بالدقة الكاملة، مع السيناريو الثاني.", "Plan and massing boards at full resolution, with the second scenario."),
  extra={"related": ["urp244-density-far07"]}))

P.append(proj("urp244-density-far07", 7, "بلوك سكني هادئ (معامل بناء 0.7)", "Quiet residential block (FAR 0.7)",
  "القطعة نفسها 100×100 م بكثافة أقل: 20 وحدة سكنية في مبانٍ منخفضة تلتف حول ساحة خضراء ومسار مشاة متفرع.",
  "The same 100×100 m plot at lower density: 20 units in low buildings wrapped around a green square with a branching path.",
  ["planning", "urban-design"], "course", "URP-244 · تمرين الكثافة العمرانية", 2026, "completed", "عمل فردي", "Individual", "", "",
  method=("ثلاثة نماذج مبانٍ بعمق 18–19 م، سكني بالكامل (6,760 م²)، ومسار مشاة واحد متفرع يجمع كل المداخل في ساحة وسطى.", "Three building types 18–19 m deep, fully residential (6,760 m²), and one branching path gathering every entrance into a central square."),
  result=("معامل بناء 0.7 ونسبة تغطية 0.45 — أعلى من السيناريو المكثف رغم بناء أقل لأن المباني منخفضة وممتدة؛ ثلث الأرض خضرة (32.5%) والمواقف أقل من 7%.", "FAR 0.7 with 0.45 coverage — higher than the dense scenario despite less floor area, because the buildings are low and spread; a third of the plot is green (32.5%) and parking under 7%."),
  tools=["AutoCAD", "Photoshop"], skills=["land-use", "urban-design"],
  metrics=[("0.7", "معامل البناء FAR", "FAR"), ("20", "وحدة سكنية", "units"), ("100", "نسمة/هكتار", "people per ha"), ("32.5%", "مساحات خضراء", "green space")],
  full=(2, "لوحتا المسقط والكتل بالدقة الكاملة، مع السيناريو الأول.", "Plan and massing boards at full resolution, with the first scenario."),
  extra={"related": ["urp244-density-far2"]}))

P.append(proj("asir-architecture-hawra", 8, "عمارة عسير وقرية الهورة", "Asir architecture & Hawra village",
  "عملان عن المكان نفسه: قراءة لهوية العمارة الجبلية بالحجر والطين والخشب، ثم قرية الهورة في جبال بللسمر نموذجاً للسياحة القائمة على الطبيعة والتراث.",
  "Two works on the same place: a reading of mountain architecture in stone, mud and wood, then Hawra village in the Ballasmar mountains as a nature-and-heritage tourism model.",
  ["planning", "heritage", "urban-design"], "course", "GEOM 427 · العمارة السعودية", 2026, "completed",
  "البوستر الأول عمل جماعي من ثلاثة طلاب (عمارة عسير)، والثاني عمل فردي (قرية الهورة)", "First poster: team of three (Asir architecture); second: individual (Hawra village)", "بوستر جماعي + بوستر فردي", "One team poster + one individual poster",
  loc={"name": bi("رجال ألمع والهورة، عسير", "Rijal Almaa & Hawra, Asir"), "lat": 18.2, "lon": 42.28},
  method=("تحليل أربعة مبانٍ في رجال ألمع والمجاردة: نسبة العرض إلى الارتفاع، نسبة الحجر إلى الفراغ (8.9–15% فراغ)، والتقسيم الثلاثي للواجهة (قاعدة سميكة، وسط بنوافذ مزخرفة، تاج من الشرفات المسننة). ثم قراءة الهورة: موقعها على الكنتور ومواقعها التراثية الأربعة ومواسمها.", "Analysis of four buildings in Rijal Almaa and Al-Majardah: width-to-height, stone-to-void (8.9–15% void) and the tripartite facade. Then Hawra: its contour setting, four heritage sites and four seasons."),
  result=("تحديد عناصر الهوية العسيرية القابلة للترجمة بمواد اليوم، واقتراح الهورة وجهة سياحة مستدامة: بئران (110 و120 سنة)، مطحنة (90 سنة)، ومدرجات زراعية على مسار زيارة واحد.", "Identified Asiri identity elements translatable into today's materials, and proposed Hawra as a sustainable destination: two wells (110 and 120 years), a mill (90 years) and terraces on one visitor route."),
  tools=["ArcGIS Pro", "Photoshop", "Illustrator"], skills=["field-survey", "urban-design", "arcgis-pro"],
  metrics=[("4", "مبانٍ حُللت واجهاتها", "facades analysed"), ("3", "طبقات للواجهة العسيرية", "facade layers"), ("4", "مواقع تراثية في الهورة", "heritage sites in Hawra")],
  full=(2, "اللوحتان كاملتان بكل المخططات والصور بدقة الطباعة.", "Both posters at print resolution.")))

P.append(proj("hawra-poster-a1", 9, "بوستر A1: قرية الهورة الأثرية نموذجاً للسياحة المتكاملة", "A1 poster: Hawra heritage village as an integrated-tourism model",
  "قرية جبلية يلتقي فيها التاريخ والطبيعة والآثار والجيولوجيا. البوستر يقرأ موقعها ومواقعها التراثية ومناخها، ويقترحها وجهة سياحة مستدامة.",
  "A mountain village where history, nature, archaeology and geology meet. The poster reads its setting, heritage sites and climate and proposes it as a sustainable destination.",
  ["planning", "heritage"], "course", "GEOM 427", 2026, "completed", "عمل فردي: البحث والخرائط والتصميم", "Individual: research, maps and design", "", "",
  loc={"name": bi("الهورة، بللسمر، عسير", "Hawra, Ballasmar, Asir"), "lat": 18.17, "lon": 42.34},
  method=("خريطة الحدود على خطوط كنتور بفاصل متر، لقطة جوية للمواقع الأربعة، وجدول مناخي يحدد تجربة كل موسم.", "Boundary map on 1-m contours, an aerial view of the four sites, and a climate table defining each season's experience."),
  result=("الماء والحبوب والزراعة على مسافة مشي داخل القرية: المدرجات تربط المواقع في مسار واحد، والقرية تستقبل الزوار طوال السنة.", "Water, grain and farming within walking distance: terraces link the sites on one route and the village welcomes visitors year-round."),
  tools=["ArcGIS Pro", "Photoshop"], skills=["arcgis-pro", "terrain-analysis", "presentations"],
  metrics=[("4", "مواقع تراثية موثقة", "documented heritage sites"), ("120", "سنة عمر أقدم بئر", "years, oldest well"), ("A1", "حجم البوستر", "poster size")],
  full=(1, "البوستر بحجم A1 مع المعرض الكامل.", "The A1 poster with the full gallery."),
  extra={"related": ["asir-architecture-hawra"]}))

P.append(proj("jeddah-albalad-poster", 10, "البلد: جدة التاريخية قبل التجديد وبعده", "Al-Balad: historic Jeddah before and after regeneration",
  "بوستر يقارن حال جدة التاريخية قبل برنامج التجديد الحضري وبعده، بصور التقطتها بنفسي في الموقع.",
  "A poster comparing historic Jeddah before and after the regeneration programme, with my own site photography.",
  ["urban-design", "heritage"], "personal", "بوستر التراث العمراني", 2025, "completed", "عمل فردي · تصوير شخصي", "Individual · own photography", "", "",
  loc={"name": bi("جدة التاريخية (البلد)", "Historic Jeddah (Al-Balad)"), "lat": 21.4858, "lon": 39.1863},
  problem=("قبل التطوير: رواشين متهالكة، مبانٍ مهددة بالانهيار، ضعف المياه والصرف والإنارة، واستثمار سياحي قليل.", "Before: decaying rawashin, buildings at risk of collapse, weak utilities and lighting, little tourism investment."),
  result=("بعد برنامج تطوير جدة التاريخية: ترميم أكثر من 600 مبنى تاريخي، تحسين الشبكات، مسارات مشاة وساحات، ومتاحف ومقاهٍ تحافظ على لغة المكان. ملاحظتي: المحل الجديد الذي يُصمَّم بلغة المكان يصير جزءاً من المشهد لا دخيلاً عليه.", "After the programme: 600+ historic buildings restored, better networks, walkways and squares, and museums and cafés that keep the place's language. My observation: a new shop designed in the local idiom becomes part of the scene, not an intruder."),
  tools=["Photoshop", "Canva"], skills=["urban-design", "presentations"],
  metrics=[("2014", "إدراج اليونسكو", "UNESCO listing"), ("600+", "مبنى تاريخي رُمّم", "historic buildings restored"), ("4 → 5", "مشكلات قبل، تحسينات بعد", "problems before, improvements after")],
  full=(1, "البوستر كاملاً بجودة الطباعة.", "The full poster at print quality.")))

P.append(proj("geom300-uav-office-profile", 11, "من السماء إلى الخريطة: ملف مكتب مهني للمسح بالدرون", "From sky to map: a UAV survey office profile",
  "دراسة لمكتب سعودي متخصص في المسح الجوي: كيف يجمع البيانات بالطائرات المسيّرة، وكيف يحوّلها إلى خرائط ونماذج ثلاثية الأبعاد وتقارير.",
  "A profile of a Saudi aerial-survey office: how it collects data with UAVs and turns it into maps, 3D models and reports.",
  ["geomatics", "gis"], "course", "GEOM 300", 2026, "completed", "عمل فردي", "Individual", "", "",
  method=("ثلاث مراحل من الميدان إلى المخرجات: جمع البيانات (كاميرات، LiDAR، حساسات حرارية وطيفية ومغناطيسية)، المعالجة (تصحيحات GNSS، فوتوغرامتري، دمج GIS)، والمخرجات (KMZ، SHP، GeoTIFF).", "Three stages from field to deliverables: capture (cameras, LiDAR, thermal, spectral and magnetic sensors), processing (GNSS corrections, photogrammetry, GIS fusion) and outputs (KMZ, SHP, GeoTIFF)."),
  result=("ستة مجالات تخصص (المسح الجوي، الأثري، الجيولوجيا والتعدين، الرصد البيئي، النمذجة ثلاثية الأبعاد، التخطيط والبنية التحتية) ولماذا تهم المخطط: بيانات أساس دقيقة وسريعة لأي دراسة موقع.", "Six specialisms and why they matter to a planner: fast, accurate base data for any site study."),
  tools=["Agisoft Metashape", "DJI Pilot", "ArcGIS Pro"], skills=["drones", "photogrammetry", "gnss", "terrain-analysis"],
  metrics=[("3", "مراحل عمل", "workflow stages"), ("6", "مجالات تخصص", "specialisms")],
  full=(1, "لوحة الملف المهني وصفحة التعريف.", "The profile board and intro page.")))

P.append(proj("residential-water-saving", 12, "ترشيد المياه في البيئة السكنية", "Water saving in residential environments",
  "أربعة محاور تقلل استهلاك المياه في الحي: أدوات الصرف المنزلي، المياه المعالجة، الري الذكي، وإعادة استخدام المياه الرمادية.",
  "Four levers that cut neighbourhood water use: efficient fixtures, treated water, smart irrigation and greywater reuse.",
  ["planning", "sustainability"], "course", "بحث في الاستدامة", 2026, "completed", "ضمن فريق من أربعة طلاب", "Team of four", "عمل جماعي · 4 طلاب", "Team project · 4 students",
  method=("مراجعة مراجع رسمية (وزارة البيئة والمياه والزراعة، الكود السعودي للبناء، FAO، GORD) لتقدير أثر كل محور، ثم ربط التقنية بالتنظيم والتوعية.", "Review of official references (MEWA, Saudi Building Code, FAO, GORD) to estimate each lever's effect, then linking technology with regulation and awareness."),
  result=("وفورات مرجعية: أدوات الصرف حتى 50%، المياه المعالجة 30%، الري بالتنقيط 60%، والمياه الرمادية 50–70% من صرف البيت. توصيات: تعميم الأدوات الموفرة، نباتات محلية كالسدر والأثل، فصل تام لشبكة المياه المعالجة، وحملات توعية.", "Reference savings: fixtures up to 50%, treated water 30%, drip irrigation 60%, greywater 50–70% of household discharge. Recommendations: efficient fixtures, native plants, full separation of treated-water networks and awareness campaigns."),
  tools=["PowerPoint", "Word"], skills=["report-writing"],
  metrics=[("4", "محاور", "levers"), ("4", "مراجع رسمية", "official references")],
  full=(1, "العرض الكامل: المحاور الأربعة بالتفصيل والتحديات والمراجع.", "Full deck: the four levers in detail, challenges and references.")))

P.append(proj("kau-campus-survey", 13, "رفع فراغ حضري باليد: من القياس إلى المجسم", "Hand survey of an urban space: from measurement to model",
  "قياس ورسم الفراغ الخارجي حول مباني كلية الاقتصاد والإدارة ومعهد الاقتصاد الإسلامي في جامعة الملك عبدالعزيز، في ست لوحات مرسومة يدوياً.",
  "Measuring and drawing the outdoor space around the Economics faculty and the Islamic Economics institute at KAU, in six hand-drawn boards.",
  ["geomatics", "urban-design"], "course", "URP-111 · مهارات التخطيط الأساسية", 2025, "completed", "عمل فردي", "Individual", "", "",
  loc={"name": bi("جامعة الملك عبدالعزيز، جدة", "KAU campus, Jeddah"), "lat": 21.4955, "lon": 39.2451},
  method=("تصوير ← قياس بالشريط ← كروكي في الموقع ← لوحات: المسقط العام، الموقع، القطاعات والواجهات، الأيزومتري، المسقط المائل، وتكبير جزء من الموقع.", "Photograph → tape measurement → on-site sketch → boards: master plan, site plan, sections and elevations, isometric, oblique, and an enlarged detail."),
  result=("قراءة المقياس والقياس الدقيق في الميدان، والتحويل بين المسقط والقطاع والمنظور، وإخراج لوحات بإطار ومعلومات ومقياس موحد.", "Reading scale and measuring precisely in the field, converting between plan, section and perspective, and producing boards with a consistent frame, title block and scale."),
  tools=["رسم يدوي", "GNSS"], skills=["surveying", "field-survey"],
  metrics=[("6", "لوحات يدوية", "hand-drawn boards")],
  full=(6, "ست لوحات بالدقة الكاملة.", "Six boards at full resolution.")))

P.append(proj("cad-revit-portfolio", 14, "فيلا سكنية: من الخط إلى الإظهار", "Villa: from line to render",
  "رسم المساقط في AutoCAD، ثم بناء النموذج ثلاثي الأبعاد في Revit، ثم إخراجه بإظهارات واقعية في Lumion على نسختين: أولى ومعدّلة.",
  "Plans in AutoCAD, a 3D model in Revit, then realistic renders in Lumion, in two versions: first and revised.",
  ["design"], "course", "الحاسوب لتصاميم البيئة · السنة التحضيرية", 2024, "completed", "عمل فردي", "Individual", "", "",
  method=("ثلاث أدوات، كل واحدة تبني على التي قبلها: مساقط ثنائية الأبعاد ← نموذج BIM بواجهات وقطاعين ومناظير من نموذج واحد ← إظهار بالإضاءة والمواد والتشجير.", "Three tools, each building on the last: 2D plans → a BIM model with elevations, two sections and perspectives → renders with lighting, materials and planting."),
  result=("بيت من دورين مع الحوش والسطح، بنسختين أولى ومعدّلة، في ملف من 34 صفحة.", "A two-storey house with courtyard and roof, in first and revised versions, in a 34-page file."),
  tools=["AutoCAD", "Revit 2023", "Lumion"], skills=["autocad", "revit", "rendering"],
  metrics=[("3", "برامج في مسار واحد", "tools in one workflow"), ("2", "نسختان", "versions"), ("34", "صفحة في الملف الكامل", "pages")],
  full=(34, "الملف الكامل: الواجبات والاختبارات بنسختيها.", "Full file: assignments and tests in both versions.")))

# مشاريع ثانوية وقيد العمل (من الجدول، بلا ملخص بعد)
P.append(proj("brt-jeddah", 20, "BRT جدة", "BRT Jeddah",
  "دراسة شبكة حافلات نقل سريع لمدينة جدة كاملة مع مثال تطبيقي على ممر واحد.", "A bus-rapid-transit network study for all of Jeddah with a worked example on one corridor.",
  ["planning", "transport", "gis"], "graduation", "URP477", 2026, "in-progress", "عمل فردي", "Individual", "", "",
  loc={"name": bi("جدة", "Jeddah"), "lat": 21.57, "lon": 39.19}, tools=["ArcGIS Pro", "Network Analyst"], skills=["transport-planning", "network-analysis"], featured=True,
  extra={"noSummary": True}))
P.append(proj("smart-school-mobility", 21, "التنقل المدرسي الذكي في جدة", "Smart school mobility, Jeddah",
  "تقييم سهولة وصول الحافلة المدرسية الكبيرة إلى منزل كل طالب على ثلاثة مستويات.", "Assessing how easily a large school bus can reach each student's home, on three levels.",
  ["transport", "gis"], "graduation", "URP477", 2026, "in-progress", "عمل فردي", "Individual", "", "",
  loc={"name": bi("جدة", "Jeddah"), "lat": 21.5, "lon": 39.2}, tools=["ArcGIS Pro", "ArcPy"], skills=["transport-planning", "accessibility", "automation"], featured=True, extra={"noSummary": True}))
P.append(proj("madinah-gis", 22, "قاعدة بيانات المدينة المنورة", "Madinah GIS database",
  "بناء قاعدة بيانات مكانية تفصيلية للمدينة المنورة كاملة انطلاقاً من قاعدة بيانات الأمانة.", "Building a detailed spatial database for all of Madinah from the municipality's database.",
  ["gis"], "graduation", "", 2026, "in-progress", "عمل فردي", "Individual", "", "",
  loc={"name": bi("المدينة المنورة", "Madinah"), "lat": 24.467, "lon": 39.611}, tools=["ArcGIS Pro"], skills=["geodatabase", "arcgis-pro"], extra={"noSummary": True}))
P.append(proj("multipolar-development", 23, "التنمية متعددة الأقطاب: ساحل تبوك", "Multi-polar regional development, Tabuk coast",
  "تحليل ملاءمة لتوزيع أقطاب النمو بين الوجه وضباء والبدع وأشواق.", "A suitability analysis for distributing growth poles among Al Wajh, Duba, Al Bad' and Ashwaq.",
  ["regional", "gis", "planning"], "course", "", 2026, "in-progress", "", "", "", "",
  loc={"name": bi("ساحل تبوك", "Tabuk coast"), "lat": 27.5, "lon": 35.9}, tools=["ArcGIS Pro"], skills=["suitability-analysis", "regional-planning"], extra={"noSummary": True}))
P.append(proj("tabuk-alula-studio", 24, "دراسات تبوك والعلا", "Tabuk & AlUla planning studies",
  "استديو تخطيطي يدرس محافظتي تبوك والعلا.", "A planning studio on Tabuk and AlUla governorates.",
  ["planning", "regional"], "course", "URP355", 2026, "in-progress", "", "", "", "",
  loc={"name": bi("تبوك والعلا", "Tabuk & AlUla"), "lat": 27.3, "lon": 37.3}, tools=["ArcGIS Pro"], skills=["regional-planning", "arcgis-pro"], extra={"noSummary": True}))
P.append(proj("lynch-waterfront", 25, "صورة المدينة: الواجهة البحرية في جدة", "Image of the City: Jeddah waterfront",
  "تطبيق عناصر كيفن لينش الخمسة على الواجهة البحرية مع تصوير الممشى بكاميرا 360°.", "Applying Kevin Lynch's five elements to the waterfront, with 360° photography of the promenade.",
  ["urban-design", "planning"], "course", "", 2026, "in-progress", "ضمن فريق", "Team member", "عمل جماعي", "Team project",
  loc={"name": bi("الواجهة البحرية، جدة", "Jeddah waterfront"), "lat": 21.6, "lon": 39.1}, tools=["Insta360", "ArcGIS Pro"], skills=["urban-design", "field-survey"], extra={"noSummary": True}))
P.append(proj("jeddah-removals", 26, "إزالات جدة والأراضي المستعادة", "Jeddah removals & reclaimed lands",
  "دراسة لعمليات الإزالة في جدة مع التركيز على الأراضي المستعادة وفرص إعادة توظيفها.", "A study of Jeddah's demolitions focusing on reclaimed land and reuse opportunities.",
  ["planning", "gis"], "course", "", 2026, "in-progress", "", "", "", "",
  loc={"name": bi("جدة", "Jeddah"), "lat": 21.54, "lon": 39.2}, tools=["ArcGIS Pro"], skills=["land-use", "arcgis-pro"], extra={"noSummary": True}))
P.append(proj("taxi-rank-priority", 27, "أولويات مواقف التاكسي في جدة", "Jeddah taxi-rank prioritisation",
  "تصنيف مواقف عامة وخاصة بفئات A/B/C واختيار خمسة مواقع لكل فئة.", "Classifying public and private ranks into A/B/C and picking five sites per class.",
  ["transport", "gis"], "course", "", 2026, "completed", "عمل فردي · مشروع أكاديمي", "Individual · academic project", "", "",
  loc={"name": bi("جدة", "Jeddah"), "lat": 21.5, "lon": 39.18}, tools=["ArcGIS Pro"], skills=["site-selection", "transport-planning"], extra={"noSummary": True}))
P.append(proj("transport-toolbox", 28, "أداة النقل الموحدة", "Unified transport toolbox",
  "دمج برامج النقل العام والمدرسي وسيارات الأجرة في واجهة واحدة.", "Merging the public-, school- and taxi-transport programs into one interface.",
  ["digital", "transport"], "personal", "", 2026, "in-progress", "عمل فردي", "Individual", "", "",
  tools=["Python", "ArcPy"], skills=["automation", "transport-planning"], extra={"noSummary": True}))
P.append(proj("urp233-building-survey", 29, "قاعدة بيانات مباني (حصر ميداني)", "Building survey database",
  "جدول حصر للمباني: استعمال الأرض ونوع السكن والارتفاع والحالة.", "A building inventory: land use, housing type, height and condition.",
  ["gis", "planning"], "course", "URP233", 2025, "in-progress", "", "", "", "",
  tools=["Excel"], skills=["field-survey", "excel"], extra={"noSummary": True}))

for p in P:
    if p.get("team") is None: p.pop("team", None)
json.dump(P, open("content/projects.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── البوسترات واللوحات (03) ──
POSTERS = [
 {"id": "poster-hawra-a1", "title": bi("قرية الهورة الأثرية (A1)", "Hawra heritage village (A1)"), "kind": "poster", "size": "A1", "course": "GEOM 427", "project": "hawra-poster-a1", "image": "", "publishable": True, "driveId": "1-qbX9mf2sBFiqSgQ2h0J17mSDjPIGC6C"},
 {"id": "posters-asir-hawra", "title": bi("عمارة عسير + قرية الهورة (بوستران)", "Asir architecture + Hawra (two posters)"), "kind": "poster", "size": "", "course": "GEOM 427", "project": "asir-architecture-hawra", "image": "", "publishable": True, "driveId": "1wS8pnQDw-5NLtOQYAnXie02Gl4IA0GRN"},
 {"id": "poster-uav-office", "title": bi("من السماء إلى الخريطة", "From sky to map"), "kind": "poster", "size": "", "course": "GEOM 300", "project": "geom300-uav-office-profile", "image": "", "publishable": True, "driveId": "1qhdFKB0HfnwXOK9q9QxDmRLV8GtzpbnZ"},
 {"id": "board-far2", "title": bi("لوحة بلوك كثافة عالية FAR 2", "High-density block board (FAR 2)"), "kind": "board", "size": "", "course": "URP-244", "project": "urp244-density-far2", "image": "", "publishable": True, "driveId": "1SPXTUAtGg7whA8Mjyl_5lQ2krz4s2ykA"},
 {"id": "board-far07", "title": bi("لوحة بلوك كثافة متوسطة FAR 0.7", "Medium-density block board (FAR 0.7)"), "kind": "board", "size": "", "course": "URP-244", "project": "urp244-density-far07", "image": "", "publishable": True, "driveId": "1ffARI4wx5JyDSQFlvq0ONiMlqNfXXa_5"},
 {"id": "poster-albalad", "title": bi("البلد قبل التجديد وبعده", "Al-Balad before and after"), "kind": "poster", "size": "A5", "course": "", "project": "jeddah-albalad-poster", "image": "", "publishable": False, "note": bi("الملف الأصلي لا يُنشر؛ يُعرض الملخص بدلاً منه.", "Original not published; the summary is shown instead.")},
 {"id": "boards-tod", "title": bi("لوحتا معرض مجاورة TOD (فريق)", "TOD neighbourhood exhibition boards (team)"), "kind": "board", "size": "", "course": "URP-244", "project": "urp244-tod-neighbourhood", "image": "", "publishable": False, "note": bi("عمل جماعي؛ اللوحات لا تُنشر حفاظاً على خصوصية الزملاء، ويُعرض الملخص بدلاً منها.", "Team work; boards not published to respect teammates' privacy — the summary is shown instead.")},
 {"id": "boards-urp111", "title": bi("ست لوحات يدوية: رفع فراغ حضري", "Six hand-drawn boards: urban space survey"), "kind": "hand", "size": "", "course": "URP-111", "project": "kau-campus-survey", "image": "", "publishable": True, "driveId": "1X19pW1L3yroKnYKyuj7EwlnigZEBiCv5"},
]
json.dump(POSTERS, open("content/posters.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── الشهادات والتطوع (04) ──
C = [
 {"id": "kau-excellence", "title": bi("شهادة التفوق للعام الجامعي 2025–2026", "Certificate of Excellence, 2025–2026"), "issuer": bi("عمادة شؤون الطلاب، جامعة الملك عبدالعزيز", "Deanship of Student Affairs, KAU"), "date": "2026", "category": "honors", "driveName": "شهادة تفوق - عمادة شؤون الطلاب 2025-2026 نسخة للموقع"},
 {"id": "studio2025-nhc", "title": bi("شكر وتقدير: معرض استديو 2025 مع الشركة الوطنية للإسكان", "Appreciation: Studio 2025 exhibition with NHC"), "issuer": bi("كلية العمارة والتخطيط، جامعة الملك عبدالعزيز", "Faculty of Architecture & Planning, KAU"), "date": "2025", "category": "honors", "skills": ["urban-design"], "driveName": "شهادة شكر - استديو 2025 مع الوطنية للإسكان"},
 {"id": "urban-october-2025", "title": bi("شكر وتقدير: فعاليات أكتوبر الحضري 2025", "Appreciation: Urban October 2025"), "issuer": bi("كلية العمارة والتخطيط، جامعة الملك عبدالعزيز", "Faculty of Architecture & Planning, KAU"), "date": "2025-10", "category": "honors", "driveName": "شهادة شكر - أكتوبر الحضري 2025"},
 {"id": "research-day-2025-26", "title": bi("شكر: فريق تنظيم ملتقى الدراسات العليا (Research Day)", "Appreciation: Graduate Studies Forum organising team"), "issuer": bi("قسم التخطيط الحضري والإقليمي، جامعة الملك عبدالعزيز", "Dept. of Urban & Regional Planning, KAU"), "date": "2026", "category": "honors", "driveName": "شهادة شكر - تنظيم ملتقى الدراسات العليا 2025-2026"},
 {"id": "eng-urban-day-26", "title": bi("شكر: اليوم الهندسي والعمراني 26 (فريق KAUPT)", "Appreciation: Engineering & Urban Day 26 (KAUPT team)"), "issuer": bi("قسم التخطيط الحضري والإقليمي، جامعة الملك عبدالعزيز", "Dept. of Urban & Regional Planning, KAU"), "date": "2026-02", "category": "honors", "driveName": "شهادة شكر - اليوم الهندسي والعمراني 26"},
 {"id": "volunteer-104h-2025", "title": bi("شهادة تطوع: 104 ساعات — فعالية أكتوبر الحضري", "Volunteering certificate: 104 hours — Urban October"), "issuer": bi("المنصة الوطنية للعمل التطوعي · المركز الوطني لتنمية القطاع غير الربحي", "National Volunteer Platform · National Center for Non-Profit Sector Development"), "date": "2025-11", "category": "volunteer", "note": bi("9 أكتوبر – 3 نوفمبر 2025، مع الإدارة العامة للمسؤولية الاجتماعية وخدمة المجتمع بالجامعة. الشهادة لا تُنشر لأنها تحمل رقم الهوية.", "9 Oct – 3 Nov 2025 with KAU's Social Responsibility & Community Service administration. Certificate not published (contains ID number)."), "noFile": True},
 {"id": "volunteer-log", "title": bi("فرص تطوعية أخرى على المنصة الوطنية", "Other volunteering on the national platform"), "issuer": bi("المنصة الوطنية للعمل التطوعي", "National Volunteer Platform"), "date": "2026", "category": "volunteer", "note": bi("تنظيم وتنسيق وإدارة معرض «عبق الماضي» بكلية العمارة والتخطيط (10–12 فبراير)، والمشاركة في مبادرة تنظيف وتعقيم المساجد في جدة (8 سبتمبر).", "Organising and managing the 'Fragrance of the Past' exhibition at the Faculty (10–12 Feb), and the mosque cleaning initiative in Jeddah (8 Sep)."), "driveName": "سجل التطوع - لقطة من المنصة الوطنية"},
 {"id": "ai-bootcamp", "title": bi("إتمام معسكر الذكاء الاصطناعي (10 ساعات)", "AI Bootcamp completion (10 hours)"), "issuer": bi("مجموعة عزيز للطائرات المسيّرة والروبوتات DRAG، عمادة شؤون الطلاب", "Drone & Robotics Aziz Group (DRAG), KAU Student Affairs"), "date": "2023-11", "category": "professional", "skills": ["ai-tools"], "note": bi("13–16 نوفمبر 2023: الجبر الخطي، الانحدار، الإحصاء والشبكات العصبية.", "13–16 Nov 2023: linear algebra, regression, statistics and neural networks."), "driveName": "شهادة إتمام - معسكر الذكاء الاصطناعي 2023"},
 {"id": "smart-cities-ssce", "title": bi("حضور محاضرة: مفاهيم تقنيات المدن الذكية", "Attendance: Smart City Technologies lecture"), "issuer": bi("الجمعية السعودية للهندسة المدنية", "Saudi Society of Civil Engineering"), "date": "2024-02", "category": "planning", "credentialId": "SSCE/T/O/2024/294", "skills": ["15-min-city"], "driveName": "شهادة حضور - محاضرة المدن الذكية 2024"},
 {"id": "ncg-english", "title": bi("دورة اللغة الإنجليزية العامة، دبلن", "General English course, Dublin"), "issuer": bi("New College Group، دبلن، أيرلندا", "New College Group, Dublin, Ireland"), "date": "2022-09", "category": "language", "driveName": "شهادة دورة - اللغة الإنجليزية دبلن 2022"},
]
for x in C:
    x.setdefault("added", ADDED); x.setdefault("image", ""); x.setdefault("pdf", ""); x.setdefault("verifyUrl", ""); x.setdefault("skills", [])
json.dump(C, open("content/certificates.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── الملف الشخصي (من الجدول) ──
profile = {
 "name": bi("فارس الأسمري", "Fares Al-Asmari"),
 "fullName": bi("فارس عبدالله حسن الأسمري", "Faris Abdullah Hassan Al-Asmari"),
 "title": bi("مخطط حضري وإقليمي · GIS وتخطيط النقل", "Urban & Regional Planner · GIS & Transport"),
 "headline": bi("مخطط حضري وإقليمي · نظم المعلومات الجغرافية والتحليل المكاني · تخطيط النقل والتنقل", "Urban & Regional Planner · GIS & Spatial Analysis · Transport & Mobility Planning"),
 "tagline": bi("أخطّط المدن بالبيانات، وأبني الأدوات التي تجعلها أذكى.", "Planning cities with data — and building the tools that make them smarter."),
 "bio": bi("طالب تخطيط حضري وإقليمي في جامعة الملك عبدالعزيز، حاصل على شهادة التميز للعام الجامعي 2025–2026. أكملت برنامج تدريب تعاوني في إدارة هندسة المرافق بشركة حافل للنقل (مجموعة محمد يوسف ناغي)، واستمررت بعده بدوام جزئي. خبرتي العملية في التحليل المكاني والشبكي على GIS، والتقييم الطبوغرافي والهيدرولوجي للمواقع، وتصميم مرافق النقل، ودراسات الجدوى المقارنة للمواقع، مع الرفع بالدرون والنمذجة ثلاثية الأبعاد.",
            "Urban & Regional Planning student at King Abdulaziz University and recipient of the University's Certificate of Excellence (2025–2026). Completed a cooperative training programme with the Facilities Engineering Department at Hafil (Mohamed Yousuf Naghi Group) and was retained part-time. Practical experience in GIS-based site and network analysis, topographic and hydrological site assessment, transport-facility layout design and comparative site feasibility, combined with drone surveying and 3D modelling."),
 "location": bi("جدة، المملكة العربية السعودية", "Jeddah, Saudi Arabia"),
 "photo": "media/profile.webp",
 "availability": {"open": True, "note": bi("متاح للمشاريع والعمل الحر", "Available for projects and freelance work")},
 "contact": {"email": EMAIL, "whatsapp": "+966580002585", "linkedin": "https://www.linkedin.com/in/faris-a-alasmari-3a4a2a337", "x": "", "github": "", "behance": ""},
 "cvFile": "request",  # التحميل بإذن
 "languages": [{"name": bi("العربية", "Arabic"), "level": bi("لغة أم", "Native")}, {"name": bi("الإنجليزية", "English"), "level": bi("مستوى مهني", "Professional working proficiency")}],
 "highlights": [{"value": "204", "label": bi("ساعة تطوع (104 منها موثقة بشهادة)", "volunteer hours (104 certified)")}, {"value": "14", "label": bi("مشروعاً بملخص جاهز", "projects with a summary")}, {"value": "4", "label": bi("تكريمات من الكلية", "faculty honours")}],
 "requestFull": {"email": EMAIL, "subject": bi("طلب العرض الكامل", "Request for the full deck")},
}
json.dump(profile, open("content/profile.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── الخبرات والتعليم ──
EXP = [
 {"id": "hafil-parttime", "role": bi("مساعد تخطيط ونظم معلومات جغرافية (دوام جزئي)", "Planning & GIS Assistant (part-time)"), "org": bi("شركة حافل للنقل · مجموعة محمد يوسف ناغي · إدارة هندسة المرافق", "Hafil Transport · Mohamed Yousuf Naghi Group · Facilities Engineering"), "type": "job", "start": "2026-08", "end": "present", "location": bi("جدة", "Jeddah"), "skills": ["arcgis-pro", "site-selection"]},
 {"id": "hafil-coop", "role": bi("متدرب تعاوني: تخطيط حضري ونظم معلومات جغرافية", "Cooperative trainee: urban planning & GIS"), "org": bi("شركة حافل للنقل · مجموعة محمد يوسف ناغي · إدارة هندسة المرافق", "Hafil Transport · Mohamed Yousuf Naghi Group · Facilities Engineering"), "type": "training", "start": "2026-06", "end": "2026-08", "location": bi("جدة", "Jeddah"), "skills": ["network-analysis", "terrain-analysis", "web-mapping", "site-selection", "report-writing"]},
 {"id": "volunteering", "role": bi("متطوع ومنظم فعاليات", "Volunteer & event organiser"), "org": bi("المنصة الوطنية للعمل التطوعي · كلية العمارة والتخطيط", "National Volunteer Platform · Faculty of Architecture & Planning"), "type": "volunteer", "start": "2025-10", "end": "present", "summary": bi("204 ساعة تطوع، منها 104 موثقة بشهادة في أكتوبر الحضري 2025، وتنظيم وإدارة معرض «عبق الماضي»، والمشاركة في تنظيم ملتقى الدراسات العليا واليوم الهندسي والعمراني 26.", "204 volunteer hours, 104 of them certified in Urban October 2025, organising and managing the 'Fragrance of the Past' exhibition, and co-organising the Graduate Studies Forum and Engineering & Urban Day 26."), "skills": []},
]
json.dump(EXP, open("content/experience.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
EDU = [{"id": "kau-burp", "degree": bi("بكالوريوس التخطيط الحضري والإقليمي", "B.Sc. Urban and Regional Planning"), "institution": bi("جامعة الملك عبدالعزيز · كلية العمارة والتخطيط · جدة", "King Abdulaziz University · Faculty of Architecture and Planning · Jeddah"), "start": "", "end": "2028", "notes": bi("شهادة التميز للعام الجامعي 2025–2026.", "Certificate of Excellence, 2025–2026.")}]
json.dump(EDU, open("content/education.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── المهارات (من الجدول؛ المستويات غير معبأة بعد → null) ──
G = [("planning", "core", "التخطيط الحضري والإقليمي", "Urban & Regional Planning", [
        ("transport-planning", "تخطيط النقل", "Transport planning"), ("tod", "التطوير الموجّه بالنقل TOD", "Transit-oriented development"),
        ("15-min-city", "مدينة الـ15 دقيقة", "15-minute city"), ("site-selection", "دراسات الجدوى المقارنة للمواقع", "Comparative site feasibility"),
        ("land-use", "استعمالات الأراضي ومعامل البناء FAR", "Land use & FAR analysis"), ("suitability-analysis", "تحليل الملاءمة", "Suitability analysis"),
        ("regional-planning", "التخطيط الإقليمي", "Regional planning"), ("urban-design", "التصميم الحضري", "Urban design"), ("field-survey", "المسوحات الميدانية", "Field surveys")]),
     ("gis", "core", "نظم المعلومات الجغرافية", "GIS & Spatial Analysis", [
        ("arcgis-pro", "ArcGIS Pro", "ArcGIS Pro"), ("web-mapping", "خرائط الويب ArcGIS Online", "Web mapping (ArcGIS Online)"), ("network-analysis", "التحليل الشبكي", "Network analysis"),
        ("accessibility", "تحليل إمكانية الوصول", "Accessibility analysis"), ("geodatabase", "قواعد البيانات المكانية", "Geodatabases"), ("spss", "التحليل الإحصائي SPSS", "IBM SPSS")]),
     ("geomatics", "support", "الجيوماتكس والمساحة", "Geomatics & Surveying", [
        ("gnss", "جمع البيانات بنظام GNSS", "GNSS data collection"), ("drones", "تشغيل الدرون DJI Pilot", "Drone operation (DJI Pilot)"), ("photogrammetry", "التصوير المساحي Agisoft Metashape", "Photogrammetry (Agisoft Metashape)"),
        ("terrain-analysis", "قراءة البيانات الطبوغرافية والهيدرولوجية", "Topographic & hydrological interpretation"), ("surveying", "الرفع المساحي", "Surveying")]),
     ("design", "support", "التصميم والنمذجة", "Design & 3D Modelling", [
        ("autocad", "AutoCAD", "AutoCAD"), ("revit", "Revit", "Revit"), ("sketchup", "SketchUp", "SketchUp"), ("rendering", "الإظهار Lumion وD5", "Rendering (Lumion, D5)"), ("adobe", "Photoshop وAdobe", "Photoshop & Adobe Suite")]),
     ("digital", "support", "البيانات والعروض والأتمتة", "Data, Presentation & Automation", [
        ("excel", "Excel", "Microsoft Excel"), ("presentations", "تصميم العروض Canva وPowerPoint", "Presentation design"), ("report-writing", "كتابة التقارير الفنية", "Technical report writing"),
        ("automation", "البرمجة والأتمتة Python", "Python & automation"), ("ai-tools", "أدوات الذكاء الاصطناعي", "AI tools")])]
skills = {"groups": [{"id": g, "tier": tier, "title": bi(a, e), "items": [{"id": i, "name": bi(n, ne), "level": None} for i, n, ne in items]} for g, tier, a, e, items in G],
          "tools": [{"name": n, "level": None} for n in ["ArcGIS Pro", "ArcPy / Python", "AutoCAD", "Revit", "Lumion", "Agisoft Metashape", "DJI Pilot", "Excel", "SPSS", "Photoshop", "Canva"]]}
json.dump(skills, open("content/skills.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── الخدمات (من الجدول؛ بلا أسعار) ──
S = [("gis-maps", "خرائط وتحليل GIS", "GIS maps & analysis", "خرائط إخراج احترافية وتحليلات مكانية لمشاريع الطلاب والجهات.", "Professional map layouts and spatial analysis.", ["خرائط إخراج", "تحليل ملاءمة", "تحليل شبكات"], "map", ["arcgis-pro", "suitability-analysis", "network-analysis"]),
     ("presentations", "عروض تقديمية", "Presentation design", "عروض عربية وإنجليزية بهوية مرتبة.", "Arabic and English decks with a clean visual identity.", ["مشاريع تخرج", "عروض شركات"], "slides", ["presentations"]),
     ("reports", "تقارير وبحوث", "Reports & research", "كتابة وتنسيق تقارير ودراسات أكاديمية وفنية.", "Writing and formatting academic and technical reports.", ["تنسيق", "توثيق APA"], "report", ["report-writing"]),
     ("cv-portfolio", "سيرة ذاتية وبورتفوليو", "CV & portfolio", "سيرة ذاتية احترافية وصفحات شخصية.", "Professional CVs and personal portfolio pages.", ["CV", "موقع شخصي"], "user", ["presentations", "ai-tools"]),
     ("automation", "أتمتة وأدوات", "Automation & tools", "سكربتات وبرامج تختصر العمل المتكرر.", "Scripts and tools that remove repetitive work.", ["Python", "ArcPy", "Excel"], "code", ["automation", "excel"]),
     ("drone-survey", "رفع بالدرون ونمذجة", "Drone survey & 3D models", "رفع جوي ومعالجة صور لإنتاج نماذج ومخططات.", "Aerial survey and photogrammetric 3D models.", ["Metashape", "DJI"], "drone", ["drones", "photogrammetry"]),
     ("qr", "QR وحلول رقمية", "QR & digital solutions", "أكواد QR ذكية ومنتجات رقمية بسيطة.", "Smart QR codes and simple digital products.", ["QR دائم", "صفحات هبوط"], "qr", ["ai-tools"])]
json.dump([{"id": i, "title": bi(a, e), "description": bi(d, de), "includes": [bi(x) for x in inc], "priceFrom": None, "currency": "SAR", "icon": ic, "skills": sk} for i, a, e, d, de, inc, ic, sk in S],
          open("content/services.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ── إحصاءات (مصدر رسمي من الجدول) ──
json.dump([{"id": "ksa-pop", "value": "32,175,224", "label": bi("إجمالي سكان المملكة", "KSA population"), "source": bi("الهيئة العامة للإحصاء، تعداد 2022", "GASTAT, Census 2022"), "sourceUrl": "https://www.stats.gov.sa", "date": "2022"},
           {"id": "ksa-saudi", "value": "58.4%", "label": bi("نسبة السعوديين", "Saudi nationals"), "source": bi("الهيئة العامة للإحصاء، تعداد 2022", "GASTAT, Census 2022"), "sourceUrl": "https://www.stats.gov.sa", "date": "2022"},
           {"id": "ksa-median-age", "value": "29", "label": bi("متوسط العمر", "Median age"), "source": bi("الهيئة العامة للإحصاء، تعداد 2022", "GASTAT, Census 2022"), "sourceUrl": "https://www.stats.gov.sa", "date": "2022"}],
          open("content/stats.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# أقسام فارغة الآن (تختفي تلقائياً)
for f in ["gis", "datasets", "notes", "testimonials"]:
    json.dump([], open(f"content/{f}.json", "w", encoding="utf-8"))

site = json.load(open("content/site.json", encoding="utf-8"))
site["sections"] = ["hero", "model", "about", "projects", "posters", "skills", "certificates", "experience", "education", "gis", "stats", "datasets", "notes", "services", "testimonials", "contact"]
site["presets"] = [
 {"id": "transport", "label": bi("أبحث عن مخطط نقل", "I need a transport planner"), "weights": {"planning": 5, "gis": 3, "geomatics": 1, "design": 1, "digital": 1}},
 {"id": "gis", "label": bi("أبحث عن محلل GIS", "I need a GIS analyst"), "weights": {"planning": 2, "gis": 5, "geomatics": 4, "design": 1, "digital": 3}},
 {"id": "design", "label": bi("أبحث عن عروض وتقارير", "I need presentations & reports"), "weights": {"planning": 2, "gis": 1, "geomatics": 0, "design": 4, "digital": 5}}]
site["seo"]["title"] = bi("فارس الأسمري · مخطط حضري وإقليمي", "Fares Al-Asmari · Urban & Regional Planner")
site["seo"]["description"] = bi("بورتفوليو فارس الأسمري، طالب تخطيط حضري وإقليمي في جامعة الملك عبدالعزيز: مشاريع تخطيط ونقل وGIS مرتبة بنموذج ملاءمة حسب ما يبحث عنه الزائر.", "Portfolio of Fares Al-Asmari, Urban & Regional Planning student at KAU: planning, transport and GIS work ranked by a suitability model.")
site["requestFullEmail"] = EMAIL
site["downloadsRequireApproval"] = True
for pr in site["presets"]: pr["theme"] = {"transport": "transport", "gis": "gis", "design": "design"}.get(pr["id"], "planning")
json.dump(site, open("content/site.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("projects", len(P), "posters", len(POSTERS), "certs", len(C))
