import React, { useState } from "react";
import { Activity, Dumbbell, Flame, Check, HelpCircle, ChevronRight } from "lucide-react";

interface BiaAnalysisViewProps {
  onNext: () => void;
}

export default function BiaAnalysisView({ onNext }: BiaAnalysisViewProps) {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);

  return (
    <div id="bia-analysis-view" className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] px-4 py-4 justify-between select-none">
      {/* Dynamic Header */}
      <div className="text-center">
        <span className="text-xs uppercase tracking-wider font-mono text-purple-400 font-semibold bg-purple-950/40 px-3 py-1 rounded-full border border-purple-800/30 inline-block mt-1">
          Trải nghiệm 03 • Phân Tích Chỉ Số Cơ Thể BIA
        </span>
        <h2 className="text-2xl font-display font-medium mt-2 text-white tracking-tight">
          Tỷ Lệ Cơ Mỡ Trực Quan
        </h2>
        <p className="text-sm text-slate-405 mt-1 px-1 leading-relaxed">
          Đo lường kháng trở dòng điện cực nhỏ để biết chỉ số mỡ và cơ bắp.
        </p>
      </div>

      {/* Styled Physical Station Checklist Guidance */}
      <div className="my-auto py-3 space-y-3">
        <div className="text-center mb-0.5">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-800/80 px-2 rounded">
            👉 THỰC HIỆN TẠI THIẾT BỊ BIA / CÂN SỨC KHỎE
          </span>
        </div>

        {/* Dynamic task list */}
        <div className="space-y-2.5">
          {/* Step 1 */}
          <div 
            onClick={() => setStep1(!step1)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step1 
                ? "bg-slate-900/80 border-purple-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
              step1 ? "bg-purple-600 border-purple-400 text-white" : "border-slate-700"
            }`}>
              {step1 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">1. Đứng hai chân trần lên điện cực</p>
              <p className="text-xs text-slate-500 mt-0.5">Tiếp xúc trực tiếp lòng bàn chân với các điểm cực kim loại</p>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => setStep2(!step2)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step2 
                ? "bg-slate-900/80 border-purple-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
              step2 ? "bg-purple-600 border-purple-400 text-white" : "border-slate-700"
            }`}>
              {step2 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">2. Giữ yên tư thế đo</p>
              <p className="text-xs text-slate-500 mt-0.5">Hai tay dang nhẹ và nắm điện cực tay (nếu có) trong 15 giây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target composition insight board */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl flex items-start gap-3 mb-3.5 backdrop-blur-sm">
        <div className="bg-purple-950 p-2 rounded-xl border border-purple-800/40 text-purple-400 mt-0.5 shrink-0">
          <Dumbbell className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white font-display">Tác dụng của đo BIA</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Giúp bạn nắm chắc tỷ lệ mỡ và cơ xương để xây dựng thói quen dinh dưỡng, tập luyện khoa học nhất.
          </p>
        </div>
      </div>

      {/* Trigger Callback */}
      <button
        id="btn-next-bia"
        onClick={onNext}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-display font-semibold text-base py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border border-purple-500/30 cursor-pointer"
      >
        <span>Tôi đã hoàn thành trạm 03</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
