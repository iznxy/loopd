import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, MessageCircle, UserPlus, Repeat2, DollarSign, AtSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

const TYPE_CONFIG = {
  like: { icon: Heart, bg: "#ffd6d6", color: "#e91e8c", label: "liked your loop" },
  comment: { icon: MessageCircle, bg: "#dbeeff", color: "#0077ff", label: "commented on your loop" },
  follow: { icon: UserPlus, bg: "#d4f5e9", color: "#00c896", label: "started following you" },
  reloop: { icon: Repeat2, bg: "#fff3cd", color: "#f59e0b", label: "relooped your post" },
  tip: { icon: DollarSign, bg: "#d4f5e9", color: "#00c896", label: "sent you a tip" },
  mention: { icon: AtSign, bg: "#feeaff", color: "#9b59b6", label: "mentioned you" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 50)
        .then(data => { setNotifs(data); setLoading(false); })
        .catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  async function markAllRead() {
    const unread = notifs.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const today = notifs.filter(n => {
    const d = new Date(n.created_date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const earlier = notifs.filter(n => {
    const d = new Date(n.created_date);
    const now = new Date();
    return d.toDateString() !== now.toDateString();
  });

  function renderNotif(n) {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.like;
    const Icon = cfg.icon;
    const avColor = getAvColor(n.from_username || "user");
    return (
      <div
        key={n.id}
        onClick={() => n.from_username && navigate(`/creator/${n.from_username}`)}
        className={`flex items-center gap-3 px-4 py-3.5 border-b border-border cursor-pointer active:bg-muted/50 ${!n.is_read ? "bg-muted/30" : ""}`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: avColor.bg, color: avColor.text }}>
            {getInitials(n.from_username || "U")}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: cfg.bg }}>
            <Icon size={10} style={{ color: cfg.color }} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground">@{n.from_username || "someone"} </span>
          <span className="text-sm text-foreground">{cfg.label}</span>
          {n.text && <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.text}</div>}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_date)}</span>
          {!n.is_read && <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate("/")}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="flex-1 text-base font-bold text-foreground">Notifications</span>
        {notifs.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="text-xs font-bold" style={{ color: accentColor }}>
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No notifications yet</div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">Today</div>
                {today.map(renderNotif)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">Earlier</div>
                {earlier.map(renderNotif)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}