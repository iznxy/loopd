import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

const ACID = "#00ff88";

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [blockedIds, setBlockedIds] = useState(new Set());

  useEffect(() => {
    base44.auth.me().then(async user => {
      setCurrentUser(user);
      const [sent, received, allUsers, blocks] = await Promise.all([
        base44.entities.Message.filter({ sender_id: user.id }, "-created_date", 100),
        base44.entities.Message.filter({ receiver_id: user.id }, "-created_date", 100),
        base44.entities.User.list("full_name", 50),
        base44.entities.Block.filter({ blocker_id: user.id }),
      ]);
      setUsers(allUsers);
      setBlockedIds(new Set(blocks.map(b => b.blocked_id)));
      const convMap = {};
      [...sent, ...received].forEach(msg => {
        const cid = msg.conversation_id;
        if (!convMap[cid] || new Date(msg.created_date) > new Date(convMap[cid].lastMsg.created_date)) {
          convMap[cid] = { ...msg, lastMsg: msg };
        }
      });
      setConversations(Object.values(convMap).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function getOtherUserId(conv) {
    const parts = conv.conversation_id.split("_");
    return parts[0] === currentUser?.id ? parts[1] : parts[0];
  }

  function getOtherUser(conv) {
    const otherId = getOtherUserId(conv);
    return users.find(u => u.id === otherId);
  }

  const filtered = conversations.filter(conv => {
    const other = getOtherUser(conv);
    const name = other?.full_name || other?.email?.split("@")[0] || conv.sender_username || "";
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col h-screen" style={{ background: "#090b0b" }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={() => navigate("/")}><ChevronLeft size={22} style={{ color: "#f5f7f5" }} /></button>
        <span className="flex-1 text-base font-bold" style={{ color: "#f5f7f5" }}>Messages</span>
        <button className="p-1" onClick={() => { setShowNewMsg(true); setUserSearch(""); }}><Edit size={18} style={{ color: "#f5f7f5" }} /></button>
      </div>

      <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Search size={14} style={{ color: "#79817d" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#f5f7f5" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: ACID }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: "#79817d" }}>No conversations yet</div>
        ) : (
          filtered.map(conv => {
            const other = getOtherUser(conv);
            const name = other?.full_name || other?.email?.split("@")[0] || conv.sender_username || "User";
            const avColor = getAvColor(name);
            const isUnread = conv.receiver_id === currentUser?.id && !conv.is_read;
            return (
              <div
                key={conv.conversation_id}
                onClick={() => navigate(`/chat/${conv.conversation_id}`)}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
                  style={{ background: avColor.bg, color: avColor.text }}>
                  {other?.avatar_url
                    ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                    : getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ fontWeight: isUnread ? 700 : 500, color: "#f5f7f5" }}>{name}</div>
                  <div className="text-xs truncate mt-0.5" style={{ color: isUnread ? "#a1aaa5" : "#79817d" }}>
                    {conv.sender_id === currentUser?.id ? "You: " : ""}{conv.text || "Voice message"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span style={{ font: "10px ui-monospace, monospace", color: "#79817d" }}>{timeAgo(conv.created_date)}</span>
                  {isUnread && <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACID }} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Message Modal */}
      {showNewMsg && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#090b0b" }}>
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => setShowNewMsg(false)}><X size={22} style={{ color: "#f5f7f5" }} /></button>
            <span className="flex-1 text-base font-bold" style={{ color: "#f5f7f5" }}>New Message</span>
          </div>
          <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Search size={14} style={{ color: "#79817d" }} />
              <input
                autoFocus
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search people…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "#f5f7f5" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {users
              .filter(u => u.id !== currentUser?.id && !blockedIds.has(u.id))
              .filter(u => {
                const name = u.full_name || u.email?.split("@")[0] || "";
                return name.toLowerCase().includes(userSearch.toLowerCase());
              })
              .map(u => {
                const name = u.full_name || u.email?.split("@")[0] || "User";
                const avColor = getAvColor(name);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      const convId = [currentUser.id, u.id].sort().join("_");
                      setShowNewMsg(false);
                      navigate(`/chat/${convId}`);
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: avColor.bg, color: avColor.text }}>
                      {getInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: "#f5f7f5" }}>{name}</div>
                      {u.email && <div className="text-xs truncate" style={{ color: "#79817d" }}>{u.email}</div>}
                    </div>
                  </div>
                );
              })}
            {users.filter(u => u.id !== currentUser?.id && !blockedIds.has(u.id)).length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: "#79817d" }}>No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}