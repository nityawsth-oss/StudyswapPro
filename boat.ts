import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, BookOpen, HelpCircle, UserCircle, LogOut, ChevronDown, Search, ShoppingBag, Menu, X, Zap, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { key: "home" as const, icon: Home, path: "/dashboard" },
  { key: "notes" as const, icon: FileText, path: "/notes" },
  { key: "doubts" as const, icon: HelpCircle, path: "/doubts" },
  { key: "quiz" as const, icon: Zap, path: "/quiz" },
  { key: "games" as const, icon: Gamepad2, path: "/games" },
  { key: "orders" as const, icon: ShoppingBag, path: "/orders" },
  { key: "profile" as const, icon: UserCircle, path: "/profile" },
];

const Navbar = () => {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [booksOpen, setBooksOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const booksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (booksRef.current && !booksRef.current.contains(e.target as Node)) setBooksOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isBookPage = location.pathname === "/books" || location.pathname === "/sell";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-card">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
        {/* Brand */}
        <button onClick={() => navigate("/dashboard")} className="text-lg sm:text-xl font-display font-bold text-primary text-glow">
          {t("brand")}
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`nav-underline px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                location.pathname === item.path
                  ? "text-primary text-glow"
                  : "text-muted-foreground hover:text-foreground hover:text-glow"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {t(item.key)}
            </button>
          ))}

          {/* Books Dropdown */}
          <div
            ref={booksRef}
            className="relative"
            onMouseEnter={() => setBooksOpen(true)}
            onMouseLeave={() => setBooksOpen(false)}
          >
            <button
              onClick={() => setBooksOpen(!booksOpen)}
              className={`px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 rounded-lg ${
                isBookPage
                  ? "text-primary text-glow"
                  : "text-muted-foreground hover:text-foreground hover:text-glow"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {t("books")}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${booksOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {booksOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 mt-1 w-44 bg-card rounded-xl border border-border shadow-card-hover overflow-hidden z-50"
                >
                  <button
                    onClick={() => { navigate("/books"); setBooksOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted hover:glow-soft transition-all duration-200"
                  >
                    <Search className="w-4 h-4 text-primary" />
                    {t("browseBooks")}
                  </button>
                  <div className="h-px bg-border" />
                  <button
                    onClick={() => { navigate("/sell"); setBooksOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted hover:glow-soft transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    {t("sellBook")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle compact />
          <LanguageSelector compact />
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">{t("logout")}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-card border-l border-border shadow-card-hover z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                <span className="font-display font-bold text-primary text-glow">{t("brand")}</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {t(item.key)}
                  </button>
                ))}

                {/* Books section */}
                <div className="pt-2 pb-1 px-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("books")}</span>
                </div>
                <button
                  onClick={() => navigate("/books")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === "/books"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Search className="w-5 h-5" />
                  {t("browseBooks")}
                </button>
                <button
                  onClick={() => navigate("/sell")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === "/sell"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("sellBook")}
                </button>
              </div>

              {/* Mobile logout */}
              <div className="border-t border-border p-4">
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  {t("logout")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
