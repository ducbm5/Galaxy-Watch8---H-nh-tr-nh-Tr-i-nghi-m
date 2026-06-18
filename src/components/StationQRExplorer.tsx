import React, { useState } from "react";
import { X, QrCode, Clipboard, Check, ExternalLink, Play, Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";

interface StationQRExplorerProps {
  onClose: () => void;
  unlockedList: { s1: boolean; s2: boolean; s3: boolean };
  onUnlockAll: () => void;
  onResetAll: () => void;
}

export default function StationQRExplorer({
  onClose,
  unlockedList,
  onUnlockAll,
  onResetAll
}: StationQRExplorerProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getCustomUrl = (id: number) => {
    return `${window.location.origin}${window.location.pathname}?station=${id}`;
  };

  const stations = [
    {
      id: 1,
      name: "Trạm 1: Chạy Bộ thông minh (Running Coach)",
      isUnlocked: unlockedList.s1,
      bypassCode: "COACH1"
    },
    {
      id: 2,
      name: "Trạm 2: Kiểm tra Quang phổ Kháng Oxy hóa",
      isUnlocked: unlockedList.s2,
      bypassCode: "ANTIOX2"
    },
    {
      id: 3,
      name: "Trạm 3: Đo Phân Tích Cơ Thể BIA",
      isUnlocked: unlockedList.s3,
      bypassCode: "BIA99"
    }
  ];

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="qr-explorer-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1322] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-display">Bảng Quét Mã QR Kích Hoạt Trạm</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-xs text-slate-400 leading-relaxed">
            💡 <strong>Hướng dẫn vận hành:</strong> Trong sự kiện thực tế, ban tổ chức in 3 mã QR tương ứng dưới đây và dán ở 3 trạm đo. Thiết bị di động của khách hàng quét mã này sẽ tự động mở khóa chặng tiếp theo mà không làm mất thông tin đăng ký!
          </div>

          <div className="space-y-4">
            {stations.map((st) => {
              const link = getCustomUrl(st.id);
              return (
                <div key={st.id} className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                  {/* QR Image column */}
                  <div className="relative w-28 h-28 bg-slate-950 rounded-lg border border-slate-800 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=22d3ee&bgcolor=0a0f1d&data=${encodeURIComponent(link)}`}
                      alt={st.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Informative column */}
                  <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 justify-center md:justify-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block self-center md:self-start ${
                        st.isUnlocked ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-amber-950 text-amber-500 border border-amber-900/50"
                      }`}>
                        {st.isUnlocked ? "Đã mở khóa (Unlocked)" : "Đang khóa (Locked)"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">PIN: {st.bypassCode}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white font-display truncate leading-snug">{st.name}</h4>
                    
                    <p className="text-[10px] font-mono text-slate-550 truncate" title={link}>
                      {link}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start pt-1">
                      <button
                        onClick={() => handleCopy(st.id, link)}
                        className="bg-slate-950 hover:bg-slate-850 text-[11px] text-slate-300 px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedId === st.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                        <span>{copiedId === st.id ? "Đã sao chép!" : "Sao chép link"}</span>
                      </button>

                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-950 hover:bg-slate-850 text-[11px] text-cyan-400 px-2.5 py-1.5 rounded border border-slate-850 flex items-center gap-1 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Mở liên kết</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex items-center justify-between shrink-0 gap-2 flex-wrap">
          <div className="flex gap-1.5">
            <button
              onClick={onUnlockAll}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-emerald-400 px-3 py-2 rounded-lg border border-slate-800 transition cursor-pointer font-semibold"
            >
              Mở khóa nhanh tất cả
            </button>
            <button
              onClick={onResetAll}
              className="text-xs bg-slate-900 hover:bg-slate-850 text-rose-450 px-3 py-2 rounded-lg border border-slate-800 transition cursor-pointer font-semibold"
            >
              Reset tất cả
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold transition cursor-pointer active:scale-95"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
