import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

const Landing = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

      {/* Language selector */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>

      {/* Hero */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-6xl sm:text-7xl md:text-8xl font-bold font-display text-foreground tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-primary text-glow">{t("brand")}</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10"
        >
          <button
            onClick={() => navigate("/auth")}
            className="ripple px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-card hover:glow-strong hover:scale-105 transition-all duration-300 active:scale-95"
          >
            {t("getStarted")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
