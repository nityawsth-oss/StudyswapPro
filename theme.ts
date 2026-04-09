import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`relative flex items-center justify-center rounded-lg border border-border bg-card shadow-card hover:glow-soft transition-all duration-300 ${
        compact ? "w-8 h-8" : "w-9 h-9"
      }`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25 }}
      >
        {dark ? (
          <Moon className={`text-primary ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
        ) : (
          <Sun className={`text-primary ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
