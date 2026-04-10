import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { UserCircle, BookOpen, FileText, HelpCircle, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) { setDisplayName(data.display_name || ""); setBio(data.bio || ""); }
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      if (!user) return { books: 0, notes: 0, doubts: 0 };
      const [b, n, d] = await Promise.all([
        supabase.from("books").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("doubts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return { books: b.count || 0, notes: n.count || 0, doubts: d.count || 0 };
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      toast.success("Profile updated!");
    },
  });

  const statCards = [
    { key: "myBooks" as const, count: stats?.books || 0, icon: BookOpen },
    { key: "myNotes" as const, count: stats?.notes || 0, icon: FileText },
    { key: "myDoubts" as const, count: stats?.doubts || 0, icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <UserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-xl sm:text-2xl font-display font-bold bg-transparent border-b-2 border-primary text-foreground focus:outline-none w-full"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground truncate">{profile?.display_name || user?.email}</h2>
              )}
              <p className="text-sm text-muted-foreground mt-1 truncate">{user?.email}</p>
              {user?.created_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("joinedOn")} {new Date(user.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { if (editing) updateProfile.mutate(); else setEditing(true); }}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                {editing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
              {editing && (
                <button onClick={() => setEditing(false)} className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("bio")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all duration-300 resize-none"
            />
          ) : (
            profile?.bio && <p className="text-muted-foreground text-sm sm:text-base">{profile.bio}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-xl border border-border p-3 sm:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">{card.count}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t(card.key)}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
