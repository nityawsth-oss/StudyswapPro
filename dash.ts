import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Search, FileText, BookOpen, HelpCircle, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: booksCount } = useQuery({
    queryKey: ["books-count"],
    queryFn: async () => {
      const { count } = await supabase.from("books").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: notesCount } = useQuery({
    queryKey: ["notes-count"],
    queryFn: async () => {
      const { count } = await supabase.from("notes").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: doubtsCount } = useQuery({
    queryKey: ["doubts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("doubts").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const cards = [
    { titleKey: "recentNotes" as const, count: notesCount ?? 0, icon: FileText, path: "/notes" },
    { titleKey: "popularBooks" as const, count: booksCount ?? 0, icon: BookOpen, path: "/books" },
    { titleKey: "activeDoubts" as const, count: doubtsCount ?? 0, icon: HelpCircle, path: "/doubts" },
    { titleKey: "quiz" as const, count: null, icon: Zap, path: "/quiz" },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 sm:mb-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              placeholder={t("search")}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground shadow-card focus:outline-none focus:border-primary input-glow transition-all duration-300 text-base sm:text-lg"
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-6 sm:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {t("welcome")} 👋
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={card.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              onClick={() => navigate(card.path)}
              className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm sm:text-base group-hover:text-glow transition-all duration-200">
                    {t(card.titleKey)}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{card.titleKey === "quiz" ? "Play Now →" : `${t("viewAll")} →`}</p>
                </div>
                {card.count !== null && <span className="text-2xl sm:text-3xl font-bold text-primary/60">{card.count}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
