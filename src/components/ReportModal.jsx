import React, { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ACID = "#00ff88";

const REASONS = [
  { id: "spam", label: "Spam or scam" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "violence", label: "Violence or harm" },
  { id: "adult_content", label: "Adult content" },
  { id: "misinformation", label: "Misinformation" },
  { id: "other", label: "Other" },
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Report.create({
        reporter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details || undefined,
      });
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
        <div className="text-center" style={{ color: "#f5f7f5" }}>
          <div className="text-4xl mb-3" style={{ color: ACID }}>✓</div>
          <div className="text-sm">Report submitted. Thank you.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl p-5 animate-slide-up"
        style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold" style={{ color: "#f5f7f5" }}>Report</span>
          <button onClick={onClose}><X size={20} style={{ color: "#a1aaa5" }} /></button>
        </div>
        <div className="space-y-2 mb-4">
          {REASONS.map(r => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors"
              style={{
                border: `1px solid ${reason === r.id ? ACID : "rgba(255,255,255,0.12)"}`,
                background: reason === r.id ? "rgba(0,255,136,0.08)" : "transparent",
                color: reason === r.id ? ACID : "#f5f7f5",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Additional details (optional)"
          className="w-full rounded-xl p-3 text-sm outline-none resize-none h-20"
          style={{ background: "#090b0b", border: "1px solid rgba(255,255,255,0.12)", color: "#f5f7f5" }}
        />
        <button
          onClick={submit}
          disabled={!reason || submitting}
          className="w-full mt-4 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
          style={{ background: ACID, color: "#07110c" }}
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </div>
    </div>
  );
}