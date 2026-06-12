import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Hash, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import { TRENDING_TAGS } from "@/lib/constants";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

const TABS = [
  { key: "top", label: "Top", Icon: TrendingUp },
  { key: "users", label: "People", Icon: Users },
  { key: "tags", label: "Tags", Icon: Hash },
];

export default function Explore() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("top");

  useEffect(() => {
    Promise.all([
      base44.entities.Post.list("-views_count", 60),
      base44.entities.User.list("full_name", 30),
    ]).then(([p, u]) => {
      setPosts(p.filter(x => !x.is_draft));
      setUsers(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPosts = query
    ? posts.filter(p =>
        p.username?.toLowerCase().includes(query.toLowerCase()) ||
        p.caption?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.toLowerCase().includes(query.toLowerCase())
      )
    : posts;

  const filteredUsers = query
    ? users.filter(u =>
        u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search loops, people, tags…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={activeTab === key
                ? { background: accentColor, color: "#fff" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Trending tags strip */}
        {!query && activeTab === "top" && (
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp size={11} /> Trending Now
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white flex-shrink-0"
                  style={{ background: accentColor }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeTab === "users" ? (
          <div className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No users found</div>
            ) : filteredUsers.map(u => {
              const uname = u.full_name || u.email?.split("@")[0] || "user";
              const avColor = getAvColor(uname);
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/creator/${u.email?.split("@")[0] || u.id}`)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-muted/50"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm overflow-hidden" style={{ background: avColor.bg, color: avColor.text }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(uname)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{u.full_name || uname}</div>
                    <div className="text-xs text-muted-foreground">@{u.email?.split("@")[0]}</div>
                  </div>
                  <button className="px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: accentColor }}>
                    Follow
                  </button>
                </div>
              );
            })}
          </div>
        ) : activeTab === "tags" ? (
          <div className="px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {TRENDING_TAGS.map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); setActiveTab("top"); }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: `hsl(${(i * 47) % 360}, 65%, 55%)` }}>
                    #
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">#{tag}</div>
                    <div className="text-xs text-muted-foreground">{(i + 1) * 123}K loops</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/creator/${post.username}`)}
                className="aspect-[9/16] relative cursor-pointer overflow-hidden"
                style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}
              >
                {post.video_url ? (
                  <video src={post.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="absolute bottom-1.5 left-1.5">
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