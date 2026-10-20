import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, SwitchCamera, Image } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getFilterStyle, FilterPicker } from "@/components/VideoFilters";

const ACID = "#00ff88";

function getSupportedMimeType() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];
  for (const t of types) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch {}
  }
  return "";
}

export default function Record() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [facingMode, setFacingMode] = useState("user");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    clearInterval(timerRef.current);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCamera();
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError(e.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera permissions."
        : "Could not access camera.");
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  function startRecording() {
    if (!streamRef.current || uploading) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    let mr;
    try {
      mr = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    } catch {
      setError("Recording not supported on this device.");
      return;
    }
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
    setError("");
    try {
      const mimeType = chunksRef.current[0]?.type || "video/webm";
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const file = new File([blob], `loop.${ext}`, { type: mimeType });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (!file_url) throw new Error("Upload failed");
      navigate("/post", { state: { video_url: file_url, filter: selectedFilter } });
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  async function handleGalleryUpload(e) {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (!file_url) throw new Error("Upload failed");
      navigate("/post", { state: { video_url: file_url, filter: selectedFilter } });
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline style={getFilterStyle(selectedFilter)} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full" style={{ width: `${progress}%`, background: ACID }} />
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
          <X size={20} color="#fff" />
        </button>
        <div className="text-white text-sm font-bold bg-black/40 px-3 py-1 rounded-full" style={{ fontFamily: "ui-monospace, monospace" }}>6s Loop</div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <Image size={20} color="#fff" />
          </button>
          <button onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")} className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <SwitchCamera size={20} color="#fff" />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleGalleryUpload} />
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
      <div className="absolute bottom-36 left-0 right-0 py-2">
        <FilterPicker selected={selectedFilter} onChange={setSelectedFilter} />
      </div>

      {/* Record button */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center">
        <button
          disabled={uploading}
          onPointerDown={uploading ? undefined : startRecording}
          onPointerUp={recording ? stopRecording : undefined}
          className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
          style={{ background: recording ? ACID : "transparent" }}
        >
          <div className="w-14 h-14 rounded-full bg-white" style={{ transform: recording ? "scale(0.6)" : "scale(1)", transition: "transform 0.2s" }} />
        </button>
      </div>
    </div>
  );
}