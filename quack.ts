import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import Navbar from "@/components/Navbar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Code, Calculator, Timer, Trophy, RotateCcw,
  CheckCircle2, XCircle, Zap, ChevronRight, Star,
  Flame, Award, Target,
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  questions: Question[];
}

const categories: Category[] = [
  {
    id: "gk", name: "General Knowledge", icon: Brain, color: "from-purple-500 to-indigo-500",
    questions: [
      { question: "Which is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2, explanation: "The Pacific Ocean covers about 63 million square miles." },
      { question: "Who wrote the national anthem of India?", options: ["Bankim Chandra", "Rabindranath Tagore", "Sarojini Naidu", "Mahatma Gandhi"], correct: 1, explanation: "Jana Gana Mana was composed by Rabindranath Tagore." },
      { question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], correct: 2, explanation: "The Japanese Yen (¥) is the official currency of Japan." },
      { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1, explanation: "Mars appears red due to iron oxide on its surface." },
      { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, explanation: "Au comes from the Latin word 'Aurum'." },
      { question: "Which is the smallest continent?", options: ["Europe", "Antarctica", "Australia", "South America"], correct: 2, explanation: "Australia is the smallest continent." },
      { question: "Who invented the telephone?", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], correct: 2, explanation: "Alexander Graham Bell patented the first practical telephone in 1876." },
      { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2, explanation: "Canberra is the capital." },
      { question: "How many bones are in the adult human body?", options: ["196", "206", "216", "256"], correct: 1, explanation: "An adult human body has 206 bones." },
      { question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, explanation: "Plants absorb CO₂ during photosynthesis." },
    ],
  },
  {
    id: "programming", name: "Programming", icon: Code, color: "from-cyan-500 to-blue-500",
    questions: [
      { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0, explanation: "HTML = HyperText Markup Language." },
      { question: "Which keyword defines a function in Python?", options: ["func", "function", "def", "define"], correct: 2, explanation: "'def' is used in Python." },
      { question: "Default value of int in Java?", options: ["null", "1", "0", "undefined"], correct: 2, explanation: "Default int value is 0." },
      { question: "Single-line comment symbol in C?", options: ["#", "//", "/*", "--"], correct: 1, explanation: "// is used for single-line comments." },
      { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], correct: 1, explanation: "CSS = Cascading Style Sheets." },
      { question: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1, explanation: "Queue follows FIFO." },
      { question: "Time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2, explanation: "Binary search is O(log n)." },
      { question: "Python library for data analysis?", options: ["Django", "Flask", "Pandas", "Tkinter"], correct: 2, explanation: "Pandas is for data manipulation." },
      { question: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Integration", "Application Process Integration", "Automated Programming Interface"], correct: 0, explanation: "API = Application Programming Interface." },
      { question: "Which is NOT a JavaScript framework?", options: ["React", "Angular", "Laravel", "Vue"], correct: 2, explanation: "Laravel is a PHP framework." },
    ],
  },
  {
    id: "aptitude", name: "Aptitude", icon: Calculator, color: "from-emerald-500 to-green-500",
    questions: [
      { question: "If 5x + 3 = 28, what is x?", options: ["3", "4", "5", "6"], correct: 2, explanation: "5x = 25, x = 5." },
      { question: "A train 150m long passes a pole in 15s. Speed?", options: ["36 km/h", "10 km/h", "54 km/h", "45 km/h"], correct: 0, explanation: "10 m/s = 36 km/h." },
      { question: "What is 15% of 240?", options: ["32", "34", "36", "38"], correct: 2, explanation: "15% of 240 = 36." },
      { question: "Next: 2, 6, 12, 20, ?", options: ["28", "30", "32", "24"], correct: 1, explanation: "Diffs: 4,6,8,10. Next = 30." },
      { question: "A does work in 10 days, B in 15. Together?", options: ["5", "6", "7", "8"], correct: 1, explanation: "1/10+1/15=1/6. 6 days." },
      { question: "SI on ₹5000 at 8% for 2 years?", options: ["₹600", "₹700", "₹800", "₹900"], correct: 2, explanation: "SI = 5000×8×2/100 = ₹800." },
      { question: "Ratio of 45 min to 1 hour?", options: ["3:4", "4:3", "2:3", "3:2"], correct: 0, explanation: "45:60 = 3:4." },
      { question: "Average of first 10 natural numbers?", options: ["5", "5.5", "6", "4.5"], correct: 1, explanation: "55/10 = 5.5." },
      { question: "A:B=2:3, B:C=4:5. Find A:C", options: ["8:15", "6:15", "2:5", "4:5"], correct: 0, explanation: "A:C = 8:15." },
      { question: "Walk 1km N then 1km E. Distance from start?", options: ["1 km", "2 km", "√2 km", "1.5 km"], correct: 2, explanation: "√(1²+1²) = √2 km." },
    ],
  },
];

const TIMER_SECONDS = 15;

