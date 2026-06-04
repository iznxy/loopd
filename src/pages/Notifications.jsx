import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

const TYPE_ICON = { like: "❤️", comment: "💬", follow: "👤", reloop: "🔁", tip: "💰", mention: "@" };

export default function Notifications() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      base44.entities.Notification.filter({ user_id: u.id }, "-created_date", 50).then(setNotifs);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Notifications</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="text-5xl">🔔</div>
            <div className="text-lg font-bold text-foreground">No notifications yet</div>
            <p className="text-sm text-muted-foreground">When someone likes, comments, or follows you, it'll show up here.</p>
          </div>
        ) : (
          notifs.map(n => {
            const avColor = getAvColor(n.from_username);
            return (
              <div key={n.id} className={`flex items-center gap-3 px-4 py-3.5 border-b border-border ${!n.is_read ? "bg-muted/30" : ""}`}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: avColor.bg, color: avColor.text }}>
                  {getInitials(n.from_username || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">
                    <span className="font-bold">@{n.from_username || "someone"}</span>{" "}
                    {n.text || `${n.type}d your loop`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_date)}</div>
                </div>
                <div className="text-xl flex-shrink-0">{TYPE_ICON[n.type] || "🔔"}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}