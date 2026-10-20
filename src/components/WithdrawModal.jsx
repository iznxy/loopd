import React, { useState } from "react";
import { X, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { base44 } from "@/api/base44Client";

const METHODS = [
  { id: "paypal", label: "PayPal", icon: "💙", placeholder: "your@paypal.email" },
  { id: "bank", label: "Bank Transfer", icon: "🏦", placeholder: "IBAN or Account Number" },
  { id: "cashapp", label: "Cash App", icon: "💸", placeholder: "$cashtag" },
  { id: "revolut", label: "Revolut", icon: "🔵", placeholder: "@revolut_tag or phone" },
];

export default function WithdrawModal({ balance, onClose, onSuccess }) {
  const { accentColor } = useTheme();
  const [step, setStep] = useState(1); // 1=amount, 2=method+details, 3=confirm, 4=done
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minWithdraw = 10;
  const parsedAmount = parseFloat(amount) || 0;
  const canProceedStep2 = method && details.trim().length > 3;

  async function submitWithdrawal() {
    setLoading(true);
    setError("");
    // Record the withdrawal request as a Tip with negative amount (withdrawal)
    // In a real app this would call a payment API; here we log it and notify admin
    await base44.entities.Notification.create({
      user_id: "admin",
      type: "tip",
      text: `Withdrawal request: $${parsedAmount.toFixed(2)} via ${method} to ${details}`,
    }).catch(() => {});
    await new Promise(r => setTimeout(r, 1200)); // simulate processing
    setLoading(false);
    setStep(4);
    onSuccess?.(parsedAmount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl pb-8 animate-slide-up max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <DollarSign size={16} style={{ color: accentColor }} />
            {step < 4 ? `Withdraw Earnings — Step ${step}/3` : "Request Submitted"}
          </div>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4">

          {/* Step 1 — Amount */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl p-3 border border-amber-500/40 bg-amber-500/10 text-xs leading-relaxed text-amber-500">
                Withdrawals are disabled. Tips are unverified in-app records, not confirmed payments,
                so no payout can be issued.
              </div>
              <div className="bg-muted rounded-2xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Unverified tip records</div>
                <div className="text-3xl font-bold text-foreground">${balance.toFixed(2)}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                  Amount to Withdraw (min ${minWithdraw})
                </label>
                <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-4 py-3">
                  <span className="text-lg font-bold text-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={minWithdraw}
                    max={balance}
                    className="flex-1 bg-transparent text-xl font-bold text-foreground outline-none"
                  />
                </div>
                {parsedAmount > 0 && parsedAmount < minWithdraw && (
                  <p className="text-xs text-red-500 mt-1.5">Minimum withdrawal is ${minWithdraw}</p>
                )}
                {parsedAmount > balance && (
                  <p className="text-xs text-red-500 mt-1.5">Exceeds your available balance</p>
                )}
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2">
                {[10, 25, 50].filter(a => a <= balance).map(a => (
                  <button key={a}
                    onClick={() => setAmount(String(a))}
                    className="flex-1 py-2 rounded-xl border text-sm font-bold transition-all"
                    style={{
                      borderColor: amount === String(a) ? accentColor : "var(--border)",
                      color: amount === String(a) ? accentColor : "var(--foreground)",
                      background: amount === String(a) ? accentColor + "15" : "var(--card)",
                    }}
                  >
                    ${a}
                  </button>
                ))}
                <button
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="flex-1 py-2 rounded-xl border text-sm font-bold transition-all"
                  style={{
                    borderColor: amount === balance.toFixed(2) ? accentColor : "var(--border)",
                    color: amount === balance.toFixed(2) ? accentColor : "var(--foreground)",
                    background: amount === balance.toFixed(2) ? accentColor + "15" : "var(--card)",
                  }}
                >
                  All
                </button>
              </div>
              <button
                disabled
                className="w-full py-4 rounded-2xl font-bold text-sm cursor-not-allowed"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                Withdrawals unavailable
              </button>
            </div>
          )}

          {/* Step 2 — Method */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setMethod(m.id); setDetails(""); }}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: method === m.id ? accentColor : "var(--border)",
                        background: method === m.id ? accentColor + "10" : "var(--card)",
                      }}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-sm font-bold text-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {method && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                    {METHODS.find(m => m.id === method)?.label} Details
                  </label>
                  <input
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder={METHODS.find(m => m.id === method)?.placeholder}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-foreground">← Back</button>
                <button
                  onClick={() => canProceedStep2 && setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
                  style={{ background: canProceedStep2 ? accentColor : "var(--muted)", color: canProceedStep2 ? "#fff" : "var(--muted-foreground)" }}
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-muted rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">${parsedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-bold text-foreground capitalize">{METHODS.find(m => m.id === method)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-bold text-foreground truncate max-w-[140px]">{details}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing time</span>
                  <span className="font-bold text-foreground">1–3 business days</span>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex gap-2">
                <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400">Make sure your details are correct. Withdrawals cannot be reversed once processed.</p>
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-foreground">← Back</button>
                <button
                  onClick={submitWithdrawal}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
                  style={{ background: accentColor }}
                >
                  {loading ? "Submitting…" : "Confirm Withdrawal"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: accentColor + "20" }}>
                <CheckCircle size={32} style={{ color: accentColor }} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">Withdrawal Requested!</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your request for <span className="font-bold">${parsedAmount.toFixed(2)}</span> has been submitted.<br />
                  You'll receive it within 1–3 business days.
                </p>
              </div>
              <div className="w-full bg-muted rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-bold text-foreground">{METHODS.find(m => m.id === method)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-bold text-foreground truncate max-w-[150px]">{details}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm"
                style={{ background: accentColor }}
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}