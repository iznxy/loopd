import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { TIPS } from "@/lib/constants";

export default function TipModal({ creator, onClose }) {
  const { accentColor } = useTheme();
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendTip() {
    if (selected === null) return;
    setSending(true);
    const user = await base44.auth.me();
    const tip = TIPS[selected];
    await base44.entities.Tip.create({
      from_user_id: user.id,
      from_username: user.email?.split("@")[0] || "user",
      to_user_id: creator.id,
      to_username: creator.username || creator.email?.split("@")[0],
      amount: tip.p,
      label: tip.l,
    });
    // Notify creator
    await base44.entities.Notification.create({
      user_id: creator.id,
      from_user_id: user.id,
      from_username: user.email?.split("@")[0] || "user",
      type: "tip",
      text: `sent you a ${tip.l} tip (${tip.c} $${tip.p})`,
    }).catch(() => {});
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
        <button onClick={onClose} className="absolute top-4 right-4"><X size={20} className="text-muted-foreground" /></button>

        <div className="px-5">
          <div className="text-base font-bold text-foreground mb-0.5">Send a Tip 💝</div>
          <div className="text-xs text-muted-foreground mb-4">Support @{creator.username || creator.email?.split("@")[0]}</div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {TIPS.map((tip, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="flex flex-col items-center py-3 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: selected === i ? accentColor : "var(--border)",
                  background: selected === i ? accentColor + "15" : "var(--muted)",
                }}
              >
                <span className="text-2xl">{tip.c}</span>
                <span className="text-xs font-bold text-foreground mt-1">{tip.l}</span>
                <span className="text-[11px] text-muted-foreground">${tip.p}</span>
              </button>
            ))}
          </div>

          <button
            onClick={sendTip}
            disabled={selected === null || sending || sent}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: selected !== null ? accentColor : "var(--muted)", color: selected !== null ? "#fff" : "var(--muted-foreground)" }}
          >
            {sent ? <><Check size={16} /> Tip Sent!</> : sending ? "Sending…" : selected !== null ? `Send ${TIPS[selected].c} $${TIPS[selected].p}` : "Select a tip"}
          </button>
        </div>
      </div>
    </div>
  );
}