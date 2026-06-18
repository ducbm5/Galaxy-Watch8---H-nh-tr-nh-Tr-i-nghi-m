import React, { useState } from "react";
import { Lock, QrCode, Sparkles, RefreshCw, Smartphone, Key, Check } from "lucide-react";
import { motion } from "motion/react";

interface StationLockScreenProps {
  stationId: number;
  stationName: string;
  onUnlock: () => void;
}

export default function StationLockScreen({ stationId, stationName, onUnlock }: StationLockScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);

  // Generate URL for scanning
  const qrUrl = `${window.location.origin}${window.location.pathname}?station=${stationId}`;

  // Master bypass keys for each station
  const correctPins: Record<number, string> = {
    1: "COACH1",
    2: "ANTIOX2",
    3: "BIA99"
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setError("");
    setTimeout(() => {
      setIsScanning(false);
      onUnlock();
    }, 2000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = correctPins[stationId];
    if (pin.toUpperCase().trim() === correctPin) {
      onUnlock();
    } else {
      setError("Mã mở khóa không chính xác. Thử lại!");
      setPin("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d16] text-[#eef2f6] px-4 py-8 justify-between overflow-y-auto">
      {/* Top Header info */}
      <div className="text-center space-y-1.5 shrink-0">
        <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 inline-block animate-pulse">
          YÊU CẦU QUÉT MÃ QR
        </span>
        <h2 className="text-xl font-display font-medium mt-1 text-white">
          Khóa Kích Hoạt Trạm
        </h2>
        <p className="text-xs text-slate-400">
          Vui lòng quét QR tại bàn điều khiển của {stationName} để mở khóa nội dung.
        </p>
      </div>

      {/* Main interactive area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 bg-cyan-500/10 rounded-3xl blur-2xl animate-pulse" />
          
          <div className="relative w-48 h-48 bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center p-3 overflow-hidden shadow-2xl">
            {/* The laser scanning animation line */}
            {isScanning && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] z-10"
              />
            )}

            {/* Simulated Live QR Code image of this exact live site link */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=22d3ee&bgcolor=0f172a&data=${encodeURIComponent(qrUrl)}`}
              alt={`QR Code Trạm ${stationId}`}
              className="w-full h-full object-contain rounded-2xl opacity-90 hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Copy Link reference */}
        <div className="text-center space-y-1 w-full max-w-xs">
          <p className="text-[10px] font-mono text-slate-500 truncate" title={qrUrl}>
            Đường dẫn trạm: {qrUrl}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Mã mở nhanh của bạn ở trạm này: <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{correctPins[stationId]}</span>
          </p>
        </div>
      </div>

      {/* Bottom Option Trigger / Buttons */}
      <div className="space-y-3 shrink-0">
        {showPinInput ? (
          <form onSubmit={handlePinSubmit} className="flex gap-2">
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập mã mở khóa (vd: COACH1...)"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-center uppercase"
            />
            <button
              type="submit"
              className="bg-cyan-650 hover:bg-cyan-600 text-white font-medium px-4 py-3 rounded-xl transition duration-150 active:scale-95 text-sm"
            >
              Kích hoạt
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-display font-semibold text-xs py-3 px-3 rounded-xl transition duration-150 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang quét...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Quét mô phỏng</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPinInput(true)}
              className="bg-slate-900 hover:bg-slate-850 text-slate-350 font-display font-semibold text-xs py-3 px-3 rounded-xl border border-slate-800 transition duration-150 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Nhập Mã PIN</span>
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-rose-450 text-xs font-semibold animate-pulse">{error}</p>
        )}

        <div className="bg-slate-950/40 border border-slate-900/60 p-3 rounded-xl text-center text-[11px] text-slate-500 leading-normal flex items-center gap-2 justify-center">
          <Smartphone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span>Sử dụng thiết bị khác quét QR trên màn hình này để tự động đồng bộ mở khóa!</span>
        </div>
      </div>
    </div>
  );
}