const MOTIVATIONAL = [
  "🔥 You're on fire! Keep the streak going!",
  "💪 Great effort! Every quiz makes you smarter!",
  "🌟 Champions are made one question at a time!",
  "🧠 Your brain is leveling up!",
  "🚀 Sky's the limit! Keep pushing!",
  "📚 Knowledge is power — and you've got plenty!",
];

const BADGES = [
  { id: "first_quiz", name: "First Steps", icon: "🎯", desc: "Complete your first quiz", check: (s: Stats) => s.totalQuizzes >= 1 },
  { id: "streak_3", name: "On Fire", icon: "🔥", desc: "3-day streak", check: (s: Stats) => s.streak >= 3 },
  { id: "streak_7", name: "Unstoppable", icon: "⚡", desc: "7-day streak", check: (s: Stats) => s.streak >= 7 },
  { id: "perfect", name: "Perfect Score", icon: "💎", desc: "Score 100% in any quiz", check: (s: Stats) => s.perfectScores >= 1 },
  { id: "quiz_10", name: "Quiz Master", icon: "🏆", desc: "Complete 10 quizzes", check: (s: Stats) => s.totalQuizzes >= 10 },
  { id: "all_cats", name: "Explorer", icon: "🌍", desc: "Play all categories", check: (s: Stats) => s.categoriesPlayed.length >= 3 },
];

interface Stats {
  totalQuizzes: number;
  streak: number;
  lastPlayedDate: string;
  perfectScores: number;
  categoriesPlayed: string[];
  bestScores: Record<string, number>;
}

const getStats = (): Stats => {
  try {
    const raw = localStorage.getItem("studyswap-quiz-stats");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalQuizzes: 0, streak: 0, lastPlayedDate: "", perfectScores: 0, categoriesPlayed: [], bestScores: {} };
};

const saveStats = (s: Stats) => localStorage.setItem("studyswap-quiz-stats", JSON.stringify(s));

const isToday = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

