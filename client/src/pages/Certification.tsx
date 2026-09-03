/**
 * Certification — how Mizan verification certificates work, with a live
 * public verification widget (certificates.verify) and the list of issued
 * certificates (certificates.list). Replaces the earlier decorative
 * scaffold. Fully bilingual through the central i18n dictionary.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n, type TKey } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  History,
  ShieldCheck,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HASH_RE = /^[a-f0-9]{64}$/i;

function fmtDate(value: unknown, lang: string): string {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return d.toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Certification() {
  const { t, lang } = useI18n();

  const [hashInput, setHashInput] = useState("");
  const [submittedHash, setSubmittedHash] = useState<string | null>(null);
  const [formatError, setFormatError] = useState(false);

  const verify = trpc.certificates.verify.useQuery(
    { hash: submittedHash ?? "" },
    { enabled: submittedHash !== null },
  );
  const list = trpc.certificates.list.useQuery();

  const handleVerify = () => {
    const trimmed = hashInput.trim().toLowerCase();
    if (!HASH_RE.test(trimmed)) {
      setFormatError(true);
      setSubmittedHash(null);
      return;
    }
    setFormatError(false);
    setSubmittedHash(trimmed);
  };

  const howItems: { icon: typeof Award; key: TKey }[] = [
    { icon: Award, key: "cert.how1" },
    { icon: CalendarClock, key: "cert.how2" },
    { icon: History, key: "cert.how3" },
  ];

  const result = verify.data;

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
            <Award className="w-10 h-10" />
            {t("cert.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-95 leading-relaxed"
          >
            {t("cert.subtitle")}
          </motion.p>
        </div>
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-14 space-y-10"
      >
        {/* How certificates work */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">{t("cert.how.title")}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {howItems.map(({ icon: Icon, key }) => (
              <Card key={key} className="p-5 space-y-2">
                <Icon className="w-7 h-7 text-blue-600" />
                <p className="text-sm text-muted-foreground leading-relaxed">{t(key)}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Standing principle */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-2 border-emerald-200 bg-emerald-50/50">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <p className="leading-relaxed font-medium pt-1">{t("cert.principle")}</p>
            </div>
          </Card>
        </motion.div>

        {/* Live verification widget */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("cert.verify.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("cert.verify.hint")}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                dir="ltr"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
                placeholder={t("cert.verify.placeholder")}
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={handleVerify} className="gap-2">
                <Search className="w-4 h-4" />
                {t("cert.verify.button")}
              </Button>
            </div>

            {formatError && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {t("cert.verify.invalid")}
              </p>
            )}

            {submittedHash !== null && verify.isLoading && (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            )}

            {result && result.status === "valid" && (
              <Card className="p-4 border-2 border-emerald-300 bg-emerald-50/60 space-y-2">
                <p className="font-bold flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {t("cert.verify.valid")}
                </p>
                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.model")}: </span>
                    <span className="font-medium">{result.model}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.version")}: </span>
                    <span className="font-medium" dir="ltr">{result.versionLabel}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.issued")}: </span>
                    <span className="font-medium">{fmtDate(result.issuedAt, lang)}</span>
                  </p>
                </div>
              </Card>
            )}

            {result && result.status === "revoked" && (
              <Card className="p-4 border-2 border-amber-300 bg-amber-50/60 space-y-2">
                <p className="font-bold flex items-center gap-2 text-amber-700">
                  <XCircle className="w-5 h-5 shrink-0" />
                  {t("cert.verify.revoked")}
                </p>
                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.model")}: </span>
                    <span className="font-medium">{result.model}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.issued")}: </span>
                    <span className="font-medium">{fmtDate(result.issuedAt, lang)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t("cert.verify.revokedAt")}: </span>
                    <span className="font-medium">{fmtDate(result.revokedAt, lang)}</span>
                  </p>
                </div>
              </Card>
            )}

            {result && result.status === "not_found" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                {t("cert.verify.notfound")}
              </p>
            )}
          </Card>
        </motion.div>

        {/* Issued certificates */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("cert.list.title")}</h2>
            {list.isLoading && (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            )}
            {list.data && list.data.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("cert.list.empty")}</p>
            )}
            {list.data && list.data.length > 0 && (
              <div className="space-y-3">
                {list.data.map((c) => (
                  <div
                    key={c.certificateId}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{c.modelName}</span>
                      <span className="text-sm text-muted-foreground">{c.developer}</span>
                      <Badge variant="outline" dir="ltr">{c.versionLabel}</Badge>
                      <span className="text-xs text-muted-foreground ms-auto">
                        {t("cert.verify.issued")}: {fmtDate(c.issuedAt, lang)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground break-all" dir="ltr">
                      <span className="font-semibold">{t("cert.list.hash")}:</span>{" "}
                      <span className="font-mono">{c.verificationHash}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
