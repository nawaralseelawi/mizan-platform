/**
 * Leaderboard - published results with per-axis tables and the sprint-item-3
 * visual-analysis package:
 *   A. Two-track gap chart (MSA vs Iraqi interval per model - Figure 1 shape)
 *   B. Iraqi track dot plot with 95% Wilson confidence intervals
 *   C. Iraqi per-axis breakdown (top 8 models)
 *   D. Saturation-break slope chart (first bank vs current bank)
 * Replaces the earlier single 0-100 bar chart in which all bars looked
 * identical. Charts render inside dir="ltr" wrappers (recharts layout math
 * assumes LTR); all labels flow through the central i18n dictionary.
 */
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trophy, ShieldCheck, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { TRACK_AXES, TRACK_ORDER, useLatestVersion } from "@/lib/benchmark";
import { useI18n, useLabels } from "@/i18n";

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

function toPct(score: number): number {
  return Math.round(score * 1000) / 10;
}

const COLOR_ARABIC = "#2563eb";
const COLOR_IRAQI = "#059669";
const COLOR_DOC = "#d97706";
const COLOR_SPAN = "#94a3b8";
const COLOR_SLOPE = "#64748b";

export default function Leaderboard() {
  const { t } = useI18n();
  const L = useLabels();
  const { label } = useLatestVersion();
  const board = trpc.leaderboard.table.useQuery(
    { versionLabel: label ?? "" },
    { enabled: label !== null },
  );

  // First (oldest) version powers the saturation-break chart.
  const versions = trpc.benchmark.versions.useQuery();
  const firstLabel = versions.data?.[0]?.label ?? null;
  const hasTwoVersions = firstLabel !== null && label !== null && firstLabel !== label;
  const firstBoard = trpc.leaderboard.table.useQuery(
    { versionLabel: firstLabel ?? "" },
    { enabled: hasTwoVersions },
  );

  const entries = board.data?.entries ?? [];

  // --- Chart A: two-track gap (interval from Iraqi to MSA score) ---
  const gapData = entries
    .filter((e) => e.arabicAverage !== null && e.iraqiAverage !== null)
    .map((e) => {
      const arabic = toPct(e.arabicAverage as number);
      const iraqi = toPct(e.iraqiAverage as number);
      return {
        name: e.model,
        arabic,
        iraqi,
        base: Math.min(arabic, iraqi),
        span: Math.abs(arabic - iraqi),
        gap: Math.round((arabic - iraqi) * 10) / 10,
      };
    })
    .sort((a, b) => b.iraqi - a.iraqi);

  // --- Chart B: Iraqi mean with pooled 95% Wilson interval ---
  const ciData = entries
    .filter(
      (e) =>
        e.iraqiAverage !== null &&
        e.iraqiAutoCiLow !== null &&
        e.iraqiAutoCiHigh !== null,
    )
    .map((e) => {
      const iraqi = toPct(e.iraqiAverage as number);
      const low = toPct(e.iraqiAutoCiLow as number);
      const high = toPct(e.iraqiAutoCiHigh as number);
      return {
        name: e.model,
        iraqi,
        errX: [
          Math.max(0, Math.round((iraqi - low) * 10) / 10),
          Math.max(0, Math.round((high - iraqi) * 10) / 10),
        ] as [number, number],
        low,
        high,
      };
    })
    .sort((a, b) => b.iraqi - a.iraqi);

  // --- Chart C: Iraqi per-axis breakdown, top 8 by Iraqi average ---
  const axisData = entries
    .filter((e) => e.iraqiAverage !== null)
    .slice()
    .sort(
      (a, b) => (b.iraqiAverage as number) - (a.iraqiAverage as number),
    )
    .slice(0, 8)
    .map((e) => {
      const byAxis = new Map(
        e.axisScores
          .filter((r) => r.track === "iraqi")
          .map((r) => [r.axis, toPct(r.score)]),
      );
      return {
        name: e.model,
        comprehension: byAxis.get("comprehension") ?? null,
        knowledge: byAxis.get("knowledge") ?? null,
        official_documents: byAxis.get("official_documents") ?? null,
      };
    });

  // --- Chart D: saturation break (first bank vs current bank) ---
  const firstEntries = firstBoard.data?.entries ?? [];
  const slopeModels = entries
    .filter(
      (e) =>
        e.macroAverage !== null &&
        firstEntries.some(
          (f) => f.model === e.model && f.macroAverage !== null,
        ),
    )
    .map((e) => e.model);
  const slopeData =
    hasTwoVersions && slopeModels.length > 1
      ? [
          Object.fromEntries([
            ["stage", firstLabel as string],
            ...slopeModels.map((m) => [
              m,
              toPct(
                firstEntries.find((f) => f.model === m)!
                  .macroAverage as number,
              ),
            ]),
          ]),
          Object.fromEntries([
            ["stage", label as string],
            ...slopeModels.map((m) => [
              m,
              toPct(
                entries.find((e) => e.model === m)!.macroAverage as number,
              ),
            ]),
          ]),
        ]
      : [];

  const chartHeight = Math.max(320, gapData.length * 34 + 60);

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
              <Trophy className="w-12 h-12" />
              {t("lb.title")}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl opacity-90 max-w-2xl mx-auto"
            >
              {t("lb.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto space-y-10">
          {entries.length === 0 && !board.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-12 text-center max-w-2xl mx-auto space-y-4">
                <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">
                  {t("lb.empty.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("lb.empty.body")}
                </p>
              </Card>
            </motion.div>
          )}

          {entries.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 overflow-x-auto">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("lb.rankings")}
                  </h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-3 px-3 text-center">{t("lb.col.rank")}</th>
                        <th className="py-3 px-3 text-start">{t("lb.col.model")}</th>
                        <th className="py-3 px-3 text-start">{t("lb.col.developer")}</th>
                        <th className="py-3 px-3 text-center">{t("lb.col.overall")}</th>
                        <th className="py-3 px-3 text-center">{t("lb.col.arabic")}</th>
                        <th className="py-3 px-3 text-center">{t("lb.col.iraqi")}</th>
                        <th className="py-3 px-3 text-center">{t("lb.col.set")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <tr
                          key={`${entry.model}-${entry.developer}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 px-3 text-center">
                            {i === 0 ? (
                              <Badge className="bg-amber-500 hover:bg-amber-500">
                                1
                              </Badge>
                            ) : (
                              i + 1
                            )}
                          </td>
                          <td className="py-3 px-3 text-start font-medium">
                            {entry.model}
                          </td>
                          <td className="py-3 px-3 text-start text-muted-foreground">
                            {entry.developer}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold">
                            {entry.macroAverage !== null
                              ? toPct(entry.macroAverage).toFixed(1)
                              : "-"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {entry.arabicAverage !== null
                              ? toPct(entry.arabicAverage).toFixed(1)
                              : "-"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {entry.iraqiAverage !== null
                              ? toPct(entry.iraqiAverage).toFixed(1)
                              : "-"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant={
                                entry.scoredTier === "private_test"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {entry.scoredTier === "private_test"
                                ? t("lb.tier.private")
                                : t("lb.tier.dev")}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {TRACK_ORDER.map((track) => (
                    <div key={track} className="mt-8">
                      <h3 className="font-semibold mb-2">
                        {track === "arabic" ? t("lb.peraxis.arabic") : t("lb.peraxis.iraqi")}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="py-2 px-3 text-start">{t("lb.col.model")}</th>
                              {TRACK_AXES[track].map((a) => (
                                <th
                                  key={a}
                                  className="py-2 px-3 text-center whitespace-nowrap"
                                >
                                  {L.axis(a)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry) => {
                              const byAxis = new Map(
                                entry.axisScores
                                  .filter((r) => r.track === track)
                                  .map((r) => [r.axis, r]),
                              );
                              return (
                                <tr
                                  key={`${track}-${entry.model}-${entry.developer}`}
                                  className="border-b last:border-0"
                                >
                                  <td className="py-2 px-3 text-start">{entry.model}</td>
                                  {TRACK_AXES[track].map((a) => {
                                    const r = byAxis.get(a);
                                    return (
                                      <td key={a} className="py-2 px-3 text-center">
                                        {r ? (
                                          <span>
                                            {toPct(r.score).toFixed(1)}
                                            {r.ciLow !== null &&
                                              r.ciHigh !== null && (
                                                <span className="block text-xs text-muted-foreground">
                                                  [{toPct(r.ciLow).toFixed(1)},{" "}
                                                  {toPct(r.ciHigh).toFixed(1)}]
                                                </span>
                                              )}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground mt-4">
                    {t("lb.note")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("lb2.note.ci")}
                  </p>
                </Card>
              </motion.div>

              {/* Visual analysis package (sprint item 3) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  {t("lb2.analysis.title")}
                </h2>

                {/* A - two-track gap */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{t("lb2.gap.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("lb2.gap.caption")}
                  </p>
                  <div dir="ltr" style={{ height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        layout="vertical"
                        data={gapData}
                        margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[50, 100]} tickCount={6} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={160}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          content={({ payload, label: lbl }) => {
                            const row = payload?.[0]?.payload;
                            if (!row) return null;
                            return (
                              <div className="rounded-md border bg-background p-2 text-xs shadow">
                                <p className="font-semibold mb-1">{lbl}</p>
                                <p style={{ color: COLOR_ARABIC }}>
                                  {t("track.arabic")}: {row.arabic.toFixed(1)}
                                </p>
                                <p style={{ color: COLOR_IRAQI }}>
                                  {t("track.iraqi")}: {row.iraqi.toFixed(1)}
                                </p>
                                <p className="text-muted-foreground">
                                  Δ {row.gap.toFixed(1)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="base" stackId="g" fill="transparent" isAnimationActive={false} />
                        <Bar
                          dataKey="span"
                          stackId="g"
                          fill={COLOR_SPAN}
                          radius={[6, 6, 6, 6]}
                          barSize={10}
                        />
                        <Scatter dataKey="iraqi" fill={COLOR_IRAQI} />
                        <Scatter dataKey="arabic" fill={COLOR_ARABIC} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* B - Iraqi track with 95% CIs */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{t("lb2.ci.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("lb2.ci.caption")}
                  </p>
                  <div dir="ltr" style={{ height: Math.max(320, ciData.length * 34 + 60) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        layout="vertical"
                        data={ciData}
                        margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[50, 100]} tickCount={6} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={160}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          content={({ payload, label: lbl }) => {
                            const row = payload?.[0]?.payload;
                            if (!row) return null;
                            return (
                              <div className="rounded-md border bg-background p-2 text-xs shadow">
                                <p className="font-semibold mb-1">{lbl}</p>
                                <p>{row.iraqi.toFixed(1)}</p>
                                <p className="text-muted-foreground">
                                  [{row.low.toFixed(1)}, {row.high.toFixed(1)}]
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Scatter dataKey="iraqi" fill={COLOR_IRAQI}>
                          <ErrorBar
                            dataKey="errX"
                            direction="x"
                            width={5}
                            strokeWidth={1.25}
                            stroke={COLOR_IRAQI}
                          />
                        </Scatter>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* C - Iraqi per-axis breakdown */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{t("lb2.axes.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("lb2.axes.caption")}
                  </p>
                  <div dir="ltr" className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={axisData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="comprehension"
                          name={L.axis("comprehension")}
                          fill={COLOR_IRAQI}
                          radius={[3, 3, 0, 0]}
                        />
                        <Bar
                          dataKey="knowledge"
                          name={L.axis("knowledge")}
                          fill={COLOR_ARABIC}
                          radius={[3, 3, 0, 0]}
                        />
                        <Bar
                          dataKey="official_documents"
                          name={L.axis("official_documents")}
                          fill={COLOR_DOC}
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* D - saturation break (only when two versions exist) */}
                {slopeData.length === 2 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-1">{t("lb2.sat.title")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("lb2.sat.caption")}
                    </p>
                    <div dir="ltr" className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={slopeData} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stage" padding={{ left: 40, right: 40 }} />
                          <YAxis domain={[60, 100]} />
                          <Tooltip
                            itemSorter={(item) => -(item.value as number)}
                            contentStyle={{ fontSize: 11 }}
                          />
                          {slopeModels.map((m) => (
                            <Line
                              key={m}
                              type="linear"
                              dataKey={m}
                              stroke={COLOR_SLOPE}
                              strokeWidth={1.5}
                              dot={{ r: 3 }}
                              isAnimationActive={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
