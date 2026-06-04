import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Grid3x3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

export default function Profile() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setUser(u);
      const uname = u.username || u.email?.split("@")[0];
      base44.entities.Post.filter({ username: uname, is_draft: false }, "-created_date", 30).then(setPosts);
      base44.entities.Follow.filter({ following_id: u.id }).then(r => setFollowers(r.length));
      base44.entities.Follow.filter({ follower_id: u.id }).then(r => setFollowing(r.length));
    });
  }, []);

  const username = user?.username || user?.email?.split("@")[0] || "you";
  const displayName = user?.full_name || username;
  const avColor = getAvColor(username);
  const totalViews = posts.reduce((s, p) => s + (p.views_count || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-base font-bold text-foreground">@{username}</span>
        <button onClick={() => navigate("/settings")} className="p-1">
          <Settings size={22} className="text-foreground" />
        </button>
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 border-4" style={{ background: avColor.bg, color: avColor.text, borderColor: accentColor }}>
          {getInitials(displayName)}
        </div>
        <div className="text-lg font-bold text-foreground">{displayName}</div>
        <div className="text-sm text-muted-foreground mb-1">@{username}</div>
        {user?.bio && <div className="text-sm text-foreground mb-2">{user.bio}</div>}

        {/* Stats */}
        <div className="flex gap-6 my-3">
          {[
            { label: "Loops", value: fmtN(posts.length) },
            { label: "Followers", value: fmtN(followers) },
            { label: "Following", value: fmtN(following) },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={() => navigate("/settings")}
            className="flex-1 py-2 rounded-full border border-border text-sm font-semibold text-foreground"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="flex-1 py-2 rounded-full text-white text-sm font-semibold"
            style={{ background: accentColor }}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Posts grid */}
      <div className="px-0.5">
        {posts.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Grid3x3 size={40} className="text-muted-foreground" />
            <div className="text-sm text-muted-foreground">No loops yet</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map(p => (
              <div
                key={p.id}
                className="aspect-square relative overflow-hidden"
                style={{ background: BG_MAP[p.bg_class] || BG_MAP.bg1 }}
              >
                {p.video_url ? (
                  <video src={p.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{p.emoji || "🎬"}</div>
                )}
                <div className="absolute bottom-1 left-1">
                  <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(p.views_count || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}