import React from "react";
import { X, Lock } from "lucide-react";
import { TIPS } from "@/lib/constants";

/**
 * Tipping is intentionally disabled.
 *
 * There is no connected payment provider, so a tip cannot be paid for and cannot be
 * verified on the server. Creating a `Tip` record here would produce a row that looks
 * like revenue while no money moved — so this modal no longer writes to the database
 * at all. Re-enable only once a server-side payment confirmation exists.
 */
export default function TipModal({ creator, onClose }) {
  const handle = creator?.username || creator?.email?.split("@")[0] || "this creator";

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="relative w-full bg-card rounded-t-3xl pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
        <button onClick={onClose} className="absolute top-4 right-4"><X size={20} className="text-muted-foreground" /></button>

        <div className="px-5">
          <div className="flex items-center gap-2 mb-0.5">
            <Lock size={15} className="text-muted-foreground" />
            <div className="text-base font-bold text-foreground">Tipping isn't available yet</div>
          </div>
          <div className="text-xs text-muted-foreground mb-4">Supporting @{handle}</div>

          <div className="rounded-2xl p-4 mb-5 border border-border bg-muted/40">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tipping needs a real payment provider so a creator can actually be paid and the
              payment can be confirmed on our servers. No provider is connected yet, so tips
              can't be sent and nothing will ever be charged to you.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5 opacity-40 pointer-events-none select-none" aria-hidden="true">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex flex-col items-center py-3 rounded-2xl border-2 border-border bg-muted">
                <span className="text-2xl">{tip.c}</span>
                <span className="text-xs font-bold text-foreground mt-1">{tip.l}</span>
                <span className="text-[11px] text-muted-foreground">${tip.p}</span>
              </div>
            ))}
          </div>

          <button
            disabled
            className="w-full py-3.5 rounded-2xl text-sm font-bold bg-muted text-muted-foreground cursor-not-allowed"
          >
            Tipping unavailable
          </button>
        </div>
      </div>
    </div>
  );
}