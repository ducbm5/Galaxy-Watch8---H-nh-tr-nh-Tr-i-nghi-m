import React from "react";
import { Award, Sparkles, RefreshCw } from "lucide-react";

interface SuccessViewProps {
  onRestart: () => void;
  userName: string;
}

export default function SuccessView({ onRestart, userName }: SuccessViewProps) {
  return (
    <div id="success-view" className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] px-4 py-4 justify-between select-none items-center text-center">
      {/* Top spacing */}
      <div />

      {/* Main Confetti / Star Medal Core layout */}
      <div className="flex flex-col items-center gap-4 py-4 max-w-xs relative">
        <div className="relative">
          {/* Animated pulsing reward decoration background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-500/80 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.25)] animate-bounce">
            <Award className="w-12 h-12 text-cyan-400" />
            <div className="absolute -top-1 -right-1 bg-purple-500 p-1.5 rounded-full text-white border border-[#0a0d16]">
              <Sparkles className="w-3 h-3 fill-white" />
            </div>
          </div>
        </div>

        {/* Essential Core Required Success Sentence */}
        <div className="space-y-3 mt-4">
          <p className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 inline-block">
            MỞ KHÓA HOÀN TẤT
          </p>
          <h2 className="text-2xl font-display font-medium text-white px-1 leading-snug">
            Chúc mừng bạn hoàn thành chuỗi thử thách nhé!
          </h2>
          {userName && (
            <p className="text-base text-cyan-300 font-medium mt-1">
              Chào {userName}, hệ thống đã ghi nhận thành công.
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-2 max-w-xs mt-2">
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
  );
}
