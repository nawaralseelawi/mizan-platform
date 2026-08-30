import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZoomIn, ZoomOut } from "lucide-react";

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

export default function Architecture() {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 20, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 20, 50));

  const DiagramViewer = ({ title }: { title: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="px-3 py-2 text-sm font-medium">{zoom}%</span>
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-8 overflow-auto h-96">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
          <svg viewBox="0 0 800 600" className="w-full h-auto">
            <defs>
              <style>{`
                .diagram-box { fill: #3b82f6; stroke: #1e40af; stroke-width: 2; }
                .diagram-text { fill: white; font-family: Arial; font-size: 14px; text-anchor: middle; }
                .diagram-line { stroke: #1e40af; stroke-width: 2; fill: none; }
              `}</style>
            </defs>

            <text x="400" y="30" className="diagram-text" fontSize="18" fontWeight="bold">
              Mizan System Architecture
            </text>

            <rect x="50" y="80" width="700" height="80" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
            <text x="400" y="70" className="diagram-text" fontSize="12" fill="#10b981">
              User Interface Layer
            </text>

            <rect x="80" y="100" width="120" height="50" className="diagram-box" rx="5" />
            <text x="140" y="130" className="diagram-text">Web Portal</text>

            <rect x="240" y="100" width="120" height="50" className="diagram-box" rx="5" />
            <text x="300" y="130" className="diagram-text">API Client</text>

            <rect x="400" y="100" width="120" height="50" className="diagram-box" rx="5" />
            <text x="460" y="130" className="diagram-text">Dashboard</text>

            <rect x="560" y="100" width="120" height="50" className="diagram-box" rx="5" />
            <text x="620" y="130" className="diagram-text">CLI Tool</text>

            <rect x="50" y="200" width="700" height="100" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
            <text x="400" y="190" className="diagram-text" fontSize="12" fill="#f59e0b">
              Application Layer
            </text>

            <rect x="80" y="220" width="140" height="60" className="diagram-box" rx="5" />
            <text x="150" y="245" className="diagram-text">Benchmark</text>
            <text x="150" y="265" className="diagram-text">Manager</text>

            <rect x="260" y="220" width="140" height="60" className="diagram-box" rx="5" />
            <text x="330" y="245" className="diagram-text">Evaluation</text>
            <text x="330" y="265" className="diagram-text">Engine</text>

            <rect x="440" y="220" width="140" height="60" className="diagram-box" rx="5" />
            <text x="510" y="245" className="diagram-text">Model</text>
            <text x="510" y="265" className="diagram-text">Registry</text>

            <rect x="620" y="220" width="80" height="60" className="diagram-box" rx="5" />
            <text x="660" y="245" className="diagram-text">Analytics</text>
            <text x="660" y="265" className="diagram-text">Engine</text>

            <rect x="50" y="340" width="700" height="100" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
            <text x="400" y="330" className="diagram-text" fontSize="12" fill="#8b5cf6">
              Data Layer
            </text>

            <rect x="80" y="360" width="140" height="60" className="diagram-box" rx="5" />
            <text x="150" y="385" className="diagram-text">Benchmark</text>
            <text x="150" y="405" className="diagram-text">Database</text>

            <rect x="260" y="360" width="140" height="60" className="diagram-box" rx="5" />
            <text x="330" y="385" className="diagram-text">Model</text>
            <text x="330" y="405" className="diagram-text">Database</text>

            <rect x="440" y="360" width="140" height="60" className="diagram-box" rx="5" />
            <text x="510" y="385" className="diagram-text">Results</text>
            <text x="510" y="405" className="diagram-text">Cache</text>

            <rect x="620" y="360" width="80" height="60" className="diagram-box" rx="5" />
            <text x="660" y="385" className="diagram-text">File</text>
            <text x="660" y="405" className="diagram-text">Storage</text>

            <rect x="50" y="480" width="700" height="80" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5,5" />
            <text x="400" y="470" className="diagram-text" fontSize="12" fill="#ec4899">
              Infrastructure Layer
            </text>

            <rect x="100" y="500" width="150" height="50" className="diagram-box" rx="5" />
            <text x="175" y="530" className="diagram-text">Kubernetes</text>

            <rect x="300" y="500" width="150" height="50" className="diagram-box" rx="5" />
            <text x="375" y="530" className="diagram-text">Monitoring</text>

            <rect x="500" y="500" width="150" height="50" className="diagram-box" rx="5" />
            <text x="575" y="530" className="diagram-text">Security</text>
          </svg>
        </div>
      </div>
    </div>
  );

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
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold">
              System Architecture
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl opacity-90 max-w-2xl mx-auto">
              Comprehensive technical architecture and infrastructure design.
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
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="microservices">Microservices</TabsTrigger>
                  <TabsTrigger value="database">Database</TabsTrigger>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card className="p-6">
                    <DiagramViewer title="System Overview" />
                  </Card>
                </TabsContent>

                <TabsContent value="microservices" className="mt-6">
                  <Card className="p-6">
                    <DiagramViewer title="Microservices Architecture" />
                  </Card>
                </TabsContent>

                <TabsContent value="database" className="mt-6">
                  <Card className="p-6">
                    <DiagramViewer title="Database Schema" />
                  </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="mt-6">
                  <Card className="p-6">
                    <DiagramViewer title="Evaluation Pipeline" />
                  </Card>
                </TabsContent>

                <TabsContent value="deployment" className="mt-6">
                  <Card className="p-6">
                    <DiagramViewer title="Deployment Architecture" />
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl font-bold">Key Components</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    name: "Benchmark Manager",
                    description: "Manages benchmark definitions, versions, and configurations",
                  },
                  {
                    name: "Evaluation Engine",
                    description: "Executes model evaluations against benchmarks",
                  },
                  {
                    name: "Model Registry",
                    description: "Stores and manages AI model metadata and versions",
                  },
                  {
                    name: "Results Cache",
                    description: "High-performance caching for evaluation results",
                  },
                ].map((component, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="font-bold mb-2">{component.name}</h3>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { category: "Backend", tech: "Node.js, Express, TypeScript" },
                  { category: "Database", tech: "MySQL, Redis" },
                  { category: "Frontend", tech: "React 19, TypeScript, Tailwind CSS" },
                  { category: "Infrastructure", tech: "Kubernetes, Docker, Cloud Run" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="font-bold text-blue-600">{item.category}</p>
                    <p className="text-muted-foreground">{item.tech}</p>
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

