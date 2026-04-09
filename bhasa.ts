import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface LanguageSelectorProps {
  compact?: boolean;
}

const LanguageSelector = ({ compact = false }: LanguageSelectorProps) => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border border-border hover:glow-soft transition-all duration-300 ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
        } bg-card shadow-card`}
      >
        <Globe className={compact ? "w-3.5 h-3.5 text-primary" : "w-4 h-4 text-primary"} />
        <span className="font-medium text-foreground">{lang === "en" ? "EN" : "हि"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-32 bg-card rounded-lg shadow-card-hover border border-border overflow-hidden z-50"
        >
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                lang === l ? "bg-accent text-accent-foreground font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              {l === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
