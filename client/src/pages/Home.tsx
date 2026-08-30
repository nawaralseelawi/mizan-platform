import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Database,
  Zap,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";

// Animated counter component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function Home() {
  const { t } = useI18n();
  const stats = trpc.models.stats.useQuery();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-blue-950/20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity } as any}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity } as any}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Zap className="w-4 h-4" />
                {t("home.eyebrow")}
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            >
              {t("home.title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {t("home.subtitle")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button size="lg" className="gap-2" onClick={() => window.location.href = '/benchmark'}>
                {t("home.cta.explore")}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/leaderboard'}>
                {t("home.cta.leaderboard")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { label: t("stat.registeredModels"), value: stats.data?.models ?? 0, icon: BarChart3 },
              { label: t("stat.publicItems"), value: stats.data?.publicItems ?? 0, icon: Database },
              { label: t("stat.privateItems"), value: stats.data?.privateItems ?? 0, icon: Award },
              { label: t("stat.publishedRuns"), value: stats.data?.publishedRuns ?? 0, icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Icon className="w-8 h-8 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-4xl font-bold mb-2">
                      <AnimatedCounter end={stat.value} />
                    </div>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Mission */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">{t("home.mission.title")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("home.mission.body")}
              </p>
              <div className="flex gap-2 pt-4">
                <div className="w-1 h-12 bg-blue-600 rounded" />
                <p className="text-sm text-muted-foreground italic">
                  {t("home.mission.tagline")}
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">{t("home.vision.title")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("home.vision.body")}
              </p>
              <div className="flex gap-2 pt-4">
                <div className="w-1 h-12 bg-emerald-600 rounded" />
                <p className="text-sm text-muted-foreground italic">
                  {t("home.vision.tagline")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">{t("home.capabilities.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.capabilities.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: BarChart3,
                title: t("cap.leaderboard.title"),
                description: t("cap.leaderboard.body"),
              },
              {
                icon: Database,
                title: t("cap.dataset.title"),
                description: t("cap.dataset.body"),
              },
              {
                icon: TrendingUp,
                title: t("cap.analytics.title"),
                description: t("cap.analytics.body"),
              },
              {
                icon: Zap,
                title: t("cap.pipeline.title"),
                description: t("cap.pipeline.body"),
              },
              {
                icon: Award,
                title: t("cap.certification.title"),
                description: t("cap.certification.body"),
              },
              {
                icon: BookOpen,
                title: t("cap.docs.title"),
                description: t("cap.docs.body"),
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <Icon className="w-10 h-10 mb-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Latest Benchmark Version */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              {t("home.release.title")}
            </motion.h2>
            <motion.div variants={itemVariants} className="space-y-2">
              <p className="text-xl opacity-90">{t("home.release.version")}</p>
              <p className="text-lg opacity-80">
                {t("home.release.body")}
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="gap-2">
                {t("home.release.notes")}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2">
                {t("home.release.download")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">{t("home.news.title")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("home.news.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                date: t("news.date"),
                title: t("news.1.title"),
                excerpt: t("news.1.body"),
              },
              {
                date: t("news.date"),
                title: t("news.2.title"),
                excerpt: t("news.2.body"),
              },
              {
                date: t("news.date"),
                title: t("news.3.title"),
                excerpt: t("news.3.body"),
              },
            ].map((news, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full">
                  <p className="text-sm text-muted-foreground mb-2">{news.date}</p>
                  <h3 className="text-lg font-bold mb-3">{news.title}</h3>
                  <p className="text-muted-foreground flex-1">{news.excerpt}</p>
                  <Button variant="ghost" className="justify-start pl-0 mt-4 text-blue-600 hover:text-blue-700">
                    {t("news.readmore")}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto text-center">
          <motion.div
            className="space-y-8 max-w-2xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold">
              {t("home.cta2.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground"
            >
              {t("home.cta2.body")}
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="gap-2" onClick={() => window.location.href = '/evaluation'}>
                {t("home.cta2.start")}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/about'}>
                {t("home.cta2.learn")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

