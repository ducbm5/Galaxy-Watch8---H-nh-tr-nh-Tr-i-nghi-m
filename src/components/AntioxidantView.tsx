import React, { useState } from "react";
import { ShieldCheck, Check, Sparkles, AlertCircle, Eye } from "lucide-react";

interface AntioxidantViewProps {
  onNext: () => void;
}

export default function AntioxidantView({ onNext }: AntioxidantViewProps) {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);

  return (
    <div id="antioxidant-view" className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] px-5 py-6 justify-between select-none">
      {/* Top Banner */}
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30">
          Trải nghiệm 02 • Đo Chỉ Số Chống Oxy Hóa
        </span>
        <h2 className="text-xl font-display font-bold mt-2.5 text-white tracking-tight">
          Đo Đề Kháng Tế Bào S-3
        </h2>
        <p className="text-xs text-slate-400 mt-1 px-4 leading-relaxed">
          Ứng dụng cảm biến ánh sáng sinh học không xâm lấn đánh giá mức độ bảo vệ tế bào khỏi lão hóa cơ thế.
        </p>
      </div>

      {/* Styled Physical Station Checklist Guidance */}
      <div className="my-auto py-4 space-y-4">
        <div className="text-center mb-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded">
            👉 THỰC HIỆN TẠI THIẾT BỊ ĐO S3
          </span>
        </div>

        {/* Dynamic task list */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div 
            onClick={() => setStep1(!step1)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step1 
                ? "bg-slate-900/80 border-emerald-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              step1 ? "bg-emerald-600 border-emerald-400 text-white" : "border-slate-700"
            }`}>
              {step1 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">1. Áp nhẹ lòng bàn tay lên máy đo S3</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Giữ yên tay trong vòng 30 giây để cảm biến quét quang phổ</p>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => setStep2(!step2)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
              step2 
                ? "bg-slate-900/80 border-emerald-500/50 text-white" 
                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              step2 ? "bg-emerald-600 border-emerald-400 text-white" : "border-slate-700"
            }`}>
              {step2 && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">2. Nhận kết quả điểm chống oxy hóa</p>
              <p className="text-[10px] text-slate-405 mt-0.5">Xem chỉ số Carotenoid tích lũy trong cơ thể hiển thị trên laptop trạm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Insight */}
      <div className="bg-slate-900/60 border border-slate-800/70 p-3.5 rounded-2xl flex items-start gap-3 mb-4 backdrop-blur-sm">
        <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-800/40 text-emerald-400 mt-0.5">
          <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white font-display">Vì sao chỉ số này quan trọng?</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Điểm số chống oxy hóa càng cao chứng tỏ cơ thể bạn càng có khả năng phòng chống tốt các bệnh mãn tính và nâng cao tuổi thọ sinh học.
          </p>
        </div>
      </div>

      {/* Button to Next Screen */}
      <button
        id="btn-next-antioxidant"
        onClick={onNext}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm py-4 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/30 font-semibold"
      >
        <span>Tôi đã hoàn thành trạm 02</span>
        <span>→</span>
      </button>
    </div>
  );
}
