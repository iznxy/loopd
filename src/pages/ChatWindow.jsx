import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Send, Mic, MicOff, Video, Square, Play, Pause } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

export default function ChatWindow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { accentColor } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const otherName = location.state?.otherName || "User";
  const otherId = location.state?.otherId || "";
  const avColor = getAvColor(otherName);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setCurrentUser(u); });
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
      message_type: "text",
      is_read: false,
    });
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        sender_username: currentUser.email?.split("@")[0],
        receiver_id: otherId,
        text: "🎤 Voice message",
        audio_url: file_url,
        message_type: "voice",
        is_read: false,
      });
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
    setRecordingTime(0);
  }

  function startVideoCall() {
    // Open a simple video call using a free service
    const roomId = conversationId.replace(/[^a-z0-9]/gi, "").slice(0, 20);
    window.open(`https://meet.jit.si/loopd-${roomId}`, "_blank");
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border bg-card">
        <button onClick={() => navigate("/messages")}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: avColor.bg, color: avColor.text }}>
          {getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">@{otherName}</div>
        </div>
        <button onClick={startVideoCall} className="p-2 rounded-full active:bg-muted">
          <Video size={20} className="text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-2">
        {messages.map(m => {
          const mine = m.sender_id === currentUser?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                style={mine ? { background: accentColor, color: "#fff" } : { background: "var(--muted)", color: "var(--foreground)" }}
              >
                {m.message_type === "voice" && m.audio_url ? (
                  <VoicePlayer url={m.audio_url} mine={mine} />
                ) : (
                  <span>{m.text}</span>
                )}
                <div className="text-[10px] opacity-60 mt-0.5 text-right">{timeAgo(m.created_date)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card flex-shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {recording ? (
          <>
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-foreground font-semibold">Recording {recordingTime}s</span>
            </div>
            <button onClick={stopRecording} className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: "#ef4444" }}>
              <Square size={14} />
            </button>
          </>
        ) : (
          <>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Message…"
              className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none"
            />
            {text.trim() ? (
              <button onClick={send} className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: accentColor }}>
                <Send size={16} />
              </button>
            ) : (
              <button onClick={startRecording} className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: accentColor }}>
                <Mic size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VoicePlayer({ url, mine }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
      <button onClick={toggle} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: mine ? "rgba(255,255,255,0.25)" : "var(--border)" }}>
        {playing ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <span className="text-xs opacity-80">Voice message</span>
    </div>
  );
}