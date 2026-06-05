import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Edit } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials, getConversationId } from "@/lib/utils";

export default function Messages() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) return;
      setCurrentUser(u);
      // Get messages where user is sender or receiver
      const sent = await base44.entities.Message.filter({ sender_id: u.id }, "-created_date", 50);
      const received = await base44.entities.Message.filter({ receiver_id: u.id }, "-created_date", 50);
      const all = [...sent, ...received];
      // Build conversations
      const convMap = {};
      all.forEach(m => {
        const otherId = m.sender_id === u.id ? m.receiver_id : m.sender_id;
        const otherName = m.sender_id === u.id ? (m.receiver_username || m.receiver_id) : m.sender_username;
        const convId = getConversationId(u.id, otherId);
        if (!convMap[convId] || new Date(m.created_date) > new Date(convMap[convId].lastDate)) {
          convMap[convId] = { convId, otherId, otherName, lastMsg: m.text, lastDate: m.created_date, unread: !m.is_read && m.receiver_id === u.id };
        }
      });
      setConversations(Object.values(convMap).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate)));
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border bg-card">
        <button onClick={() => navigate("/")}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">Messages</span>
        <button className="p-1"><Edit size={20} className="text-foreground" /></button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="text-5xl">💬</div>
            <div className="text-lg font-bold text-foreground">No messages yet</div>
            <p className="text-sm text-muted-foreground">Start a conversation by visiting someone's profile.</p>
          </div>
        ) : (
          conversations.map(conv => {
            const avColor = getAvColor(conv.otherName);
            return (
              <div
                key={conv.convId}
                onClick={() => navigate(`/chat/${conv.convId}`, { state: { otherId: conv.otherId, otherName: conv.otherName } })}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-border cursor-pointer active:bg-muted/50"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: avColor.bg, color: avColor.text }}>
                  {getInitials(conv.otherName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-foreground">@{conv.otherName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(conv.lastDate)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{conv.lastMsg}</div>
                </div>
                {conv.unread && <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}