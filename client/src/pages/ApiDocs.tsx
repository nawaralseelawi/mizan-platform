import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code } from "lucide-react";

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

const endpoints = [
  {
    method: "GET",
    path: "/api/benchmarks",
    description: "List all available benchmarks",
  },
  {
    method: "GET",
    path: "/api/models",
    description: "List all registered models",
  },
  {
    method: "POST",
    path: "/api/evaluations",
    description: "Submit a new evaluation",
  },
  {
    method: "GET",
    path: "/api/leaderboard",
    description: "Get current leaderboard rankings",
  },
];

export default function ApiDocs() {
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
              <BookOpen className="w-12 h-12" />
              API Documentation
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              Complete API reference for integrating with Mizan.
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
            {/* Quick Start */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Quick Start</h2>
              <Card className="p-6">
                <p className="text-muted-foreground mb-4">Get started with the Mizan API in minutes:</p>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                  {`curl -X GET https://api.iraqllm-bench.io/v1/benchmarks \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </div>
              </Card>
            </motion.div>

            {/* Endpoints */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">API Endpoints</h2>
              <div className="space-y-3">
                {endpoints.map((endpoint, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-600 font-mono">{endpoint.method}</Badge>
                      <div className="flex-1">
                        <p className="font-mono font-semibold">{endpoint.path}</p>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Code className="w-4 h-4 mr-2" />
                        Try It
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Authentication */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Authentication</h2>
              <Card className="p-6">
                <p className="text-muted-foreground mb-4">
                  All API requests require an API key in the Authorization header:
                </p>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </Card>
            </motion.div>

            {/* SDKs */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">SDKs & Libraries</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {["Python", "JavaScript", "Go"].map((sdk) => (
                  <Card key={sdk} className="p-4 text-center">
                    <h3 className="font-bold mb-2">{sdk}</h3>
                    <Button size="sm" variant="outline" className="w-full">
                      View on GitHub
                    </Button>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Rate Limits */}
            <motion.div variants={itemVariants} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Rate Limits</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-bold">Free Tier</p>
                  <p className="text-muted-foreground">100 requests per hour</p>
                </div>
                <div>
                  <p className="font-bold">Pro Tier</p>
                  <p className="text-muted-foreground">10,000 requests per hour</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

