import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Mic, MicOff, Video, Smile } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { getAvColor, getInitials } from "@/lib/utils";
import GifPicker from "@/components/chat/GifPicker";
import EmojiPicker from "@/components/chat/EmojiPicker";
import VoiceMessage from "@/components/chat/VoiceMessage";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { accentColor } = useTheme();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    base44.auth.me().then(async user => {
      setCurrentUser(user);
      const parts = conversationId.split("_");
      const otherId = parts[0] === user.id ? parts[1] : parts[0];
      // Targeted lookup instead of pulling the whole user directory
      const [found] = await base44.entities.User.filter({ id: otherId });
      setOtherUser(found || null);

      // Block gate. IMPORTANT: this is a UI gate only, not a security boundary.
      // Block rows are readable only by the person who created them, so "they blocked me"
      // cannot be detected from the client, and Message.create remains directly callable.
      const myBlocks = await base44.entities.Block.filter({ blocker_id: user.id, blocked_id: otherId });
      setIBlockedThem(myBlocks.length > 0);

      const [msgs, reads] = await Promise.all([
        base44.entities.Message.filter({ conversation_id: conversationId }, "created_date", 100),
        base44.entities.MessageRead.filter({ conversation_id: conversationId, user_id: user.id }),
      ]);
      setMessages(msgs);

      // Read receipts live in MessageRead (owned by the reader), one bulk write per conversation.
      const alreadyRead = new Set(reads.map(r => r.message_id));
      const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read && !alreadyRead.has(m.id));
      if (unread.length > 0) {
        await base44.entities.MessageRead.bulkCreate(
          unread.map(m => ({ message_id: m.id, conversation_id: conversationId, user_id: user.id }))
        ).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const unsub = base44.entities.Message.subscribe(event => {
      if (event.data?.conversation_id === conversationId) {
        if (event.type === "create") setMessages(prev => [...prev, event.data]);
        if (event.type === "update") setMessages(prev => prev.map(m => m.id === event.data.id ? event.data : m));
      }
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(override = {}) {
    if (!currentUser || !otherUser || iBlockedThem || sending) return;
    const payload = {
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_username: currentUser.email?.split("@")[0],
      receiver_id: otherUser.id,
      text: override.text ?? text,
      message_type: override.message_type ?? "text",
      audio_url: override.audio_url ?? undefined,
      audio_file_uri: override.audio_file_uri ?? undefined,
      is_read: false,
    };
    if (!payload.text && !payload.audio_url && !payload.audio_file_uri) return;
    const typed = text;
    setText("");
    setSending(true);
    try {
      await base44.entities.Message.create(payload);
    } catch {
      // A failed send must not swallow what the user typed.
      if (!override.text) setText(typed);
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      // Store the private file reference, never a signed URL: signed URLs expire within minutes,
      // which would leave a dead link baked into the message record forever.
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await sendMessage({ text: "", message_type: "voice", audio_file_uri: file_uri });
    };
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleGifSelect(gifUrl) {
    setShowGif(false);
    await sendMessage({ text: gifUrl, message_type: "gif" });
  }

  function handleEmojiSelect(emoji) {
    setText(prev => prev + emoji);
    setShowEmoji(false);
  }

  const otherName = otherUser?.full_name || otherUser?.email?.split("@")[0] || "User";
  const avColor = getAvColor(otherName);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass-strong flex-shrink-0">
        <button onClick={() => navigate("/messages")}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0"
          style={{ background: avColor.bg, color: avColor.text }}>
          {otherUser?.avatar_url
            ? <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{otherName}</div>
          <div className="text-[10px] text-muted-foreground">@{otherUser?.email?.split("@")[0]}</div>
        </div>
        <button
          onClick={() => setInCall(v => !v)}
          className="p-2 rounded-full"
          style={{ background: inCall ? "#e91e8c" : accentColor }}
        >
          <Video size={16} color="#fff" />
        </button>
      </div>

      {/* Jitsi video call */}
      {inCall && (
        <div className="flex-shrink-0 bg-black" style={{ height: 260 }}>
          <iframe
            src={`https://meet.jit.si/loopd-${conversationId}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
            title="Video Call"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.map(msg => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {msg.message_type === "voice" && (msg.audio_file_uri || msg.audio_url) ? (
                <VoiceMessage audioUrl={msg.audio_url} fileUri={msg.audio_file_uri} isMe={isMe} accentColor={accentColor} />
              ) : msg.message_type === "gif" && msg.text ? (
                <img
                  src={msg.text}
                  alt="GIF"
                  className="w-[200px] rounded-2xl bg-muted"
                  style={{ minHeight: 120, objectFit: "contain" }}
                />
              ) : (
                <div
                  className="max-w-[72%] px-4 py-2.5 rounded-2xl text-sm"
                  style={isMe
                    ? { background: accentColor, color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "var(--muted)", color: "var(--foreground)", borderBottomLeftRadius: 4 }}
                >
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Emoji / GIF pickers */}
      {showEmoji && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />}
      {showGif && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />}

      {/* Input bar */}
      {iBlockedThem ? (
        <div className="px-4 py-4 border-t border-border glass-strong flex-shrink-0 text-center">
          <div className="text-sm font-bold text-foreground mb-1">You blocked this account</div>
          <div className="text-xs text-muted-foreground">Unblock them from their profile to send messages.</div>
        </div>
      ) : (
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border glass-strong flex-shrink-0">
        <button onClick={() => { setShowEmoji(v => !v); setShowGif(false); }} className="p-1.5">
          <Smile size={20} className="text-muted-foreground" />
        </button>
        <button onClick={() => { setShowGif(v => !v); setShowEmoji(false); }} className="px-2 py-1 rounded-lg text-xs font-bold text-muted-foreground border border-border">
          GIF
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Message…"
          className="flex-1 bg-muted rounded-2xl px-4 py-2 text-sm text-foreground outline-none"
        />
        {text.trim() ? (
          <button onClick={() => sendMessage()} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: accentColor }}>
            <Send size={16} color="#fff" />
          </button>
        ) : (
          <button
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: recording ? "#e91e8c" : accentColor }}
          >
            {recording ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
          </button>
        )}
      </div>
      )}
    </div>
  );
}