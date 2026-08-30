import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AXIS_LABELS, AXIS_ORDER, useLatestVersion } from "@/lib/benchmark";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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

export default function Benchmark() {
  const { t } = useI18n();
  const [selectedDomain, setSelectedDomain] = useState<string>("dialect_comprehension");
  const { label: latestVersion } = useLatestVersion();

  const composition = trpc.benchmark.composition.useQuery(
    { versionLabel: latestVersion ?? "" },
    { enabled: latestVersion !== null },
  );
  const sumByAxis = (
    rows: { axis: string; n: number }[] | undefined,
  ): Map<string, number> => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(r.axis, (m.get(r.axis) ?? 0) + r.n);
    return m;
  };
  const countsByAxis = sumByAxis(composition.data?.publicByAxis);
  const privateByAxis = sumByAxis(composition.data?.privateByAxis);
  const domains = AXIS_ORDER.map((axis) => ({
    id: axis,
    name: AXIS_LABELS[axis].name,
    tasks: (countsByAxis.get(axis) ?? 0) + (privateByAxis.get(axis) ?? 0),
  }));

  const capabilities = [
    "Iraqi Dialect Understanding",
    "Iraqi Dialect Generation",
    "MSA-Iraqi Translation",
    "Iraqi Cultural Knowledge",
    "Official Document Extraction",
    "Context-Aware Safety",
  ];

  const metrics = [
    { name: "Accuracy", description: "Automatic scoring for multiple-choice items" },
    { name: "Field Exact Match", description: "Per-field accuracy on official-document extraction" },
    { name: "Human Rubric Score", description: "Unified-rubric human judging for open generation" },
    { name: "95% Confidence Interval", description: "Statistical uncertainty reported with every published axis score" },
  ];

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
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold">
              {t("bench.title")}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("bench.subtitle")}
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
            {/* Tabs */}
            <Tabs defaultValue="domains" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              {/* Domains Tab */}
              <TabsContent value="domains" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {domains.map((domain) => (
                    <motion.div
                      key={domain.id}
                      variants={itemVariants}
                      onClick={() => setSelectedDomain(domain.id)}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`p-6 h-full transition-all ${
                          selectedDomain === domain.id
                            ? "ring-2 ring-blue-600 shadow-lg"
                            : "hover:shadow-lg"
                        }`}
                      >
                        <h3 className="text-lg font-bold mb-2">{domain.name}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{domain.tasks} Tasks</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Domain Details */}
                {selectedDomain && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <h3 className="text-2xl font-bold mb-4">
                      {domains.find((d) => d.id === selectedDomain)?.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {AXIS_LABELS[selectedDomain as keyof typeof AXIS_LABELS]?.description ?? ""}
                    </p>
                    <Button>View Benchmark Details</Button>
                  </motion.div>
                )}
              </TabsContent>

              {/* Capabilities Tab */}
              <TabsContent value="capabilities" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {capabilities.map((capability, i) => (
                    <motion.div key={i} variants={itemVariants}>
                      <Card className="p-6 hover:shadow-lg transition-all">
                        <h3 className="text-lg font-bold mb-2">{capability}</h3>
                        <p className="text-muted-foreground text-sm">
                          Comprehensive evaluation of {capability.toLowerCase()} capabilities.
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Metrics Tab */}
              <TabsContent value="metrics" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {metrics.map((metric, i) => (
                    <motion.div key={i} variants={itemVariants}>
                      <Card className="p-6 hover:shadow-lg transition-all">
                        <h3 className="text-lg font-bold mb-2">{metric.name}</h3>
                        <p className="text-muted-foreground text-sm">{metric.description}</p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6 mt-8">
                <motion.div variants={itemVariants} className="space-y-4">
                  <p className="text-muted-foreground">
                    Explore individual benchmark tasks and their specifications.
                  </p>
                  <Button onClick={() => (window.location.href = "/dataset")}>Browse Public Items</Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Evaluation Pipeline Preview */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              Evaluation Pipeline
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4">
              {["Data Preparation", "Model Submission", "Evaluation Execution", "Results Analysis", "Certification"].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold">{step}</h3>
                    <p className="text-sm text-muted-foreground">Step {i + 1} of 5</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

