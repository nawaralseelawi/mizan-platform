# دليل تشغيل منصة ميزان — Runbook

دليل تشغيل كامل من الصفر لجهاز محلي. مكتوب لمستخدم عنده خبرة terminal.
كل الأوامر تُنفَّذ من داخل مجلد المشروع (`mizan-platform/`) ما لم يُذكر غير ذلك.

Complete local run guide, from zero to a real leaderboard. Every command
runs from inside the project folder unless stated otherwise.

---

## 0. المتطلبات — Prerequisites

نصّبها مرة واحدة:

| الأداة | النسخة | من أين |
|---|---|---|
| Node.js | 20 LTS أو أحدث | nodejs.org |
| PostgreSQL | 14 أو أحدث | postgresql.org |
| مفتاح API | — | console.anthropic.com أو platform.openai.com |

تحقّق من Node بعد التنصيب:
```bash
node --version    # يجب أن يظهر v20 أو أعلى
npm --version
```

تحقّق أن PostgreSQL يعمل:
```bash
# Linux
sudo service postgresql status
# macOS (Homebrew)
brew services list | grep postgresql
# Windows: افتح "Services" وتأكد أن postgresql-x64 قيد التشغيل
```

---

## 1. تجهيز قاعدة البيانات — Create the database

أنشئ مستخدماً وقاعدة بيانات باسم `mizan`. من terminal:

```bash
# Linux
sudo -u postgres psql -c "CREATE USER mizan WITH PASSWORD 'اختر_كلمة_سر';"
sudo -u postgres psql -c "CREATE DATABASE mizan OWNER mizan;"

# macOS
psql postgres -c "CREATE USER mizan WITH PASSWORD 'اختر_كلمة_سر';"
psql postgres -c "CREATE DATABASE mizan OWNER mizan;"

# Windows (من psql shell بعد تسجيل دخول postgres)
CREATE USER mizan WITH PASSWORD 'اختر_كلمة_سر';
CREATE DATABASE mizan OWNER mizan;
```

---

## 2. ملف البيئة — The .env file

في جذر المشروع أنشئ ملفاً اسمه `.env` (انسخ من `.env.example`) وعبّئه:

```
DATABASE_URL=postgres://mizan:كلمة_السر@localhost:5432/mizan
JWT_SECRET=ضع_هنا_نصاً_طويلاً_عشوائياً
SESSION_HOURS=72
PORT=3000
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-مفتاحك
# أو، إذا تختبر نماذج OpenAI:
# OPENAI_API_KEY=sk-مفتاحك
```

لتوليد `JWT_SECRET` قوي:
```bash
# Linux / macOS
openssl rand -base64 48
```

> ملاحظة أمان: ملف `.env` مستثنى من Git أصلاً (في `.gitignore`). لا ترفعه ولا تشاركه.

---

## 3. التنصيب والهيكلة — Install and migrate

```bash
npm install
npm run db:generate      # يولّد ملفات الهجرة من المخطط
npm run db:migrate       # يطبّقها على قاعدة البيانات
```

---

## 4. استيراد بنك البنود التجريبي — Import the pilot bank

```bash
npm run import:items -- --file data/pilot-0.1-part1.jsonl --version pilot-0.1
npm run import:items -- --file data/pilot-0.1-part2.jsonl --version pilot-0.1
```

النتيجة المتوقعة: 43 بنداً علنياً مستورداً على مساري العربية والعراقية.

---

## 5. تشغيل نموذج حقيقي — Run a real model

هنا تحدث المقارنة الفعلية. المشغّل يستعلم النموذج، يصحّح آلياً بنود
الاختيار والاستخراج لكل (مسار، محور)، ويترك بنود التوليد الحر للتحكيم
البشري.

```bash
# مثال: Claude
npm run eval -- \
  --items data/pilot-0.1-part1.jsonl \
  --items2 data/pilot-0.1-part2.jsonl \
  --provider anthropic \
  --model claude-sonnet-4-6 \
  --developer Anthropic \
  --version pilot-0.1 \
  --out data/results-claude.json
```

```bash
# مثال: GPT (يتطلب OPENAI_API_KEY في .env)
npm run eval -- \
  --items data/pilot-0.1-part1.jsonl \
  --items2 data/pilot-0.1-part2.jsonl \
  --provider openai \
  --model gpt-4o \
  --developer OpenAI \
  --version pilot-0.1 \
  --out data/results-gpt.json
```

كرّر لأي عدد من النماذج تريد مقارنتها؛ كل واحد يُخرج ملف نتائج منفصلاً.

