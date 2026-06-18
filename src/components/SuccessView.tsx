import React from "react";
import { Gift, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface SuccessViewProps {
  onRestart: () => void;
  userName: string;
}

// Generate unique config options for continuous shooting confetti
const CONFETTI_PARTICLES = Array.from({ length: 32 }).map((_, i) => {
  const angle = 190 + Math.random() * 160; // Upward-oriented arc
  const radians = (angle * Math.PI) / 180;
  const distance = 90 + Math.random() * 150; // Random distance to travel
  const targetX = Math.cos(radians) * distance;
  const targetY = Math.sin(radians) * distance - 60; // Negative offset to fly high
  const size = 6 + Math.random() * 8;
  const colors = [
    "#22d3ee", // Cyan
    "#ec4899", // Pink/Magenta
    "#eab308", // Golden Yellow
    "#a855f7", // Purple
    "#10b981", // Emerald
    "#f97316"  // Deep Orange
  ];
  return {
    id: i,
    x: targetX,
    y: targetY,
    color: colors[i % colors.length],
    size,
    delay: Math.random() * 0.6,
    duration: 1.6 + Math.random() * 1.4,
    rotation: 180 + Math.random() * 540,
    shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "diamond" : "strip"
  };
});

export default function SuccessView({ onRestart, userName }: SuccessViewProps) {
  return (
    <div id="success-view" className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] select-none">
      {/* Scrollable central content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center text-center space-y-6">
        
        <div className="flex flex-col items-center gap-4 max-w-xs relative w-full">
          
          {/* Main Confetti / Gift-Box Arena */}
          <div className="relative w-full h-44 flex items-center justify-center overflow-visible">
            
            {/* Colorful soft back-glow glow rings */}
            <div className="absolute w-44 h-44 bg-gradient-to-tr from-cyan-500/15 via-pink-500/15 to-purple-500/15 rounded-full blur-2xl opacity-50 animate-pulse" />
            
            {/* Festive shooting confetti fragments */}
            {CONFETTI_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 15, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.2, 1, 0.7, 0],
                  opacity: [1, 1, 0.9, 0.4, 0],
                  rotate: p.rotation
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  repeatDelay: 0.5 + Math.random() * 1.5,
                  delay: p.delay,
                  ease: "easeOut"
                }}
                className="absolute origin-center shrink-0 pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.shape === "circle" ? "50%" : undefined,
                  transform: p.shape === "diamond" ? "rotate(45deg)" : undefined,
                  clipPath: p.shape === "strip" ? "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" : undefined
                }}
              />
            ))}

            {/* Sparkles continuously rising */}
            {[1, 2, 3, 4].map((s) => (
              <motion.div
                key={s}
                initial={{ y: 20, opacity: 0, scale: 0 }}
                animate={{
                  y: -50 - Math.random() * 40,
                  x: (s % 2 === 0 ? 1 : -1) * (15 + Math.random() * 25),
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  repeat: Infinity,
                  delay: s * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute text-yellow-300 pointer-events-none z-10"
              >
                <Sparkles className="w-4 h-4 fill-amber-300" />
              </motion.div>
            ))}

            {/* Premium center Gift Box button container */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0],
                scale: [1, 1.03, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10 w-24 h-24 rounded-full bg-slate-900 border-2 border-emerald-500/80 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.3)]"
            >
              <Gift className="w-12 h-12 text-[#10b981]" />
              
              {/* Top-right mini-sparkle accent badge */}
              <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-full text-white border border-[#0a0d16]">
                <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
              </div>
            </motion.div>
          </div>

          {/* Clean titles with targeted text deletion */}
          <div className="space-y-3 mt-2 w-full">
            <p className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 inline-block">
              MỞ KHÓA HOÀN TẤT
            </p>
            <h2 className="text-2xl font-display font-medium text-white px-1 leading-snug">
              Chúc mừng bạn hoàn thành chuỗi thử thách nhé!
            </h2>
            {userName && (
              <p className="text-lg font-display font-semibold text-cyan-300 mt-2">
                Chào {userName}!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons Pinned to Bottom */}
      <div className="border-t border-slate-900/80 bg-[#0a0d16] px-4 pb-5 pt-3.5 shrink-0 flex justify-center">
        <div className="w-full max-w-xs">
          <button
            id="btn-restart-challenge"
            onClick={onRestart}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 font-display font-semibold text-base py-3.5 px-4 rounded-xl shadow border border-slate-800 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Thực hiện lại trải nghiệm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