const Quiz = () => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [quizDone, setQuizDone] = useState(false);
  const [stats, setStats] = useState<Stats>(getStats);
  const [showBadges, setShowBadges] = useState(false);

  const questions = selectedCategory?.questions || [];
  const total = questions.length;
  const playedToday = isToday(stats.lastPlayedDate);

  useEffect(() => {
    if (!selectedCategory || quizDone || showResult) return;
    if (timeLeft <= 0) { handleNext(true); return; }
    const timer = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selectedCategory, quizDone, showResult]);

  const handleSelect = (idx: number) => { if (!showResult) setSelected(idx); };

  const handleNext = useCallback((timeout = false) => {
    const answer = timeout ? null : selected;
    const isCorrect = answer === questions[currentQ]?.correct;
    const newScore = isCorrect ? score + 1 : score;
    const newAnswers = [...answers, answer];
    setScore(newScore);
    setAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      if (currentQ + 1 >= total) {
        setQuizDone(true);
        // Update stats
        const updated = { ...stats };
        updated.totalQuizzes += 1;
        if (newScore === total) updated.perfectScores += 1;
        if (selectedCategory && !updated.categoriesPlayed.includes(selectedCategory.id)) {
          updated.categoriesPlayed = [...updated.categoriesPlayed, selectedCategory.id];
        }
        if (selectedCategory) {
          const prev = updated.bestScores[selectedCategory.id] || 0;
          if (newScore > prev) updated.bestScores[selectedCategory.id] = newScore;
        }
        // Streak
        if (isYesterday(updated.lastPlayedDate)) {
          updated.streak += 1;
        } else if (!isToday(updated.lastPlayedDate)) {
          updated.streak = 1;
        }
        updated.lastPlayedDate = new Date().toISOString();
        setStats(updated);
        saveStats(updated);
      } else {
        setCurrentQ((p) => p + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(TIMER_SECONDS);
      }
    }, 2000);
  }, [selected, currentQ, total, score, answers, questions, selectedCategory, stats]);

  const resetQuiz = () => {
    setCurrentQ(0); setSelected(null); setShowResult(false);
    setScore(0); setAnswers([]); setTimeLeft(TIMER_SECONDS); setQuizDone(false);
  };

  const goHome = () => { resetQuiz(); setSelectedCategory(null); };

  const earnedBadges = BADGES.filter((b) => b.check(stats));
  const motivationalMsg = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

  // Category selection
  if (!selectedCategory) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Quiz Arena</h1>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">Test your knowledge across multiple categories</p>
          </motion.div>

          {/* Streak & Daily Challenge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-md mx-auto mb-8">
            <Card className="border-border bg-card shadow-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground text-sm">{stats.streak} Day Streak</p>
                    <p className="text-xs text-muted-foreground">{playedToday ? "✅ Daily challenge done!" : "🎯 Play today to keep your streak!"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Trophy className="w-3 h-3" /> {stats.totalQuizzes}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => setShowBadges(!showBadges)} className="text-xs gap-1">
                    <Award className="w-3.5 h-3.5" /> {earnedBadges.length}/{BADGES.length}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges panel */}
          <AnimatePresence>
            {showBadges && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="max-w-md mx-auto mb-8 overflow-hidden">
                <div className="grid grid-cols-3 gap-2">
                  {BADGES.map((b) => {
                    const earned = b.check(stats);
                    return (
                      <div key={b.id} className={`p-3 rounded-xl border text-center transition-all ${earned ? "border-primary bg-primary/5" : "border-border bg-card opacity-50"}`}>
                        <div className="text-2xl mb-1">{b.icon}</div>
                        <p className="text-xs font-semibold text-foreground">{b.name}</p>
                        <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
                <Card
                  className="cursor-pointer group hover:-translate-y-2 transition-all duration-300 border-border bg-card shadow-card hover:shadow-card-hover overflow-hidden"
                  onClick={() => { setSelectedCategory(cat); setTimeLeft(TIMER_SECONDS); }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <cat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cat.questions.length} questions</p>
                    </div>
                    {stats.bestScores[cat.id] != null && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" /> Best: {stats.bestScores[cat.id]}/{cat.questions.length}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      Start <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Results
  if (quizDone) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚";
    const newBadges = BADGES.filter((b) => b.check(stats));
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-6">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Quiz Complete!</h2>
            <p className="text-xl text-muted-foreground">
              You scored <span className="text-primary font-bold">{score}</span> / <span className="font-bold">{total}</span> ({pct}%)
            </p>
          </motion.div>

          {/* Motivational */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-4">
            <p className="text-sm font-medium text-primary">{motivationalMsg}</p>
          </motion.div>

          {/* Streak */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center gap-3 mb-6">
            <Badge variant="secondary" className="gap-1"><Flame className="w-3 h-3" /> {stats.streak} day streak</Badge>
            <Badge variant="outline" className="gap-1"><Target className="w-3 h-3" /> {stats.totalQuizzes} quizzes</Badge>
          </motion.div>

          {/* New badges */}
          {newBadges.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center gap-2 mb-6 flex-wrap">
              {newBadges.map((b) => (
                <div key={b.id} className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-xs font-medium text-foreground flex items-center gap-1">
                  {b.icon} {b.name}
                </div>
              ))}
            </motion.div>
          )}

          <div className="flex gap-3 justify-center mb-8">
            <Button onClick={resetQuiz} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
            <Button variant="outline" onClick={goHome}>Change Category</Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correct;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                        <p className="font-medium text-foreground text-sm">{i + 1}. {q.question}</p>
                      </div>
                      <div className="ml-8 space-y-1 text-sm">
                        {userAns !== null && userAns !== q.correct && (
                          <p className="text-red-400">Your answer: {q.options[userAns]}</p>
                        )}
                        <p className="text-green-400">Correct: {q.options[q.correct]}</p>
                        <p className="text-muted-foreground text-xs mt-1">{q.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Quiz in progress
  const q = questions[currentQ];
  const progress = ((currentQ) / total) * 100;
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="gap-1">
            <selectedCategory.icon className="w-3.5 h-3.5" /> {selectedCategory.name}
          </Badge>
          <span className="text-sm text-muted-foreground font-medium">{currentQ + 1} / {total}</span>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <div className="flex items-center gap-2 mb-6">
          <Timer className={`w-4 h-4 ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timeLeft <= 5 ? "bg-destructive" : "bg-primary"}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>{timeLeft}s</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <Card className="border-border bg-card shadow-card mb-6">
              <CardContent className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground leading-relaxed">{q.question}</h3>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                let style = "border-border bg-card hover:border-primary/50";
                if (showResult) {
                  if (i === q.correct) style = "border-green-500 bg-green-500/10";
                  else if (i === selected && i !== q.correct) style = "border-red-500 bg-red-500/10";
                } else if (i === selected) {
                  style = "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]";
                }
                return (
                  <motion.button key={i} whileTap={!showResult ? { scale: 0.98 } : {}} onClick={() => handleSelect(i)} disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${style}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">{String.fromCharCode(65 + i)}</span>
                      <span className="text-foreground text-sm sm:text-base">{opt}</span>
                      {showResult && i === q.correct && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto shrink-0" />}
                      {showResult && i === selected && i !== q.correct && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Explanation:</span> {q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {!showResult && selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <Button onClick={() => handleNext(false)} className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-soft">
              {currentQ + 1 === total ? "Finish Quiz" : "Next Question"} <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Badge variant="outline" className="gap-1 text-sm"><Trophy className="w-3.5 h-3.5 text-primary" /> Score: {score}/{currentQ}</Badge>
          <Badge variant="outline" className="gap-1 text-sm"><Flame className="w-3.5 h-3.5 text-primary" /> Streak: {stats.streak}</Badge>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
