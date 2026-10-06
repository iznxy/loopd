import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock, Shield, Eye, Download, Music, Ban, KeyRound, Smartphone, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";

export default function Privacy() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [showChangePw, setShowChangePw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [settings, setSettings] = useState({
    private_account: false,
    allow_downloads: true,
    allow_duets: true,
    show_adult_content: false,
    allow_messages_from: "everyone",
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user) return;
      setSettings({
        private_account: user.private_account ?? false,
        allow_downloads: user.allow_downloads ?? true,
        allow_duets: user.allow_duets ?? true,
        show_adult_content: user.show_adult_content ?? false,
        allow_messages_from: user.allow_messages_from ?? "everyone",
      });
    }).catch(() => {});
  }, []);

  async function updateSetting(key, value) {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaving(true);
    await base44.auth.updateMe({ [key]: value }).catch(() => {});
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function Toggle({ value, onChange }) {
    return (
      <button
        onClick={e => { e.stopPropagation(); onChange(!value); }}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? accentColor : "var(--border)" }}
      >
        <div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: value ? "calc(100% - 20px)" : 4 }}
        />
      </button>
    );
  }

  function Row({ icon: Icon, iconBg, label, sub, children, onClick, arrow }) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 cursor-pointer active:bg-muted/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <Icon size={18} color="#fff" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
        {children}
        {arrow && <ChevronRight size={16} className="text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 glass-strong border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">Privacy & Security</span>
        <div className="w-6 flex items-center justify-end">
          {saving ? (
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
          ) : savedFlash ? (
            <Check size={16} style={{ color: accentColor }} />
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 px-4 pt-4 space-y-5">
        {/* Status banner */}
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20` }}>
            <Shield size={20} style={{ color: accentColor }} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Your data is protected</div>
            <div className="text-xs text-muted-foreground">Row-level security isolates your data from other users</div>
          </div>
        </div>

        {/* Account Security */}
        <div>
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Account Security</div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <Row icon={KeyRound} iconBg="#e91e8c" label="Change Password" sub="Update your password" onClick={() => setShowChangePw(true)} arrow />
            <Row icon={Smartphone} iconBg="#00a8ff" label="Active Sessions" sub="Manage logged-in devices" onClick={() => {}} arrow />
          </div>
        </div>

        {/* Visibility */}
        <div>
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Visibility</div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <Row icon={Eye} iconBg="#9b59b6" label="Private Account" sub="Only followers can see your loops">
              <Toggle value={settings.private_account} onChange={v => updateSetting("private_account", v)} />
            </Row>
            <Row icon={Ban} iconBg="#ff6b35" label="Blocked Users" sub="Manage blocked accounts" onClick={() => {}} arrow />
          </div>
        </div>

        {/* Content Controls */}
        <div>
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Content Controls</div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <Row icon={Download} iconBg="#00c896" label="Allow Downloads" sub="Let others download your loops">
              <Toggle value={settings.allow_downloads} onChange={v => updateSetting("allow_downloads", v)} />
            </Row>
            <Row icon={Music} iconBg="#f5a623" label="Allow Duets" sub="Let others remix your loops">
              <Toggle value={settings.allow_duets} onChange={v => updateSetting("allow_duets", v)} />
            </Row>
            <Row icon={Eye} iconBg="#e91e8c" label="Show 18+ Content" sub="Display mature content in feed">
              <Toggle value={settings.show_adult_content} onChange={v => updateSetting("show_adult_content", v)} />
            </Row>
          </div>
        </div>

        {/* Messaging */}
        <div>
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Messaging</div>
          <div className="glass-card rounded-2xl overflow-hidden">
            {[
              { val: "everyone", label: "Everyone", sub: "Any user can message you" },
              { val: "followers", label: "Followers only", sub: "Only people you follow" },
              { val: "no_one", label: "No one", sub: "Disable direct messages" },
            ].map((opt, i) => (
              <div
                key={opt.val}
                onClick={() => updateSetting("allow_messages_from", opt.val)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 cursor-pointer active:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.sub}</div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: settings.allow_messages_from === opt.val ? accentColor : "var(--border)" }}
                >
                  {settings.allow_messages_from === opt.val && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: accentColor }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground px-4 pt-2">
          Loopd uses end-to-end data isolation. Your messages, saved loops, and notifications are only visible to you.
        </p>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
}