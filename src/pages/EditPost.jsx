import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";

export default function EditPost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("id");
  const { accentColor } = useTheme();

  const [post, setPost] = useState(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!postId) { navigate(-1); return; }
    base44.entities.Post.filter({ id: postId }).then(([p]) => {
      if (!p) { navigate(-1); return; }
      setPost(p);
      setCaption(p.caption || "");
      setTags(p.tags || "");
      setVisibility(p.visibility || "public");
      setAllowComments(p.allow_comments !== false);
      setAllowDownloads(p.allow_downloads !== false);
      setLoading(false);
    }).catch(() => navigate(-1));
  }, [postId]);

  async function save() {
    setSaving(true);
    await base44.entities.Post.update(postId, { caption, tags, visibility, allow_comments: allowComments, allow_downloads: allowDownloads });
    navigate(-1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border bg-card sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">Edit Loop</span>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-bold"
          style={{ background: accentColor }}
        >
          <Save size={14} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-5">
        {/* Preview thumbnail */}
        <div className="w-24 h-40 rounded-xl overflow-hidden mx-auto border border-border">
          {post.video_url
            ? <video src={post.video_url} className="w-full h-full object-cover" muted />
            : <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">{post.emoji || "🎬"}</div>
          }
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

        {/* Visibility */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">Who can see this?</label>
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

        {/* Toggles */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {[
            { label: "Allow Comments", value: allowComments, set: setAllowComments },
            { label: "Allow Downloads", value: allowDownloads, set: setAllowDownloads },
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