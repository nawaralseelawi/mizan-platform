import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

export default function Models() {
  const { t } = useI18n();
  const models = trpc.models.list.useQuery();
  const rows = models.data ?? [];

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
              <Cpu className="w-12 h-12" />
              {t("models.title")}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl opacity-90 max-w-2xl mx-auto"
            >
              {t("models.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          {!models.isLoading && rows.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-12 text-center max-w-2xl mx-auto space-y-3">
                <Cpu className="w-10 h-10 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">
                  No models registered yet
                </h2>
                <p className="text-muted-foreground">
                  The registry fills automatically when the first evaluation
                  runs are imported from the offline harness. No model is
                  listed by name-dropping - registration requires a run.
                </p>
              </Card>
            </motion.div>
          )}

          {rows.length > 0 && (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {rows.map((model) => (
                <motion.div key={model.id} variants={itemVariants}>
                  <Card className="p-6 h-full hover:shadow-lg transition-all flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold">{model.name}</h3>
                      {model.parameters && <Badge>{model.parameters}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {model.developer}
                    </p>
                    <div className="mt-auto pt-3 border-t grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total runs
                        </p>
                        <p className="font-semibold">{model.totalRuns}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Published
                        </p>
                        <p className="font-semibold">{model.publishedRuns}</p>
                      </div>
                    </div>
                    {model.license && (
                      <p className="text-xs text-muted-foreground">
                        License: {model.license}
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

