/**
 * API Documentation — an honest account of what the platform exposes today:
 * the small public tRPC read API (leaderboard, certificates) and the CLI
 * evaluation runner as the real evaluation interface (including the
 * OPENAI_BASE_URL custom-endpoint path for self-hosted models). Replaces
 * the earlier decorative scaffold that implied SDKs and endpoints that do
 * not exist. Fully bilingual through the central i18n dictionary.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useI18n, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Globe, Terminal, FileJson, Rocket, Send } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/** Always-LTR monospace block for endpoint names and examples. */
function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      dir="ltr"
      className="bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed"
    >
      {children}
    </pre>
  );
}

export default function ApiDocs() {
  const { t } = useI18n();

  const endpoints: { name: string; body: TKey }[] = [
    { name: "leaderboard.table", body: "api.ep.lb.body" },
    { name: "certificates.list", body: "api.ep.cl.body" },
    { name: "certificates.verify", body: "api.ep.cv.body" },
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
            <Code2 className="w-10 h-10" />
            {t("api.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("api.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* Public read API */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-7 h-7 text-blue-600 shrink-0" />
              <h2 className="text-xl font-bold">{t("api.read.title")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t("api.read.body")}</p>
            <div className="space-y-3">
              {endpoints.map(({ name, body }) => (
                <div key={name} className="rounded-lg border border-border p-4 space-y-2">
                  <Badge variant="outline" className="font-mono" dir="ltr">
                    GET {name}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("api.ep.note")}</p>
            <div className="space-y-2">
              <h3 className="font-bold">{t("api.example.title")}</h3>
              <CodeBlock>
{`# Verify a certificate hash (URL-encoded JSON input):
GET /api/trpc/certificates.verify?input=%7B%22hash%22%3A%22<64-hex-hash>%22%7D

# Leaderboard for a bank version:
GET /api/trpc/leaderboard.table?input=%7B%22versionLabel%22%3A%22pilot-0.2%22%7D`}
              </CodeBlock>
            </div>
          </Card>
        </motion.div>

        {/* Runner as the real evaluation interface */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-7 h-7 text-emerald-600 shrink-0" />
              <h2 className="text-xl font-bold">{t("api.runner.title")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t("api.runner.body")}</p>
            <CodeBlock>
{`# Cloud provider (choose the one matching the model):
OPENROUTER_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY

# Self-hosted model behind an OpenAI-compatible server
# (vLLM, Ollama, LM Studio) - no size limit:
OPENAI_BASE_URL=http://localhost:11434/v1`}
            </CodeBlock>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">{t("api.runner.cta")}</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/submit">
                  <Send className="w-4 h-4 me-2" />
                  {t("api.gotoSubmit")}
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Item schema */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileJson className="w-7 h-7 text-blue-600 shrink-0" />
              <h2 className="text-xl font-bold">{t("api.schema.title")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t("api.schema.body")}</p>
            <CodeBlock>
{`track:  arabic | iraqi
axis:   comprehension | generation | translation |
        knowledge | official_documents | safety
format: multiple_choice | open_generation | extraction
tier:   public_dev | private_test`}
            </CodeBlock>
          </Card>
        </motion.div>

        {/* Roadmap */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-4">
              <Rocket className="w-8 h-8 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{t("api.roadmap.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("api.roadmap.body")}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
