import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

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

export default function Governance() {
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
              <Shield className="w-12 h-12" />
              Governance
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              Policies, guidelines, and governance structure for Mizan.
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
            {/* Governance Structure */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Governance Structure</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Executive Board",
                    description: "Strategic oversight and policy decisions",
                  },
                  {
                    title: "Technical Committee",
                    description: "Benchmark design and implementation",
                  },
                  {
                    title: "Review Board",
                    description: "Quality assurance and certification",
                  },
                  {
                    title: "Community Council",
                    description: "Stakeholder representation and feedback",
                  },
                ].map((item, i) => (
                  <Card key={i} className="p-6">
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Policies */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Key Policies</h2>
              <div className="space-y-3">
                {[
                  "Data Privacy and Protection",
                  "Intellectual Property Rights",
                  "Conflict of Interest",
                  "Transparency and Accountability",
                  "Research Ethics",
                  "Contributor Guidelines",
                ].map((policy, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="font-bold">{policy}</h3>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Contributing Guidelines */}
            <motion.div variants={itemVariants} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Contributing Guidelines</h3>
              <p className="text-muted-foreground mb-6">
                Learn how to contribute datasets, benchmarks, or models to Mizan.
              </p>
              <Button>View Guidelines</Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

