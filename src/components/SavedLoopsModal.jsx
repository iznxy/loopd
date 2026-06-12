import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtN } from "@/lib/utils";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

export default function SavedLoopsModal({ onClose }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async user => {
      const saves = await base44.entities.SavedLoop.filter({ user_id: user.id }, "-created_date", 50);
      if (saves.length === 0) { setLoading(false); return; }
      const postIds = saves.map(s => s.post_id);
      const allPosts = await base44.entities.Post.list("-created_date", 100);
      setSaved(allPosts.filter(p => postIds.includes(p.id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl flex flex-col" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
          <span className="text-sm font-bold text-foreground">Saved Loops</span>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No saved loops yet</div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {saved.map(post => (
                <div key={post.id} className="aspect-[9/16] relative overflow-hidden"
                  style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}>
                  {post.video_url
                    ? <video src={post.video_url} className="w-full h-full object-cover" muted />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
                  }
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}