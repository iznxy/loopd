import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials, getConversationId } from "@/lib/utils";

export default function ChatWindow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { accentColor } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const otherName = location.state?.otherName || "User";
  const otherId = location.state?.otherId || "";
  const avColor = getAvColor(otherName);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setCurrentUser(u);
    });
    base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100).then(setMessages);
  }, [conversationId]);

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe(event => {
      if (event.data?.conversation_id === conversationId) {
        setMessages(prev => {
          if (event.type === "create") return [...prev, event.data];
          if (event.type === "update") return prev.map(m => m.id === event.id ? event.data : m);
          if (event.type === "delete") return prev.filter(m => m.id !== event.id);
          return prev;
        });
      }
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || !currentUser) return;
    const msg = text.trim();
    setText("");
    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_username: currentUser.email?.split("@")[0],
      receiver_id: otherId,
      text: msg,
      is_read: false,
    });
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border bg-card">
        <button onClick={() => navigate("/messages")}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: avColor.bg, color: avColor.text }}>
          {getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">@{otherName}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-2">
        {messages.map(m => {
          const mine = m.sender_id === currentUser?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                style={mine ? { background: accentColor, color: "#fff" } : { background: "var(--muted)", color: "var(--foreground)" }}
              >
                {m.text}
                <div className="text-[10px] opacity-60 mt-0.5 text-right">{timeAgo(m.created_date)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-card flex-shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message…"
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none"
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: text.trim() ? accentColor : "var(--muted)" }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}