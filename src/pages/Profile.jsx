import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit3, Grid3X3, Heart } from "lucide-react";
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
  const [likedPosts, setLikedPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [tab, setTab] = useState("loops");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [myPosts, followerList, followingList, likes] = await Promise.all([
        base44.entities.Post.filter({ user_id: u.id, is_draft: false }, "-created_date", 50),
        base44.entities.Follow.filter({ following_id: u.id }),
        base44.entities.Follow.filter({ follower_id: u.id }),
        base44.entities.Like.filter({ user_id: u.id }, "-created_date", 50),
      ]);
      setPosts(myPosts);
      setFollowers(followerList.length);
      setFollowing(followingList.length);
      if (likes.length > 0) {
        const likedPostIds = likes.map(l => l.post_id);
        const allPosts = await base44.entities.Post.list("-created_date", 100);
        setLikedPosts(allPosts.filter(p => likedPostIds.includes(p.id)));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const username = user?.full_name || user?.email?.split("@")[0] || "User";
  const avColor = getAvColor(username);

  const displayPosts = tab === "loops" ? posts : likedPosts;

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div className="text-lg font-bold text-foreground">@{user?.email?.split("@")[0] || "profile"}</div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/settings")} className="p-2">
            <Settings size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Avatar + stats */}
      <div className="flex items-center gap-4 px-4 py-3 flex-shrink-0">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden flex-shrink-0"
          style={{ background: avColor.bg, color: avColor.text }}>
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : getInitials(username)}
        </div>
        <div className="flex gap-5">
          {[
            { label: "Loops", value: fmtN(posts.length) },
            { label: "Followers", value: fmtN(followers) },
            { label: "Following", value: fmtN(following) },
            { label: "Likes", value: fmtN(totalLikes) },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-base font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Name + bio */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="text-sm font-bold text-foreground">{username}</div>
        {user?.bio && <div className="text-sm text-muted-foreground mt-0.5">{user.bio}</div>}
        <button
          onClick={() => navigate("/edit-profile")}
          className="mt-2 w-full py-2 rounded-xl border border-border text-sm font-bold text-foreground flex items-center justify-center gap-2"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {[
          { key: "loops", icon: Grid3X3, label: "Loops" },
          { key: "liked", icon: Heart, label: "Liked" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold border-b-2 transition-colors"
            style={{
              borderColor: tab === key ? accentColor : "transparent",
              color: tab === key ? accentColor : "var(--muted-foreground)",
            }}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <div className="text-3xl">{tab === "loops" ? "🎬" : "❤️"}</div>
          <span>{tab === "loops" ? "No loops yet" : "No liked loops yet"}</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {displayPosts.map(post => (
            <div
              key={post.id}
              className="aspect-[9/16] relative cursor-pointer overflow-hidden"
              style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}
            >
              {post.video_url
                ? <video src={post.video_url} className="w-full h-full object-cover" muted />
                : <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
              }
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              <div className="absolute bottom-1.5 left-1.5">
                <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}