import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const CONFIG_FILE_PATH = path.join(process.cwd(), "gas-config.json");
const LOGS_FILE_PATH = path.join(process.cwd(), "gas-submissions.json");

// Helper to read helper config
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading config:", error);
  }
  return { gasUrl: "" };
}

// Helper to write config
function writeConfig(config: { gasUrl: string }) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing config:", error);
  }
}

// Helper to read submissions log
function readSubmissions(): any[] {
  try {
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading submissions:", error);
  }
  return [];
}

// Helper to write submissions log
function logSubmission(name: string, phone: string, status: string, remoteStatus: "success" | "simulated" | "failed", errorMessage?: string) {
  try {
    const list = readSubmissions();
    const newEntry = {
      timestamp: new Date().toISOString(),
      name,
      phone,
      status,
      remoteStatus,
      errorMessage: errorMessage || null
    };
    list.unshift(newEntry); // newest first
    // Limit to 50 logs for screen safety
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(list.slice(0, 50), null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing log:", error);
  }
}

// ------------------------------------------------------------
// API Endpoints
// ------------------------------------------------------------

// 1. Get current config and logs
app.get("/api/config", (req, res) => {
  const config = readConfig();
  const logs = readSubmissions();
  res.json({
    gasUrl: config.gasUrl || "",
    logs
  });
});

// 2. Save new GAS Web App URL
app.post("/api/config", (req, res) => {
  const { gasUrl } = req.body;
  writeConfig({ gasUrl: gasUrl || "" });
  res.json({ success: true, message: "Apps Script URL updated successfully!" });
});

// 3. Delete logs
app.post("/api/config/clear-logs", (req, res) => {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, "[]", "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not clear logs" });
  }
});

// 4. Proxy submission to Google Apps Script
app.post("/api/submit", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Missing Name or Phone quantity" });
  }

  const config = readConfig();
  const gasUrl = process.env.VITE_GAS_URL || process.env.GAS_URL || config.gasUrl || "";

  const status = "Thành công";

  if (!gasUrl) {
    // If no URL configured yet, log as simulated
    logSubmission(name, phone, status, "simulated");
    return res.json({
      success: true,
      simulated: true,
      message: "Simulation successful! (No Google Apps Script URL was provided. Captured locally instead)."
    });
  }

  try {
    // Google Apps Script expects parameters. Let's send them cleanly as JSON payload.
    // To accommodate both formats in App Script, we'll send standard POST with body.
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8" // sends standard un-preflightable text to GAS
      },
      body: JSON.stringify({
        name,
        phone,
        status
      })
    });

    // Check redirection and success
    // Since App Script redirects from /exec to /u/... are normally resolved by native fetch, let's verify success
    const responseText = await response.text();
    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // Sometimes GAS returns raw text or HTML
    }

    if (response.ok || (parsed && parsed.status === "success")) {
      logSubmission(name, phone, status, "success");
      return res.json({
        success: true,
        simulated: false,
        message: "Data successfully synced with Google Sheets!"
      });
    } else {
      console.warn("GAS responded with non-ok status or cannot parse JSON:", responseText);
      logSubmission(name, phone, status, "failed", `Status: ${response.status}. Body: ${responseText.slice(0, 100)}`);
      return res.json({
        success: true,
        simulated: true,
        warning: true,
        message: "App Script responded, but there might be an issue. Data is recorded locally. Apps Script error: " + responseText.slice(0, 100)
      });
    }

  } catch (error: any) {
    console.error("GAS connection or routing error:", error);
    logSubmission(name, phone, status, "failed", error?.message || "Connection refused");
    
    // We treat connection issues gracefully by fallback logging so user journey completes
    return res.json({
      success: true,
      simulated: true,
      warning: true,
      message: `Failed to contact Google Apps Script target: (${error?.message || "Unknown Network Error"}). Submissions are saved locally in the developer logs list.`
    });
  }
});

// ------------------------------------------------------------
// Vite Asset Serving / Production Static Build Hosting
// ------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
