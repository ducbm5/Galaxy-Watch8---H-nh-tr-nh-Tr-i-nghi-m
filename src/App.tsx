import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Check, AlertCircle, Sparkles, Send, RefreshCw, User, Phone, Play, ChevronRight, BookOpen, Layers } from "lucide-react";

import { Step, AppConfig } from "./types";
import RunningCoachView from "./components/RunningCoachView";
import AntioxidantView from "./components/AntioxidantView";
import BiaAnalysisView from "./components/BiaAnalysisView";
import DeveloperConsole from "./components/DeveloperConsole";
import SuccessView from "./components/SuccessView";
import gasConfig from "../gas-config.json";

export default function App() {
  const [step, setStep] = useState<Step>(Step.INFO_FORM);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
    // Load cached contact info if available
    const savedName = localStorage.getItem("event_app_name");
    const savedPhone = localStorage.getItem("event_app_phone");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);

    // Detect admin URL access parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("dev") === "true") {
      setIsAdmin(true);
      setIsConsoleOpen(true);
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
  };

  return (
    <div className="h-[100dvh] lg:h-screen w-full bg-[#0a0d16] flex flex-col lg:flex-row font-sans justify-center overflow-hidden">
      
      {/* 1. Main Viewport Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden h-full">
        
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
                    <RunningCoachView onNext={() => setStep(Step.ANTIOXIDANT)} />
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
                    <AntioxidantView onNext={() => setStep(Step.BIA_ANALYSIS)} />
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
                    <BiaAnalysisView onNext={handleSubmitExperience} />
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

    </div>
  );
}
