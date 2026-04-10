import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy, Gamepad2 } from "lucide-react";

type Cell = "X" | "O" | null;
type Mode = "pvp" | "pvc" | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const getWinner = (board: Cell[]): { winner: Cell; line: number[] | null } => {
  for (const l of WINNING_LINES) {
    const [a, b, c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: l };
    }
  }
  return { winner: null, line: null };
};

const isDraw = (board: Cell[]) => board.every((c) => c !== null);

const computerMove = (board: Cell[]): number => {
  // Try to win
  for (const l of WINNING_LINES) {
    const [a, b, c] = l;
    const cells = [board[a], board[b], board[c]];
    if (cells.filter((x) => x === "O").length === 2 && cells.includes(null)) {
      return l[cells.indexOf(null)];
    }
  }
  // Try to block
  for (const l of WINNING_LINES) {
    const [a, b, c] = l;
    const cells = [board[a], board[b], board[c]];
    if (cells.filter((x) => x === "X").length === 2 && cells.includes(null)) {
      return l[cells.indexOf(null)];
    }
  }
  // Center
  if (board[4] === null) return 4;
  // Random corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Random remaining
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
};

const playSound = (type: "move" | "win" | "draw") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.08;
    if (type === "move") {
      osc.frequency.value = 600;
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === "win") {
      osc.frequency.value = 800;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.value = 300;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {}
};

const MiniGames = () => {
  const [mode, setMode] = useState<Mode>(null);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState<{ X: number; O: number; draws: number }>(() => {
    try {
      return JSON.parse(localStorage.getItem("studyswap-ttt-scores") || '{"X":0,"O":0,"draws":0}');
    } catch {
      return { X: 0, O: 0, draws: 0 };
    }
  });

  const { winner, line } = getWinner(board);
  const draw = !winner && isDraw(board);

  useEffect(() => {
    if (winner) {
      setWinLine(line);
      setGameOver(true);
      playSound("win");
      const updated = { ...scores, [winner]: scores[winner] + 1 };
      setScores(updated);
      localStorage.setItem("studyswap-ttt-scores", JSON.stringify(updated));
    } else if (draw) {
      setGameOver(true);
      playSound("draw");
      const updated = { ...scores, draws: scores.draws + 1 };
      setScores(updated);
      localStorage.setItem("studyswap-ttt-scores", JSON.stringify(updated));
    }
  }, [board]);

  // Computer turn
  useEffect(() => {
    if (mode === "pvc" && turn === "O" && !gameOver && !winner && !draw) {
      const timer = setTimeout(() => {
        const idx = computerMove(board);
        if (idx !== undefined && idx >= 0) {
          const newBoard = [...board];
          newBoard[idx] = "O";
          setBoard(newBoard);
          setTurn("X");
          playSound("move");
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, gameOver, board]);

  const handleClick = (idx: number) => {
    if (board[idx] || gameOver) return;
    if (mode === "pvc" && turn === "O") return;
    const newBoard = [...board];
    newBoard[idx] = turn;
    setBoard(newBoard);
    setTurn(turn === "X" ? "O" : "X");
    playSound("move");
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinLine(null);
    setGameOver(false);
  };

  // Mode selection
  if (!mode) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Mini Games</h1>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">Take a break and have some fun!</p>
          </motion.div>

          <div className="max-w-md mx-auto">
            <Card className="border-border bg-card shadow-card overflow-hidden">
              <CardContent className="p-6 text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-foreground">⊞</span>
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">Tic Tac Toe</h3>
                <p className="text-sm text-muted-foreground">Classic 3×3 grid game</p>
                <div className="grid gap-3">
                  <Button onClick={() => setMode("pvp")} className="w-full glow-soft bg-primary text-primary-foreground hover:bg-primary/90">
                    👥 Player vs Player
                  </Button>
                  <Button onClick={() => setMode("pvc")} variant="outline" className="w-full">
                    🤖 Player vs Computer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Tic Tac Toe</h2>
          <Badge variant="secondary" className="text-xs">
            {mode === "pvp" ? "Player vs Player" : "Player vs Computer"}
          </Badge>
        </motion.div>

        {/* Score */}
        <div className="flex justify-center gap-4 mb-6">
          {(["X", "O"] as const).map((p) => (
            <div key={p} className={`px-4 py-2 rounded-xl border ${turn === p && !gameOver ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]" : "border-border bg-card"} transition-all duration-300`}>
              <span className="text-lg font-bold text-foreground">{p}</span>
              <span className="text-sm text-muted-foreground ml-2">{scores[p]}</span>
            </div>
          ))}
          <div className="px-4 py-2 rounded-xl border border-border bg-card">
            <span className="text-sm text-muted-foreground">Draw</span>
            <span className="text-sm text-muted-foreground ml-2">{scores.draws}</span>
          </div>
        </div>

        {/* Turn / Status */}
        <div className="text-center mb-4">
          <AnimatePresence mode="wait">
            <motion.p key={gameOver ? "over" : turn} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-medium text-muted-foreground">
              {winner ? (
                <span className="text-primary font-bold text-base">{winner} Wins! 🎉</span>
              ) : draw ? (
                <span className="text-foreground font-bold text-base">It's a Draw! 🤝</span>
              ) : (
                <>Current turn: <span className="text-primary font-bold">{turn}</span>{mode === "pvc" && turn === "O" && " (thinking...)"}</>
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[320px] mx-auto mb-6">
          {board.map((cell, i) => {
            const isWin = winLine?.includes(i);
            return (
              <motion.button
                key={i}
                whileTap={!cell && !gameOver ? { scale: 0.9 } : {}}
                onClick={() => handleClick(i)}
                className={`aspect-square rounded-xl border-2 text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all duration-200
                  ${isWin ? "border-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" : "border-border bg-card hover:border-primary/40"}
                  ${!cell && !gameOver ? "cursor-pointer active:scale-95" : "cursor-default"}
                `}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={cell === "X" ? "text-primary" : "text-accent-foreground"}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button onClick={restart} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Restart
          </Button>
          <Button onClick={() => { restart(); setMode(null); }} variant="ghost" className="gap-2">
            Change Mode
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MiniGames;
