import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { AXIS_ORDER, useLatestVersion } from "@/lib/benchmark";
import { useI18n, useLabels } from "@/i18n";
import { startLogin } from "@/const";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Dashboard() {
  const { t } = useI18n();
  const L = useLabels();
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const stats = trpc.models.stats.useQuery();
  const utils = trpc.useUtils();
  const runs = trpc.admin.runs.useQuery(undefined, { enabled: isAdmin });
  const refresh = () => {
    void utils.admin.runs.invalidate();
    void utils.leaderboard.invalidate();
    void utils.models.invalidate();
    void utils.certificates.invalidate();
  };
  const publish = trpc.admin.publishRun.useMutation({ onSuccess: refresh });
  const retract = trpc.admin.retractRun.useMutation({ onSuccess: refresh });
  const cleanup = trpc.admin.cleanupDuplicates.useMutation({ onSuccess: refresh });
  const { label } = useLatestVersion();
  const composition = trpc.benchmark.composition.useQuery(
    { versionLabel: label ?? "" },
    { enabled: label !== null },
  );

  const sumByAxis = (
    rows: { axis: string; n: number }[] | undefined,
  ): Map<string, number> => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(r.axis, (m.get(r.axis) ?? 0) + r.n);
    return m;
  };
  const publicByAxis = sumByAxis(composition.data?.publicByAxis);
  const privateByAxis = sumByAxis(composition.data?.privateByAxis);
  const chartData = AXIS_ORDER.map((axis) => ({
    name: L.axis(axis),
    publicItems: publicByAxis.get(axis) ?? 0,
    privateItems: privateByAxis.get(axis) ?? 0,
  }));

  if (!loading && !user) {
    return (
      <div className="container mx-auto py-24 px-4">
        <Card className="p-12 text-center max-w-md mx-auto space-y-4">
          <Lock className="w-10 h-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-semibold">{t("dash.locked.title")}</h1>
          <p className="text-muted-foreground">
            {t("dash.locked.body")}
          </p>
          <Button onClick={() => startLogin()}>{t("login.submit")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="container mx-auto space-y-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{t("dash.title")}</h1>
            <p className="text-muted-foreground">
              {t("dash.subtitle")}{label ? ` ${label}` : ""}.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: t("stat.registeredModels"), value: stats.data?.models ?? 0 },
            { label: t("ds.stats.public"), value: stats.data?.publicItems ?? 0 },
            { label: t("stat.privateItems"), value: stats.data?.privateItems ?? 0 },
            { label: t("stat.publishedRuns"), value: stats.data?.publishedRuns ?? 0 },
          ].map((s) => (
            <Card key={s.label} className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </motion.div>


        {isAdmin && (
          <motion.div initial="hidden" animate="visible" variants={itemVariants}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-1">{t("dash.runs.title")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dash.runs.desc")}
              </p>
              {(runs.data ?? []).length > 0 && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cleanup.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          t("dash.cleanup.confirm"),
                        )
                      ) {
                        cleanup.mutate();
                      }
                    }}
                  >
                    {cleanup.isPending
                      ? t("dash.cleanup.running")
                      : t("dash.cleanup.button")}
                  </Button>
                  {cleanup.data && (
                    <span className="ms-3 text-sm text-muted-foreground">
                      {t("dash.cleanup.done")
                        .replace("{kept}", String(cleanup.data.modelsKept))
                        .replace("{deleted}", String(cleanup.data.runsDeleted))}
                    </span>
                  )}
                </div>
              )}
              {(runs.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("dash.runs.empty")}
                </p>
              )}
              {(runs.data ?? []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-2 px-3 text-center">{t("dash.col.run")}</th>
                        <th className="py-2 px-3 text-start">{t("lb.col.model")}</th>
                        <th className="py-2 px-3 text-center">{t("dash.subtitle")}</th>
                        <th className="py-2 px-3 text-center">{t("dash.col.axes")}</th>
                        <th className="py-2 px-3 text-center">{t("dash.col.status")}</th>
                        <th className="py-2 px-3 text-center">{t("dash.col.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(runs.data ?? []).map((run) => (
                        <tr key={run.runId} className="border-b last:border-0">
                          <td className="py-2 px-3 text-center font-mono text-xs">
                            #{run.runId}
                          </td>
                          <td className="py-2 px-3 text-start">
                            {run.modelName}
                            <span className="block text-xs text-muted-foreground">
                              {run.developer}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">{run.versionLabel}</td>
                          <td className="py-2 px-3 text-center">{run.axes}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge
                              variant={
                                run.status === "published"
                                  ? "default"
                                  : run.status === "retracted"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {run.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {run.status !== "published" ? (
                              <Button
                                size="sm"
                                disabled={publish.isPending}
                                onClick={() =>
                                  publish.mutate({ runId: run.runId })
                                }
                              >
                                {t("dash.publish")}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={retract.isPending}
                                onClick={() =>
                                  retract.mutate({ runId: run.runId })
                                }
                              >
                                {t("dash.retract")}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(publish.error || retract.error) && (
                    <p className="text-sm text-red-600 mt-2">
                      {publish.error?.message ?? retract.error?.message}
                    </p>
                  )}
                  {publish.data && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                      {t("dash.cert")} {publish.data.verificationHash}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("dash.composition")}
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="publicItems" name="Public" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="privateItems" name="Private (manifest)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Private counts come from the hash manifest; private item content
              is never stored on this platform.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

