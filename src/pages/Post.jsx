import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { BG_CLASSES, EMOJIS } from "@/lib/constants";
import { FilterPicker } from "@/components/VideoFilters";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

export default function Post() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentColor } = useTheme();
  const videoUrl = location.state?.video_url || "";
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [bgClass, setBgClass] = useState("bg1");
  const [isAdult, setIsAdult] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [visibility, setVisibility] = useState("public");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [loading, setLoading] = useState(false);

  async function publish() {
    setLoading(true);
    const user = await base44.auth.me();
    const username = user?.username || user?.email?.split("@")[0] || "anonymous";
    await base44.entities.Post.create({
      user_id: user?.id || "",
      username,
      display_name: user?.full_name || username,
      caption,
      tags,
      emoji,
      bg_class: bgClass,
      filter: selectedFilter,
      video_url: videoUrl,
      is_adult: isAdult,
      allow_comments: allowComments,
      allow_downloads: allowDownloads,
      visibility,
      is_draft: false,
      likes_count: 0,
      views_count: 0,
      comments_count: 0,
      reloops_count: 0,
    });
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-y-auto hide-scrollbar">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border bg-card sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">New Loop</span>
        <button
          onClick={publish}
          disabled={loading}
          className="px-4 py-2 rounded-full text-white text-sm font-bold"
          style={{ background: accentColor }}
        >
          {loading ? "…" : "Post"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden max-w-xs mx-auto" style={{ background: BG_MAP[bgClass] }}>
          {videoUrl ? (
            <video src={videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">{emoji}</div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Caption</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's this loop about?"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none h-20"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Tags</label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="#funny #viral #loopd"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none"
          />
        </div>

        {/* Emoji picker (if no video) */}
        {!videoUrl && (
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-full text-xl border-2 ${emoji === e ? "border-current" : "border-border"}`} style={{ borderColor: emoji === e ? accentColor : undefined }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {/* BG picker */}
        {!videoUrl && (
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Background</label>
            <div className="flex gap-2">
              {BG_CLASSES.map(bg => (
                <button key={bg} onClick={() => setBgClass(bg)} className={`w-10 h-10 rounded-full border-4 ${bgClass === bg ? "border-current" : "border-transparent"}`} style={{ background: BG_MAP[bg], borderColor: bgClass === bg ? accentColor : undefined }} />
              ))}
            </div>
          </div>
        )}

        {/* Visibility */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Who can see this?</label>
          <div className="flex gap-2">
            {[
              { v: "public", label: "🌍 Public" },
              { v: "friends", label: "👥 Friends" },
              { v: "private", label: "🔒 Private" },
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setVisibility(opt.v)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                style={{
                  borderColor: visibility === opt.v ? accentColor : "var(--border)",
                  background: visibility === opt.v ? accentColor + "15" : "var(--card)",
                  color: visibility === opt.v ? accentColor : "var(--foreground)",
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Filter picker */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">✨ Nostalgic Filter</label>
          <FilterPicker selected={selectedFilter} onChange={setSelectedFilter} />
        </div>

        {/* Toggles */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {[
            { label: "Allow Comments", value: allowComments, set: setAllowComments },
            { label: "Allow Downloads", value: allowDownloads, set: setAllowDownloads },
            { label: "18+ Content", value: isAdult, set: setIsAdult },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              <button
                onClick={() => item.set(!item.value)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: item.value ? accentColor : "var(--border)" }}
              >
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: item.value ? "calc(100% - 20px)" : 4 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}