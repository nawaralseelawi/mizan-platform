/**
 * Submit Your Model - on-platform runner instructions plus a submission form.
 * The form composes a structured mailto message; no files are uploaded to the
 * platform (Mizan runs no inference and hosts no weights). The fully
 * automated submission pipeline is roadmapped post-sprint.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Cloud, Server, Terminal, FileJson, Mail } from "lucide-react";

const CONTACT_EMAIL = "mizan.iraqllm@gmail.com";

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <pre dir="ltr" className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto text-left leading-relaxed">
      {lines.join("\n")}
    </pre>
  );
}

export default function SubmitModel() {
  const { t } = useI18n();
  const [f, setF] = useState({
    model: "", version: "", developer: "", params: "",
    hosting: "api", name: "", affiliation: "", notes: "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    const subject = `Mizan Model Submission: ${f.model || "(model)"}`;
    const body = [
      `Model name: ${f.model}`,
      `Version / date: ${f.version}`,
      `Developer: ${f.developer}`,
      `Parameters: ${f.params}`,
      `Hosting: ${f.hosting === "api" ? "Cloud API" : "Self-hosted (OpenAI-compatible endpoint)"}`,
      `Researcher: ${f.name}`,
      `Affiliation: ${f.affiliation}`,
      `Notes: ${f.notes}`,
      ``,
      `[Please attach the results JSON produced by the Mizan runner before sending.]`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const field = (key: keyof typeof f, labelKey: Parameters<typeof t>[0], required = true) => (
    <div className="space-y-1.5">
      <Label>{t(labelKey)}{required ? " *" : ""}</Label>
      <Input value={f[key]} onChange={set(key)} dir="auto" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold">
            {t("sub.title")}
          </motion.h1>
          <p className="text-lg opacity-95 leading-relaxed">{t("sub.subtitle")}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Prerequisites */}
        <Card className="p-6 space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2"><Terminal className="w-5 h-5 text-blue-600" />{t("sub.prereq.title")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("sub.prereq.body")}</p>
        </Card>

        {/* Setup */}
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-bold">{t("sub.setup.title")}</h2>
          <CodeBlock lines={[
            "git clone https://github.com/nawaralseelawi/mizan-platform.git",
            "cd mizan-platform",
            "npm install",
          ]} />
          <p className="text-sm text-muted-foreground">{t("sub.setup.note")}</p>
        </Card>

        {/* Path A */}
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-600" />{t("sub.pathA.title")}</h2>
          <CodeBlock lines={[
            '$env:OPENROUTER_API_KEY="sk-or-..."',
            'npx tsx runner/run.ts --items data/pilot-0.2-all.jsonl \\',
            '  --provider openrouter --model "vendor/model-slug" \\',
            '  --developer "Vendor" --version pilot-0.2 --out data/results-mymodel.json',
          ]} />
        </Card>

        {/* Path B */}
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><Server className="w-5 h-5 text-emerald-600" />{t("sub.pathB.title")}</h2>
          <CodeBlock lines={[
            '$env:OPENAI_BASE_URL="http://localhost:11434/v1"',
            'npx tsx runner/run.ts --items data/pilot-0.2-all.jsonl \\',
            '  --provider openai --model "your-model-name" \\',
            '  --developer "Your Lab" --version pilot-0.2 --out data/results-mymodel.json',
          ]} />
          <p className="text-sm text-muted-foreground">{t("sub.pathB.note")}</p>
        </Card>

        {/* Output */}
        <Card className="p-6 space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2"><FileJson className="w-5 h-5 text-amber-600" />{t("sub.out.title")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("sub.out.body")}</p>
        </Card>

        {/* Form */}
        <Card className="p-6 space-y-5 border-2 border-blue-200 bg-blue-50/40">
          <h2 className="text-2xl font-bold">{t("sub.form.title")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {field("model", "sub.form.model")}
            {field("version", "sub.form.version")}
            {field("developer", "sub.form.developer")}
            {field("params", "sub.form.params")}
            <div className="space-y-1.5">
              <Label>{t("sub.form.hosting")} *</Label>
              <select
                value={f.hosting}
                onChange={set("hosting")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="api">{t("sub.form.hostingApi")}</option>
                <option value="self">{t("sub.form.hostingSelf")}</option>
              </select>
            </div>
            {field("name", "sub.form.name")}
            {field("affiliation", "sub.form.affiliation")}
          </div>
          <div className="space-y-1.5">
            <Label>{t("sub.form.notes")}</Label>
            <Textarea value={f.notes} onChange={set("notes")} dir="auto" rows={3} />
          </div>
          <p className="text-sm text-muted-foreground">{t("sub.form.attach")}</p>
          <Button size="lg" onClick={submit} className="w-full md:w-auto">
            <Mail className="w-4 h-4 me-2" />
            {t("sub.form.submit")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
