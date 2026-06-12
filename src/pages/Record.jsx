import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, SwitchCamera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { VIDEO_FILTERS, getFilterStyle } from "@/components/VideoFilters";

export default function Record() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [facingMode, setFacingMode] = useState("user");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  async function startCamera() {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
  }

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = handleUpload;
    mr.start(100);
    mediaRecorderRef.current = mr;
    setRecording(true);
    setProgress(0);
    let t = 0;
    timerRef.current = setInterval(() => {
      t += 100;
      setProgress(Math.min((t / 6000) * 100, 100));
      if (t >= 6000) stopRecording();
    }, 100);
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function handleUpload() {
    setUploading(true);
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const file = new File([blob], "loop.webm", { type: "video/webm" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    navigate("/post", { state: { video_url: file_url, filter: selectedFilter } });
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline style={getFilterStyle(selectedFilter)} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full transition-none bg-white" style={{ width: `${progress}%`, background: accentColor }} />
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
          <X size={20} color="#fff" />
        </button>
        <div className="text-white text-sm font-bold bg-black/40 px-3 py-1 rounded-full">6s Loop</div>
        <button onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
          <SwitchCamera size={20} color="#fff" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white text-sm rounded-xl p-3 text-center">{error}</div>
      )}

      {/* Uploading overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <div className="text-white font-bold">Uploading your loop…</div>
        </div>
      )}

      {/* Filter strip */}
      <div className="absolute bottom-36 left-0 right-0 flex gap-3 px-4 overflow-x-auto hide-scrollbar py-2">
        {VIDEO_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className="w-14 h-14 rounded-xl overflow-hidden border-2 transition-all"
              style={{
                borderColor: selectedFilter === f.id ? "#fff" : "rgba(255,255,255,0.2)",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-xl" style={f.style}>🎬</div>
            </div>
            <span className="text-white text-[9px] font-semibold drop-shadow">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Record button */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center">
        <button
          onPointerDown={startRecording}
          onPointerUp={recording ? stopRecording : undefined}
          className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
          style={{ background: recording ? accentColor : "transparent" }}
        >
          <div className="w-14 h-14 rounded-full bg-white" style={{ transform: recording ? "scale(0.6)" : "scale(1)", transition: "transform 0.2s" }} />
        </button>
      </div>
    </div>
  );
}