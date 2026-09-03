/**
 * Evaluation Metrics — the real Mizan scoring methodology, axis by axis.
 * Replaces the earlier decorative scaffold that listed BLEU/ROUGE (which
 * Mizan does not use) and a dead "comparison tool" button. Fully bilingual
 * through the central i18n dictionary.
 */
import { motion } from "framer-motion";
import { useI18n, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Sigma, Users, ShieldAlert, Hourglass } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type MethodKey = "met.method.auto" | "met.method.human" | "met.method.hybrid" | "met.method.extraction";

export default function Metrics() {
  const { t } = useI18n();

  const axes: { title: TKey; method: MethodKey; body: TKey }[] = [
    { title: "met.a1.title", method: "met.method.auto", body: "met.a1.body" },
    { title: "met.a2.title", method: "met.method.human", body: "met.a2.body" },
    { title: "met.a3.title", method: "met.method.hybrid", body: "met.a3.body" },
    { title: "met.a4.title", method: "met.method.auto", body: "met.a4.body" },
    { title: "met.a5.title", method: "met.method.extraction", body: "met.a5.body" },
    { title: "met.a6.title", method: "met.method.human", body: "met.a6.body" },
  ];

  const methodVariant: Record<MethodKey, "default" | "secondary" | "outline" | "destructive"> = {
    "met.method.auto": "default",
    "met.method.human": "secondary",
    "met.method.hybrid": "outline",
    "met.method.extraction": "outline",
  };

  const policies: { icon: typeof Sigma; title: TKey; body: TKey }[] = [
    { icon: Sigma, title: "met.agg.title", body: "met.agg.body" },
    { icon: Users, title: "met.judge.title", body: "met.judge.body" },
    { icon: ShieldAlert, title: "met.stats.title", body: "met.stats.body" },
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
            <BarChart3 className="w-10 h-10" />
            {t("met.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("met.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* Per-axis scoring */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">{t("met.axes.title")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {axes.map(({ title, method, body }) => (
              <Card key={title} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug">{t(title)}</h3>
                  <Badge variant={methodVariant[method]} className="shrink-0">
                    {t(method)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Aggregation, judging policy, statistical rigor */}
        <motion.div variants={itemVariants} className="space-y-4">
          {policies.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <div className="flex items-start gap-4">
                <Icon className="w-8 h-8 text-blue-600 shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{t(title)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(body)}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Honest pilot status of generative axes */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-4">
              <Hourglass className="w-8 h-8 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{t("met.pending.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("met.pending.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
