import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowDownToLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN } from "@/lib/utils";
import { TIPS } from "@/lib/constants";

export default function Earn() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [tips, setTips] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      base44.entities.Tip.filter({ to_user_id: u.id }, "-created_date", 20).then(setTips);
    });
  }, []);

  const totalEarned = tips.reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">💰 Earn</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="p-4 space-y-4">
        {/* Monetization is not yet available — these are unverified records, never a payout balance */}
        <div className="rounded-2xl p-4 border border-amber-500/40 bg-amber-500/10">
          <div className="text-sm font-bold text-amber-500 mb-1">Monetization isn't available yet</div>
          <p className="text-xs text-amber-500/90 leading-relaxed">
            New tips can't be sent while payments aren't supported. Any tips below are in-app records
            from before tipping was paused — no payment was processed, so they are not verified revenue
            and cannot be withdrawn. Withdrawals stay disabled until a payment can be confirmed on the
            server.
          </p>
        </div>

        {/* Recorded tips */}
        <div className="rounded-2xl p-5 text-white" style={{ background: accentColor }}>
          <div className="text-sm font-medium opacity-80 mb-1">Recorded Tips (unverified)</div>
          <div className="text-4xl font-bold font-display">${totalEarned.toFixed(2)}</div>
          <div className="text-sm opacity-80 mt-1">{tips.length} tip records · not verified payments</div>
          <button
            disabled
            className="mt-4 flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl opacity-40 cursor-not-allowed"
          >
            <ArrowDownToLine size={16} /> Withdrawals unavailable
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "💎", label: "This Month", value: "$" + tips.filter(t => new Date(t.created_date) > new Date(Date.now() - 30*24*3600*1000)).reduce((s,t) => s+(t.amount||0),0).toFixed(2) },
            { icon: "🔥", label: "Best Tip", value: "$" + (tips.reduce((m,t) => Math.max(m, t.amount||0),0)).toFixed(2) },
            { icon: "🎉", label: "Supporters", value: fmtN(new Set(tips.map(t=>t.from_user_id)).size) },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-sm font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tip amounts guide */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-bold text-sm text-foreground">Tip Tiers</div>
          <div className="grid grid-cols-3 gap-0">
            {TIPS.map(t => (
              <div key={t.l} className="flex flex-col items-center p-3 border-r border-b border-border last:border-r-0">
                <div className="text-2xl mb-1">{t.c}</div>
                <div className="text-xs font-bold text-foreground">${t.p}</div>
                <div className="text-[10px] text-muted-foreground">{t.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tips */}
        {tips.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-bold text-sm text-foreground">Recent Tips</div>
            {tips.slice(0, 10).map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                    {(t.from_username || "?").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">@{t.from_username || "someone"}</div>
                    {t.label && <div className="text-xs text-muted-foreground">{t.label}</div>}
                  </div>
                </div>
                <div className="text-sm font-bold" style={{ color: accentColor }}>${(t.amount || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}