import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getAvColor, getInitials } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeContext";

export default function StoriesRow({ currentUser }) {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    base44.entities.User.list("full_name", 12).then(all => {
      const others = all.filter(u => u.id !== currentUser?.id).slice(0, 10);
      setUsers(others);
    }).catch(() => {});
  }, [currentUser]);

  if (users.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-3 py-2 flex-shrink-0">
      {users.map((u, i) => {
        const name = u.full_name || u.email?.split("@")[0] || "user";
        const avColor = getAvColor(name);
        const isActive = i % 3 !== 2;
        return (
          <button
            key={u.id}
            onClick={() => navigate(`/creator/${u.email?.split("@")[0] || u.id}`)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className="w-14 h-14 rounded-full p-0.5"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${accentColor}, #00a8ff)`
                  : "rgba(255,255,255,0.2)",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-xs overflow-hidden border-2 border-black"
                style={{ background: avColor.bg, color: avColor.text }}
              >
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  : getInitials(name)}
              </div>
            </div>
            <span className="text-white text-[9px] font-medium drop-shadow max-w-[56px] truncate">
              {name.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}