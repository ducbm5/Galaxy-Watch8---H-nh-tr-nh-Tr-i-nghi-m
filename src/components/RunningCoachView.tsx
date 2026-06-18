import React, { useState } from "react";
import { Activity, Heart, Check, Compass, Info, Footprints, Flame } from "lucide-react";

interface RunningCoachViewProps {
  onNext: () => void;
}

export default function RunningCoachView({ onNext }: RunningCoachViewProps) {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);

  // All steps checked allows auto progress, or user can click skip / next anytime
  const allSubstepsChecked = step1 && step2 && step3;

  return (
    <div id="running-coach-view" className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] px-5 py-6 justify-between select-none">
      {/* Top Smartwatch Header */}
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/30">
          Trải nghiệm 01 • Running Coach
        </span>
        <h2 className="text-xl font-display font-bold mt-2.5 text-white tracking-tight">
          Chạy Bộ Địa Hình Cùng Watch8
        </h2>
        <p className="text-xs text-slate-400 mt-1 px-2 leading-relaxed">
          Thử thách đo lường thông minh nhịp độ, tư thế và vùng nhịp tim ổn định của bạn tại thảm chạy sự kiện.
        </p>
      </div>

      {/* Styled Physical Station Checklist Guidance */}
      <div className="my-auto py-4 space-y-4">
        <div className="text-center mb-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded">
            👉 THỰC HIỆN TẠI THẢM TRẠI
          </span>
        </div>

        {/* Dynamic task list */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div 
            onClick={() => setStep1(!step1)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step1 
                ? "bg-slate-900/80 border-cyan-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              step1 ? "bg-cyan-600 border-cyan-400 text-white" : "border-slate-700"
            }`}>
              {step1 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">1. Đeo đồng hồ Galaxy Watch8</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Liên hệ điều phối viên tại trạm để đeo thử đồng hồ</p>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => setStep2(!step2)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step2 
                ? "bg-slate-900/80 border-cyan-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              step2 ? "bg-cyan-600 border-cyan-400 text-white" : "border-slate-700"
            }`}>
              {step2 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">2. Thực hiện chạy tại chỗ</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bắt đầu sải chân nhịp nhàng trên thảm trong vòng 1-2 phút</p>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => setStep3(!step3)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step3 
                ? "bg-slate-900/80 border-cyan-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              step3 ? "bg-cyan-600 border-cyan-400 text-white" : "border-slate-700"
            }`}>
              {step3 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">3. Xem phân tích nhịp tim</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Kiểm tra vùng nhịp tim Zone 2 tối ưu đốt mỡ trên mặt đồng hồ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Companion Real-time Guidance Tip */}
      <div className="bg-cyan-950/30 border border-cyan-900/40 p-3.5 rounded-2xl flex items-start gap-3 mb-4">
        <div className="bg-cyan-950 p-2 rounded-xl border border-cyan-800/40 text-cyan-400 mt-0.5">
          <Footprints className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white font-display">Gợi ý từ HLV Sự kiện</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Chạy bộ với tư thế thẳng lưng, hạ bàn chân bằng nửa trước để cảm biến Watch8 đo đạc chính xác tư thế nâng sải của bạn.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        id="btn-next-running-coach"
        onClick={onNext}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-display font-semibold text-sm py-4 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-cyan-500/30 font-semibold"
      >
        <span>Tôi đã hoàn thành trạm 01</span>
        <span>→</span>
      </button>
    </div>
  );
}
