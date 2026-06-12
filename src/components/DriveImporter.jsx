import React, { useState } from "react";
import { X, HardDrive, RefreshCw, Plus, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";

export default function DriveImporter({ onImport, onClose }) {
  const { accentColor } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  async function loadVideos() {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("driveVideos", {});
      setFiles(res.data.files || []);
      setLoaded(true);
    } catch (e) {
      setError("Could not load Drive videos. Please try again.");
    }
    setLoading(false);
  }

  function toggle(fileId) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(fileId) ? next.delete(fileId) : next.add(fileId);
      return next;
    });
  }

  function handleImport() {
    const chosen = files.filter(f => selected.has(f.id));
    onImport(chosen);
    onClose();
  }

  function formatSize(bytes) {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(1)} MB`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl overflow-hidden animate-slide-up"
        style={{ maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor + "20" }}>
              <HardDrive size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Import from Google Drive</div>
              <div className="text-[11px] text-muted-foreground">Select video clips to add to the archive</div>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: "calc(80vh - 140px)" }}>
          {!loaded ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <HardDrive size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center px-6">Browse video files from your connected Google Drive account.</p>
              <button
                onClick={loadVideos}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
                style={{ background: accentColor }}
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <HardDrive size={14} />}
                {loading ? "Loading…" : "Browse Drive"}
              </button>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive px-6">{error}</div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No video files found in your Drive.</div>
          ) : (
            <div className="divide-y divide-border">
              {files.map(file => {
                const isSelected = selected.has(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggle(file.id)}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer active:bg-muted/50 transition-colors"
                    style={{ background: isSelected ? accentColor + "0a" : undefined }}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {file.thumbnailLink
                        ? <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{file.name}</div>
                      <div className="text-[11px] text-muted-foreground">{formatSize(parseInt(file.size))}</div>
                    </div>
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: isSelected ? accentColor : "var(--border)",
                        background: isSelected ? accentColor : "transparent",
                      }}
                    >
                      {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {loaded && files.length > 0 && (
          <div className="px-5 py-4 border-t border-border flex items-center gap-3">
            <button
              onClick={loadVideos}
              disabled={loading}
              className="p-2 rounded-full bg-muted"
            >
              <RefreshCw size={15} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-white text-sm font-bold transition-opacity"
              style={{ background: accentColor, opacity: selected.size === 0 ? 0.4 : 1 }}
            >
              <Plus size={15} />
              Import {selected.size > 0 ? `${selected.size} clip${selected.size > 1 ? "s" : ""}` : "Selected"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}