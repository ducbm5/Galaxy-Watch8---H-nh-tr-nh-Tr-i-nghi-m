import React, { useState, useEffect } from "react";
import { Server, Database, Save, Copy, Check, Trash2, HelpCircle, Code, ListFilter } from "lucide-react";
import { AppConfig, SubmissionLog } from "../types";

interface DeveloperConsoleProps {
  config: AppConfig;
  onSaveUrl: (url: string) => Promise<boolean>;
  onClearLogs: () => Promise<void>;
  onRefresh: () => void;
}

export default function DeveloperConsole({
  config,
  onSaveUrl,
  onClearLogs,
  onRefresh
}: DeveloperConsoleProps) {
  const [inputUrl, setInputUrl] = useState(config.gasUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputUrl(config.gasUrl);
  }, [config.gasUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const ok = await onSaveUrl(inputUrl.trim());
      if (ok) {
        setSaveMessage({ type: "success", text: "Lưu cấu hình GAS Web App thành công!" });
      } else {
        setSaveMessage({ type: "error", text: "Không thể lưu. Vui lòng kiểm tra lại!" });
      }
    } catch (err) {
      setSaveMessage({ type: "error", text: "Lỗi kết nối máy chủ nội bộ." });
    } finally {
      setIsSaving(false);
    }
  };

  const gasCodeTemplate = `/**
 * Google Apps Script - Cấu hình Backend nhận dữ liệu Sự Kiện
 * Hướng dẫn sử dụng:
 * 1. Mở Google Sheet của bạn.
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xoá hết mã mặc định và dán đoạn mã này vào.
 * 4. Nhấn Save (biểu tượng đĩa từ).
 * 5. Nhấn Deploy (Triển khai) -> New deployment -> Web app.
 * 6. Để Execute as: "Me" (Tôi), và Who has access: "Anyone" (Bất kỳ ai).
 * 7. Nhấn Deploy và sao chép Web App URL thu được để dán vào bảng điều khiển bên trái.
 */

function doPost(e) {
  // Cho phép CORS
  var header = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload;
    
    // Đọc payload dưới dạng JSON hoặc POST parameters thông thường
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter;
      }
    } else {
      payload = e.parameter;
    }
    
    // Gán biến
    var name = payload.name || payload.Name || "Không tên";
    var phone = payload.phone || payload.Phone || "Không có SĐT";
    var status = payload.status || payload.Status || "Thành công";
    var timestamp = new Date();
    
    // Kiểm tra và đặt header của cột nếu Sheet trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian ghi nhận", "Họ tên", "Số điện thoại", "Trạng thái"]);
    }
    
    // Lưu dòng mới
    sheet.appendRow([timestamp, name, phone, status]);
    
    // Trả về JSON phản hồi thành công kèm header CORS
    var result = {
      status: "success",
      message: "Dữ liệu được lưu trữ thành công trên Google Sheets!",
      data: { name: name, phone: phone, status: status }
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorResult = {
      status: "error",
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "success", 
    message: "Google Apps Script Web App của bạn đã hoạt động bình thường!" 
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gasCodeTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#111625] text-slate-200 border-l border-slate-800">
      {/* Title block */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-cyan-950 p-2 rounded-xl text-cyan-400 border border-cyan-800/40">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display text-white">Cấu Hình Apps Script (GAS)</h1>
            <p className="text-xs text-slate-400">Kết nối Google Sheets & Xem nhật ký thời gian thực</p>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          className="text-xs text-slate-400 hover:text-cyan-400 p-2 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 transition-all cursor-pointer"
          title="Tải lại nhật ký liên kết"
        >
          Tải lại
        </button>
      </div>

      {/* Main console content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {/* Status Indicator Bar */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/85">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2">Trạng thái liên kết</h2>
          <div className="flex items-center justify-between">
            {config.gasUrl ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-white">Đã Kết Nối Google Sheet</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-semibold text-amber-400">Simulated (Chạy thử Offline)</span>
              </div>
            )}
            <span className="text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded font-mono">
              PORT: 3000
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {config.gasUrl 
              ? "Hệ thống sẽ gửi thông tin trực tiếp tới Sheets qua API Proxy của chúng tôi. Không lỗi CORS."
              : "Vì chưa liên kết URL mới, dữ liệu khi bấm Submit ở màn hình Mobile sẽ chỉ được lưu tạm tại danh sách Logs dưới đây."}
          </p>
        </div>

        {/* Form GAS URL input */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-1.5">
              URL Triển Khai Apps Script (Web App)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder-slate-600 font-mono"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg border border-cyan-500/30 transition-all font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <span className="text-xs animate-spin font-mono">...</span> : <Save className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
              saveMessage.type === "success" 
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" 
                : "bg-rose-950/40 text-rose-450 border-rose-900/40"
            }`}>
              {saveMessage.text}
            </div>
          )}
        </form>

        {/* Copy GAS Code Box */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Code className="w-4 h-4" />
              <h3 className="text-xs font-semibold font-display text-white">Mã nguồn Google Apps Script</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 rounded px-2 py-1 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép Code</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Nhấn sao chép, dán vào phần Script của Trang tính, và tiến hành Triển khai (Deploy Web App) để sở hữu cơ sở dữ liệu Google Sheet riêng tư chính chủ!
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 max-h-40 overflow-y-auto no-scrollbar">
            <pre className="text-[9px] text-slate-500 font-mono whitespace-pre-wrap">{gasCodeTemplate}</pre>
          </div>
        </div>

        {/* Real-time Submissions Logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4" />
              <h3 className="text-xs font-semibold font-display text-white">Dữ liệu ghi nhận thực tế ({config.logs.length})</h3>
            </div>
            {config.logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/30 rounded-lg transition-all text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xoá lịch sử</span>
              </button>
            )}
          </div>

          {config.logs.length === 0 ? (
            <div className="border border-slate-800/80 border-dashed rounded-xl p-6 text-center text-xs text-slate-500">
              Chưa có dữ liệu nào được gửi. Bấm "Thành công & Nhận quà" trên điện thoại để ghi nhận dòng đầu tiên.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
              {config.logs.map((log, index) => (
                <div key={index} className="bg-slate-950 border border-slate-900 rounded-lg p-3 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-white font-display text-[13px]">{log.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      log.remoteStatus === "success" 
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/30"
                        : log.remoteStatus === "simulated"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-900/30"
                        : "bg-rose-950/80 text-rose-450 border border-rose-900/30"
                    }`}>
                      {log.remoteStatus === "success" ? "Google Sheets" : log.remoteStatus === "simulated" ? "Simulated" : "Error"}
                    </span>
                  </div>
                  <div className="flex text-[11px] text-slate-400 gap-4">
                    <span>SĐT: <strong className="font-mono text-slate-300">{log.phone}</strong></span>
                    <span>Hành động: <strong className="text-slate-300">{log.status}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900/80 pt-1.5 font-mono">
                    <span>{new Date(log.timestamp).toLocaleTimeString("vi-VN")} - {new Date(log.timestamp).toLocaleDateString("vi-VN")}</span>
                    {log.errorMessage && <span className="text-rose-400 max-w-[150px] truncate" title={log.errorMessage}>{log.errorMessage}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
