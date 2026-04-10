import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Send, X, HelpCircle, Bot } from "lucide-react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type ChatMsg = { role: "user" | "assistant"; content: string };

const keywordResponses: Record<string, string> = {
  physics: "Physics is fascinating! For mechanics, start with Newton's laws. For optics, focus on ray diagrams. HC Verma and NCERT are great resources. Which topic do you need help with?",
  maths: "Mathematics requires practice! For calculus, understand limits first. For algebra, practice factoring. RD Sharma and NCERT are excellent. What specific topic are you stuck on?",
  mathematics: "Mathematics requires practice! For calculus, understand limits first. For algebra, practice factoring. RD Sharma and NCERT are excellent. What specific topic are you stuck on?",
  chemistry: "Chemistry has 3 branches: Physical, Organic, and Inorganic. For organic, learn named reactions. For physical, focus on formulas. NCERT is a must. Which area do you need help with?",
  books: "You can browse books on StudySwap! Go to the Books section to find affordable textbooks from fellow students. You can also sell your old books there.",
  sell: "To sell a book, click 'Sell a Book' in the navbar. Upload images, fill in the details, set a price (or list as free), and hit Publish!",
  notes: "Check out the Notes section to find study notes shared by other students. You can also upload your own notes to help the community!",
  hello: "Hello! 👋 I'm the StudySwap AI assistant. I can help you with physics, chemistry, maths, exam tips, and using the platform. What do you need help with?",
  hi: "Hi there! 👋 I'm here to help with your studies and questions about StudySwap. Ask me anything about subjects, exams, or how to use the platform!",
  help: "I can help you with: 📚 Subject doubts (Physics, Chemistry, Maths) 📝 Study tips & exam strategies 🛒 How to buy/sell books on StudySwap 📄 Finding & sharing notes. What do you need?",
  thanks: "You're welcome! 😊 Happy to help. Feel free to ask more questions anytime!",
};

function getQuickResponse(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (lower.includes(keyword)) return response;
  }
  return null;
}

const Doubts = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const { data: doubts, isLoading } = useQuery({
    queryKey: ["doubts"],
    queryFn: async () => {
      const { data } = await supabase.from("doubts").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const postDoubt = useMutation({
    mutationFn: async (q: string) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("doubts").insert({ user_id: user.id, question: q });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doubts"] });
      setQuestion("");
      toast.success("Doubt posted!");
    },
  });

  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput.trim();
    const userMsg: ChatMsg = { role: "user", content: msg };
    
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    // Try predefined response first for instant answers
    const quick = getQuickResponse(msg);
    if (quick) {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { role: "assistant", content: quick }]);
        setIsTyping(false);
      }, 400);
      return;
    }

    // Use real AI for everything else
    try {
      const allMessages = [...chatMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI service unavailable");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: currentContent } : m));
                }
                return [...prev, { role: "assistant", content: currentContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: currentContent } : m));
                }
                return [...prev, { role: "assistant", content: currentContent }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantSoFar) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "I'm here to help! Could you rephrase your question? 🤔" }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback to a helpful message
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Try asking about a specific subject like Physics, Maths, or how to use StudySwap! 📚" },
      ]);
      toast.error("AI temporarily unavailable");
    } finally {
      setIsTyping(false);
    }
  }, [chatInput, isTyping, chatMessages]);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <motion.h1
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-6 sm:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ❓ {t("doubts")}
        </motion.h1>

        {/* Ask doubt */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("typeQuestion")}
              className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all duration-300"
              onKeyDown={(e) => e.key === "Enter" && question.trim() && postDoubt.mutate(question)}
            />
            <button
              onClick={() => question.trim() && postDoubt.mutate(question)}
              disabled={!question.trim()}
              className="ripple px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:glow-soft hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
            >
              {t("askDoubt")}
            </button>
          </div>
        </motion.div>

        {/* Doubts list */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-card animate-pulse">
                  <div className="h-4 w-3/4 rounded bg-muted mb-2" />
                  <div className="h-3 w-1/3 rounded bg-muted/60" />
                </div>
              ))
            : doubts && doubts.length > 0
            ? doubts.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-foreground font-medium text-sm sm:text-base">{d.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {d.subject && <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full mr-2 text-[10px] font-medium">{d.subject}</span>}
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            : (
              <div className="text-center py-16 sm:py-20 text-muted-foreground">
                <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" />
                <p>{t("noDoubts")}</p>
              </div>
            )}
        </div>
      </main>

      {/* AI Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:scale-110 transition-all duration-300 z-50"
      >
        {chatOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* AI Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-card rounded-2xl border border-border shadow-card-hover z-50 flex flex-col overflow-hidden max-w-sm"
            style={{ height: "min(480px, 65vh)" }}
          >
            <div className="px-4 py-3 border-b border-border bg-primary/5">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <Bot className="w-5 h-5 text-primary" />
                {t("chatWithAI")}
                <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">AI Powered</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {chatMessages.length === 0 && !isTyping && (
                <div className="text-center py-8">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-primary/30" />
                  <p className="text-sm text-muted-foreground mb-3">Ask me anything about your studies!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Explain Newton's laws", "JEE tips", "How to sell books?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-muted text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-2 text-xs">Thinking...</span>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t("sendMessage")}
                className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary input-glow transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              />
              <button onClick={handleChatSend} disabled={isTyping} className="p-2 rounded-lg bg-primary text-primary-foreground hover:glow-soft transition-all disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Doubts;
