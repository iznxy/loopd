import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, MessageCircle, UserPlus, Repeat2, DollarSign, AtSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

const ACID = "#00ff88";

const TYPE_CONFIG = {
  like: { icon: Heart, label: "liked your loop" },
  comment: { icon: MessageCircle, label: "commented on your loop" },
  follow: { icon: UserPlus, label: "started following you" },
  reloop: { icon: Repeat2, label: "relooped your post" },
  tip: { icon: DollarSign, label: "sent you a tip" },
  mention: { icon: AtSign, label: "mentioned you" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const user = await base44.auth.me();
      const mutes = await base44.entities.Mute.filter({ muter_id: user.id });
      // Muting an account suppresses every notification that account generates.
      // An empty $nin excludes nobody, so other users' notifications always come through.
      const data = await base44.entities.Notification.filter(
        { user_id: user.id, from_user_id: { $nin: mutes.map(m => m.muted_id) } },
        "-created_date", 50
      );
      setNotifs(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleNotifClick(n) {
    if (!n.is_read) {
      try {
        await base44.entities.Notification.update(n.id, { is_read: true });
        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      } catch {}
    }
    if (n.from_username) navigate(`/creator/${n.from_username}`);
  }

  async function markAllRead() {
    const unread = notifs.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  }

  const today = notifs.filter(n => new Date(n.created_date).toDateString() === new Date().toDateString());
  const earlier = notifs.filter(n => new Date(n.created_date).toDateString() !== new Date().toDateString());

  function renderNotif(n) {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.like;
    const Icon = cfg.icon;
    const avColor = getAvColor(n.from_username || "user");
    return (
      <div
        key={n.id}
        onClick={() => handleNotifClick(n)}
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/5 transition-colors"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: !n.is_read ? "rgba(0,255,136,0.04)" : "transparent" }}
      >
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"
            style={{ background: avColor.bg, color: avColor.text }}>
            {getInitials(n.from_username || "U")}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#090b0b", border: "1px solid rgba(255,255,255,0.16)" }}>
            <Icon size={10} style={{ color: ACID }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold" style={{ color: "#f5f7f5" }}>@{n.from_username || "someone"} </span>
          <span className="text-sm" style={{ color: "#a1aaa5" }}>{cfg.label}</span>
          {n.text && <div className="text-xs mt-0.5 truncate" style={{ color: "#79817d" }}>{n.text}</div>}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span style={{ font: "10px ui-monospace, monospace", color: "#79817d" }}>{timeAgo(n.created_date)}</span>
          {!n.is_read && <span className="w-2 h-2 rounded-full" style={{ background: ACID }} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "#090b0b" }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={() => navigate("/")}><ChevronLeft size={22} style={{ color: "#f5f7f5" }} /></button>
        <span className="flex-1 text-base font-bold" style={{ color: "#f5f7f5" }}>Notifications</span>
        {notifs.some(n => !n.is_read) && (
          <button onClick={markAllRead} style={{ font: "600 11px ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "1px", color: ACID }}>
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-2/3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="w-1/2 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#79817d" }}>
            <div className="text-4xl mb-3">🔔</div>
            <div className="text-sm">No notifications yet</div>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <div className="px-4 py-2" style={{ font: "11px ui-monospace, monospace", letterSpacing: "1.6px", textTransform: "uppercase", color: "#79817d", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Today</div>
                {today.map(renderNotif)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <div className="px-4 py-2" style={{ font: "11px ui-monospace, monospace", letterSpacing: "1.6px", textTransform: "uppercase", color: "#79817d", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Earlier</div>
                {earlier.map(renderNotif)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}