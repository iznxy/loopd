import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Mic, Phone, Video, MoreVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      // Parse conversationId to get the other user id
      const parts = conversationId.split("_");
      const otherId = parts[0] === user.id ? parts[1] : parts[0];
      base44.entities.User.filter({ id: otherId }).then(users => {
        if (users.length > 0) setOtherUser(users[0]);
      }).catch(() => {});
      loadMessages(user);
    });
  }, [conversationId]);

  function loadMessages(user) {
    base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100)
      .then(msgs => {
        setMessages(msgs);
        // Mark unread messages as read
        msgs.filter(m => m.receiver_id === user?.id && !m.is_read)
          .forEach(m => base44.entities.Message.update(m.id, { is_read: true }));
      })
      .catch(() => {});
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !currentUser) return;
    const msg = text.trim();
    setText("");
    const parts = conversationId.split("_");
    const receiverId = parts[0] === currentUser.id ? parts[1] : parts[0];
    const newMsg = await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_username: currentUser.email?.split("@")[0] || "user",
      receiver_id: receiverId,
      text: msg,
      message_type: "text",
      is_read: false,
    });
    setMessages(prev => [...prev, newMsg]);
  }

  const otherName = otherUser?.full_name || otherUser?.email?.split("@")[0] || "User";
  const avColor = getAvColor(otherName);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate("/messages")}>
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
          style={{ background: avColor.bg, color: avColor.text }}>
          {otherUser?.avatar_url
            ? <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{otherName}</div>
          <div className="text-xs text-muted-foreground">Active now</div>
        </div>
        <button className="p-2"><Phone size={18} className="text-muted-foreground" /></button>
        <button className="p-2"><Video size={18} className="text-muted-foreground" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUser?.id;
          const showDate = i === 0 || new Date(msg.created_date).toDateString() !== new Date(messages[i-1].created_date).toDateString();
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="text-center text-[11px] text-muted-foreground my-2">
                  {new Date(msg.created_date).toLocaleDateString()}
                </div>
              )}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                  style={isMe
                    ? { background: accentColor, color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "var(--muted)", color: "var(--foreground)", borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-muted-foreground"}`}>
                    {timeAgo(msg.created_date)}
                    {isMe && msg.is_read && " · Seen"}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-card flex-shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Message…"
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: text.trim() ? accentColor : "var(--muted)" }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}