> أسماء النماذج تتغير مع الوقت. استخدم المعرّف الرسمي الحالي من وثائق
> المزوّد. `--model` يُمرَّر كما هو إلى الـAPI.

---

## 6. استيراد النتائج وإنشاء مشرف — Import results, create admin

```bash
npm run import:results -- --file data/results-claude.json
# كرّر لكل ملف نتائج

npm run create:admin -- --email you@mizan.iq --name "اسمك" --password "كلمة_سر_قوية_10_محارف+"
```

عند الاستيراد يحصل كل تشغيل على حالة `imported` — لا يظهر على اللوحة بعد.
النشر خطوة بشرية صريحة (القسم 8).

---

## 7. تشغيل الموقع — Start the site

```bash
npm run dev
```

هذا يشغّل الخادم (منفذ 3000) وواجهة التطوير معاً. افتح المتصفح على:

```
http://localhost:5173
```

> في وضع التطوير الواجهة على 5173 وتُمرِّر طلبات الـAPI تلقائياً إلى 3000.
> للنشر الإنتاجي لاحقاً استخدم `npm run build` ثم `npm start`، ويُخدَّم
> كل شيء من منفذ واحد (3000).

---

## 8. النشر والتحقق — Publish and verify

1. اذهب إلى `http://localhost:5173/login` وسجّل دخولاً بحساب المشرف.
2. افتح `Dashboard` — سترى جدول "Evaluation runs" بالتشغيلات المستوردة.
3. اضغط **Publish** على تشغيل. يظهر فوراً على `Leaderboard` بمعدلات
   العربية والعراقية المنفصلة، وتُصدَر له شهادة ببصمة تحقق.
4. صفحة `Certification` تعرض الشهادة، وبوابة التحقق تقبل البصمة وتؤكدها.
5. **Retract** يسحب التشغيل من اللوحة ويعلّم الشهادة "revoked" (لا يحذفها).

بنود التوليد الحر (`open_generation`) لا تُصحَّح آلياً؛ تظهر في مخرجات
المشغّل كـ"human pending" وتُحكَّم بشرياً وفق أدلة التصحيح في دليل كتابة
البنود، ثم تُضاف نتائجها يدوياً في دفعة لاحقة.

---

## استكشاف الأخطاء — Troubleshooting

**`Missing required environment variable: DATABASE_URL`**
ملف `.env` غير موجود أو في المجلد الخطأ. تأكد أنه في جذر المشروع تماماً.

**`ECONNREFUSED ... 5432` أو `password authentication failed`**
PostgreSQL متوقف أو بيانات الاتصال خطأ. تحقق من تشغيله (القسم 0) ومن أن
كلمة السر في `DATABASE_URL` تطابق التي وضعتها في القسم 1.

**`relation "..." does not exist`**
لم تُطبَّق الهجرة. أعد `npm run db:generate && npm run db:migrate`.

**`ANTHROPIC_API_KEY is not set` عند التشغيل**
المفتاح غير موجود في `.env`، أو أن الجلسة لم تلتقطه. المشغّل يقرأ `.env`
تلقائياً؛ تأكد من عدم وجود مسافات حول `=` وأن المفتاح على سطر واحد.

**`Unknown benchmark_version` عند استيراد النتائج**
استوردت النتائج قبل البنود. نفّذ القسم 4 أولاً ثم أعد الاستيراد.

**الواجهة فارغة أو "No published results yet"**
هذا صحيح ومقصود قبل النشر. أكمل القسم 8 (اضغط Publish).

**تعارض في نسخ الحزم عند `npm install`**
احذف `node_modules` و`package-lock.json` وأعد `npm install`.

**المنفذ 3000 أو 5173 مشغول**
غيّر `PORT` في `.env` (للخادم)، أو أوقف العملية التي تستخدم المنفذ.

---

## بطاقة أوامر سريعة — Quick reference

```bash
npm install                                   # مرة واحدة
npm run db:generate && npm run db:migrate     # تجهيز القاعدة
npm run import:items -- --file data/pilot-0.1-part1.jsonl --version pilot-0.1
npm run import:items -- --file data/pilot-0.1-part2.jsonl --version pilot-0.1
npm run eval -- --items data/pilot-0.1-part1.jsonl --items2 data/pilot-0.1-part2.jsonl --provider anthropic --model claude-sonnet-4-6 --developer Anthropic --version pilot-0.1 --out data/results-claude.json
npm run import:results -- --file data/results-claude.json
npm run create:admin -- --email you@mizan.iq --name "اسمك" --password "..."
npm run dev                                   # ثم افتح localhost:5173
```

