import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit3, Grid3X3, Heart, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import FollowListModal from "@/components/FollowListModal";
import SavedLoopsModal from "@/components/SavedLoopsModal";

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
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

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
        <div className="flex gap-1">
          <button onClick={() => setShowSaved(true)} className="p-2">
            <Bookmark size={20} className="text-foreground" />
          </button>
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
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-foreground">{fmtN(posts.length)}</span>
            <span className="text-xs text-muted-foreground">Loops</span>
          </div>
          <button
            className="flex flex-col items-center active:opacity-70"
            onClick={() => user && setShowFollowers(true)}
          >
            <span className="text-base font-bold text-foreground">{fmtN(followers)}</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </button>
          <button
            className="flex flex-col items-center active:opacity-70"
            onClick={() => user && setShowFollowing(true)}
          >
            <span className="text-base font-bold text-foreground">{fmtN(following)}</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-foreground">{fmtN(totalLikes)}</span>
            <span className="text-xs text-muted-foreground">Likes</span>
          </div>
        </div>
      </div>

      {/* Name + bio */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="text-sm font-bold text-foreground">{username}</div>
        {user?.bio && <div className="text-sm text-muted-foreground mt-0.5">{user.bio}</div>}
        <button
          onClick={() => navigate("/edit-profile")}
          className="mt-2 w-full py-2.5 rounded-xl border border-border text-sm font-bold text-foreground flex items-center justify-center gap-2"
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
            <Icon size={16} /> {label}
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
            <div key={post.id} className="aspect-[9/16] relative cursor-pointer overflow-hidden"
              style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}
              onClick={() => tab === "loops" && navigate(`/edit-post?id=${post.id}`)}>
              {post.video_url
                ? <video src={post.video_url} className="w-full h-full object-cover" muted />
                : <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
              }
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              <div className="absolute bottom-1.5 left-1.5">
                <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
              </div>
              {tab === "loops" && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="text-white text-[9px] bg-black/40 rounded px-1 py-0.5">✏️</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showFollowers && user && (
        <FollowListModal userId={user.id} type="followers" onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && user && (
        <FollowListModal userId={user.id} type="following" onClose={() => setShowFollowing(false)} />
      )}
      {showSaved && <SavedLoopsModal onClose={() => setShowSaved(false)} />}
    </div>
  );
}