/**
 * System Architecture — honest description of the actual Mizan pipeline and
 * stack. Replaces the earlier decorative scaffold that claimed Kubernetes,
 * MySQL, Redis, and microservices, none of which exist in this system.
 * Fully bilingual through the central i18n dictionary.
 */
import { motion } from "framer-motion";
import { useI18n, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import {
  Layers,
  FileJson,
  Terminal,
  Database,
  ShieldCheck,
  Award,
  Trophy,
  LayoutDashboard,
  Lock,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Architecture() {
  const { t } = useI18n();

  const pipeline: TKey[] = [
    "arch.pipe1",
    "arch.pipe2",
    "arch.pipe3",
    "arch.pipe4",
    "arch.pipe5",
    "arch.pipe6",
  ];

  const components: { icon: typeof Layers; title: TKey; body: TKey }[] = [
    { icon: FileJson, title: "arch.c1.title", body: "arch.c1.body" },
    { icon: Terminal, title: "arch.c2.title", body: "arch.c2.body" },
    { icon: Database, title: "arch.c3.title", body: "arch.c3.body" },
    { icon: Award, title: "arch.c4.title", body: "arch.c4.body" },
    { icon: Trophy, title: "arch.c5.title", body: "arch.c5.body" },
    { icon: LayoutDashboard, title: "arch.c6.title", body: "arch.c6.body" },
  ];

  const stack: { label: TKey; value: TKey }[] = [
    { label: "arch.stack1.label", value: "arch.stack1.value" },
    { label: "arch.stack2.label", value: "arch.stack2.value" },
    { label: "arch.stack3.label", value: "arch.stack3.value" },
    { label: "arch.stack4.label", value: "arch.stack4.value" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-3"
          >
            <Layers className="w-10 h-10" />
            {t("arch.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("arch.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* Pipeline: authoring -> publication */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-5">{t("arch.pipeline.title")}</h2>
            <ol className="space-y-4">
              {pipeline.map((key, i) => (
                <li key={key} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed pt-1">{t(key)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </motion.div>

        {/* Contamination invariant */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("arch.contamination.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("arch.contamination.body")}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actual components */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">{t("arch.components.title")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {components.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-5 space-y-2">
                <Icon className="w-7 h-7 text-blue-600" />
                <h3 className="font-bold">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Honest stack */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t("arch.stack.title")}</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {stack.map(({ label, value }) => (
                <div key={label}>
                  <p className="font-bold text-blue-600">{t(label)}</p>
                  <p className="text-muted-foreground leading-relaxed">{t(value)}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Sumer boundary */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("arch.boundary.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("arch.boundary.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
