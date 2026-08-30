import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n, type TKey } from "@/i18n";
import { Menu, X, Search, Moon, Sun, Command, Languages } from "lucide-react";
import mizanIcon from "@/assets/mizan-logo.png";
import mizanIconLight from "@/assets/mizan-logo-light.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close the "More" menu only when clicking outside it - not on hover-out,
  // so the user can move down into the menu and pick an item comfortably.
  useEffect(() => {
    if (!isMoreOpen) return;
    function onDocClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isMoreOpen]);
  const { theme, toggleTheme } = useTheme();
  const { t, toggle, lang } = useI18n();
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  const mainNavItems: { key: TKey; href: string }[] = [
    { key: "nav.home", href: "/" },
    { key: "nav.about", href: "/about" },
    { key: "nav.benchmark", href: "/benchmark" },
    { key: "nav.dataset", href: "/dataset" },
    { key: "nav.models", href: "/models" },
    { key: "nav.leaderboard", href: "/leaderboard" },
    { key: "nav.evaluation", href: "/evaluation" },
  ];

  const moreNavItems: { key: TKey; href: string }[] = [
    { key: "nav.architecture", href: "/architecture" },
    { key: "nav.metrics", href: "/metrics" },
    { key: "nav.certification", href: "/certification" },
    { key: "nav.governance", href: "/governance" },
    { key: "nav.apidocs", href: "/api-docs" },
    { key: "nav.dashboard", href: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <img
            src={theme === "dark" ? mizanIconLight : mizanIcon}
            alt="Mizan - IraqLLM-Bench"
            className="h-11 w-auto object-contain"
          />
          <span className="hidden sm:block text-[11px] font-semibold tracking-wide text-muted-foreground">
            IraqLLM-Bench
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {mainNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => (window.location.href = item.href)}
            >
              {t(item.key)}
            </Button>
          ))}

          <div className="relative" ref={moreRef}>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => setIsMoreOpen((v) => !v)}
            >
              {t("nav.more")}
            </Button>
            {isMoreOpen && (
              <div
                className={`absolute top-full mt-1 w-48 rounded-md border border-border bg-popover shadow-md p-1 z-50 ${
                  dir === "rtl" ? "start-0" : "end-0"
                }`}
              >
                {moreNavItems.map((item) => (
                  <button
                    key={item.href}
                    className="w-full text-start px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => (window.location.href = item.href)}
                  >
                    {t(item.key)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="gap-1 font-semibold"
            title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Languages className="w-4 h-4" />
            {t("lang.toggle")}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden sm:flex"
          >
            <Search className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {mainNavItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = item.href;
                }}
              >
                {t(item.key)}
              </Button>
            ))}
            <div className="border-t border-border my-2 pt-2">
              {moreNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = item.href;
                  }}
                >
                  {t(item.key)}
                </Button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {isSearchOpen && (
        <div className="border-t border-border bg-background px-4 py-3">
          <div className="container mx-auto">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="..." className="flex-1" autoFocus />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
