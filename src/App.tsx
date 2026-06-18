import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Check, AlertCircle, Sparkles, Send, RefreshCw, User, Phone, Play, ChevronRight, BookOpen, Layers, QrCode } from "lucide-react";

import { Step, AppConfig } from "./types";
import RunningCoachView from "./components/RunningCoachView";
import AntioxidantView from "./components/AntioxidantView";
import BiaAnalysisView from "./components/BiaAnalysisView";
import DeveloperConsole from "./components/DeveloperConsole";
import SuccessView from "./components/SuccessView";
import StationLockScreen from "./components/StationLockScreen";
import StationQRExplorer from "./components/StationQRExplorer";
import gasConfig from "../gas-config.json";

export default function App() {
  const [step, setStep] = useState<Step>(Step.INFO_FORM);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Station unlock states
  const [station1Unlocked, setStation1Unlocked] = useState(false);
  const [station2Unlocked, setStation2Unlocked] = useState(false);
  const [station3Unlocked, setStation3Unlocked] = useState(false);
  const [showQRExplorer, setShowQRExplorer] = useState(false);

  const [config, setConfig] = useState<AppConfig>({
    gasUrl: "",
    logs: []
  });

  // Load configured Apps Script details from our backend on mount
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error("Could not fetch internal config: ", e);
    }
  };

  useEffect(() => {
    fetchConfig();
    
    // Load unlock states from localStorage
    const s1 = localStorage.getItem("station_1_unlocked") === "true";
    const s2 = localStorage.getItem("station_2_unlocked") === "true";
    const s3 = localStorage.getItem("station_3_unlocked") === "true";
    setStation1Unlocked(s1);
    setStation2Unlocked(s2);
    setStation3Unlocked(s3);

    // Load cached contact info if available
    const savedName = localStorage.getItem("event_app_name");
    const savedPhone = localStorage.getItem("event_app_phone");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);

    // Detect admin / dev mode parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("dev") === "true") {
      setIsAdmin(true);
      setIsConsoleOpen(true);
    }

    // Detect QR Station scan parameter in URL
    const stationParam = params.get("station");
    if (stationParam) {
      let routeStep: Step | null = null;
      if (stationParam === "1") {
        setStation1Unlocked(true);
        localStorage.setItem("station_1_unlocked", "true");
        routeStep = Step.RUNNING_COACH;
      } else if (stationParam === "2") {
        setStation2Unlocked(true);
        localStorage.setItem("station_2_unlocked", "true");
        routeStep = Step.ANTIOXIDANT;
      } else if (stationParam === "3") {
        setStation3Unlocked(true);
        localStorage.setItem("station_3_unlocked", "true");
        routeStep = Step.BIA_ANALYSIS;
      }

      // If user scanned a QR code and they already filled in registration earlier,
      // bring them directly to that challenge! Beautiful and seamless.
      if (routeStep) {
        if (savedName && savedPhone) {
          setStep(routeStep);
        } else {
          setStep(Step.INFO_FORM);
        }
      }

      // Clean parameter from browser address bar
      const url = new URL(window.location.href);
      url.searchParams.delete("station");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const handleSaveUrl = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gasUrl: url })
      });
      if (res.ok) {
        await fetchConfig();
        return true;
      }
    } catch (e) {
      console.error("Error saving GAS URL:", e);
    }
    return false;
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/config/clear-logs", { method: "POST" });
      if (res.ok) {
        await fetchConfig();
      }
    } catch (e) {
      console.error("Error clearing logs:", e);
    }
  };

  // Step 1: Form Validation & Move to Step 2
  const handleStartExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Họ tên không được để trống!";
    }

    const phoneRegex = /^[0-9+ ]{9,13}$/;
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống!";
    } else if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (9 đến 13 chữ số)!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save transient state in localStorage
    localStorage.setItem("event_app_name", name.trim());
    localStorage.setItem("event_app_phone", phone.trim());
    setErrors({});
    setStep(Step.RUNNING_COACH);
  };

  // Final submit wrapper
  const handleSubmitExperience = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        status: "Thành công"
      };

      let modeSelected = "server";
      let response: Response | undefined;

      try {
        response = await fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Express backend submit unavailable, falling back to direct client post:", err);
      }

      // If backend is missing (e.g. 404 on Vercel), failed, or returned HTML instead of JSON, fall back to direct GAS submission
      const isHtmlResponse = response && response.headers.get("content-type")?.includes("text/html");
      const isMissingBackend = !response || response.status === 404 || isHtmlResponse;

      if (isMissingBackend) {
        const directGasUrl = ((((import.meta as any).env?.VITE_GAS_URL) || "") || gasConfig.gasUrl || "").trim();
        if (directGasUrl) {
          console.log("Direct client-side post fallback to Google Apps Script:", directGasUrl);
          await fetch(directGasUrl, {
            method: "POST",
            mode: "no-cors", // Crucial for multi-domain redirection without CORS blocks
            headers: {
              "Content-Type": "text/plain;charset=UTF-8"
            },
            body: JSON.stringify(payload)
          });
          modeSelected = "client";
        } else {
          throw new Error("Server proxy failed (or returned HTML on static platform) and no client-side direct gasUrl exists in configuration or environment");
        }
      } else if (!response.ok) {
        throw new Error("Server proxy responded with error status: " + response.status);
      }

      // If the local backend served successfully, fetch config to refresh dev logs
      if (modeSelected === "server") {
        await fetchConfig();
      }
      setStep(Step.SUCCESS_PAGE);
    } catch (error) {
      console.error("Network or integration error submitting form: ", error);
      alert("Có lỗi xảy ra khi lưu thông tin. Vui lòng kiểm tra lại URL Apps Script.");
      setStep(Step.SUCCESS_PAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAllWorkflow = () => {
    setStep(Step.INFO_FORM);
    setStation1Unlocked(false);
    setStation2Unlocked(false);
    setStation3Unlocked(false);
    localStorage.removeItem("station_1_unlocked");
    localStorage.removeItem("station_2_unlocked");
    localStorage.removeItem("station_3_unlocked");
    localStorage.removeItem("event_app_name");
    localStorage.removeItem("event_app_phone");
    setName("");
    setPhone("");
  };

  return (
    <div className="h-[100dvh] lg:h-screen w-full bg-[#0a0d16] flex flex-col lg:flex-row font-sans justify-center overflow-hidden relative">
      
      {/* 1. Main Viewport Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden h-full">
        
        {/* Universal Floating QR Code controller for operators/testers */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setShowQRExplorer(true)}
            className="bg-cyan-950/95 text-cyan-400 hover:bg-cyan-900 border border-cyan-800/60 font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] transition duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
          >
            <QrCode className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>Mã QR Trạm Đo 📌</span>
          </button>
        </div>

        {/* Clean centered mobile container */}
        <div className="relative w-full max-w-md h-full lg:h-[800px] lg:max-h-[90vh] lg:rounded-3xl lg:border lg:border-slate-800/80 bg-[#0a0d16] shadow-2xl flex flex-col overflow-hidden">
          
          {/* Core mobile screen viewport context */}
          <div className="flex-1 relative flex flex-col">
            
            {/* Render sequence screens inside browser view with smooth layout motion transitions */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* SUBMITTING OVERLAY LOADER */}
                {isSubmitting && (
                  <motion.div
                    key="submitting_loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0d16] text-[#eef2f6]"
                  >
                    <div className="flex flex-col items-center space-y-4 max-w-xs text-center px-4">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-16 h-16 bg-cyan-500/15 rounded-full animate-ping" />
                        <div className="w-12 h-12 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-b-slate-800 border-l-slate-800 animate-spin flex items-center justify-center" />
                      </div>
                      <h3 className="text-lg font-display font-medium text-white">Đang lưu thông tin...</h3>
                      <p className="text-xs text-slate-400 font-mono">Đang tiến hành đồng bộ kết quả.</p>
                    </div>
                  </motion.div>
                )}

                {/* SCREEN 1: INFORMATION SUBMISSION FORM */}
                {!isSubmitting && step === Step.INFO_FORM && (
                  <motion.div
                    key="info_form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex flex-col justify-between"
                  >
                    {/* Scrollable content body */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                      {/* Welcome Title details */}
                      <div className="space-y-1.5 text-center mt-2">
                        <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 font-semibold inline-block">
                          SỰ KIỆN WATCH8 SPORTTECH
                        </span>
                        <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                          Chuỗi Thử Thách Sức Khỏe
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed px-1">
                          Đăng ký nhanh thông tin bên dưới để trải nghiệm các tính năng sức khỏe đột phá từ Galaxy Watch8!
                        </p>
                      </div>

                      <form onSubmit={handleStartExperience} className="space-y-3.5">
                        {/* Name input */}
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400 block pl-1">
                            Họ và tên của bạn <span className="text-cyan-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                              }}
                              placeholder="Ví dụ: Nguyễn Văn A"
                              className={`w-full bg-slate-900/60 hover:bg-slate-900 border ${
                                errors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500"
                              } rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder-slate-600`}
                            />
                          </div>
                          {errors.name && (
                            <div className="flex items-center gap-1 text-rose-450 text-xs pl-1 pt-0.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Phone input */}
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400 block pl-1">
                            Số điện thoại liên hệ <span className="text-cyan-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                              }}
                              placeholder="Ví dụ: 0912345678"
                              className={`w-full bg-slate-900/60 hover:bg-slate-900 border ${
                                errors.phone ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500"
                              } rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder-slate-600`}
                            />
                          </div>
                          {errors.phone && (
                            <div className="flex items-center gap-1 text-rose-450 text-xs pl-1 pt-0.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.phone}</span>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Bottom disclaimer & CTA button Pinned */}
                    <div className="border-t border-slate-900/80 bg-[#0a0d16] px-4 pb-5 pt-3.5 space-y-2.5 shrink-0">
                      <div className="text-center text-xs text-slate-500 px-3 leading-normal">
                        Bằng việc bấm bắt đầu bạn đồng ý cho phép ứng dụng ghi nhận thông tin trải nghiệm của bạn.
                      </div>
                      <button
                        onClick={handleStartExperience}
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-display font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-cyan-950/40 transition-all duration-250 hover:shadow-cyan-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-cyan-400/20"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Bắt đầu trải nghiệm ngay</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SCREEN 2: RUNNING COACH WORKOUT */}
                {!isSubmitting && step === Step.RUNNING_COACH && (
                  <motion.div
                    key="running_coach"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="absolute inset-0"
                  >
                    {!station1Unlocked ? (
                      <StationLockScreen
                        stationId={1}
                        stationName="Trạm 1: Huấn luyện viên Chạy bộ (Running Coach)"
                        onUnlock={() => {
                          setStation1Unlocked(true);
                          localStorage.setItem("station_1_unlocked", "true");
                        }}
                      />
                    ) : (
                      <RunningCoachView onNext={() => setStep(Step.ANTIOXIDANT)} />
                    )}
                  </motion.div>
                )}

                {/* SCREEN 3: ANTIOXIDANT OPTICAL SPECTROSCOPY SCANNER */}
                {!isSubmitting && step === Step.ANTIOXIDANT && (
                  <motion.div
                    key="antioxidant"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="absolute inset-0"
                  >
                    {!station2Unlocked ? (
                      <StationLockScreen
                        stationId={2}
                        stationName="Trạm 2: Quét Quang phổ Kháng Oxy hóa"
                        onUnlock={() => {
                          setStation2Unlocked(true);
                          localStorage.setItem("station_2_unlocked", "true");
                        }}
                      />
                    ) : (
                      <AntioxidantView onNext={() => setStep(Step.BIA_ANALYSIS)} />
                    )}
                  </motion.div>
                )}

                {/* SCREEN 4: BIA ELECTRICAL COMPOSITION SENSOR METRICS */}
                {!isSubmitting && step === Step.BIA_ANALYSIS && (
                  <motion.div
                    key="bia"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="absolute inset-0"
                  >
                    {!station3Unlocked ? (
                      <StationLockScreen
                        stationId={3}
                        stationName="Trạm 3: Đo Phân Tích Thành Phần Cơ Thể BIA"
                        onUnlock={() => {
                          setStation3Unlocked(true);
                          localStorage.setItem("station_3_unlocked", "true");
                        }}
                      />
                    ) : (
                      <BiaAnalysisView onNext={handleSubmitExperience} />
                    )}
                  </motion.div>
                )}

                {/* SCREEN 6: GENERAL SUCCESS */}
                {!isSubmitting && step === Step.SUCCESS_PAGE && (
                  <motion.div
                    key="success_page"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <SuccessView
                      userName={name}
                      onRestart={resetAllWorkflow}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Small desktop toggle button for settings pane */}
        {isAdmin && (
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="lg:hidden mt-4 text-xs font-semibold px-4 py-2.5 bg-slate-900 text-slate-300 rounded-lg border border-slate-800 shadow cursor-pointer flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isConsoleOpen ? "Đóng bảng cấu hình GAS" : "Mở bảng cấu hình GAS"}</span>
          </button>
        )}
      </div>

      {/* 2. Right Section: Developer control center togglable on desktop */}
      {isAdmin && (
        <div className={`w-full lg:w-[480px] ${isConsoleOpen ? "block" : "hidden"} lg:block z-25`}>
          <DeveloperConsole
            config={config}
            onSaveUrl={handleSaveUrl}
            onClearLogs={handleClearLogs}
            onRefresh={fetchConfig}
          />
        </div>
      )}

      {/* Station QR codes Explorer drawer */}
      {showQRExplorer && (
        <StationQRExplorer
          onClose={() => setShowQRExplorer(false)}
          unlockedList={{
            s1: station1Unlocked,
            s2: station2Unlocked,
            s3: station3Unlocked
          }}
          onUnlockAll={() => {
            setStation1Unlocked(true);
            setStation2Unlocked(true);
            setStation3Unlocked(true);
            localStorage.setItem("station_1_unlocked", "true");
            localStorage.setItem("station_2_unlocked", "true");
            localStorage.setItem("station_3_unlocked", "true");
          }}
          onResetAll={() => {
            setStation1Unlocked(false);
            setStation2Unlocked(false);
            setStation3Unlocked(false);
            localStorage.removeItem("station_1_unlocked");
            localStorage.removeItem("station_2_unlocked");
            localStorage.removeItem("station_3_unlocked");
          }}
        />
      )}

    </div>
  );
}
