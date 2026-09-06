/**
 * Footer — brand, quick links, and resources. This rewrite removes the
 * template leftovers that pointed nowhere: "Privacy" and "Terms" (no such
 * pages exist), and the LinkedIn/GitHub/Twitter social row (no public
 * accounts yet; the repository stays private until the paper is on arXiv).
 * Every remaining link opens a real page, and "Contact" is a real mailto.
 * All text flows through the central i18n dictionary using existing keys.
 */
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n, type TKey } from "@/i18n";
import { Mail } from "lucide-react";
import mizanLogo from "@/assets/mizan-logo.png";
import mizanLogoLight from "@/assets/mizan-logo-light.png";

const CONTACT_EMAIL = "mizan.iraqllm@gmail.com";

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const quickLinks: { key: TKey; href: string }[] = [
    { key: "nav.home", href: "/" },
    { key: "nav.benchmark", href: "/benchmark" },
    { key: "nav.dataset", href: "/dataset" },
    { key: "nav.leaderboard", href: "/leaderboard" },
    { key: "ev.cta.submit", href: "/submit" },
  ];

  const resources: { key: TKey; href: string }[] = [
    { key: "nav.metrics", href: "/metrics" },
    { key: "nav.architecture", href: "/architecture" },
    { key: "nav.governance", href: "/governance" },
    { key: "nav.certification", href: "/certification" },
    { key: "nav.apidocs", href: "/api-docs" },
  ];

  return (
    <footer className="border-t border-border bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={theme === "dark" ? mizanLogoLight : mizanLogo}
                alt="Mizan - IraqLLM-Bench"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                IraqLLM-Bench
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.about")}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-bold">{t("footer.quicklinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-bold">{t("footer.resources")}</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6">
          <p className="text-sm text-muted-foreground text-center">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
