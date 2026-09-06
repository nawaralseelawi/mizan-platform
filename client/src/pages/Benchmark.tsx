/**
 * Benchmark Explorer — the six evaluation axes with live item counts from
 * the platform, plus the two tracks, real metrics, and the real pipeline.
 *
 * Fix in this revision: tab contents are unmounted/remounted by the Tabs
 * component when switching tabs. Motion elements that relied on inherited
 * parent variants (which animate only once, on first view) remounted in
 * their hidden state and stayed invisible - notably the Pipeline tab.
 * Every such element now carries its own initial/animate props.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AXIS_ORDER, useLatestVersion } from "@/lib/benchmark";
import { motion } from "framer-motion";
import { useI18n, useLabels, type TKey } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Benchmark() {
  const { t, dir } = useI18n();
  const labels = useLabels();
  const [selectedAxis, setSelectedAxis] = useState<string>("comprehension");
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
  const axes = AXIS_ORDER.map((axis) => ({
    id: axis,
    name: labels.axis(axis),
    items: (countsByAxis.get(axis) ?? 0) + (privateByAxis.get(axis) ?? 0),
  }));

  const metrics: { title: TKey; body: TKey }[] = [
    { title: "bench2.m1.title", body: "bench2.m1.body" },
    { title: "bench2.m2.title", body: "bench2.m2.body" },
    { title: "bench2.m3.title", body: "bench2.m3.body" },
    { title: "bench2.m4.title", body: "bench2.m4.body" },
  ];

  const pipeline: TKey[] = [
    "bench2.p1",
    "bench2.p2",
    "bench2.p3",
    "bench2.p4",
    "bench2.p5",
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
          <div className="space-y-12">
            <Tabs defaultValue="axes" className="w-full" dir={dir}>
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="axes">{t("bench2.tab.axes")}</TabsTrigger>
                <TabsTrigger value="tracks">{t("bench2.tab.tracks")}</TabsTrigger>
                <TabsTrigger value="metrics">{t("bench2.tab.metrics")}</TabsTrigger>
                <TabsTrigger value="pipeline">{t("bench2.tab.pipeline")}</TabsTrigger>
              </TabsList>

              {/* Axes Tab - live item counts */}
              <TabsContent value="axes" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {axes.map((axis) => (
                    <motion.div
                      key={axis.id}
                      variants={itemVariants}
                      onClick={() => setSelectedAxis(axis.id)}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`p-6 h-full transition-all ${
                          selectedAxis === axis.id
                            ? "ring-2 ring-blue-600 shadow-lg"
                            : "hover:shadow-lg"
                        }`}
                      >
                        <h3 className="text-lg font-bold mb-2">{axis.name}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {axis.items} {t("bench2.items")}
                          </Badge>
                          <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 ltr:rotate-180" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Axis Details */}
                {selectedAxis && (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4"
                  >
                    <h3 className="text-2xl font-bold">
                      {axes.find((a) => a.id === selectedAxis)?.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`bench2.d.${selectedAxis}` as TKey)}
                    </p>
                    <Button onClick={() => (window.location.href = "/dataset")} className="gap-2">
                      {t("home2.release.browse")}
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Button>
                  </motion.div>
                )}
              </TabsContent>

              {/* Tracks Tab - the dual-track core of Mizan */}
              <TabsContent value="tracks" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="p-6 h-full space-y-3">
                      <h3 className="text-lg font-bold">{t("track.arabic")}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {t("bench2.track.arabic.body")}
                      </p>
                    </Card>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Card className="p-6 h-full space-y-3 border-2 border-emerald-200">
                      <h3 className="text-lg font-bold">{t("track.iraqi")}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {t("bench2.track.iraqi.body")}
                      </p>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Metrics Tab - real scoring summary */}
              <TabsContent value="metrics" className="space-y-6 mt-8">
                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {metrics.map(({ title, body }) => (
                    <motion.div key={title} variants={itemVariants}>
                      <Card className="p-6 hover:shadow-lg transition-all">
                        <h3 className="text-lg font-bold mb-2">{t(title)}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{t(body)}</p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/metrics")}
                    className="gap-2"
                  >
                    {t("bench2.fullMetrics")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Button>
                </motion.div>
              </TabsContent>

              {/* Pipeline Tab - the real path from authoring to publication */}
              <TabsContent value="pipeline" className="space-y-6 mt-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 max-w-2xl"
                >
                  {pipeline.map((key, i) => (
                    <motion.div key={key} variants={itemVariants} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </div>
                      <h3 className="font-bold leading-relaxed">{t(key)}</h3>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
