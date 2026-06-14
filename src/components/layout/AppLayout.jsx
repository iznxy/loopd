import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User, MessageCircle } from "lucide-react";
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
    { path: "/record", icon: PlusSquare, label: t("nav_create") },
    { path: "/messages", icon: MessageCircle, label: t("nav_messages") },
    { path: "/notifications", icon: Bell, label: t("nav_notifications"), badge: unreadNotifs },
    { path: "/profile", icon: User, label: t("nav_profile") },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom Nav */}
      <nav
        className="flex-shrink-0 flex items-center justify-around border-t border-border bg-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom)", minHeight: 56 }}
      >
        {tabs.map(({ path, icon: Icon, label, badge }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? accentColor : "var(--muted-foreground)" }}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ background: accentColor }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? accentColor : "var(--muted-foreground)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}