import React, { useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ChangePasswordModal({ onClose }) {
  const { accentColor } = useTheme();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function strength(pw) {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) return 4;
    if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 3;
    if (pw.length >= 8) return 2;
    if (pw.length >= 4) return 1;
    return 0;
  }
  const s = strength(newPw);
  const sColors = ["","#f04e4e","#f5c542","#00c896","#00a87e"];
  const sLabels = ["","Weak 😕","Fair 🙂","Good 👍","Strong 💪"];

  async function save() {
    if (newPw.length < 8) { setError("Password must be 8+ characters"); return; }
    if (newPw !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");
    // In a real app you'd verify current password server-side
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">🔑 Change Password</h3>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-base font-bold text-foreground">Password Updated!</div>
            <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-full text-white font-bold text-sm" style={{ background: accentColor }}>Done</button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {[
                { label: "Current Password", value: current, set: setCurrent },
                { label: "New Password", value: newPw, set: setNewPw },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <input type="password" value={f.value} onChange={e => f.set(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
                </div>
              ))}
              {newPw.length > 0 && (
                <div>
                  <div className="h-1 rounded-full bg-border overflow-hidden mb-1"><div className="h-full rounded-full transition-all" style={{ width: `${s*25}%`, background: sColors[s] }} /></div>
                  <div className="text-[11px]" style={{ color: sColors[s] }}>{sLabels[s]}</div>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Confirm New Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>
            {error && <div className="text-xs text-red-500 mb-3">{error}</div>}
            <button onClick={save} disabled={loading} className="w-full py-3.5 rounded-full text-white font-bold text-sm" style={{ background: accentColor }}>
              {loading ? "Updating…" : "Update Password"}
            </button>
            <button onClick={onClose} className="w-full py-2.5 text-sm text-muted-foreground mt-1">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}