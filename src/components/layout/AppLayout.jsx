import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, DollarSign } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const NAV = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Plus, label: "Record", path: "/record", fab: true },
  { icon: DollarSign, label: "Earn", path: "/earn" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentColor } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom Nav */}
      <div className="flex-shrink-0 bg-card border-t border-border flex items-center justify-around px-2 py-1 safe-area-bottom" style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}>
        {NAV.map(({ icon: Icon, label, path, fab }) => {
          const active = location.pathname === path;
          if (fab) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-5"
                style={{ background: accentColor }}
              >
                <Icon size={22} color="#fff" />
              </button>
            );
          }
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 flex-1"
            >
              <Icon
                size={22}
                style={{ color: active ? accentColor : "var(--muted-foreground)" }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? accentColor : "var(--muted-foreground)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}