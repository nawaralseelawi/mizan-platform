/**
 * Bilingual (Arabic/English) i18n layer for the Mizan platform.
 *
 * - Arabic is the default language; the UI switches the document direction
 *   to RTL for Arabic and LTR for English automatically.
 * - All user-facing chrome text lives in the `dict` below. Benchmark item
 *   content is data, not UI, and is never translated here.
 * - Language choice persists in a cookie so it survives reloads without
 *   using browser storage APIs that are restricted in some environments.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

// ---------------------------------------------------------------------------
// Translation dictionary. Key = stable identifier; value = both languages.
// ---------------------------------------------------------------------------
const dict = {
  // Brand / nav
  "brand.subtitle": { ar: "معيار النماذج اللغوية العراقية", en: "IraqLLM-Bench" },
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.about": { ar: "عن المشروع", en: "About" },
  "nav.benchmark": { ar: "المحاور", en: "Benchmark" },
  "nav.dataset": { ar: "البنود", en: "Dataset" },
  "nav.models": { ar: "النماذج", en: "Models" },
  "nav.leaderboard": { ar: "لوحة النتائج", en: "Leaderboard" },
  "nav.evaluation": { ar: "التقييم", en: "Evaluation" },
  "nav.more": { ar: "المزيد", en: "More" },
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.governance": { ar: "الحوكمة", en: "Governance" },
  "nav.certification": { ar: "الشهادات", en: "Certification" },
  "nav.apidocs": { ar: "توثيق الواجهة", en: "API Docs" },
  "nav.metrics": { ar: "المقاييس", en: "Metrics" },
  "nav.architecture": { ar: "البنية", en: "Architecture" },
  "nav.login": { ar: "دخول المشرفين", en: "Sign in" },
  "nav.signout": { ar: "خروج", en: "Sign out" },

  // Home hero
  "home.eyebrow": {
    ar: "ميزان — المعيار الوطني لتقييم النماذج اللغوية العربية",
    en: "Mizan - IraqLLM-Bench - National Arabic LLM Evaluation",
  },
  "home.title": {
    ar: "نقيس كيف تفهم النماذج العربية والعراق",
    en: "Measuring How AI Understands Arabic and Iraq",
  },
  "home.subtitle": {
    ar: "المعيار الوطني للنماذج اللغوية الكبيرة في العربية — بمسار مخصص للعراقية. بنود مؤلَّفة أصلاً عبر مسارين وستة محاور، ومجموعة اختبار سرية تُبقي كل نتيجة نزيهة.",
    en: "The national benchmark for large language models in Arabic - with a dedicated Iraqi Arabic track. Originally authored items across two tracks and six axes, and a sealed private test set that keeps every score honest.",
  },
  "home.cta.explore": { ar: "استكشف المحاور", en: "Explore Benchmarks" },
  "home.cta.leaderboard": { ar: "عرض لوحة النتائج", en: "View Leaderboard" },

  // Home stats
  "stat.registeredModels": { ar: "النماذج المسجَّلة", en: "Registered Models" },
  "stat.publicItems": { ar: "بنود التطوير العلنية", en: "Public Dev Items" },
  "stat.privateItems": { ar: "بنود الاختبار السرية", en: "Private Test Items" },
  "stat.publishedRuns": { ar: "التشغيلات المنشورة", en: "Published Runs" },

  // Home sections
  "home.mission.title": { ar: "رسالتنا", en: "Our Mission" },
  "home.mission.body": {
    ar: "بناء الإطار الوطني الصارم علمياً لتقييم النماذج اللغوية الكبيرة في العربية عموماً وفي العراقية خصوصاً — لتمكين الباحثين والمؤسسات وصنّاع القرار من معرفة، بالدليل، مدى فهم أي نموذج للغة وللسياق العراقي.",
    en: "To establish the national, scientifically rigorous framework for evaluating large language models in Arabic at large and in Iraqi Arabic specifically - enabling researchers, institutions, and policymakers to know, with evidence, how well any model actually understands the language and the Iraqi context.",
  },
  "home.mission.tagline": {
    ar: "الشفافية والصرامة والتعاون في التقييم.",
    en: "Transparency, rigor, and collaboration in AI evaluation.",
  },
  "home.vision.title": { ar: "رؤيتنا", en: "Our Vision" },
  "home.vision.body": {
    ar: "أن نصبح المرجع المعتمد لتقييم النماذج اللغوية العربية والعراقية، ونرسي ثقافة التميّز العلمي والمسؤولية في تطوير الذكاء الاصطناعي.",
    en: "To become the authoritative source for AI benchmarking in the Middle East and beyond, fostering a culture of scientific excellence and responsible AI development while contributing to global standards and best practices in artificial intelligence evaluation.",
  },
  "home.vision.tagline": {
    ar: "التميّز والمسؤولية والتعاون.",
    en: "Excellence, responsibility, and global collaboration.",
  },
  "home.capabilities.title": { ar: "قدرات المنصة", en: "Platform Capabilities" },
  "home.capabilities.subtitle": {
    ar: "أدوات متكاملة للتقييم والمقارنة والتطوير.",
    en: "Comprehensive tools for AI evaluation, comparison, and advancement.",
  },
  "cap.leaderboard.title": { ar: "لوحة نتائج تفاعلية", en: "Interactive Leaderboard" },
  "cap.leaderboard.body": {
    ar: "ترتيب حيّ للنماذج مع خيارات عرض متعددة ومسارات تاريخية.",
    en: "Real-time rankings with multiple visualization options and historical trends.",
  },
  "cap.dataset.title": { ar: "مستكشف البنود", en: "Dataset Explorer" },
  "cap.dataset.body": {
    ar: "تصفّح وفلترة وتحليل بنود التقييم مع بياناتها الوصفية.",
    en: "Browse, filter, and analyze comprehensive benchmark datasets with metadata.",
  },
  "cap.analytics.title": { ar: "تحليلات الأداء", en: "Performance Analytics" },
  "cap.analytics.body": {
    ar: "رسوم ومقاييس متقدمة لتحليل الأداء ومقارنته بعمق.",
    en: "Advanced charts and metrics for deep performance analysis and comparison.",
  },
  "cap.pipeline.title": { ar: "خط التقييم", en: "Evaluation Pipeline" },
  "cap.pipeline.body": {
    ar: "تشغيل النماذج على البنود مع تتبّع الحالة والسجلات.",
    en: "Submit models and run benchmarks with real-time status tracking and logs.",
  },
  "cap.certification.title": { ar: "نظام الشهادات", en: "Certification System" },
  "cap.certification.body": {
    ar: "شهادات رقمية وبوابة تحقق للنماذج المُقيَّمة.",
    en: "Digital certificates and verification portal for validated AI models.",
  },
  "cap.docs.title": { ar: "توثيق شامل", en: "Comprehensive Docs" },
  "cap.docs.body": {
    ar: "توثيق تفصيلي للواجهة البرمجية وأدلة التكامل.",
    en: "Detailed API documentation, SDKs, and integration guides.",
  },
  "home.release.title": { ar: "أحدث إصدار للمعيار", en: "Latest Benchmark Release" },
  "home.release.version": { ar: "النسخة التجريبية 0.1 — قيد الإنتاج", en: "Pilot 0.1 - in production" },
  "home.release.body": {
    ar: "ستة محاور تقييم، بنود عراقية مؤلَّفة أصلاً، ومجموعة اختبار سرية. أول نتائج منشورة ستظهر بعد اكتمال التشغيلات التجريبية ومراجعتها.",
    en: "Six evaluation axes, originally authored Iraqi Arabic items, and a sealed private test set. First published results will appear once the pilot runs are completed and reviewed.",
  },
  "home.release.notes": { ar: "ملاحظات الإصدار", en: "View Release Notes" },
  "home.release.download": { ar: "تحميل المعيار", en: "Download Benchmark" },
  "home.news.title": { ar: "آخر الأخبار", en: "Latest News" },
  "home.news.subtitle": {
    ar: "تابع أحدث تطورات تقييم النماذج اللغوية.",
    en: "Stay updated with the latest developments in AI benchmarking.",
  },
  "home.cta2.title": { ar: "جاهز لتقييم نموذجك؟", en: "Ready to Evaluate Your AI Model?" },
  "home.cta2.body": {
    ar: "انضمّ إلى الباحثين والمؤسسات الذين يستخدمون ميزان لتقييم نماذجهم والارتقاء بها.",
    en: "Join thousands of researchers and organizations using Mizan to evaluate and advance their AI systems.",
  },
  "home.cta2.start": { ar: "ابدأ التقييم", en: "Start Evaluation" },
  "home.cta2.learn": { ar: "اعرف أكثر", en: "Learn More" },

  // Leaderboard
  "lb.title": { ar: "لوحة النتائج", en: "Leaderboard" },
  "lb.subtitle": {
    ar: "الترتيب الرسمي للنماذج على مجموعة ميزان. كل نتيجة منشورة تأتي من تشغيل مُراجَع ومعتمَد بشرياً.",
    en: "Official rankings of language models on the Mizan private test set. Every published score comes from a reviewed, human-approved evaluation run.",
  },
  "lb.empty.title": { ar: "لا توجد نتائج منشورة بعد", en: "No published results yet" },
  "lb.empty.body": {
    ar: "بنك البنود التجريبي قيد الإنتاج والتشغيلات الأولى قيد الإعداد. لا يظهر أي رقم على هذه اللوحة قبل اكتمال تشغيل حقيقي ومراجعته ونشره صراحةً. هذا سجل قياس، لا واجهة عرض.",
    en: "The pilot item bank is in production and the first evaluation runs are being prepared. No number appears on this board before a real run is completed, reviewed, and explicitly published. This is a measurement record, not a showcase.",
  },
  "lb.rankings": { ar: "الترتيب", en: "Rankings" },
  "lb.col.rank": { ar: "المرتبة", en: "Rank" },
  "lb.col.model": { ar: "النموذج", en: "Model" },
  "lb.col.developer": { ar: "المطوّر", en: "Developer" },
  "lb.col.overall": { ar: "الإجمالي", en: "Overall" },
  "lb.col.arabic": { ar: "العربية", en: "Arabic" },
  "lb.col.iraqi": { ar: "العراقية", en: "Iraqi" },
  "lb.col.set": { ar: "المجموعة", en: "Set" },
  "lb.tier.private": { ar: "سرية", en: "Private" },
  "lb.tier.dev": { ar: "تطوير", en: "Dev set" },
  "lb.peraxis.arabic": { ar: "العربية العامة — الدرجات حسب المحور", en: "General Arabic - per-axis scores" },
  "lb.peraxis.iraqi": { ar: "العراقية — الدرجات حسب المحور", en: "Iraqi Arabic - per-axis scores" },
  "lb.note": {
    ar: "الدرجات من 0 إلى 100 مع فواصل ثقة 95% بين قوسين. مدخلات «تطوير» مُقيَّمة على مجموعة التطوير العلنية خلال المرحلة التجريبية؛ الترتيب الرسمي سيعتمد المجموعة السرية.",
    en: 'Scores scaled 0-100 with 95% confidence intervals in brackets. "Dev set" entries are scored on the public development split during the pilot phase; official rankings will use the private test set.',
  },
  "lb.chart.title": { ar: "المعدّل الإجمالي حسب النموذج", en: "Overall average by model" },

  // Axes
  "axis.comprehension": { ar: "الفهم", en: "Comprehension" },
  "axis.generation": { ar: "الإنتاج", en: "Generation" },
  "axis.translation": { ar: "الترجمة", en: "Translation" },
  "axis.knowledge": { ar: "المعرفة", en: "Knowledge" },
  "axis.official_documents": { ar: "الوثائق", en: "Documents" },
  "axis.safety": { ar: "السلامة", en: "Safety" },
  "track.arabic": { ar: "العربية العامة", en: "General Arabic" },
  "track.iraqi": { ar: "العراقية", en: "Iraqi Arabic" },
  "track.arabic.short": { ar: "عربية", en: "Arabic" },
  "track.iraqi.short": { ar: "عراقية", en: "Iraqi" },

  // Dataset explorer
  "ds.title": { ar: "مستكشف البنود", en: "Dataset Explorer" },
  "ds.subtitle": {
    ar: "مجموعة التطوير العلنية من بنك ميزان. مجموعة الاختبار الرسمية سرية — لا تُنشر هنا ولا في أي مكان.",
    en: "The public development split of the Mizan item bank. The official private test set is sealed - not published here or anywhere else.",
  },
  "ds.filter.title": { ar: "التصفية حسب المسار والمحور", en: "Filter by track and axis" },
  "ds.filter.bothTracks": { ar: "المساران", en: "Both tracks" },
  "ds.filter.allAxes": { ar: "كل المحاور", en: "All axes" },
  "ds.empty.title": { ar: "لا توجد بنود علنية بعد", en: "No public items yet" },
  "ds.empty.body": {
    ar: "بنك البنود التجريبي قيد التأليف والمراجعة. ستظهر مجموعة التطوير العلنية هنا فور اعتماد أول دفعة واستيرادها.",
    en: "The pilot item bank is being authored and dual-reviewed. The public development split will appear here as soon as the first batch is approved and imported.",
  },
  "ds.prev": { ar: "السابق", en: "Previous" },
  "ds.next": { ar: "التالي", en: "Next" },
  "ds.showing": { ar: "عرض", en: "Showing" },
  "ds.of": { ar: "من", en: "of" },
  "ds.items": { ar: "بند", en: "items" },
  "ds.stats.title": { ar: "إحصائيات بنك البنود", en: "Item bank statistics" },
  "ds.stats.public": { ar: "بنود التطوير العلنية", en: "Public dev items" },
  "ds.stats.private": { ar: "بنود الاختبار السرية (بصمات فقط)", en: "Private test items (hash manifest only)" },
  "ds.stats.axes": { ar: "محاور التقييم", en: "Evaluation axes" },
  "region.baghdadi": { ar: "بغدادية", en: "Baghdadi" },
  "region.southern": { ar: "جنوبية", en: "Southern" },
  "region.maslawi": { ar: "موصلية", en: "Maslawi" },
  "region.mixed": { ar: "مشتركة", en: "Mixed" },
  "region.msa": { ar: "فصحى", en: "MSA" },
  "fmt.multiple_choice": { ar: "اختيار من متعدد", en: "Multiple choice" },
  "fmt.open_generation": { ar: "توليد حر", en: "Open generation" },
  "fmt.extraction": { ar: "استخراج", en: "Extraction" },

  // Login
  "login.title": { ar: "دخول المشرفين", en: "Maintainer sign in" },
  "login.subtitle": {
    ar: "الحسابات تُمنح من إدارة المشروع، ولا يوجد تسجيل مفتوح.",
    en: "Accounts are issued by the project administration. There is no open registration.",
  },
  "login.email": { ar: "البريد الإلكتروني", en: "Email" },
  "login.password": { ar: "كلمة المرور", en: "Password" },
  "login.submit": { ar: "دخول", en: "Sign in" },
  "login.submitting": { ar: "جارٍ الدخول...", en: "Signing in..." },
  "login.signedInAs": { ar: "مسجّل الدخول:", en: "Signed in as" },
  "login.openDashboard": { ar: "فتح لوحة التحكم", en: "Open dashboard" },

  // Dashboard
  "dash.title": { ar: "لوحة تحكم المشرف", en: "Maintainer dashboard" },
  "dash.subtitle": {
    ar: "الحالة الحية لبنك البنود وخط التقييم — النسخة",
    en: "Live state of the item bank and evaluation pipeline - version",
  },
  "dash.runs.title": { ar: "تشغيلات التقييم", en: "Evaluation runs" },
  "dash.runs.desc": {
    ar: "نشر التشغيل يضعه على لوحة النتائج العلنية ويُصدر شهادة تحقّقه. السحب يزيله من اللوحة ويلغي الشهادة — لكن السجل يبقى كتاريخ علني.",
    en: "Publishing a run puts it on the public leaderboard and issues its verification certificate. Retraction removes it from the board and revokes the certificate - the record stays, as public history.",
  },
  "dash.runs.empty": {
    ar: "لا توجد تشغيلات مستوردة بعد. استورد النتائج بأداة import-results.",
    en: "No runs imported yet. Import results with the import-results CLI.",
  },
  "dash.col.run": { ar: "التشغيل", en: "Run" },
  "dash.col.axes": { ar: "المحاور", en: "Axes" },
  "dash.col.status": { ar: "الحالة", en: "Status" },
  "dash.col.actions": { ar: "الإجراءات", en: "Actions" },
  "dash.publish": { ar: "نشر", en: "Publish" },
  "dash.retract": { ar: "سحب", en: "Retract" },
  "dash.status.imported": { ar: "مستورد", en: "imported" },
  "dash.status.published": { ar: "منشور", en: "published" },
  "dash.status.retracted": { ar: "مسحوب", en: "retracted" },
  "dash.cert": { ar: "صدرت شهادة — البصمة:", en: "Certificate issued - hash:" },
  "dash.composition": { ar: "تركيب بنك البنود حسب المحور", en: "Item bank composition by axis" },
  "dash.composition.note": {
    ar: "أعداد البنود السرية من البصمات؛ محتواها لا يُخزَّن في هذه المنصة إطلاقاً.",
    en: "Private counts come from the hash manifest; private item content is never stored on this platform.",
  },
  "dash.locked.title": { ar: "منطقة المشرفين", en: "Maintainer area" },
  "dash.locked.body": {
    ar: "لوحة التحكم لمشرفي المنصة. الحسابات تُصدَر من إدارة المشروع.",
    en: "The dashboard is for platform maintainers. Accounts are issued by the project administration.",
  },
  "dash.chart.public": { ar: "علني", en: "Public" },
  "dash.chart.private": { ar: "سري (بصمة)", en: "Private (manifest)" },

  // Common
  "common.loading": { ar: "جارٍ التحميل...", en: "Loading..." },
  "footer.about": {
    ar: "مبادرة وطنية لتقييم النماذج اللغوية الكبيرة في العربية والعراقية والارتقاء بها.",
    en: "A national AI benchmarking initiative for evaluating and advancing artificial intelligence capabilities.",
  },
  "footer.quicklinks": { ar: "روابط سريعة", en: "Quick Links" },
  "footer.resources": { ar: "موارد", en: "Resources" },
  "footer.privacy": { ar: "الخصوصية", en: "Privacy Policy" },
  "footer.terms": { ar: "الشروط", en: "Terms of Service" },
  "footer.contact": { ar: "تواصل", en: "Contact" },
  "footer.rights": { ar: "© 2026 ميزان. جميع الحقوق محفوظة.", en: "© 2026 Mizan. All rights reserved." },
  "news.date": { ar: "تموز 2026", en: "July 2026" },
  "news.readmore": { ar: "اقرأ المزيد ←", en: "Read More →" },
  "news.1.title": { ar: "إطلاق المنصة", en: "Platform launched" },
  "news.1.body": { ar: "منصة ميزان العلنية تعمل الآن: المنهجية، بنود التطوير العلنية، وخط النتائج — بسياسة صارمة تمنع الأرقام الوهمية.", en: "The Mizan public platform is live: methodology, public dev items, and the results pipeline - with a strict no-placeholder-numbers policy." },
  "news.2.title": { ar: "بنك البنود التجريبي قيد الإنتاج", en: "Pilot item bank in production" },
  "news.2.body": { ar: "بنود عراقية مؤلَّفة أصلاً تُكتب وتُراجَع مراجعة مزدوجة على منصة سومر للتأليف.", en: "Originally authored Iraqi Arabic items are being written and dual-reviewed on the Sumer authoring platform." },
  "news.3.title": { ar: "اكتمال المنهجية", en: "Methodology finalized" },
  "news.3.body": { ar: "ستة محاور، تأليف أصلي بلا ترجمة، مراجعة مزدوجة، ومجموعة اختبار سرية ببصمات.", en: "Six axes, original authoring with no translation, dual review, and a hash-manifested private test set." },
  "bench.title": { ar: "مستكشف المحاور", en: "Benchmark Explorer" },
  "bench.subtitle": { ar: "ستة محاور تقييم تقيس مدى فهم النماذج اللغوية للعراق: لهجته، ومعرفته، ووثائقه، وسياقه.", en: "Six evaluation axes measuring how language models understand Iraq: its dialect, knowledge, documents, and context." },
  "models.title": { ar: "سجل النماذج", en: "Model Registry" },
  "models.subtitle": { ar: "كل نموذج دخل خط تقييم ميزان، مع سجل تشغيلاته. لا يظهر النموذج هنا إلا بعد استيراد تشغيل تقييم حقيقي.", en: "Every model that has entered the Mizan evaluation pipeline, with its run history. A model appears here only after a real evaluation run has been imported." },
  "eval.title": { ar: "خط التقييم", en: "Evaluation Pipeline" },
  "eval.subtitle": { ar: "قدّم نماذجك وشغّل تقييمات شاملة على ميزان.", en: "Submit your models and run comprehensive evaluations on Mizan." },
  "about.title": { ar: "عن ميزان", en: "About Mizan" },
  "about.subtitle": { ar: "المبادرة العلمية الوطنية لبناء إطار تقييم محكَّم للنماذج اللغوية الكبيرة في العربية — بمسار مخصص للعراقية. «ميزان» هو الاسم الرئيسي، و«IraqLLM-Bench» هو الاسم الرمزي للمشروع.", en: "The national scientific initiative building a peer-reviewed evaluation framework for large language models in Arabic - with a dedicated Iraqi Arabic track. Mizan is the primary name; IraqLLM-Bench is the project codename." },
  "dash.cleanup.button": { ar: "تنظيف المكررات", en: "Clean up duplicates" },
  "dash.cleanup.running": { ar: "جارٍ التنظيف...", en: "Cleaning up..." },
  "dash.cleanup.confirm": { ar: "سيُبقى أحدث تشغيل لكل نموذج ويُنشر، وتُحذف بقية التشغيلات المكررة نهائياً. متابعة؟", en: "This keeps and publishes the newest run per model and permanently deletes the older duplicate runs. Continue?" },
  "dash.cleanup.done": { ar: "تم: أُبقي {kept} نموذج، وحُذف {deleted} تشغيل مكرر.", en: "Done: kept {kept} models, deleted {deleted} duplicate runs." },
  "lang.toggle": { ar: "EN", en: "عربي" },

  // Evaluate-your-model page (honest replacement of the old decorative stub)
  "ev.title": { ar: "قيّم نموذجك", en: "Evaluate Your Model" },
  "ev.subtitle": {
    ar: "ميزان منصة تقييم وسجلّ نتائج — لا يستضيف النماذج ولا يستقبل ملفات أوزان. كل نموذج يُقيَّم عبر واجهته البرمجية، وتُنشر نتيجته بشهادة تحقّق.",
    en: "Mizan is an evaluation harness and results registry — it does not host models or accept weight uploads. Every model is evaluated through its API, and results are published with a verification certificate.",
  },
  "ev.noupload.title": { ar: "لماذا لا يوجد «رفع نموذج»؟", en: "Why is there no model upload?" },
  "ev.noupload.body": {
    ar: "المنصة لا تشغّل الاستدلال على خوادمها. هذا يجعل التقييم قابلاً لإعادة الإنتاج بلا حدود حجم: أي نموذج يمكن تشغيله لديك يمكن تقييمه على ميزان.",
    en: "The platform runs no inference on its servers. This keeps evaluation reproducible with no size limits: any model you can serve, Mizan can evaluate.",
  },
  "ev.path.a.title": { ar: "المسار الأول — نماذج الواجهات البرمجية", en: "Path A — API-hosted models" },
  "ev.path.a.body": {
    ar: "النماذج المتاحة عبر مزوّد سحابي (مثل OpenRouter أو Anthropic أو OpenAI) يقيّمها فريق ميزان مباشرة بمشغّل التقييم على بنك البنود الكامل.",
    en: "Models available through a cloud provider (e.g. OpenRouter, Anthropic, OpenAI) are evaluated directly by the Mizan team using the evaluation runner over the full item bank.",
  },
  "ev.path.b.title": { ar: "المسار الثاني — النماذج ذاتية الاستضافة", en: "Path B — Self-hosted models" },
  "ev.path.b.body": {
    ar: "شغّل نموذجك على أجهزتك بخادم متوافق مع واجهة OpenAI (مثل vLLM أو Ollama أو LM Studio)، ويتصل به مشغّل ميزان عبر نقطة نهاية مخصّصة. لا حدّ لحجم النموذج — 13 مليار معلمة أو أكثر.",
    en: "Serve your model on your own hardware with an OpenAI-compatible server (e.g. vLLM, Ollama, LM Studio); the Mizan runner connects to your custom endpoint. No size limit — 13B parameters or beyond.",
  },
  "ev.steps.title": { ar: "خطوات التقديم والتحقّق", en: "Submission & verification steps" },
  "ev.step1": { ar: "شغّل جولة التقييم محلياً بمشغّل ميزان على بنك البنود العلني.", en: "Run the evaluation locally with the Mizan runner over the public item bank." },
  "ev.step2": { ar: "يولّد المشغّل ملف نتائج مع بصمة تحقّق (SHA-256).", en: "The runner produces a results file with a SHA-256 verification hash." },
  "ev.step3": { ar: "قدّم النتائج إلى فريق ميزان عبر البريد المعتمد.", en: "Submit the results to the Mizan team via the official email." },
  "ev.step4": { ar: "يتحقّق الفريق بإعادة تشغيل عيّنة تدقيق ومطابقة البصمات.", en: "The team verifies by re-running an audit sample and matching hashes." },
  "ev.step5": { ar: "تُنشر النتيجة على اللوحة الرسمية كلقطة مؤرَّخة غير قابلة للاستبدال.", en: "The result is published on the official leaderboard as a dated, immutable snapshot." },
  "ev.principles.title": { ar: "مبادئ ثابتة", en: "Standing principles" },
  "ev.p1": { ar: "كل تقييم لقطة مؤرَّخة: النسخ الجديدة للنماذج تُضاف كتشغيلات جديدة ولا تستبدل التاريخ.", en: "Every evaluation is a dated snapshot: new model versions are added as new runs and never overwrite history." },
  "ev.p2": { ar: "النشر على اللوحة يمرّ ببوابة تحقّق بشرية دائماً.", en: "Leaderboard publication always passes a human verification gate." },
  "ev.p3": { ar: "إعادة الإنتاج مفتوحة: الكود والبنك العلني يُتاحان للباحثين مع الورقة العلمية.", en: "Reproduction is open: the code and public bank are released with the paper." },
  "ev.cta.title": { ar: "جاهز لتقييم نموذجك؟", en: "Ready to evaluate your model?" },
  "ev.cta.body": { ar: "راسل فريق ميزان وسنرسل لك دليل التشغيل خطوة بخطوة.", en: "Email the Mizan team and we will send the step-by-step runner guide." },
  "ev.cta.button": { ar: "راسل الفريق", en: "Email the team" },
  "ev.cta.leaderboard": { ar: "استعرض لوحة النتائج", en: "View the leaderboard" },

  // Submit-your-model page (on-platform guide + submission form)
  "sub.title": { ar: "قدّم نموذجك", en: "Submit Your Model" },
  "sub.subtitle": {
    ar: "شغّل التقييم على أجهزتك أو بمفاتيحك باتباع الخطوات أدناه، ثم املأ النموذج — وسيفتح بريدك برسالة جاهزة لفريق ميزان.",
    en: "Run the evaluation on your own hardware or API keys using the steps below, then fill the form — your email client opens with a ready message to the Mizan team.",
  },
  "sub.prereq.title": { ar: "المتطلبات", en: "Prerequisites" },
  "sub.prereq.body": {
    ar: "بيئة Node.js 20+ وgit، والوصول إلى مستودع mizan-platform (علني عند نشر الورقة؛ وقبل ذلك يُطلب عبر نموذج التقديم أدناه)، ثم أحد الخيارين: مفتاح مزوّد سحابي، أو نموذج ذاتي الاستضافة عبر خادم متوافق مع واجهة OpenAI (vLLM أو Ollama أو LM Studio).",
    en: "Node.js 20+ and git, access to the mizan-platform repository (public at paper release; request it via the form below before that), then either a cloud provider API key, or a self-hosted model behind an OpenAI-compatible server (vLLM, Ollama, LM Studio).",
  },
  "sub.setup.title": { ar: "الإعداد", en: "Setup" },
  "sub.setup.note": {
    ar: "بنك البنود data/pilot-0.2-all.jsonl — يقيّم المشغّل 190 بنداً آلياً ويعلّم 150 بنداً توليدياً للتحكيم البشري.",
    en: "Item bank data/pilot-0.2-all.jsonl — the runner auto-scores 190 items and flags 150 open-generation items for human judging.",
  },
  "sub.pathA.title": { ar: "المسار الأول — نموذج عبر واجهة برمجية", en: "Path A — API-hosted model" },
  "sub.pathB.title": { ar: "المسار الثاني — نموذج ذاتي الاستضافة (بلا حدّ حجم)", en: "Path B — Self-hosted model (no size limit)" },
  "sub.pathB.note": {
    ar: "المفتاح اختياري للنقاط المحلية؛ أي عدد معلمات يعمل لأن الاستدلال كله على أجهزتك.",
    en: "The API key is optional for local endpoints; any parameter count works since inference runs on your hardware.",
  },
  "sub.out.title": { ar: "مخرجات المشغّل", en: "Runner output" },
  "sub.out.body": {
    ar: "ملف نتائج يتضمن الدرجات المجمّعة لكل (مسار، محور) مع بصمة تحقّق SHA-256 — هذا الملف هو ما تقدّمه لنا.",
    en: "A results file with per-(track, axis) aggregate scores and a SHA-256 verification hash — this is the file you submit to us.",
  },
  "sub.form.title": { ar: "نموذج التقديم", en: "Submission form" },
  "sub.form.model": { ar: "اسم النموذج", en: "Model name" },
  "sub.form.version": { ar: "النسخة / التاريخ", en: "Version / date" },
  "sub.form.developer": { ar: "الجهة المطوّرة", en: "Developer" },
  "sub.form.params": { ar: "عدد المعلمات (مثال: 13B)", en: "Parameter count (e.g. 13B)" },
  "sub.form.hosting": { ar: "طريقة الاستضافة", en: "Hosting" },
  "sub.form.hostingApi": { ar: "واجهة برمجية سحابية", en: "Cloud API" },
  "sub.form.hostingSelf": { ar: "ذاتية الاستضافة", en: "Self-hosted" },
  "sub.form.name": { ar: "اسم الباحث", en: "Researcher name" },
  "sub.form.affiliation": { ar: "الانتماء المؤسسي", en: "Affiliation" },
  "sub.form.notes": { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  "sub.form.attach": {
    ar: "بعد الضغط سيُفتح بريدك برسالة جاهزة — أرفق ملف النتائج JSON قبل الإرسال.",
    en: "Your email client opens with a ready message — attach the results JSON before sending.",
  },
  "sub.form.submit": { ar: "إرسال التقديم عبر البريد", en: "Send submission by email" },
  "ev.cta.submit": { ar: "قدّم نموذجك", en: "Submit your model" },

  // Submit page - expanded step-by-step content
  "sub.choose.title": { ar: "أي مسار يناسبك؟", en: "Which path fits you?" },
  "sub.choose.api.title": { ar: "اختر المسار الأول إذا:", en: "Choose Path A if:" },
  "sub.choose.api.body": {
    ar: "نموذجك متاح عبر مزوّد سحابي عام (OpenRouter أو OpenAI أو Anthropic). لا تحتاج أي عتاد — يكفي مفتاح API ورصيد بسيط (بضعة دولارات للجولة الكاملة)، والتقييم ينتهي خلال 30–60 دقيقة.",
    en: "Your model is available through a public cloud provider (OpenRouter, OpenAI, or Anthropic). No hardware needed — just an API key and a small credit (a few dollars for the full run); evaluation completes in 30-60 minutes.",
  },
  "sub.choose.self.title": { ar: "اختر المسار الثاني إذا:", en: "Choose Path B if:" },
  "sub.choose.self.body": {
    ar: "نموذجك خاص أو مدرَّب محلياً وغير منشور لدى مزوّد سحابي. تشغّله على عتادك أنت (معالج رسومي بذاكرة كافية)، بلا أي حدّ لعدد المعلمات وبلا كلفة API — الاستدلال كله عندك.",
    en: "Your model is private or locally trained and not served by a cloud provider. You run it on your own hardware (a GPU with enough memory), with no parameter limit and no API cost - all inference happens on your side.",
  },
  "sub.a.s1": { ar: "أنشئ حساباً لدى المزوّد واحصل على مفتاح API (مثلاً openrouter.ai ← Keys)، واشحن رصيداً بسيطاً.", en: "Create a provider account and get an API key (e.g. openrouter.ai -> Keys), and add a small credit." },
  "sub.a.s2": { ar: "عرّف المفتاح في جلسة الطرفية (السطر الأول في الكتلة أدناه).", en: "Set the key in your terminal session (first line in the block below)." },
  "sub.a.s3": { ar: "شغّل أمر التقييم مع تعديل خانة النموذج والمطوّر (السطر الثاني).", en: "Run the evaluation command, editing the model slug and developer fields (second line)." },
  "sub.a.s4": { ar: "انتظر اكتمال الجولة — يعرض المشغّل تقدّماً حياً كل خمسة بنود.", en: "Wait for the run to finish - the runner prints live progress every five items." },
  "sub.a.s5": { ar: "ستجد ملف النتائج في مجلد data باسم الملف الذي حدّدته في --out.", en: "Find the results file in the data folder under the name you set in --out." },
  "sub.b.s1": { ar: "ثبّت خادماً متوافقاً مع واجهة OpenAI: أسهلها Ollama (ollama.com) أو LM Studio، وللخوادم البحثية vLLM.", en: "Install an OpenAI-compatible server: easiest are Ollama (ollama.com) or LM Studio; for research servers, vLLM." },
  "sub.b.s2": { ar: "حمّل نموذجك في الخادم (مثلاً ollama pull أو فتح ملف الأوزان في LM Studio) وتأكد أنه يستجيب محلياً.", en: "Load your model into the server (e.g. ollama pull, or open the weights in LM Studio) and confirm it responds locally." },
  "sub.b.s3": { ar: "اعرف عنوان النقطة المحلية: Ollama يعمل على http://localhost:11434/v1 وvLLM على المنفذ الذي تحدده.", en: "Note your local endpoint: Ollama serves at http://localhost:11434/v1; vLLM at the port you choose." },
  "sub.b.s4": { ar: "عرّف المتغيّر OPENAI_BASE_URL بعنوان نقطتك (السطر الأول في الكتلة أدناه) — المفتاح غير مطلوب للنقاط المحلية.", en: "Set OPENAI_BASE_URL to your endpoint (first line in the block below) - no API key is required for local endpoints." },
  "sub.b.s5": { ar: "شغّل أمر التقييم باسم النموذج كما يعرفه خادمك (السطر الثاني).", en: "Run the evaluation command with the model name as your server knows it (second line)." },
  "sub.b.s6": { ar: "مدة الجولة تعتمد على سرعة عتادك؛ وستجد ملف النتائج في مجلد data.", en: "Run time depends on your hardware; the results file appears in the data folder." },
  "sub.after.title": { ar: "ماذا يحدث بعد التقديم؟", en: "What happens after you submit?" },
  "sub.after.s1": { ar: "فحص أولي: نتأكد من سلامة ملف النتائج ووجود بصمة التحقّق واكتمال العدّادات.", en: "Initial check: we validate the results file, its verification hash, and the item counts." },
  "sub.after.s2": { ar: "تدقيق مستقل: نعيد تشغيل عيّنة من البنود على نموذجك نفسه ونطابق الدرجات والبصمات.", en: "Independent audit: we re-run a sample of items against your model and match scores and hashes." },
  "sub.after.s3": { ar: "الاستيراد والنشر: تُستورد النتيجة وتُنشر على اللوحة الرسمية كلقطة مؤرَّخة غير قابلة للاستبدال مع شهادتها.", en: "Import and publish: the result is imported and published on the official leaderboard as a dated, immutable snapshot with its certificate." },
  "sub.after.s4": { ar: "الإشعار: يصلك ردّ بريدي برابط نتيجتك المنشورة وبصمة شهادتها — خلال أيام عمل قليلة من التقديم.", en: "Notification: you receive an email with your published result link and certificate hash - within a few working days." },
  // Architecture page (honest replacement of the decorative Manus scaffold)
  "arch.title": { ar: "البنية التقنية", en: "System Architecture" },
  "arch.subtitle": {
    ar: "كيف يتحوّل بند تقييم مؤلَّف أصلاً إلى نتيجة منشورة بشهادة تحقّق — البنية الفعلية الموثَّقة للمنصة، لا مخططات زخرفية.",
    en: "How an originally authored evaluation item becomes a published, certificate-backed score — the platform's actual, documented architecture, not decorative diagrams.",
  },
  "arch.pipeline.title": { ar: "خط التقييم: من التأليف إلى النشر", en: "The pipeline: from authoring to publication" },
  "arch.pipe1": {
    ar: "التأليف والمراجعة: تُؤلَّف البنود أصلاً بالعربية والعراقية (لا ترجمة إطلاقاً) وتُراجَع مراجعة بشرية مزدوجة على منصة سومر للتأليف — منصة مستقلة عن ميزان.",
    en: "Authoring and review: items are originally composed in Arabic and Iraqi Arabic (never translated) and dual human-reviewed on the Sumer authoring platform — a system separate from Mizan.",
  },
  "arch.pipe2": {
    ar: "عقد JSONL أحادي الاتجاه: تصل البنود المعتمدة إلى ميزان بصيغة JSONL موحّدة تحمل المسار والمحور وصيغة السؤال ووسوم المنطقة اللهجية ومستوى السرية.",
    en: "One-way JSONL contract: approved items reach Mizan as standardized JSONL carrying track, axis, question format, dialect-region tags, and contamination tier.",
  },
  "arch.pipe3": {
    ar: "الاستيراد: مستورد آمن التكرار يتحقّق من المخطط ويفصل البنود بين مجموعة تطوير علنية ومجموعة اختبار سرية لا يُخزَّن محتواها على المنصة إطلاقاً (بصمات فقط).",
    en: "Import: an idempotent importer validates the schema and splits items between a public development set and a sealed private test set whose content is never stored on the platform (hash manifest only).",
  },
  "arch.pipe4": {
    ar: "التشغيل: مشغّل تقييم بسطر الأوامر يعمل على أجهزة الباحث — المنصة لا تشغّل أي استدلال على خوادمها. يدعم المزوّدات السحابية (OpenRouter وAnthropic وOpenAI) وأي نموذج ذاتي الاستضافة عبر نقطة نهاية متوافقة مع واجهة OpenAI.",
    en: "Evaluation run: a CLI runner executes on the researcher's hardware — the platform itself runs no inference. It supports cloud providers (OpenRouter, Anthropic, OpenAI) and any self-hosted model behind an OpenAI-compatible endpoint.",
  },
  "arch.pipe5": {
    ar: "التصحيح: بنود الاختيار من متعدد والاستخراج تُصحَّح آلياً؛ أما البنود التوليدية (الإنتاج والترجمة والسلامة) فتُعلَّم للتحكيم البشري بمعايير مرقّمة — ولا تُنشر لها درجات آلية.",
    en: "Scoring: multiple-choice and extraction items are auto-scored; open-generation items (generation, translation, safety) are flagged for human judging with numbered rubrics — no automatic scores are published for them.",
  },
  "arch.pipe6": {
    ar: "النشر: تُستورد الدرجات المجمّعة لكل (مسار، محور)، ثم تمرّ ببوابة نشر بشرية تُصدر شهادة تحقّق SHA-256 وتضع التشغيل على لوحة النتائج لقطةً مؤرَّخة.",
    en: "Publication: per-(track, axis) aggregates are imported, then pass a human publication gate that issues a SHA-256 verification certificate and places the run on the leaderboard as a dated snapshot.",
  },
  "arch.contamination.title": { ar: "قاعدة مكافحة التلوث", en: "Contamination-control invariant" },
  "arch.contamination.body": {
    ar: "محتوى المجموعة السرية لا يمرّ عبر هذه المنصة ولا يُخزَّن فيها بأي شكل. تحتفظ المنصة ببصمات البنود السرية فقط للتحقّق من التغطية، ويُدار المحتوى نفسه خارجها بالكامل.",
    en: "Private test content never passes through or is stored on this platform in any form. The platform keeps only hash manifests of private items for coverage verification; the content itself is managed entirely offline.",
  },
  "arch.components.title": { ar: "المكوّنات الفعلية", en: "Actual components" },
  "arch.c1.title": { ar: "بنك البنود", en: "Item bank" },
  "arch.c1.body": {
    ar: "بنود JSONL ثنائية المسار (فصحى + عراقية) على ستة محاور، موسومة بالمنطقة اللهجية وصيغة السؤال ومستوى الصعوبة.",
    en: "Dual-track JSONL items (MSA + Iraqi Arabic) across six axes, tagged with dialect region, question format, and difficulty.",
  },
  "arch.c2.title": { ar: "مشغّل التقييم", en: "Evaluation runner" },
  "arch.c2.body": {
    ar: "أداة TypeScript بسطر الأوامر تشغّل النموذج على البنك وتُنتج ملف نتائج ببصمة تحقّق.",
    en: "A TypeScript CLI that runs a model over the bank and produces a results file with a verification hash.",
  },
  "arch.c3.title": { ar: "مستورد النتائج", en: "Results importer" },
  "arch.c3.body": {
    ar: "يستورد الدرجات المجمّعة لكل (مسار، محور) استيراداً آمن التكرار، محافظاً على كل تشغيل سجلاً مستقلاً.",
    en: "Imports per-(track, axis) aggregate scores idempotently, preserving every run as an independent record.",
  },
  "arch.c4.title": { ar: "بوابة النشر والشهادات", en: "Publication gate & certificates" },
  "arch.c4.body": {
    ar: "النشر قرار بشري يُصدر شهادة SHA-256؛ والسحب يُلغي الشهادة ويبقى تاريخاً علنياً.",
    en: "Publishing is a human decision that issues a SHA-256 certificate; retraction revokes the certificate and remains public history.",
  },
  "arch.c5.title": { ar: "لوحة النتائج", en: "Leaderboard" },
  "arch.c5.body": {
    ar: "تعرض التشغيلات المنشورة فقط — أحدث تشغيل منشور لكل نموذج، وبلا أرقام وهمية بأي حال.",
    en: "Shows published runs only — the latest published run per model, with no placeholder numbers under any circumstances.",
  },
  "arch.c6.title": { ar: "لوحة تحكم المشرفين", en: "Maintainer dashboard" },
  "arch.c6.body": {
    ar: "إدارة النشر والسحب وتنظيف المكررات وتركيب البنك — بحسابات تُمنح من إدارة المشروع.",
    en: "Publication, retraction, duplicate cleanup, and bank composition — with accounts issued by the project administration.",
  },
  "arch.stack.title": { ar: "التقنيات المستخدمة فعلاً", en: "The stack actually in use" },
  "arch.stack1.label": { ar: "الواجهة", en: "Frontend" },
  "arch.stack1.value": {
    ar: "React + Tailwind CSS + shadcn/ui، ثنائية الاتجاه (RTL/LTR) بالكامل",
    en: "React + Tailwind CSS + shadcn/ui, fully bidirectional (RTL/LTR)",
  },
  "arch.stack2.label": { ar: "الخلفية", en: "Backend" },
  "arch.stack2.value": {
    ar: "tRPC فوق Express بلغة TypeScript",
    en: "tRPC over Express, in TypeScript",
  },
  "arch.stack3.label": { ar: "قاعدة البيانات", en: "Database" },
  "arch.stack3.value": {
    ar: "PostgreSQL (استضافة Neon) عبر Drizzle ORM",
    en: "PostgreSQL (hosted on Neon) via Drizzle ORM",
  },
  "arch.stack4.label": { ar: "التشغيل", en: "Runtime" },
  "arch.stack4.value": {
    ar: "المنصة على Render — والاستدلال كله على أجهزة الباحثين، لا على المنصة",
    en: "Platform on Render — all inference on researchers' hardware, never on the platform",
  },
  "arch.boundary.title": { ar: "حدّ معماري صارم", en: "A strict architectural boundary" },
  "arch.boundary.body": {
    ar: "سومر مصنع البنود وميزان مختبر التقييم: لا يحتوي ميزان أي أنظمة تأليف أو رفع أو مراجعة بنود — يستقبل البنود المعتمدة فقط.",
    en: "Sumer is the item factory; Mizan is the evaluation laboratory. Mizan contains no authoring, upload, or review systems — it receives approved items only.",
  },

  // Metrics page (real per-axis scoring methodology)
  "met.title": { ar: "المقاييس", en: "Evaluation Metrics" },
  "met.subtitle": {
    ar: "كيف تُحتسب الدرجات محوراً محوراً — المنهجية المعلنة نفسها التي توثّقها الورقة العلمية.",
    en: "How scores are computed, axis by axis — the same disclosed methodology the scientific paper documents.",
  },
  "met.axes.title": { ar: "طريقة القياس لكل محور", en: "Scoring method per axis" },
  "met.method.auto": { ar: "تصحيح آلي", en: "Automatic" },
  "met.method.human": { ar: "تحكيم بشري", en: "Human judging" },
  "met.method.hybrid": { ar: "هجين", en: "Hybrid" },
  "met.method.extraction": { ar: "استخراج مقارن", en: "Ground-truth extraction" },
  "met.a1.title": { ar: "المحور 1 — فهم اللهجة", en: "Axis 1 — Dialect comprehension" },
  "met.a1.body": {
    ar: "اختيار من متعدد؛ الدرجة نسبة الإجابات الصحيحة. مواضع الإجابات موزونة عبر البنك لتحييد انحياز الموضع.",
    en: "Multiple choice; the score is the proportion of correct answers. Answer positions are balanced across the bank to neutralize position bias.",
  },
  "met.a2.title": { ar: "المحور 2 — التوليد باللهجة", en: "Axis 2 — Dialect generation" },
  "met.a2.body": {
    ar: "توليد حر يُقيَّم بمعيار مرقّم من 10 (gen-rubric-v1) تكون فيه أصالة اللهجة (0–4) حاسمة — فالفشل المحوري المرصود هو «الفصحى المتنكّرة». يُقاس اتفاق المحكّمين بمعامل كريبندورف ألفا.",
    en: "Open generation scored on a numbered /10 rubric (gen-rubric-v1) where dialect authenticity (0–4) is decisive — the central failure mode is \"disguised MSA\". Inter-annotator agreement is measured with Krippendorff's alpha.",
  },
  "met.a3.title": { ar: "المحور 3 — الترجمة فصحى ↔ عراقية", en: "Axis 3 — Translation MSA ↔ Iraqi" },
  "met.a3.body": {
    ar: "الاتجاهان بالتساوي؛ التحكيم البشري بمعيار trans-rubric-v1 هو الحاسم، ويُرفَق مقياس chrF الآلي مؤشراً ثانوياً — فالمقاييس الآلية وحدها تعجز عن تمييز الفصحى المتنكّرة من العراقية الأصيلة.",
    en: "Both directions equally; human judging with trans-rubric-v1 is decisive, with automatic chrF attached as a secondary indicator — automatic metrics alone cannot distinguish disguised MSA from authentic Iraqi.",
  },
  "met.a4.title": { ar: "المحور 4 — المعرفة العراقية", en: "Axis 4 — Iraqi knowledge" },
  "met.a4.body": {
    ar: "اختيار من متعدد بتصحيح آلي يغطي التاريخ والجغرافيا والدستور والمؤسسات والثقافة الشعبية. البنود ذات المفاتيح المتنازَع عليها تُرفض في التأليف، والحقائق الزمنية تحمل وسم time_sensitive.",
    en: "Auto-scored multiple choice covering history, geography, constitution and institutions, and popular culture. Items with contested keys are rejected at authoring, and time-bound facts carry a time_sensitive tag.",
  },
  "met.a5.title": { ar: "المحور 5 — الوثائق الرسمية", en: "Axis 5 — Official documents" },
  "met.a5.body": {
    ar: "يقرأ النموذج كتاباً رسمياً محاكى ويستخرج الحقول (الجهة المُصدِرة، الرقم، التاريخ، المُرسَل إليه، الموضوع، المطلوب)، وتُقارَن آلياً بالحقيقة الأرضية حقلاً حقلاً — بما فيها الحقول الغائبة عمداً.",
    en: "The model reads a simulated official letter and extracts its fields (issuing authority, number, date, addressee, subject, required action), compared automatically to ground truth field by field — including deliberately absent fields.",
  },
  "met.a6.title": { ar: "المحور 6 — السلامة والحساسية المجتمعية", en: "Axis 6 — Safety & societal sensitivity" },
  "met.a6.body": {
    ar: "تحكيم بشري بمعيار safety-rubric-v1 يرصد فشلَين متعاكسَين: الامتثال المؤذي والإفراط في الرفض، مع محفّزات سقف صارم للمحتوى الكاره تُصفّر الدرجة.",
    en: "Human judging with safety-rubric-v1 tracking two opposite failure modes: harmful compliance and over-refusal, with hard-cap triggers for hate content that zero the score.",
  },
  "met.agg.title": { ar: "التجميع والدرجة الكلية", en: "Aggregation and the overall score" },
  "met.agg.body": {
    ar: "تُحتسب درجة من 0 إلى 100 لكل زوج (مسار، محور)، والإجمالي متوسط كلّي بأوزان متساوية عبر المحاور. يُنشر المساران منفصلين دائماً — فالفصحى شبه مشبعة لدى النماذج الحديثة، والمسار العراقي هو ساحة التمييز الفعلية.",
    en: "A 0–100 score is computed per (track, axis) pair; the overall score is an unweighted macro average across axes. The two tracks are always published separately — MSA is near saturation for modern models, and the Iraqi track is where the real discrimination happens.",
  },
  "met.judge.title": { ar: "موقع «النموذج الحَكَم»", en: "Where LLM-as-judge stands" },
  "met.judge.body": {
    ar: "التحكيم البشري بمعايير مرقّمة هو الأساس في المحاور التوليدية؛ ويُستخدم تقييم نموذجٍ لنموذجٍ مؤشراً ثانوياً فقط ولا يُعتمد وحده أبداً، نظراً لانحياز النماذج الحَكَم الموثَّق لأسلوب بعضها.",
    en: "Human judging with numbered rubrics is the basis for generative axes; model-as-judge is used only as a secondary indicator and never on its own, given the documented bias of judge models toward each other's style.",
  },
  "met.stats.title": { ar: "الصرامة الإحصائية", en: "Statistical rigor" },
  "met.stats.body": {
    ar: "تُرفَق فواصل ثقة 95% بالدرجات على لوحة النتائج حيثما نُشرت، ويُفحص انحياز مواضع الإجابات ضمن بروتوكول التقييم، ويُذكر حجم العينة لكل محور صراحة مع كل نتيجة.",
    en: "95% confidence intervals accompany published leaderboard scores, answer-position bias is checked as part of the evaluation protocol, and the per-axis sample size is reported explicitly with every result.",
  },
  "met.pending.title": { ar: "المحاور التوليدية في النسخة التجريبية", en: "Generative axes in the pilot" },
  "met.pending.body": {
    ar: "في النسخة التجريبية الحالية تُنشر درجات المحاور الآلية، بينما تخضع بنود التوليد والترجمة والسلامة لحملة التحكيم البشري — وستُضاف درجاتها فور اكتمالها، بدل نشر أرقام آلية مضلّلة عنها.",
    en: "In the current pilot, auto-scored axes are published while generation, translation, and safety items undergo the human-judging campaign — their scores will be added when it completes, rather than publishing misleading automatic numbers for them.",
  },

  // Certification page (live verification + issued certificates)
  "cert.title": { ar: "الشهادات", en: "Certification" },
  "cert.subtitle": {
    ar: "كل نتيجة منشورة على ميزان تحمل شهادة تحقّق ببصمة SHA-256 يستطيع أي طرف التثبّت منها هنا.",
    en: "Every published Mizan result carries a SHA-256 verification certificate that anyone can check here.",
  },
  "cert.how.title": { ar: "كيف تعمل الشهادات", en: "How certificates work" },
  "cert.how1": {
    ar: "عند نشر تشغيلٍ ما على اللوحة تُصدر المنصة شهادة ببصمة SHA-256 تربط النموذج ونسخة البنك وتاريخ التشغيل ونتائجه.",
    en: "When a run is published, the platform issues a certificate whose SHA-256 hash binds the model, bank version, run date, and results.",
  },
  "cert.how2": {
    ar: "التقييمات لقطات مؤرَّخة غير قابلة للاستبدال: النسخ الجديدة من النماذج تُضاف تشغيلاتٍ جديدة، ولا يُعاد كتابة التاريخ أبداً.",
    en: "Evaluations are dated, immutable snapshots: new model versions are added as new runs, and history is never rewritten.",
  },
  "cert.how3": {
    ar: "سحب نتيجةٍ ما يُلغي شهادتها لكنه لا يخفيها — الشهادة الملغاة تظهر ملغاةً عند التحقّق، لأن السحب تاريخ علني.",
    en: "Retracting a result revokes its certificate but does not hide it — a revoked certificate reports as revoked on verification, because retraction is public history.",
  },
  "cert.principle": {
    ar: "«التشغيل حرّ، والنشر موثَّق ببوابة بشرية» — لا يظهر رقم على اللوحة الرسمية قبل تحقّق بشري صريح.",
    en: "\"Running is free; publication is attested through a human gate\" — no number appears on the official board before explicit human verification.",
  },
  "cert.verify.title": { ar: "تحقّق من شهادة", en: "Verify a certificate" },
  "cert.verify.hint": {
    ar: "ألصق بصمة الشهادة (64 خانة سداسية عشرية) للتثبّت من صحتها.",
    en: "Paste the certificate hash (64 hexadecimal characters) to verify it.",
  },
  "cert.verify.placeholder": { ar: "بصمة SHA-256...", en: "SHA-256 hash..." },
  "cert.verify.button": { ar: "تحقّق", en: "Verify" },
  "cert.verify.invalid": {
    ar: "الصيغة غير صحيحة — البصمة 64 خانة سداسية عشرية.",
    en: "Invalid format — the hash is 64 hexadecimal characters.",
  },
  "cert.verify.valid": { ar: "شهادة صحيحة", en: "Valid certificate" },
  "cert.verify.revoked": { ar: "شهادة ملغاة", en: "Revoked certificate" },
  "cert.verify.notfound": { ar: "لا توجد شهادة بهذه البصمة", en: "No certificate matches this hash" },
  "cert.verify.model": { ar: "النموذج", en: "Model" },
  "cert.verify.developer": { ar: "المطوّر", en: "Developer" },
  "cert.verify.version": { ar: "نسخة البنك", en: "Bank version" },
  "cert.verify.issued": { ar: "تاريخ الإصدار", en: "Issued" },
  "cert.verify.revokedAt": { ar: "تاريخ الإلغاء", en: "Revoked" },
  "cert.list.title": { ar: "الشهادات الصادرة", en: "Issued certificates" },
  "cert.list.empty": {
    ar: "لا توجد شهادات نشطة بعد — تصدر الشهادات تلقائياً مع نشر التشغيلات.",
    en: "No active certificates yet — certificates are issued automatically as runs are published.",
  },
  "cert.list.hash": { ar: "البصمة", en: "Hash" },

  // Governance page (real institutional anchor + binding policies)
  "gov.title": { ar: "الحوكمة", en: "Governance" },
  "gov.subtitle": {
    ar: "من يقود ميزان، وكيف تُتّخذ قراراته، وما السياسات الملزمة التي تحكم بياناته ونتائجه.",
    en: "Who leads Mizan, how its decisions are made, and the binding policies that govern its data and results.",
  },
  "gov.inst.title": { ar: "الإطار المؤسسي", en: "Institutional anchor" },
  "gov.inst.body": {
    ar: "يقود المشروع علمياً الدكتور مصطفى صادق لطيف (شركة نفط ميسان) والدكتور نوار السيلاوي (جامعة ميسان)، عضوا الفريق الوطني للنموذج اللغوي العراقي المشكَّل بالأمر الديواني 251482 لسنة 2025 وتعديله 251692، بإشراف مكتب رئيس الوزراء. ويُطرح ميزان بوصفه الإطار الوطني الذي يُقاس عليه أولاً أي نموذج يُقترح لاستخدام الدولة — محلياً كان أم عالمياً.",
    en: "The project is scientifically led by Dr. Mustafa Sadiq Latif (Missan Oil Company) and Dr. Nawar Al-Seelawi (University of Misan), members of Iraq's National LLM Team formed by Prime Ministerial Diwani Order 251482 of 2025 and its amendment 251692, under the Prime Minister's Office. Mizan is positioned as the national framework on which any model proposed for state use — local or global — is measured first.",
  },
  "gov.access.title": { ar: "نموذج الوصول", en: "Access model" },
  "gov.access1": {
    ar: "القراءة مفتوحة للجميع: المنهجية والنتائج واللوحة علنية بلا حسابات.",
    en: "Reading is open to all: methodology, results, and the leaderboard are public with no accounts.",
  },
  "gov.access2": {
    ar: "إعادة الإنتاج بالكود العلني على موارد الباحث نفسه — المنصة لا تموّل أي استدلال.",
    en: "Reproduction uses the public code on the researcher's own resources — the platform funds no inference.",
  },
  "gov.access3": {
    ar: "النشر على اللوحة الرسمية يمرّ دائماً بتقديم نتائج عبر بوابة تحقّق بشرية.",
    en: "Official leaderboard publication always passes through result submission with a human verification gate.",
  },
  "gov.method.title": { ar: "حوكمة المنهجية", en: "Methodological governance" },
  "gov.m1": {
    ar: "تأليف أصلي حصراً: البنود تُكتب بالعربية والعراقية من مؤلفين عراقيين — والترجمة من معايير أجنبية ممنوعة منعاً باتاً.",
    en: "Original authorship only: items are written in Arabic and Iraqi Arabic by Iraqi authors — translation from foreign benchmarks is strictly prohibited.",
  },
  "gov.m2": {
    ar: "مراجعة بشرية مزدوجة لكل بند قبل اعتماده، وفق أدلة تأليف ملزمة للمحاور الستة.",
    en: "Dual human review of every item before approval, under binding item-writing guidelines for all six axes.",
  },
  "gov.m3": {
    ar: "مكافحة التلوث: مجموعة تطوير علنية ومجموعة اختبار سرية لا يُنشر محتواها أبداً ولا يُخزَّن على المنصة.",
    en: "Contamination control: a public development set and a sealed private test set whose content is never published nor stored on the platform.",
  },
  "gov.m4": {
    ar: "توسيم المنطقة اللهجية إلزامي لكل بند — فـ«العراقية» ليست لهجة واحدة.",
    en: "Dialect-region tagging is mandatory for every item — \"Iraqi\" is not a single dialect.",
  },
  "gov.ethics.title": { ar: "أخلاقيات البيانات", en: "Data ethics" },
  "gov.e1": {
    ar: "بنود الوثائق الرسمية محاكاة بالكامل بأسماء وهمية — لا تدخل البنك أي وثيقة حقيقية أو بيانات شخصية.",
    en: "Official-document items are fully simulated with fictitious names — no real documents or personal data ever enter the bank.",
  },
  "gov.e2": {
    ar: "في محور السلامة يُوصَف المحتوى المؤذي ولا يُكتب، وتُصاغ المحفّزات بصيغ عامة لا تستهدف أي جهة.",
    en: "In the safety axis, harmful content is described, never written, and prompts use generic framings that target no group.",
  },
  "gov.e3": {
    ar: "الحيادية تجاه المكوّنات والمحافظات والرموز معيار قياس صريح، لا شعاراً.",
    en: "Neutrality across communities, governorates, and symbols is an explicit measured criterion, not a slogan.",
  },
  "gov.integrity.title": { ar: "نزاهة النتائج والنسخ", en: "Result and version integrity" },
  "gov.i1": {
    ar: "كل تقييم لقطة مؤرَّخة بنسخة بنك وبصمة؛ واللوحة سجل طولي لتطوّر النماذج، لا صورة تُستبدل.",
    en: "Every evaluation is a snapshot dated with a bank version and hash; the leaderboard is a longitudinal record of model progress, not a replaceable picture.",
  },
  "gov.i2": {
    ar: "جولات إعادة التقييم المجدولة ستستورد النتائج آلياً — ويبقى النشر قراراً بشرياً.",
    en: "Scheduled re-evaluation rounds will import results automatically — publication remains a human decision.",
  },
  "gov.release.title": { ar: "الإتاحة والترخيص", en: "Release and licensing" },
  "gov.r1": {
    ar: "مع نشر الورقة العلمية: الكود برخصة Apache-2.0، وبنك التطوير العلني على GitHub وHugging Face Datasets مع بطاقة بيانات.",
    en: "At paper release: the code under Apache-2.0, and the public development bank on GitHub and Hugging Face Datasets with a datasheet.",
  },
  "gov.r2": {
    ar: "المجموعة السرية المستقبلية بوصول مقيّد بالطلب لأغراض التدقيق العلمي.",
    en: "The future private test set will have restricted, on-request access for scientific auditing.",
  },
  "gov.contact.title": { ar: "تواصل", en: "Contact" },
  "gov.contact.body": {
    ar: "للاستفسارات العلمية وتقديم النماذج والتعاون البحثي:",
    en: "For scientific inquiries, model submissions, and research collaboration:",
  },

  // API docs page (honest: small public read API + the runner as the real interface)
  "api.title": { ar: "توثيق الواجهة", en: "API Documentation" },
  "api.subtitle": {
    ar: "توصيف صادق لما تتيحه المنصة برمجياً اليوم: واجهة قراءة علنية صغيرة، ومشغّل تقييم بسطر الأوامر هو واجهة التقييم الفعلية.",
    en: "An honest account of what the platform exposes programmatically today: a small public read API, and a CLI evaluation runner that is the real evaluation interface.",
  },
  "api.read.title": { ar: "واجهة القراءة العلنية (tRPC عبر HTTP)", en: "Public read API (tRPC over HTTP)" },
  "api.read.body": {
    ar: "تُخدَم الإجراءات على المسار ‎/api/trpc/‎ وتُستدعى إجراءات القراءة بطلبات GET مع مُدخل JSON مرمَّز في الرابط، وتُعيد JSON. لا توجد واجهة كتابة علنية — فالنشر والإدارة بحسابات المشرفين فقط.",
    en: "Procedures are served under /api/trpc/. Read procedures are called with GET requests carrying a URL-encoded JSON input, and return JSON. There is no public write API — publication and administration are maintainer-only.",
  },
  "api.ep.lb.body": {
    ar: "يُعيد مدخلات اللوحة لنسخة بنك محددة: أحدث تشغيل منشور لكل نموذج، بدرجات كل (مسار، محور) وحقول فاصل الثقة وعدد البنود، والمتوسطات العربية والعراقية والكلية.",
    en: "Returns leaderboard entries for a given bank version: the latest published run per model, with per-(track, axis) scores, confidence-interval fields, item counts, and the Arabic, Iraqi, and macro averages.",
  },
  "api.ep.cl.body": {
    ar: "يُعيد الشهادات النشطة (غير الملغاة) مع النموذج والمطوّر ونسخة البنك وتاريخ الإصدار.",
    en: "Returns active (non-revoked) certificates with model, developer, bank version, and issue date.",
  },
  "api.ep.cv.body": {
    ar: "يستقبل بصمة SHA-256 ويُعيد إحدى الحالات: صحيحة أو ملغاة أو غير موجودة — فالشهادات الملغاة تُعلن ملغاةً ولا تُخفى.",
    en: "Takes a SHA-256 hash and returns one of: valid, revoked, or not found — revoked certificates are reported as revoked, never hidden.",
  },
  "api.ep.note": {
    ar: "إجراءات قراءة إضافية تغذّي مستكشف البنود وسجل النماذج بالبيانات نفسها الظاهرة في الواجهة.",
    en: "Additional read procedures power the Dataset Explorer and the Model Registry with the same data shown in the UI.",
  },
  "api.example.title": { ar: "مثال استدعاء", en: "Example call" },
  "api.runner.title": { ar: "واجهة التقييم الفعلية: المشغّل", en: "The real evaluation interface: the runner" },
  "api.runner.body": {
    ar: "التقييم لا يجري عبر HTTP على المنصة، بل بمشغّل سطر الأوامر على أجهزتك: يقرأ بنك JSONL، ويستدعي النموذج عبر مزوّد سحابي أو نقطة نهاية متوافقة مع OpenAI تحددها بالمتغير OPENAI_BASE_URL (لأي نموذج ذاتي الاستضافة)، ثم يُنتج ملف نتائج ببصمة SHA-256 جاهزاً للتقديم.",
    en: "Evaluation does not happen over HTTP on the platform; it runs through the CLI runner on your machines: it reads the JSONL bank, calls the model through a cloud provider or an OpenAI-compatible endpoint set via OPENAI_BASE_URL (for any self-hosted model), and produces a results file with a SHA-256 hash ready for submission.",
  },
  "api.runner.cta": {
    ar: "دليل التشغيل الكامل خطوة بخطوة على صفحة «قدّم نموذجك».",
    en: "The full step-by-step runner guide lives on the Submit Your Model page.",
  },
  "api.schema.title": { ar: "مخطط البنود (JSONL)", en: "Item schema (JSONL)" },
  "api.schema.body": {
    ar: "كل بند سطر JSON يحمل: المعرّف، والمسار (arabic أو iraqi)، والمحور (ست قيم قانونية)، وصيغة السؤال (multiple_choice أو open_generation أو extraction)، والمنطقة اللهجية، ومستوى السرية، ثم المحتوى بحسب الصيغة.",
    en: "Each item is a JSON line carrying: id, track (arabic or iraqi), axis (six canonical values), question format (multiple_choice, open_generation, or extraction), dialect region, contamination tier, then format-specific content.",
  },
  "api.roadmap.title": { ar: "على الخارطة", en: "On the roadmap" },
  "api.roadmap.body": {
    ar: "واجهة قراءة REST مُنسَّخة رسمياً وتصدير آلي للنتائج والشهادات — بعد نشر الورقة، حين يُتاح المستودع علنياً برخصة Apache-2.0.",
    en: "A formally versioned REST read API and machine-readable exports of results and certificates — after paper release, when the repository goes public under Apache-2.0.",
  },
  "api.gotoSubmit": { ar: "قدّم نموذجك", en: "Submit your model" },

  // Not-found page
  "nf.title": { ar: "الصفحة غير موجودة", en: "Page not found" },
  "nf.body": {
    ar: "الرابط الذي طلبته غير موجود أو نُقل. جرّب العودة إلى الرئيسية أو استعراض لوحة النتائج.",
    en: "The link you requested does not exist or has moved. Try heading home or browsing the leaderboard.",
  },
  "nf.home": { ar: "العودة للرئيسية", en: "Back to home" },
  "nf.leaderboard": { ar: "لوحة النتائج", en: "View leaderboard" },
  // Home — honest release box (replaces the stale "Pilot 0.1" copy)
  "home2.release.version": {
    ar: "بنك pilot-0.2 — لوحة منشورة لعشرين نموذجاً",
    en: "Bank pilot-0.2 — a published 20-model leaderboard",
  },
  "home2.release.body": {
    ar: "340 بنداً مؤلَّفاً أصلاً عبر مسارين وستة محاور. درجات المحاور الآلية منشورة، والمحاور التوليدية قيد حملة التحكيم البشري — وكل نتيجة منشورة موثَّقة بشهادة تحقّق.",
    en: "340 originally authored items across two tracks and six axes. Auto-scored axes are published; generative axes are under the human-judging campaign — and every published result is backed by a verification certificate.",
  },
  "home2.release.browse": { ar: "تصفح البنود العلنية", en: "Browse public items" },

  // Home — real news (replaces the stale July 2026 trio)
  "news2.1.date": { ar: "أيلول 2026", en: "September 2026" },
  "news2.1.title": {
    ar: "لوحة العشرين نموذجاً على بنك الـ340",
    en: "The 20-model board on the 340-item bank",
  },
  "news2.1.body": {
    ar: "أُعيد تقييم كل النماذج على البنك الموسّع: الفصحى قرب السقف، والتمييز الفعلي يحدث على المسار العراقي — بفجوة منهجية ثابتة بين المسارين.",
    en: "All models were re-evaluated on the expanded bank: MSA sits near the ceiling while the real discrimination happens on the Iraqi track — a consistent gap between the two.",
  },
  "news2.2.date": { ar: "أيلول 2026", en: "September 2026" },
  "news2.2.title": {
    ar: "صفحة «قدّم نموذجك» أصبحت متاحة",
    en: "\"Submit Your Model\" is live",
  },
  "news2.2.body": {
    ar: "دليل تشغيل كامل بمسارين: واجهات سحابية، ونماذج ذاتية الاستضافة بلا حدّ حجم عبر نقطة نهاية متوافقة مع OpenAI.",
    en: "A full runner guide with two paths: cloud APIs, and self-hosted models with no size limit through an OpenAI-compatible endpoint.",
  },
  "news2.3.date": { ar: "آب 2026", en: "August 2026" },
  "news2.3.title": {
    ar: "اكتمال بنك النسخة التجريبية",
    en: "Pilot item bank completed",
  },
  "news2.3.body": {
    ar: "بنود ثنائية المسار مؤلَّفة أصلاً موزّعة على المحاور الستة، مستوردة بنسخة pilot-0.2 مع فصل صارم بين مستويي السرية.",
    en: "Dual-track, originally authored items across all six axes, imported as pilot-0.2 with strict tier separation.",
  },

  // About page (real content replacing the Manus filler)
  "ab.story.title": { ar: "قصة المشروع", en: "The story" },
  "ab.story.p1": {
    ar: "وُلد ميزان سنة 2026 في سياق الفريق الوطني للنموذج اللغوي العراقي ليجيب عن سؤال لا يجيب عنه أي معيار عالمي: إلى أي مدى تفهم النماذج اللغوية الكبيرة العربية فعلاً — والعراق تحديداً؟ المعايير العالمية تغطي الفصحى تغطية عامة، ولا ترى اللهجة العراقية ولا المعرفة المحلية ولا الوثائق الرسمية إطلاقاً.",
    en: "Mizan was born in 2026 within the context of Iraq's National LLM Team to answer a question no international benchmark answers: how well do large language models actually understand Arabic — and Iraq in particular? Global benchmarks cover MSA broadly and see neither the Iraqi dialect, nor local knowledge, nor official documents at all.",
  },
  "ab.story.p2": {
    ar: "يبني ميزان القياس من أساسه على مسارين متساويي الأهمية — العربية الفصحى والعربية العراقية — ببنود مؤلَّفة أصلاً لا مترجمة، ومراجعة بشرية مزدوجة، وفصل صارم بين مجموعة تطوير علنية ومجموعة اختبار سرية.",
    en: "Mizan builds the measurement from the ground up on two equally important tracks — Modern Standard Arabic and Iraqi Arabic — with originally authored (never translated) items, dual human review, and a strict split between a public development set and a sealed private test set.",
  },
  "ab.pieces.title": { ar: "ممّ يتكوّن ميزان؟", en: "What Mizan consists of" },
  "ab.piece1.title": { ar: "بنك البنود", en: "The item bank" },
  "ab.piece1.body": {
    ar: "بنود JSONL ثنائية المسار على ستة محاور، موسومة بالمنطقة اللهجية وصيغة السؤال ومستوى الصعوبة والسرية.",
    en: "Dual-track JSONL items across six axes, tagged with dialect region, question format, difficulty, and contamination tier.",
  },
  "ab.piece2.title": { ar: "أداة التشغيل", en: "The evaluation harness" },
  "ab.piece2.body": {
    ar: "مشغّل يقيّم أي نموذج — سحابياً كان أم ذاتي الاستضافة — على البنك نفسه بشروط موحّدة وبصمة تحقّق.",
    en: "A runner that evaluates any model — cloud-hosted or self-hosted — on the same bank under uniform conditions, with a verification hash.",
  },
  "ab.piece3.title": { ar: "اللوحة والشهادات", en: "Leaderboard & certificates" },
  "ab.piece3.body": {
    ar: "نتائج تُنشر ببوابة بشرية، وكل نتيجة لقطة مؤرَّخة غير قابلة للاستبدال بشهادة SHA-256.",
    en: "Results published through a human gate, each a dated, immutable snapshot with a SHA-256 certificate.",
  },
  "ab.finding.title": { ar: "الاكتشاف العلمي المحوري", en: "The central empirical finding" },
  "ab.finding.body": {
    ar: "على لوحة pilot-0.2 تتقارب النماذج الحديثة قرب السقف على مسار الفصحى، بينما تتوزّع وتتمايز بوضوح على المسار العراقي — بفجوة منهجية ثابتة لكل نموذج بين مساريه. أي أن المعايير الفصيحة مشبعة، والعراقية هي الإشارة التمييزية الحقيقية — وهذا يثبت الادعاء المركزي للمشروع تجريبياً.",
    en: "On the pilot-0.2 board, modern models cluster near the ceiling on the MSA track while spreading out and clearly separating on the Iraqi track — a consistent per-model gap between the two. In other words: MSA benchmarks are saturated, and Iraqi Arabic is the real discriminative signal — empirically confirming the project's central claim.",
  },
  "ab.lead.title": { ar: "القيادة العلمية", en: "Scientific leadership" },
  "ab.road.title": { ar: "خارطة الطريق", en: "Roadmap" },
  "ab.road1": {
    ar: "ورقة علمية تجريبية تُرفع إلى arXiv لتثبيت الأسبقية، ثم تقديم لمجلة محكّمة بعد ضمّ نتائج التحكيم البشري.",
    en: "A pilot scientific paper posted to arXiv to establish precedence, then a peer-reviewed journal submission once human-judging results are merged.",
  },
  "ab.road2": {
    ar: "توسيع البنك إلى ما فوق ألف بند بمؤلفين من المناطق — بغداد والجنوب والموصل — مع مجموعة اختبار سرية حقيقية.",
    en: "Expanding the bank beyond a thousand items with regional authors — Baghdad, the south, and Mosul — alongside a real sealed private test set.",
  },
  "ab.road3": {
    ar: "دليل الإملاء العراقي الموحّد منشوراً علمياً مستقلاً، ونشر بنك التطوير مفتوحاً مع الكود.",
    en: "The unified Iraqi orthography guide as an independent publication, and an open release of the development bank with the code.",
  },
  "ab.cta.title": { ar: "شارك في القياس", en: "Take part in the measurement" },
  "ab.cta.body": {
    ar: "قيّم نموذجك على ميزان، أو استعرض النتائج المنشورة على اللوحة الرسمية.",
    en: "Evaluate your model on Mizan, or browse the published results on the official board.",
  },

  // Benchmark explorer (bilingual tabs and real descriptions)
  "bench2.tab.axes": { ar: "المحاور", en: "Axes" },
  "bench2.tab.tracks": { ar: "المساران", en: "Tracks" },
  "bench2.tab.metrics": { ar: "المقاييس", en: "Metrics" },
  "bench2.tab.pipeline": { ar: "خط التقييم", en: "Pipeline" },
  "bench2.items": { ar: "بند", en: "items" },
  "bench2.d.comprehension": {
    ar: "فهم النص المكتوب: الفصحى على المسار العربي، والعراقية بتنوعاتها على المسار العراقي — مفردات وتراكيب وتعابير واستنتاج سياقي.",
    en: "Understanding written text: MSA on the Arabic track, and Iraqi Arabic across its varieties on the Iraqi track — vocabulary, structures, expressions, and contextual inference.",
  },
  "bench2.d.generation": {
    ar: "إنتاج لغة طبيعية سليمة بحسب المسار؛ والفخ المرصود على المسار العراقي هو «الفصحى المتنكّرة» — يُقيَّم بتحكيم بشري بمعايير مرقّمة.",
    en: "Producing natural, correct language per track; the tracked trap on the Iraqi track is \"disguised MSA\" — judged by humans with numbered rubrics.",
  },
  "bench2.d.translation": {
    ar: "الترجمة بين الفصحى والعراقية بالاتجاهين بأمانة للمعنى والسجل — مسار عراقي حصراً.",
    en: "Translation between MSA and Iraqi Arabic in both directions, faithful to meaning and register — Iraqi track only.",
  },
  "bench2.d.knowledge": {
    ar: "المعرفة العامة على المسار العربي، والعراقية تحديداً على مساره: تاريخ وجغرافيا ودستور ومؤسسات وثقافة شعبية.",
    en: "General knowledge on the Arabic track and Iraq-specific knowledge on its own: history, geography, constitution and institutions, and popular culture.",
  },
  "bench2.d.official_documents": {
    ar: "قراءة كتاب رسمي واستخراج حقوله بدقة: الجهة المُصدِرة والرقم والتاريخ والمُرسَل إليه والموضوع والمطلوب.",
    en: "Reading an official letter and extracting its fields precisely: issuing authority, number, date, addressee, subject, and required action.",
  },
  "bench2.d.safety": {
    ar: "السلوك في السياقات الحساسة: الحياد تجاه المكوّنات والمحافظات والرموز، ورفض المؤذي دون إفراط في الرفض.",
    en: "Behavior in sensitive contexts: neutrality across communities, governorates, and symbols, and refusing harm without over-refusal.",
  },
  "bench2.track.arabic.body": {
    ar: "خط الأساس المقارن: يقيس ما تقيسه المعايير العالمية الجيدة من فهم وإنتاج ومعرفة بالفصحى — وقد بلغت النماذج الحديثة فيه حدّ التشبّع تقريباً.",
    en: "The comparative baseline: what good global benchmarks measure in MSA comprehension, generation, and knowledge — where modern models have nearly reached saturation.",
  },
  "bench2.track.iraqi.body": {
    ar: "ساحة التمييز العلمي: المسار المميِّز الذي لا يغطيه أي معيار آخر — لهجة ومعرفة محلية ووثائق رسمية وسلامة بسياق عراقي.",
    en: "The scientific discrimination ground: the distinguishing track no other benchmark covers — dialect, local knowledge, official documents, and safety in an Iraqi context.",
  },
  "bench2.m1.title": { ar: "دقة الاختيار من متعدد", en: "Multiple-choice accuracy" },
  "bench2.m1.body": {
    ar: "تصحيح آلي لمحوري الفهم والمعرفة، بمواضع إجابات موزونة عبر البنك.",
    en: "Automatic scoring for comprehension and knowledge, with answer positions balanced across the bank.",
  },
  "bench2.m2.title": { ar: "مطابقة الحقول", en: "Field exact match" },
  "bench2.m2.body": {
    ar: "استخراج مقارن بالحقيقة الأرضية حقلاً حقلاً لمحور الوثائق الرسمية.",
    en: "Field-by-field comparison against ground truth for the official-documents axis.",
  },
  "bench2.m3.title": { ar: "معايير التحكيم البشري", en: "Human rubric scores" },
  "bench2.m3.body": {
    ar: "درجات من 10 بمعايير مرقّمة للمحاور التوليدية، مع قياس اتفاق المحكّمين.",
    en: "/10 scores on numbered rubrics for generative axes, with inter-annotator agreement measured.",
  },
  "bench2.m4.title": { ar: "فواصل الثقة", en: "Confidence intervals" },
  "bench2.m4.body": {
    ar: "فاصل ثقة 95% يُرفق بكل درجة محور منشورة على اللوحة.",
    en: "A 95% confidence interval accompanies every published axis score on the board.",
  },
  "bench2.fullMetrics": { ar: "المنهجية الكاملة", en: "Full methodology" },
  "bench2.p1": { ar: "التأليف والمراجعة المزدوجة في منصة سومر", en: "Authoring and dual review on Sumer" },
  "bench2.p2": { ar: "الاستيراد مع فصل مستويي السرية", en: "Import with contamination-tier separation" },
  "bench2.p3": { ar: "التشغيل بالمشغّل على أجهزة الباحث", en: "Evaluation with the runner on researcher hardware" },
  "bench2.p4": { ar: "تصحيح آلي وتحكيم بشري بحسب المحور", en: "Automatic scoring and human judging per axis" },
  "bench2.p5": { ar: "بوابة نشر بشرية وشهادة تحقّق", en: "Human publication gate and verification certificate" },

  // Model registry (empty state and labels)
  "mdl.empty.title": { ar: "لا نماذج مسجّلة بعد", en: "No models registered yet" },
  "mdl.empty.body": {
    ar: "السجل يمتلئ تلقائياً عند استيراد أول تشغيلات التقييم من المشغّل. لا يُدرج نموذج بمجرد ذكر اسمه — التسجيل يتطلب تشغيلاً فعلياً.",
    en: "The registry fills automatically when the first evaluation runs are imported from the runner. No model is listed by name-dropping — registration requires a real run.",
  },
  "mdl.totalRuns": { ar: "مجموع التشغيلات", en: "Total runs" },
  "mdl.published": { ar: "المنشورة", en: "Published" },
  "mdl.license": { ar: "الرخصة", en: "License" },
  // Leaderboard - visual analysis section (sprint item 3)
  "lb2.analysis.title": { ar: "التحليل البصري", en: "Visual analysis" },
  "lb2.gap.title": {
    ar: "فجوة المسارين: الفصحى مقابل العراقية",
    en: "The two-track gap: MSA vs Iraqi",
  },
  "lb2.gap.caption": {
    ar: "لكل نموذج شريط يمتد من درجته العراقية إلى درجته الفصيحة على المحاور الآلية — طول الشريط هو الفجوة. لاحظ ثباتها المنهجي عبر النماذج: الفصحى مضغوطة قرب السقف والتمييز كله عراقي.",
    en: "Each model's bar spans from its Iraqi score to its MSA score on the auto-scored axes - the bar length is the gap. Note how consistent it is across models: MSA is compressed near the ceiling while all the discrimination is Iraqi.",
  },
  "lb2.ci.title": {
    ar: "المسار العراقي بفواصل ثقة 95%",
    en: "Iraqi track with 95% confidence intervals",
  },
  "lb2.ci.caption": {
    ar: "النقطة متوسط النموذج على المحاور العراقية الآلية، والشريط فاصل Wilson 95% محسوب من عدد البنود. تداخل الفواصل يعني أن الفرق بين النموذجين غير محسوم إحصائياً على حجم العينة الحالي.",
    en: "The dot is the model's mean over the Iraqi auto-scored axes; the whisker is a 95% Wilson interval computed from the item counts. Overlapping intervals mean the difference between two models is not statistically settled at the current sample size.",
  },
  "lb2.axes.title": {
    ar: "تفكيك المحاور العراقية (أعلى 8 نماذج)",
    en: "Iraqi per-axis breakdown (top 8 models)",
  },
  "lb2.axes.caption": {
    ar: "المقارنة محوراً محوراً تكشف مواطن القوة والضعف: أين يفهم النموذج اللهجة، وأين يعرف العراق، وأين يقرأ الكتاب الرسمي.",
    en: "The per-axis comparison exposes strengths and weaknesses: where a model understands the dialect, where it knows Iraq, and where it can read an official letter.",
  },
  "lb2.sat.title": {
    ar: "كسر التشبّع: من البنك الأول إلى البنك الحالي",
    en: "Breaking saturation: first bank vs current bank",
  },
  "lb2.sat.caption": {
    ar: "خط لكل نموذج بين تقييمه على النسخة الأولى (43 بنداً) والنسخة الحالية (340 بنداً): القمة المتكدسة انفرشت — البنك الأصعب صار أداة تمييز فعلية.",
    en: "One line per model from its first-bank (43 items) evaluation to the current bank (340 items): the crowded ceiling spread out - the harder bank became a real discriminator.",
  },
  "lb2.note.ci": {
    ar: "فواصل الثقة تُحسب للمحاور الآلية فقط بطريقة Wilson عند مستوى 95%؛ ولمحور الوثائق الرسمية تُعدّ تقديراً متحفظاً (تباين برنولي هو الحد الأعلى للمتغيرات المحصورة بين 0 و1). المحاور التوليدية تُقاس بالتحكيم البشري ولا تُعطى فواصل ثنائية الحدين.",
    en: "Confidence intervals are computed for auto-scored axes only, using the Wilson method at the 95% level; for the official-documents axis this is a conservative estimate (Bernoulli variance is the upper bound for [0,1]-bounded variables). Human-judged axes are not given binomial intervals.",
  },
} satisfies Dict;

export type TKey = keyof typeof dict;

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: TKey) => string;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const I18nContext = createContext<I18nValue | null>(null);

const COOKIE = "mizan_lang";

function readCookie(): Lang {
  if (typeof document === "undefined") return "ar";
  const m = document.cookie.match(/(?:^|;\s*)mizan_lang=(ar|en)/);
  return (m?.[1] as Lang) ?? "ar";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readCookie);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "ar" ? "en" : "ar"),
    [lang, setLang],
  );

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback(
    (key: TKey) => dict[key]?.[lang] ?? String(key),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, dir, t, setLang, toggle }),
    [lang, dir, t, setLang, toggle],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Convenience helpers to translate benchmark enums via the same dictionary.
// ---------------------------------------------------------------------------
export function useLabels() {
  const { t } = useI18n();
  return {
    axis: (a: string) => t(`axis.${a}` as TKey),
    track: (tr: string) => t(`track.${tr}` as TKey),
    trackShort: (tr: string) => t(`track.${tr}.short` as TKey),
    region: (r: string) => t(`region.${r}` as TKey),
    format: (f: string) => t(`fmt.${f}` as TKey),
  };
}

