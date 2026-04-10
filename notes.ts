import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { FileText, Upload, X, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const Notes = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const uploadNote = useMutation({
    mutationFn: async () => {
      if (!user || !title.trim()) throw new Error("Title required");
      setUploading(true);
      let fileUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("book-images").upload(path, file);
        if (!uploadError) {
          const { data } = supabase.storage.from("book-images").getPublicUrl(path);
          fileUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title,
        subject: subject || null,
        content: content || null,
        file_url: fileUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle(""); setSubject(""); setContent(""); setFile(null); setShowUpload(false);
      toast.success("Note uploaded!");
    },
    onError: (err: any) => toast.error(err.message),
    onSettled: () => setUploading(false),
  });

  const formatFileSize = (url: string) => {
    // Estimate from URL - in real app would store size in DB
    return "PDF";
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            className="text-2xl sm:text-3xl font-display font-bold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            📝 {t("notes")}
          </motion.h1>
          {user && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-105 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Note
            </motion.button>
          )}
        </div>

        {/* Upload Form */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note Title *" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all" required />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all resize-none" />
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Attach PDF / File</label>
                  {file ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => setFile(null)} className="text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full h-20 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-all">
                      <Upload className="w-5 h-5" /> Choose file
                      <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                  <button onClick={() => uploadNote.mutate()} disabled={!title.trim() || uploading} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                    {uploading ? "Uploading..." : "Upload Note"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-card animate-pulse">
                <div className="h-4 w-3/4 rounded bg-muted mb-3" />
                <div className="h-3 w-full rounded bg-muted/60 mb-2" />
                <div className="h-3 w-5/6 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-foreground truncate group-hover:text-glow transition-all">{note.title}</h3>
                    {note.subject && (
                      <span className="inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-medium mt-1">{note.subject}</span>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{note.content || "No description"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                      <div className="flex gap-1.5">
                        {note.file_url && (
                          <>
                            <button
                              onClick={() => setPreviewUrl(note.file_url)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={note.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>{t("noNotes")}</p>
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPreviewUrl(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-card rounded-2xl border border-border shadow-card-hover w-full max-w-3xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium text-foreground">File Preview</span>
                  <button onClick={() => setPreviewUrl(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
                <iframe src={previewUrl} className="w-full" style={{ height: "70vh" }} title="Note preview" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Notes;
