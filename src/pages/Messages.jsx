import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

export default function Messages() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then(async user => {
      setCurrentUser(user);
      const [sent, received, allUsers] = await Promise.all([
        base44.entities.Message.filter({ sender_id: user.id }, "-created_date", 100),
        base44.entities.Message.filter({ receiver_id: user.id }, "-created_date", 100),
        base44.entities.User.list("full_name", 50),
      ]);
      setUsers(allUsers);
      // Build conversation map
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
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate("/")}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="flex-1 text-base font-bold text-foreground">Messages</span>
        <button className="p-1" onClick={() => { setShowNewMsg(true); setUserSearch(""); }}><Edit size={18} className="text-foreground" /></button>
      </div>

      <div className="px-4 py-2 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No conversations yet</div>
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
                className="flex items-center gap-3 px-4 py-3.5 border-b border-border cursor-pointer active:bg-muted/50"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
                  style={{ background: avColor.bg, color: avColor.text }}>
                  {other?.avatar_url
                    ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                    : getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{name}</div>
                  <div className={`text-xs truncate mt-0.5 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {conv.sender_id === currentUser?.id ? "You: " : ""}{conv.text || "Voice message"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(conv.created_date)}</span>
                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: accentColor }} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* New Message Modal */}
      {showNewMsg && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
            <button onClick={() => setShowNewMsg(false)}><X size={22} className="text-foreground" /></button>
            <span className="flex-1 text-base font-bold text-foreground">New Message</span>
          </div>
          <div className="px-4 py-2 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground" />
              <input
                autoFocus
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search people…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {users
              .filter(u => u.id !== currentUser?.id)
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
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border cursor-pointer active:bg-muted/50"
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: avColor.bg, color: avColor.text }}>
                      {getInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{name}</div>
                      {u.email && <div className="text-xs text-muted-foreground truncate">{u.email}</div>}
                    </div>
                  </div>
                );
              })}
            {users.filter(u => u.id !== currentUser?.id).length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}