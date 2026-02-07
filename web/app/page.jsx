"use client";

import { useMemo, useState } from "react";

const defaultApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [kioskId, setKioskId] = useState("kiosk-1");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [amountPaise, setAmountPaise] = useState(200);
  const [paymentId, setPaymentId] = useState("");
  const [token, setToken] = useState(null);
  const [tokenOtp, setTokenOtp] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = useMemo(() => defaultApi, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please attach a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("kioskId", kioskId);
    formData.append("phone", phone);
    formData.append("file", file);

    const response = await fetch(`${apiUrl}/api/jobs`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Upload failed.");
      return;
    }

    setJobId(data.jobId);
    setDevOtp(data.otp || null);
    setStep(2);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError(null);

    const response = await fetch(`${apiUrl}/api/jobs/${jobId}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp })
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "OTP verification failed.");
      return;
    }

    setStep(3);
  };

  const handleCreatePayment = async () => {
    setError(null);

    const response = await fetch(`${apiUrl}/api/jobs/${jobId}/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise })
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Payment init failed.");
      return;
    }

    setPaymentId(data.orderId || data.paymentId || "demo_payment");
  };

  const handleConfirmPayment = async () => {
    setError(null);

    const response = await fetch(`${apiUrl}/api/jobs/${jobId}/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId })
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Payment confirmation failed.");
      return;
    }

    setToken(data.token);
    setTokenOtp(data.tokenOtp);
    setStep(4);
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Idealab Print</h1>
          <p className="text-slate-600">
            Upload your PDF, verify your phone, pay with UPI, and scan the token at the kiosk.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        ) : null}

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3 text-sm font-medium text-slate-600">
            <span className={step === 1 ? "text-slate-900" : ""}>1. Upload</span>
            <span>→</span>
            <span className={step === 2 ? "text-slate-900" : ""}>2. Verify</span>
            <span>→</span>
            <span className={step === 3 ? "text-slate-900" : ""}>3. Pay</span>
            <span>→</span>
            <span className={step === 4 ? "text-slate-900" : ""}>4. Print</span>
          </div>

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleUpload}>
              <div>
                <label className="block text-sm font-medium">Kiosk ID</label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={kioskId}
                  onChange={(event) => setKioskId(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mobile number</label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="10 digit number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">PDF file</label>
                <input
                  className="mt-1 block w-full text-sm"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                <p className="mt-2 text-xs text-slate-500">A4, black & white, single sided.</p>
              </div>
              <button
                className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                type="submit"
              >
                Upload &amp; Send OTP
              </button>
              {devOtp ? (
                <p className="text-xs text-amber-700">Dev OTP: {devOtp}</p>
              ) : null}
            </form>
          ) : null}

          {step === 2 ? (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium">Enter OTP</label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
                {devOtp ? (
                  <p className="text-xs text-amber-700">Dev OTP: {devOtp}</p>
                ) : null}
              </div>
              <button className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800" type="submit">
                Verify OTP
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Amount (paise)</label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  type="number"
                  value={amountPaise}
                  onChange={(event) => setAmountPaise(Number(event.target.value))}
                />
              </div>
              <button
                className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                type="button"
                onClick={handleCreatePayment}
              >
                Create Payment Order
              </button>
              {paymentId ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Payment ID / Order ID: {paymentId}</p>
                  <button
                    className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
                    type="button"
                    onClick={handleConfirmPayment}
                  >
                    Confirm Payment
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <p className="text-slate-700">Scan this token at the kiosk to start printing.</p>
              <div className="rounded border border-dashed border-slate-300 p-4 text-center">
                <p className="text-xl font-semibold">{token}</p>
                <p className="text-sm text-slate-500">Fallback OTP: {tokenOtp}</p>
              </div>
              <p className="text-xs text-slate-500">
                Keep this screen open until the print completes. You will be refunded automatically if printing fails.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
