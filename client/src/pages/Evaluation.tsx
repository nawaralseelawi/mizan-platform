/**
 * Evaluate Your Model - honest description of how models are evaluated on
 * Mizan. The platform is an evaluation harness and results registry: it never
 * hosts model weights and runs no inference. This page replaces an earlier
 * decorative scaffold that implied weight uploads.
 */
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Server,
  ShieldCheck,
  CalendarClock,
  Users,
  BookOpenCheck,
  Mail,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

const CONTACT_EMAIL = "mizan.iraqllm@gmail.com";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Evaluation() {
  const { t } = useI18n();

  const steps = ["ev.step1", "ev.step2", "ev.step3", "ev.step4", "ev.step5"] as const;
  const principles = [
    { icon: CalendarClock, key: "ev.p1" },
    { icon: Users, key: "ev.p2" },
    { icon: BookOpenCheck, key: "ev.p3" },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            {t("ev.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("ev.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* Why no upload */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("ev.noupload.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("ev.noupload.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Two paths */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <Cloud className="w-9 h-9 text-blue-600" />
            <h3 className="text-lg font-bold">{t("ev.path.a.title")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("ev.path.a.body")}</p>
          </Card>
          <Card className="p-6 space-y-3">
            <Server className="w-9 h-9 text-emerald-600" />
            <h3 className="text-lg font-bold">{t("ev.path.b.title")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("ev.path.b.body")}</p>
          </Card>
        </motion.div>

        {/* Steps */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-5">{t("ev.steps.title")}</h3>
            <ol className="space-y-4">
              {steps.map((key, i) => (
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

        {/* Principles */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-4">{t("ev.principles.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {principles.map(({ icon: Icon, key }) => (
              <Card key={key} className="p-5 space-y-2">
                <Icon className="w-7 h-7 text-blue-600" />
                <p className="text-sm text-muted-foreground leading-relaxed">{t(key)}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <h3 className="text-2xl font-bold">{t("ev.cta.title")}</h3>
            <p className="text-muted-foreground">{t("ev.cta.body")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <a href={`mailto:${CONTACT_EMAIL}?subject=Mizan%20Model%20Evaluation`}>
                  <Mail className="w-4 h-4 me-2" />
                  {t("ev.cta.button")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/leaderboard">
                  <Trophy className="w-4 h-4 me-2" />
                  {t("ev.cta.leaderboard")}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
