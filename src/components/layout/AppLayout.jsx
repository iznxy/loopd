import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Home, Search, Plus, Bell, User, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentColor } = useTheme();
  const { t } = useLanguage();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user) return;
      base44.entities.Notification.filter({ user_id: user.id, is_read: false }, "-created_date", 50)
        .then(items => setUnreadNotifs(items.length))
        .catch(() => {});
    }).catch(() => {});
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Floating Glass Bottom Nav */}
      <div className="flex-shrink-0 flex justify-center px-4 pb-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        <nav className="glass-strong rounded-2xl flex items-center justify-around px-2 py-2 shadow-2xl"
          style={{ minWidth: 320, maxWidth: 420 }}>
          {tabs.map(({ path, icon: Icon, label, badge, isCenter }) => {
            const active = location.pathname === path;
            if (isCenter) {
              return (
                <Link key={path} to={path} className="flex flex-col items-center justify-center px-2">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                  >
                    <Plus size={24} color="#fff" strokeWidth={2.5} />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 relative transition-transform active:scale-90"
              >
                <div className="relative">
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ color: active ? accentColor : "var(--muted-foreground)" }}
                  />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "#e91e8c" }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                  {active && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: accentColor }}
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