import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { getAvColor, getInitials } from "@/lib/utils";

export default function EditProfile() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setUser(u);
      setDisplayName(u.full_name || "");
      setUsername(u.username || u.email?.split("@")[0] || "");
      setBio(u.bio || "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await base44.auth.updateMe({ username, bio });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("/profile"); }, 1000);
  }

  const avColor = getAvColor(username);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border bg-card sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">Edit Profile</span>
        <button
          onClick={save}
          disabled={saving || saved}
          className="px-4 py-1.5 rounded-full text-white text-sm font-bold transition-all"
          style={{ background: saved ? "#22c55e" : accentColor }}
        >
          {saved ? <Check size={16} /> : saving ? "…" : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4"
            style={{ background: avColor.bg, color: avColor.text, borderColor: accentColor }}
          >
            {getInitials(displayName || username)}
          </div>
          <button className="mt-2 text-sm font-semibold" style={{ color: accentColor }}>
            Change Photo
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">This is your public name (read-only on platform level).</p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Username
            </label>
            <div className="flex items-center bg-muted border border-border rounded-xl px-4 py-3 gap-1">
              <span className="text-sm text-muted-foreground">@</span>
              <input
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                placeholder="username"
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the world about yourself…"
              maxLength={150}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none h-24"
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">{bio.length}/150</p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Email
            </label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground outline-none opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}