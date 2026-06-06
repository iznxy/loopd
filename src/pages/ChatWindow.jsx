import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Send, Mic, Video, Square, Play, Pause, PhoneOff } from "lucide-react";
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
  const [showCallUI, setShowCallUI] = useState(false);
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
    setShowCallUI(true);
  }

  function openJitsi() {
    const roomId = conversationId.replace(/[^a-z0-9]/gi, "").slice(0, 20);
    window.open(`https://meet.jit.si/loopd-${roomId}`, "_blank");
  }

  return (
    <div className="relative flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border bg-card">
        <button onClick={() => navigate("/messages")}><ChevronLeft size={22} className="text-foreground" /></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: avColor.bg, color: avColor.text }}>
          {getInitials(otherName)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">@{otherName}</div>
        </div>
        <button onClick={startVideoCall} className="p-2 rounded-full active:bg-muted" title="Start video call">
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

      {/* Video Call UI */}
      {showCallUI && (
        <VideoCallOverlay
          otherName={otherName}
          avColor={avColor}
          accentColor={accentColor}
          onJoin={openJitsi}
          onClose={() => setShowCallUI(false)}
        />
      )}

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

function VideoCallOverlay({ otherName, avColor, accentColor, onJoin, onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm">
      {/* Animated ring */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full animate-ping absolute inset-0 opacity-20" style={{ background: accentColor }} />
        <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl relative z-10 border-4" style={{ background: avColor.bg, color: avColor.text, borderColor: accentColor }}>
          {getInitials(otherName)}
        </div>
      </div>

      <div className="text-white text-xl font-bold mb-1">@{otherName}</div>
      <div className="text-white/50 text-sm mb-10">Starting video call…</div>

      {/* Info card */}
      <div className="bg-white/10 rounded-2xl px-6 py-4 mb-10 text-center max-w-xs">
        <div className="text-white text-sm font-semibold mb-1">🎥 Video call via Jitsi Meet</div>
        <div className="text-white/60 text-xs">Tap "Join Call" to open a secure video room. Share the same link with @{otherName} to connect.</div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
        >
          <PhoneOff size={22} color="#fff" />
        </button>
        <button
          onClick={() => { onJoin(); onClose(); }}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: accentColor }}
        >
          <Video size={22} color="#fff" />
        </button>
      </div>
      <div className="flex gap-6 mt-3 text-xs text-white/40">
        <span>Decline</span>
        <span style={{ marginLeft: 28 }}>Join Call</span>
      </div>
    </div>
  );
}

function VoicePlayer({ url, mine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
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

  function onTimeUpdate() {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(cur);
    setProgress(dur > 0 ? cur / dur : 0);
  }

  function onLoadedMetadata() {
    setDuration(audioRef.current?.duration || 0);
  }

  function onEnded() {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }

  function seek(e) {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
  }

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const btnBg = mine ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)";
  const trackBg = mine ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
  const fillBg = mine ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.4)";

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        className="hidden"
      />

      {/* Play/Pause button */}
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: btnBg }}
      >
        {playing ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
      </button>

      {/* Waveform bars + scrubber */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Fake waveform bars (decorative) + clickable progress track */}
        <div
          className="relative h-7 flex items-center gap-[2px] cursor-pointer"
          onClick={seek}
        >
          {/* Bars */}
          {[4,7,5,9,6,8,4,7,5,9,6,8,4,7,5,9,6,8,4,7].map((h, i) => {
            const barFilled = (i / 20) < progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${h * 2.5}px`,
                  background: barFilled ? fillBg : trackBg,
                  minWidth: 2,
                }}
              />
            );
          })}
        </div>

        {/* Time */}
        <div className="flex justify-between text-[10px] opacity-60 leading-none px-0.5">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Mic icon badge */}
      <div className="flex-shrink-0 opacity-50">
        <Mic size={12} />
      </div>
    </div>
  );
}