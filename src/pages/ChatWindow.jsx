import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Mic, Square, MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      const parts = conversationId.split("_");
      const otherId = parts[0] === user.id ? parts[1] : parts[0];
      base44.entities.User.list("full_name", 100).then(users => {
        const found = users.find(u => u.id === otherId);
        if (found) setOtherUser(found);
      }).catch(() => {});
      loadMessages(user);
    });
  }, [conversationId]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;
      if (event.type === "create") {
        setMessages(prev => {
          if (prev.find(m => m.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
        // Mark as read if receiver
        if (event.data.receiver_id === currentUser?.id) {
          base44.entities.Message.update(event.data.id, { is_read: true }).catch(() => {});
        }
      } else if (event.type === "update") {
        setMessages(prev => prev.map(m => m.id === event.data.id ? event.data : m));
      } else if (event.type === "delete") {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });
    return unsubscribe;
  }, [conversationId, currentUser]);

  function loadMessages(user) {
    base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100)
      .then(msgs => {
        setMessages(msgs);
        msgs.filter(m => m.receiver_id === user?.id && !m.is_read)
          .forEach(m => base44.entities.Message.update(m.id, { is_read: true }).catch(() => {}));
      }).catch(() => {});
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
    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_username: currentUser.email?.split("@")[0] || "user",
      receiver_id: receiverId,
      text: msg,
      message_type: "text",
      is_read: false,
    });
  }

  async function sendVoiceNote() {
    if (!audioBlob || !currentUser) return;
    const parts = conversationId.split("_");
    const receiverId = parts[0] === currentUser.id ? parts[1] : parts[0];
    const { file_url } = await base44.integrations.Core.UploadFile({ file: audioBlob });
    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_username: currentUser.email?.split("@")[0],
      receiver_id: receiverId,
      audio_url: file_url,
      message_type: "voice",
      is_read: false,
    });
    setAudioBlob(null);
    setAudioUrl(null);
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(t => t.stop());
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function saveEdit(msgId) {
    if (!editText.trim()) return;
    await base44.entities.Message.update(msgId, { text: editText.trim() });
    setEditingId(null);
    setEditText("");
  }

  async function deleteMessage(msgId) {
    await base44.entities.Message.delete(msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setMenuMsgId(null);
  }

  const otherName = otherUser?.full_name || otherUser?.email?.split("@")[0] || "User";
  const avColor = getAvColor(otherName);

  return (
    <div className="flex flex-col h-screen bg-background" onClick={() => setMenuMsgId(null)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate("/messages")}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
          style={{ background: avColor.bg, color: avColor.text }}>
          {otherUser?.avatar_url
            ? <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{otherName}</div>
          <div className="text-xs" style={{ color: accentColor }}>● Active now</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-2">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUser?.id;
          const showDate = i === 0 || new Date(msg.created_date).toDateString() !== new Date(messages[i - 1].created_date).toDateString();
          const isEditing = editingId === msg.id;
          const showMenu = menuMsgId === msg.id;
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="text-center text-[11px] text-muted-foreground my-3 font-medium">
                  {new Date(msg.created_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
              )}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1.5 relative`}>
                <div className="relative">
                  {/* Long-press / context menu button */}
                  {isMe && (
                    <button
                      className="absolute -left-6 bottom-1 opacity-0 hover:opacity-100 focus:opacity-100 p-1"
                      onClick={e => { e.stopPropagation(); setMenuMsgId(showMenu ? null : msg.id); }}
                    >
                      <MoreVertical size={14} className="text-muted-foreground" />
                    </button>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2 max-w-[75vw]">
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit(msg.id)}
                        className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                      />
                      <button onClick={() => saveEdit(msg.id)} className="p-1.5 rounded-full" style={{ background: accentColor }}>
                        <Check size={12} color="#fff" />
                      </button>
                      <button onClick={() => { setEditingId(null); setEditText(""); }} className="p-1.5 rounded-full bg-muted">
                        <X size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="max-w-[72vw] px-4 py-2.5 rounded-2xl text-sm relative"
                      style={isMe
                        ? { background: accentColor, color: "#fff", borderBottomRightRadius: 4 }
                        : { background: "var(--muted)", color: "var(--foreground)", borderBottomLeftRadius: 4 }
                      }
                      onDoubleClick={e => {
                        e.stopPropagation();
                        if (isMe && msg.message_type !== "voice") {
                          setEditingId(msg.id);
                          setEditText(msg.text || "");
                        }
                      }}
                    >
                      {msg.message_type === "voice" && msg.audio_url ? (
                        <audio controls src={msg.audio_url} className="h-8 w-44" />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                      <div className={`text-[10px] mt-0.5 ${isMe ? "text-white/60 text-right" : "text-muted-foreground"}`}>
                        {timeAgo(msg.created_date)}{isMe && msg.is_read && " · Seen"}
                      </div>
                    </div>
                  )}

                  {/* Context menu */}
                  {showMenu && isMe && (
                    <div
                      className="absolute right-0 bottom-full mb-1 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      {msg.message_type !== "voice" && (
                        <button
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-muted w-full text-left"
                          onClick={() => { setEditingId(msg.id); setEditText(msg.text || ""); setMenuMsgId(null); }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-muted w-full text-left"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Voice preview */}
      {audioUrl && (
        <div className="px-4 py-2 border-t border-border bg-card flex items-center gap-3">
          <audio controls src={audioUrl} className="flex-1 h-8" />
          <button onClick={sendVoiceNote} className="px-3 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: accentColor }}>
            Send
          </button>
          <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="px-3 py-1.5 rounded-full bg-muted text-xs">
            Discard
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card flex-shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: recording ? "#e91e8c" : "var(--muted)" }}
          title="Hold to record voice note"
        >
          {recording ? <Square size={13} color="#fff" /> : <Mic size={15} className="text-muted-foreground" />}
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={recording ? "Recording…" : "Message…"}
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none"
          disabled={recording}
        />
        <button
          type="button"
          onClick={e => { e.stopPropagation(); sendMessage(); }}
          disabled={!text.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all"
          style={{ background: text.trim() ? accentColor : "var(--muted)" }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}