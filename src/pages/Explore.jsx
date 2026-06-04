import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN } from "@/lib/utils";
import { TRENDING_TAGS } from "@/lib/constants";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

export default function Explore() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Post.list("-views_count", 50)
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = query
    ? posts.filter(p =>
        p.username?.toLowerCase().includes(query.toLowerCase()) ||
        p.caption?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.toLowerCase().includes(query.toLowerCase())
      )
    : posts;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search loops, people, tags..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {!query && (
          <div className="px-4 py-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Trending Tags</div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: accentColor }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {filtered.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/creator/${post.username}`)}
                className="aspect-square relative cursor-pointer overflow-hidden"
                style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}
              >
                {post.video_url ? (
                  <video src={post.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
                )}
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                  <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}