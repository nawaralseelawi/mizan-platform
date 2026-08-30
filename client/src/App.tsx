import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Benchmark from "./pages/Benchmark";
import Architecture from "./pages/Architecture";
import Dataset from "./pages/Dataset";
import Models from "./pages/Models";
import Leaderboard from "./pages/Leaderboard";
import Evaluation from "./pages/Evaluation";
import Metrics from "./pages/Metrics";
import Certification from "./pages/Certification";
import Governance from "./pages/Governance";
import ApiDocs from "./pages/ApiDocs";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/benchmark" component={Benchmark} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/dataset" component={Dataset} />
      <Route path="/models" component={Models} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/evaluation" component={Evaluation} />
      <Route path="/metrics" component={Metrics} />
      <Route path="/certification" component={Certification} />
      <Route path="/governance" component={Governance} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

