import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getInitials } from "@/lib/utils";

const ACID = "#00ff88";

export default function StoriesRow({ currentUser }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    base44.entities.User.list("full_name", 12).then(all => {
      const others = all.filter(u => u.id !== currentUser?.id).slice(0, 10);
      setUsers(others);
    }).catch(() => {});
  }, [currentUser]);

  if (users.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
      {/* Add story */}
      <button
        onClick={() => navigate("/record")}
        className="flex flex-col items-center gap-1.5 flex-shrink-0"
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 62, height: 62, borderRadius: "50%",
            border: `1px solid ${ACID}`,
            background: "#111615",
            color: "#fff",
            fontSize: 20,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            boxShadow: "0 0 18px rgba(0,255,136,0.13)",
          }}
        >
          +
        </div>
      </button>
      {users.map(u => {
        const name = u.full_name || u.email?.split("@")[0] || "user";
        return (
          <button
            key={u.id}
            onClick={() => navigate(`/creator/${u.email?.split("@")[0] || u.id}`)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: 62, height: 62, borderRadius: "50%",
                border: "1px solid rgba(0,255,136,0.55)",
                padding: 4,
                background: "#111615",
                color: "#fff",
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
              }}
            >
              {u.avatar_url
                ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                : getInitials(name)
              }
            </div>
          </button>
        );
      })}
    </div>
  );
}