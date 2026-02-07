const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

const apiUrl = process.env.API_URL || "http://localhost:4000";
const kioskId = process.env.KIOSK_ID || "kiosk-1";

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("kiosk:scan", async (event, token) => {
  const response = await fetch(`${apiUrl}/api/kiosk/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kioskId, token })
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: data.error || "Scan failed" };
  }

  return data;
});

ipcMain.handle("kiosk:print", async (event, jobId, pdfUrl) => {
  return new Promise((resolve) => {
    exec(`lp -o media=A4 -o sides=one-sided -o ColorModel=Gray -o fit-to-page ${pdfUrl}`, async (error) => {
      if (error) {
        await fetch(`${apiUrl}/api/kiosk/jobs/${jobId}/print-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "failed", reason: error.message })
        });
        resolve({ status: "failed", error: error.message });
        return;
      }

      await fetch(`${apiUrl}/api/kiosk/jobs/${jobId}/print-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "printed" })
      });
      resolve({ status: "printed" });
    });
  });
});
