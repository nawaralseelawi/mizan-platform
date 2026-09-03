/**
 * About Mizan — the project's real story, components, central empirical
 * finding, scientific leadership, and roadmap. Replaces the earlier page
 * whose body was hardcoded English filler (fictional boards, invented
 * future plans). Leadership wording reuses the ratified gov.inst.body key
 * so it stays in a single source of truth. Fully bilingual through the
 * central i18n dictionary.
 */
import { motion } from "framer-motion";
import { useI18n, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileJson,
  Terminal,
  Trophy,
  Sparkles,
  Landmark,
  Map,
  Send,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  const { t } = useI18n();

  const pieces: { icon: typeof FileJson; title: TKey; body: TKey }[] = [
    { icon: FileJson, title: "ab.piece1.title", body: "ab.piece1.body" },
    { icon: Terminal, title: "ab.piece2.title", body: "ab.piece2.body" },
    { icon: Trophy, title: "ab.piece3.title", body: "ab.piece3.body" },
  ];

  const roadmap: TKey[] = ["ab.road1", "ab.road2", "ab.road3"];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold">
              {t("about.title")}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("about.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* Story */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">{t("ab.story.title")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("ab.story.p1")}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("ab.story.p2")}</p>
          </Card>
        </motion.div>

        {/* What Mizan consists of */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">{t("ab.pieces.title")}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {pieces.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-5 space-y-2">
                <Icon className="w-8 h-8 text-blue-600" />
                <h3 className="font-bold">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Central empirical finding */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-emerald-200 bg-emerald-50/50">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("ab.finding.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("ab.finding.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Scientific leadership - single source of truth: gov.inst.body */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
            <div className="flex items-start gap-4">
              <Landmark className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("ab.lead.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("gov.inst.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Roadmap */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-7 h-7 text-blue-600 shrink-0" />
              <h2 className="text-xl font-bold">{t("ab.road.title")}</h2>
            </div>
            <ol className="space-y-4">
              {roadmap.map((key, i) => (
                <li key={key} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed pt-1 text-muted-foreground">{t(key)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <h2 className="text-2xl font-bold">{t("ab.cta.title")}</h2>
            <p className="text-muted-foreground">{t("ab.cta.body")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => (window.location.href = "/submit")}>
                <Send className="w-4 h-4 me-2" />
                {t("ev.cta.submit")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => (window.location.href = "/leaderboard")}>
                <Trophy className="w-4 h-4 me-2" />
                {t("home.cta.leaderboard")}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
