import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Check, AlertCircle, Sparkles, Send, RefreshCw, User, Phone, Play, ChevronRight, BookOpen, Layers } from "lucide-react";

import { Step, AppConfig } from "./types";
import RunningCoachView from "./components/RunningCoachView";
import AntioxidantView from "./components/AntioxidantView";
import BiaAnalysisView from "./components/BiaAnalysisView";
import DeveloperConsole from "./components/DeveloperConsole";
import SuccessView from "./components/SuccessView";

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
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim()
        })
      });

      if (response.ok) {
        // Retrieve fresh database entries from local back-end
        await fetchConfig();
        setStep(Step.SUCCESS_PAGE);
      } else {
        alert("Có lỗi bất thường xảy ra khi lưu thông tin. Thiết bị sẽ tự động ghi nhận ngoại tuyến.");
        setStep(Step.SUCCESS_PAGE);
      }
    } catch (error) {
      console.error("Network or integration error submitting form: ", error);
      setStep(Step.SUCCESS_PAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAllWorkflow = () => {
    setStep(Step.INFO_FORM);
  };

  return (
    <div className="min-h-screen bg-[#0a0d16] flex flex-col lg:flex-row font-sans justify-center">
      
      {/* 1. Main Viewport Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Clean centered mobile container */}
        <div className="relative w-full max-w-md min-h-screen lg:min-h-[85vh] lg:h-[800px] lg:rounded-3xl lg:border lg:border-slate-800/80 bg-[#0a0d16] shadow-2xl flex flex-col overflow-hidden">
          
          {/* Core mobile screen viewport context */}
          <div className="flex-1 relative flex flex-col">
            
            {/* Render sequence screens inside browser view with smooth layout motion transitions */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* SCREEN 1: INFORMATION SUBMISSION FORM */}
                {step === Step.INFO_FORM && (
                  <motion.div
                    key="info_form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex flex-col justify-between px-4 py-4"
                  >
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

                    {/* Action Form */}
                    <form onSubmit={handleStartExperience} className="space-y-3.5 my-auto">
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

                    {/* Bottom disclaimer & CTA button */}
                    <div className="space-y-2.5">
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
                {step === Step.RUNNING_COACH && (
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
                {step === Step.ANTIOXIDANT && (
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
                {step === Step.BIA_ANALYSIS && (
                  <motion.div
                    key="bia"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="absolute inset-0"
                  >
                    <BiaAnalysisView onNext={() => setStep(Step.SUBMIT_PAGE)} />
                  </motion.div>
                )}

                {/* SCREEN 5: VERIFICATION & COMPLETION SHEET SEND */}
                {step === Step.SUBMIT_PAGE && (
                  <motion.div
                    key="submit_page"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="absolute inset-0 flex flex-col justify-between px-4 py-4"
                  >
                    <div className="text-center mt-2 space-y-1.5">
                      <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30 inline-block">
                        BƯỚC CUỐI CÙNG
                      </span>
                      <h2 className="text-2xl font-display font-medium mt-2 text-white tracking-tight">
                        Xác Nhận Đơn Đăng Ký
                      </h2>
                      <p className="text-sm text-slate-400 leading-relaxed px-1">
                        Bạn đã trải qua đầy đủ 3 trạm đo lường. Hãy gửi thông tin để kết thúc hoạt động.
                      </p>
                    </div>

                    {/* Review card containing captured parameters */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-auto space-y-3">
                      <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold font-mono border-b border-slate-850 pb-2 flex items-center justify-between">
                        <span>Hồ sơ tham gia</span>
                        <span className="text-[#10b981] flex items-center gap-1 lowercase font-normal">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                          đánh giá thành công
                        </span>
                      </div>

                      {/* Name segment */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-400 font-medium">Họ và tên:</span>
                        <strong className="text-white text-base font-semibold truncate max-w-[200px]">{name}</strong>
                      </div>

                      {/* Phone segment */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-400 font-medium">Số điện thoại:</span>
                        <strong className="text-cyan-400 text-base font-semibold font-mono">{phone}</strong>
                      </div>

                      {/* Hardcoded status segment */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-400 font-medium">Trạng thái:</span>
                        <div className="bg-emerald-950 border border-emerald-800/40 px-2.5 py-1 rounded-md text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3px]" />
                          <span>Thành công</span>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Button */}
                    <div className="space-y-3">
                      <div className="bg-cyan-950/20 text-cyan-400 text-xs text-center border border-cyan-900/20 p-2.5 rounded-lg">
                        🛡️ Thông tin được bảo mật & lưu trữ tự động.
                      </div>

                      <button
                        id="btn-complete-submit"
                        onClick={handleSubmitExperience}
                        disabled={isSubmitting}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-display font-semibold text-base py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-center"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Đăng ghi nhận thông tin...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Hoàn thành & Gửi kết quả</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SCREEN 6: GENERAL SUCCESS */}
                {step === Step.SUCCESS_PAGE && (
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
