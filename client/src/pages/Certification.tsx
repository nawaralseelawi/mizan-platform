import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};



export default function Certification() {
  const certs = trpc.certificates.list.useQuery();
  const [hashInput, setHashInput] = useState("");
  const [hashToVerify, setHashToVerify] = useState<string | null>(null);
  const verify = trpc.certificates.verify.useQuery(
    { hash: hashToVerify ?? "" },
    { enabled: hashToVerify !== null },
  );
  const certifications = (certs.data ?? []).map((c) => ({
    id: c.certificateId,
    model: c.modelName,
    developer: c.developer,
    version: c.versionLabel,
    date: new Date(c.issuedAt).toISOString().slice(0, 10),
    hash: c.verificationHash,
  }));
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold flex items-center justify-center gap-3">
              <Award className="w-12 h-12" />
              Certification
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              Digital certificates with SHA-256 verification hashes for models that completed a published Mizan evaluation. Issued after human review - never automatically.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Certification Levels */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Certification Levels</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    level: "Bronze",
                    criteria: "Accuracy > 75%",
                    color: "bg-amber-100 dark:bg-amber-900/30",
                  },
                  {
                    level: "Silver",
                    criteria: "Accuracy > 85%",
                    color: "bg-slate-100 dark:bg-slate-900/30",
                  },
                  {
                    level: "Gold",
                    criteria: "Accuracy > 90%",
                    color: "bg-yellow-100 dark:bg-yellow-900/30",
                  },
                ].map((cert, i) => (
                  <Card key={i} className={`p-6 ${cert.color}`}>
                    <h3 className="text-lg font-bold mb-2">{cert.level}</h3>
                    <p className="text-muted-foreground">{cert.criteria}</p>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Certified Models */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Certified Models</h2>
              {certifications.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  No certificates issued yet. The first certificates will be
                  granted after the pilot evaluation runs are completed,
                  reviewed, and published.
                </Card>
              )}
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-bold">{cert.model}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cert.developer} - certified {cert.date}
                          </p>
                        </div>
                      </div>
                      <Badge>{cert.version}</Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {cert.hash}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Verification Portal */}
            <motion.div variants={itemVariants} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Verification Portal</h3>
              <p className="text-muted-foreground mb-6">
                Paste a certificate hash to confirm whether Mizan attests to
                it. Revoked certificates are reported as revoked, not hidden.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="64-character SHA-256 hash"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value.trim())}
                  className="font-mono"
                />
                <Button
                  disabled={!/^[a-f0-9]{64}$/i.test(hashInput)}
                  onClick={() => setHashToVerify(hashInput.toLowerCase())}
                >
                  Verify
                </Button>
              </div>
              {hashToVerify && verify.data && (
                <div className="mt-4 text-sm">
                  {verify.data.status === "valid" && (
                    <p className="text-green-700 dark:text-green-400">
                      Valid certificate: {verify.data.model} (
                      {verify.data.developer}) on version{" "}
                      {verify.data.versionLabel}, issued{" "}
                      {new Date(verify.data.issuedAt).toISOString().slice(0, 10)}.
                    </p>
                  )}
                  {verify.data.status === "revoked" && (
                    <p className="text-amber-700 dark:text-amber-400">
                      Revoked certificate: {verify.data.model} on version{" "}
                      {verify.data.versionLabel}. It was retracted and no
                      longer attests to published results.
                    </p>
                  )}
                  {verify.data.status === "not_found" && (
                    <p className="text-red-600">
                      No certificate matches this hash.
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Certification Process */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold">Certification Process</h3>
              <div className="space-y-3">
                {[
                  { step: 1, name: "Model Submission", description: "Submit your model for evaluation" },
                  { step: 2, name: "Benchmark Execution", description: "Run comprehensive benchmarks" },
                  { step: 3, name: "Review", description: "Expert review of results" },
                  { step: 4, name: "Certification", description: "Receive digital certificate" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

