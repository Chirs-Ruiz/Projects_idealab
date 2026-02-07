const { useEffect, useState } = React;

function App() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Ready to scan");
  const [lastJob, setLastJob] = useState(null);

  useEffect(() => {
    let buffer = "";
    let timeout;

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        if (buffer.length > 0) {
          setToken(buffer);
          buffer = "";
        }
        return;
      }

      if (event.key.length === 1) {
        buffer += event.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = "";
        }, 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScan = async () => {
    if (!token) return;
    setStatus("Verifying token...");

    const result = await window.kioskApi.scanToken(token);
    if (result.error) {
      setStatus(result.error);
      return;
    }

    setStatus("Printing...");
    setLastJob(result.jobId);
    const printResult = await window.kioskApi.printJob(result.jobId, result.pdfUrl);
    if (printResult.status === "printed") {
      setStatus("Printed successfully");
    } else {
      setStatus(`Print failed: ${printResult.error}`);
    }
    setToken("");
  };

  return (
    <div className="app">
      <header>
        <h1>Idealab Kiosk</h1>
        <p>Scan QR or enter fallback OTP.</p>
      </header>

      <div className="panel">
        <label>Token / OTP</label>
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Scan or type token"
        />
        <button onClick={handleScan}>Start Print</button>
        <p className="status">{status}</p>
        {lastJob ? <p className="small">Last job: {lastJob}</p> : null}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
