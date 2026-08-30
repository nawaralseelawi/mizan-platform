import { useI18n, type TKey } from "@/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import mizanIcon from "@/assets/mizan-icon.png";
import mizanIconLight from "@/assets/mizan-icon-light.png";

export default function Footer() {
  const { t } = useI18n();
  const { theme } = useTheme();

  const quickLinks: { key: TKey; href: string }[] = [
    { key: "nav.about", href: "/about" },
    { key: "nav.governance", href: "/governance" },
    { key: "nav.apidocs", href: "/api-docs" },
  ];
  const resourceLinks: { key: TKey; href: string }[] = [
    { key: "footer.privacy", href: "#" },
    { key: "footer.terms", href: "#" },
    { key: "footer.contact", href: "#" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img
                src={theme === "dark" ? mizanIconLight : mizanIcon}
                alt="Mizan"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold">Mizan (IraqLLM-Bench)</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.about")}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.quicklinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.key}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href + link.key}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
