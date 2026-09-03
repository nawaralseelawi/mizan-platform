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

