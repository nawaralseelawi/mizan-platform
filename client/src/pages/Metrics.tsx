import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

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

const metrics = [
  {
    name: "Accuracy",
    formula: "Correct Predictions / Total Predictions",
    description: "Percentage of correct predictions across all samples",
  },
  {
    name: "F1 Score",
    formula: "2 * (Precision * Recall) / (Precision + Recall)",
    description: "Harmonic mean of precision and recall for balanced evaluation",
  },
  {
    name: "BLEU Score",
    formula: "Cumulative n-gram precision with brevity penalty",
    description: "Bilingual Evaluation Understudy for translation quality",
  },
  {
    name: "ROUGE Score",
    formula: "Recall of n-grams between generated and reference text",
    description: "Recall-Oriented Understudy for Gisting Evaluation",
  },
];

export default function Metrics() {
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
              <BarChart3 className="w-12 h-12" />
              Evaluation Metrics
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              Comprehensive guide to metrics used in Mizan evaluations.
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
            {/* Metrics Grid */}
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {metrics.map((metric, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="p-6 h-full hover:shadow-lg transition-all">
                    <h3 className="text-lg font-bold mb-3">{metric.name}</h3>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded mb-4 font-mono text-sm">
                      {metric.formula}
                    </div>
                    <p className="text-muted-foreground">{metric.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Metric Comparison */}
            <motion.div variants={itemVariants} className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Metric Comparison Tool</h3>
              <p className="text-muted-foreground mb-6">
                Compare different metrics to understand their strengths and use cases.
              </p>
              <Button>Open Comparison Tool</Button>
            </motion.div>

            {/* Best Practices */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold">Best Practices</h3>
              <div className="space-y-3">
                {[
                  "Use multiple metrics for comprehensive evaluation",
                  "Consider domain-specific metrics for specialized tasks",
                  "Report confidence intervals with metric values",
                  "Document all metric calculation parameters",
                  "Use consistent metric definitions across benchmarks",
                ].map((practice, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {i + 1}
                    </div>
                    <p>{practice}</p>
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

