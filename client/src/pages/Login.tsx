import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";

export default function Login() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
  });

  return (
    <div className="container mx-auto py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <LogIn className="w-8 h-8 mx-auto text-blue-600" />
            <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>

          {user ? (
            <div className="text-center space-y-4">
              <p className="text-sm">
                {t("login.signedInAs")}{" "}
                <span className="font-medium">{user.email}</span> ({user.role})
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/dashboard")}>
                  {t("login.openDashboard")}
                </Button>
                <Button variant="outline" onClick={() => logout()}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                login.mutate({ email, password });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? t("login.submitting") : t("login.submit")}
              </Button>
              {login.error && (
                <p className="text-sm text-red-600">{login.error.message}</p>
              )}
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

