import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Home, Search, Plus, Bell, User, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ACID = "#00ff88";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentColor } = useTheme();
  const { t } = useLanguage();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user || !active) return;
        const mutes = await base44.entities.Mute.filter({ muter_id: user.id });
        // Badge mirrors the notifications feed: muted accounts are not counted.
        const total = await base44.entities.Notification.count({
          user_id: user.id,
          is_read: false,
          from_user_id: { $nin: mutes.map(m => m.muted_id) },
        });
        if (active) setUnreadNotifs(total);
      } catch {}
    })();
    return () => { active = false; };
  }, [location.pathname]);

  const tabs = [
    { path: "/", icon: Home, label: t("nav_home") },
    { path: "/explore", icon: Search, label: t("nav_explore") },
    { path: "/record", icon: Plus, label: t("nav_create"), isCenter: true },
    { path: "/messages", icon: MessageCircle, label: t("nav_messages") },
    { path: "/notifications", icon: Bell, label: t("nav_notifications"), badge: unreadNotifs },
    { path: "/profile", icon: User, label: t("nav_profile") },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#090b0b" }}>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Floating Glass Bottom Nav */}
      <div className="flex-shrink-0 flex justify-center px-4 pb-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        <nav
          className="flex items-center justify-around"
          style={{
            minWidth: 320,
            maxWidth: 460,
            minHeight: 64,
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 23,
            background: "rgba(24,29,27,0.77)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.46)",
            padding: "10px 12px",
            animation: "panelUp 0.7s cubic-bezier(0.2,0.75,0.25,1) 0.24s both",
          }}
        >
          {tabs.map(({ path, icon: Icon, label, badge, isCenter }) => {
            const active = location.pathname === path;
            if (isCenter) {
              return (
                <Link key={path} to={path} className="flex items-center justify-center">
                  <div
                    className="flex items-center justify-center transition-transform active:scale-90"
                    style={{
                      width: 46, height: 46, borderRadius: 15,
                      border: "1px solid rgba(0,255,136,0.5)",
                      background: ACID,
                      boxShadow: "0 0 22px rgba(0,255,136,0.2)",
                    }}
                  >
                    <Plus size={23} color="#07110c" strokeWidth={2.4} />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className="relative flex items-center justify-center transition-transform active:scale-90"
                style={{ width: 56, height: 48 }}
              >
                <div className="relative">
                  <Icon
                    size={21}
                    strokeWidth={1.7}
                    style={{ color: active ? ACID : "#a1aaa5" }}
                  />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: ACID, color: "#07110c" }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                  {active && (
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: ACID }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}