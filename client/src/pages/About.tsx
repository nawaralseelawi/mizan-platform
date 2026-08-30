import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Target, Shield } from "lucide-react";

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

export default function About() {
  const { t } = useI18n();
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
              {t("about.title")}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("about.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold mb-6">Our History</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Mizan (IraqLLM-Bench) was founded in 2026 to answer a question no international benchmark can: how well do language models actually understand Arabic - and Iraq in particular? Global benchmarks measure Arabic thinly and do not see the Iraqi dialect, local knowledge, or official documents at all. Mizan builds the measurement from the ground up on two tracks - general Arabic and Iraqi Arabic - with originally authored items, expert review, and a sealed private test set.
                </p>
                <p>
                  The initiative emerged from the recognition that standardized, transparent benchmarking is essential for understanding AI capabilities, identifying limitations, and ensuring responsible development and deployment of AI systems across various domains and applications.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto">
          <motion.div
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center">
              Our Objectives
            </motion.h2>

            <motion.div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Target,
                  title: "Establish Standards",
                  description: "Create and maintain comprehensive benchmarking standards for evaluating AI systems across diverse domains and applications.",
                },
                {
                  icon: BookOpen,
                  title: "Promote Transparency",
                  description: "Ensure transparent, reproducible evaluation methodologies that enable researchers and organizations to understand AI capabilities.",
                },
                {
                  icon: Users,
                  title: "Foster Collaboration",
                  description: "Build a collaborative ecosystem where researchers, institutions, and organizations contribute to advancing AI benchmarking.",
                },
                {
                  icon: Shield,
                  title: "Ensure Responsibility",
                  description: "Promote responsible AI development by providing rigorous evaluation frameworks that identify limitations and risks.",
                },
              ].map((obj, i) => {
                const Icon = obj.icon;
                return (
                  <motion.div key={i} variants={itemVariants}>
                    <Card className="p-6 h-full">
                      <Icon className="w-10 h-10 mb-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xl font-bold mb-3">{obj.title}</h3>
                      <p className="text-muted-foreground">{obj.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Scientific Principles */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              Scientific Principles
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-6">
              {[
                {
                  title: "Rigor",
                  description: "All benchmarks are designed with scientific rigor, employing validated methodologies and peer-reviewed evaluation criteria.",
                },
                {
                  title: "Reproducibility",
                  description: "Evaluation processes are fully documented and reproducible, enabling independent verification of results.",
                },
                {
                  title: "Comprehensiveness",
                  description: "Benchmarks cover diverse domains, tasks, and metrics to provide a holistic assessment of AI capabilities.",
                },
                {
                  title: "Transparency",
                  description: "All data, methodologies, and results are publicly available, fostering trust and collaboration in the research community.",
                },
                {
                  title: "Objectivity",
                  description: "Evaluation criteria are objective and measurable, minimizing bias and ensuring fair comparison across systems.",
                },
              ].map((principle, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="border-l-4 border-blue-600 pl-6 py-2"
                >
                  <h3 className="text-xl font-bold mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Governance */}
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
              Governance Structure
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">Executive Board</h3>
                <p className="text-muted-foreground mb-4">
                  Provides strategic direction and oversight for the initiative, ensuring alignment with national AI development goals.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">Technical Committee</h3>
                <p className="text-muted-foreground mb-4">
                  Oversees the design and implementation of benchmarks, ensuring scientific rigor and technical excellence.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">Review Board</h3>
                <p className="text-muted-foreground mb-4">
                  Evaluates submissions, manages the certification process, and maintains quality standards across the platform.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">Community Contributors</h3>
                <p className="text-muted-foreground mb-4">
                  Researchers, organizations, and institutions that contribute datasets, benchmarks, and models to advance the initiative.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Iraq */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              Why Iraq?
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Iraq's strategic position in the Middle East, combined with its growing technology sector and commitment to digital transformation, makes it an ideal location for establishing a world-class AI benchmarking initiative.
              </p>

              <p>
                The initiative represents Iraq's commitment to becoming a hub for AI research and development in the region. By establishing rigorous benchmarking standards, Iraq contributes to global AI advancement while building local expertise and fostering innovation.
              </p>

              <p>
                Mizan serves as a platform for Iraqi researchers and organizations to collaborate internationally, share knowledge, and contribute to the global AI research community while addressing region-specific challenges and opportunities.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              Future Vision
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                We envision Mizan evolving into a globally recognized authority in AI benchmarking, setting standards that influence AI development practices worldwide. Our roadmap includes expanding benchmark coverage, integrating emerging AI paradigms, and strengthening international partnerships.
              </p>

              <p>
                Key initiatives for the coming years include developing domain-specific benchmarks for healthcare, finance, and education; establishing certification programs for AI systems; and creating educational resources to build AI literacy across the region.
              </p>

              <p>
                Through continuous innovation and collaboration, Mizan will contribute to ensuring that AI development is transparent, responsible, and beneficial to society while positioning Iraq as a leader in AI research and governance.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 flex gap-4">
              <Button size="lg" className="gap-2">
                Join Our Mission
              </Button>
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

