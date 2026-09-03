/**
 * Not Found — bilingual 404 page through the central i18n dictionary.
 */
import { Link } from "wouter";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Home, Trophy } from "lucide-react";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-xl text-center space-y-6">
        <p className="text-7xl font-bold text-blue-600" dir="ltr">
          404
        </p>
        <h1 className="text-3xl font-bold">{t("nf.title")}</h1>
        <p className="text-muted-foreground leading-relaxed">{t("nf.body")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="w-4 h-4 me-2" />
              {t("nf.home")}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/leaderboard">
              <Trophy className="w-4 h-4 me-2" />
              {t("nf.leaderboard")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
