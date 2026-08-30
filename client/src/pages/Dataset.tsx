import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Filter, Lock } from "lucide-react";
import type { Axis, Track } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { AXIS_ORDER, TRACK_ORDER, useLatestVersion } from "@/lib/benchmark";
import { useI18n, useLabels } from "@/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const PAGE_SIZE = 10;

const REGION_LABELS: Record<string, string> = {
  baghdadi: "Baghdadi",
  southern: "Southern",
  maslawi: "Maslawi",
  mixed: "Mixed",
  msa: "MSA",
};

const FORMAT_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  open_generation: "Open generation",
  extraction: "Extraction",
};

interface McPayload {
  choices: string[];
  correct_answer: number;
}
interface ExtractionPayload {
  ground_truth: Record<string, string>;
}
interface GenPayload {
  rubric_id: string;
}

export default function Dataset() {
  const { t } = useI18n();
  const L = useLabels();
  const { label, isLoading: versionLoading } = useLatestVersion();
  const [selectedTrack, setSelectedTrack] = useState<Track | "all">("all");
  const [selectedAxis, setSelectedAxis] = useState<Axis | "all">("all");
  const [page, setPage] = useState(1);

  const stats = trpc.models.stats.useQuery();
  const items = trpc.benchmark.publicItems.useQuery(
    {
      versionLabel: label ?? "",
      track: selectedTrack === "all" ? undefined : selectedTrack,
      axis: selectedAxis === "all" ? undefined : selectedAxis,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: label !== null },
  );

  const total = items.data?.total ?? 0;
  const rows = items.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const noVersion = !versionLoading && label === null;

  return (
    <div className="w-full">
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold flex items-center justify-center gap-3"
            >
              <Database className="w-12 h-12" />
              {t("ds.title")}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl opacity-90 max-w-2xl mx-auto"
            >
              {t("ds.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3 className="text-lg font-bold">{t("ds.filter.title")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTrack === "all" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTrack("all");
                    setPage(1);
                  }}
                >
                  {t("ds.filter.bothTracks")}
                </Button>
                {TRACK_ORDER.map((track) => (
                  <Button
                    key={track}
                    variant={selectedTrack === track ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTrack(track);
                      setPage(1);
                    }}
                  >
                    {L.track(track)}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedAxis === "all" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAxis("all");
                    setPage(1);
                  }}
                >
                  {t("ds.filter.allAxes")}
                </Button>
                {AXIS_ORDER.map((axis) => (
                  <Button
                    key={axis}
                    variant={selectedAxis === axis ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAxis(axis);
                      setPage(1);
                    }}
                  >
                    {L.axis(axis)}
                  </Button>
                ))}
              </div>
            </motion.div>

            {(noVersion || (!items.isLoading && total === 0)) && (
              <motion.div variants={itemVariants}>
                <Card className="p-12 text-center max-w-2xl mx-auto space-y-3">
                  <Database className="w-10 h-10 mx-auto text-muted-foreground" />
                  <h2 className="text-2xl font-semibold">
                    {t("ds.empty.title")}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("ds.empty.body")}
                  </p>
                </Card>
              </motion.div>
            )}

            {total > 0 && (
              <>
                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {rows.map((item) => (
                    <motion.div key={item.itemId} variants={itemVariants}>
                      <Card className="p-6 h-full hover:shadow-lg transition-all flex flex-col">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.itemId}
                          </span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <Badge variant="default">
                              {L.trackShort(item.track)}
                            </Badge>
                            <Badge>{L.axis(item.axis)}</Badge>
                            <Badge variant="secondary">
                              {L.region(item.dialectRegion)}
                            </Badge>
                            <Badge variant="outline">
                              {L.format(item.questionFormat)}
                            </Badge>
                          </div>
                        </div>

                        <p dir="rtl" className="text-base mb-3 leading-relaxed">
                          {item.prompt}
                        </p>
                        {item.context && (
                          <p
                            dir="rtl"
                            className="text-sm text-muted-foreground border rounded-md p-3 mb-3 bg-slate-50 dark:bg-slate-900/40"
                          >
                            {item.context}
                          </p>
                        )}

                        {item.questionFormat === "multiple_choice" && (
                          <ul dir="rtl" className="space-y-1 text-sm">
                            {(item.payload as unknown as McPayload).choices.map(
                              (choice, idx) => (
                                <li
                                  key={idx}
                                  className={`border rounded-md px-3 py-1.5 ${
                                    idx ===
                                    (item.payload as unknown as McPayload)
                                      .correct_answer
                                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                      : ""
                                  }`}
                                >
                                  {choice}
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                        {item.questionFormat === "extraction" && (
                          <div dir="rtl" className="text-sm space-y-1">
                            {Object.entries(
                              (item.payload as unknown as ExtractionPayload)
                                .ground_truth,
                            ).map(([k, v]) => (
                              <p key={k}>
                                <span className="font-mono text-xs text-muted-foreground ml-2">
                                  {k}:
                                </span>{" "}
                                {v}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.questionFormat === "open_generation" && (
                          <p className="text-xs font-mono text-muted-foreground">
                            rubric:{" "}
                            {(item.payload as unknown as GenPayload).rubric_id}
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("ds.prev")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {t("ds.next")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("ds.showing")} {rows.length} {t("ds.of")} {total} {t("ds.items")}
                  </span>
                </motion.div>
              </>
            )}

            <motion.div
              variants={itemVariants}
              className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-6">{t("ds.stats.title")}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.data?.publicItems ?? 0}
                  </p>
                  <p className="text-muted-foreground">{t("ds.stats.public")}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2">
                    <Lock className="w-6 h-6" />
                    {stats.data?.privateItems ?? 0}
                  </p>
                  <p className="text-muted-foreground">
                    {t("ds.stats.private")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">6</p>
                  <p className="text-muted-foreground">{t("ds.stats.axes")}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

