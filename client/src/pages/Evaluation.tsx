import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";

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

const evaluations: {
  id: number;
  model: string;
  status: string;
  progress: number;
  accuracy: number | null;
  date: string;
}[] = [];

export default function Evaluation() {
  const { t } = useI18n();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "running":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "queued":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

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
              <Upload className="w-12 h-12" />
              {t("eval.title")}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("eval.subtitle")}
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
            {/* Upload Section */}
            <motion.div variants={itemVariants}>
              <Card className="p-8 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
                <div className="text-center space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-blue-600" />
                  <div>
                    <h3 className="text-lg font-bold">Upload Your Model</h3>
                    <p className="text-muted-foreground">Drag and drop or click to select a model file</p>
                  </div>
                  <Button size="lg">Select File</Button>
                </div>
              </Card>
            </motion.div>

            {/* Pipeline Steps */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold">Evaluation Pipeline</h3>
              <div className="space-y-3">
                {[
                  { step: 1, name: "Model Upload", status: "completed" },
                  { step: 2, name: "Validation", status: "completed" },
                  { step: 3, name: "Benchmark Execution", status: "running" },
                  { step: 4, name: "Results Analysis", status: "pending" },
                  { step: 5, name: "Report Generation", status: "pending" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.status}</p>
                    </div>
                    {item.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {item.status === "running" && <Clock className="w-5 h-5 text-blue-600 animate-spin" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Evaluations */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold">Recent Evaluations</h3>
              <div className="space-y-4">
                {evaluations.length === 0 && (
                  <Card className="p-8 text-center text-muted-foreground">
                    No evaluation runs yet. Runs are executed offline in the
                    isolated harness environment and imported here for review;
                    the pilot runs will appear once the item bank is approved.
                  </Card>
                )}
                {evaluations.map((evaluation) => (
                  <Card key={evaluation.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(evaluation.status)}
                        <div>
                          <h4 className="font-bold">{evaluation.model}</h4>
                          <p className="text-sm text-muted-foreground">{evaluation.date}</p>
                        </div>
                      </div>
                      {evaluation.accuracy && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{evaluation.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      )}
                    </div>
                    <Progress value={evaluation.progress} className="mb-4" />
                    <div className="flex gap-2">
                      {evaluation.status === "completed" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Report</Button>
                          <Button size="sm" variant="outline">Download Results</Button>
                        </div>
                      )}
                      {evaluation.status === "running" && (
                        <Button size="sm" variant="outline">View Logs</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Export Formats */}
            <motion.div variants={itemVariants} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Export Results</h3>
              <p className="text-muted-foreground mb-6">Download evaluation results in your preferred format:</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">PDF Report</Button>
                <Button variant="outline">CSV Data</Button>
                <Button variant="outline">JSON Export</Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

