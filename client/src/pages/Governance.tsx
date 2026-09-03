/**
 * Governance — the real governance of Mizan: institutional anchor (National
 * LLM Team, Diwani Order 251482/2025), the ratified access model, binding
 * methodological rules, data ethics, result/version integrity, and the
 * release & licensing plan. Replaces the earlier decorative scaffold with
 * its fictional boards. Fully bilingual through the central i18n dictionary.
 */
import { motion } from "framer-motion";
import { useI18n, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Landmark,
  KeyRound,
  BookOpenCheck,
  Scale,
  History,
  Rocket,
  Mail,
} from "lucide-react";

const CONTACT_EMAIL = "mizan.iraqllm@gmail.com";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function PolicySection({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Shield;
  title: TKey;
  items: TKey[];
}) {
  const { t } = useI18n();
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-7 h-7 text-blue-600 shrink-0" />
        <h2 className="text-xl font-bold">{t(title)}</h2>
      </div>
      <ul className="space-y-3">
        {items.map((key) => (
          <li key={key} className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
            <p className="leading-relaxed text-muted-foreground">{t(key)}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function Governance() {
  const { t } = useI18n();

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
            <Shield className="w-10 h-10" />
            {t("gov.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("gov.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-8"
      >
        {/* Institutional anchor */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
            <div className="flex items-start gap-4">
              <Landmark className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("gov.inst.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("gov.inst.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PolicySection
            icon={KeyRound}
            title="gov.access.title"
            items={["gov.access1", "gov.access2", "gov.access3"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PolicySection
            icon={BookOpenCheck}
            title="gov.method.title"
            items={["gov.m1", "gov.m2", "gov.m3", "gov.m4"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PolicySection
            icon={Scale}
            title="gov.ethics.title"
            items={["gov.e1", "gov.e2", "gov.e3"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PolicySection
            icon={History}
            title="gov.integrity.title"
            items={["gov.i1", "gov.i2"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PolicySection
            icon={Rocket}
            title="gov.release.title"
            items={["gov.r1", "gov.r2"]}
          />
        </motion.div>

        {/* Contact */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <h2 className="text-2xl font-bold">{t("gov.contact.title")}</h2>
            <p className="text-muted-foreground">{t("gov.contact.body")}</p>
            <Button size="lg" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="w-4 h-4 me-2" />
                <span dir="ltr">{CONTACT_EMAIL}</span>
              </a>
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
