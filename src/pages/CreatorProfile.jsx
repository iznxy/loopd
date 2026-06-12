import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle } from "lucide-react";
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

export default function CreatorProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setCurrentUser(me);
      const allUsers = await base44.entities.User.list("full_name", 100);
      const found = allUsers.find(u =>
        u.email?.split("@")[0] === username || u.id === username
      );
      if (!found) { setLoading(false); return; }
      setCreator(found);
      const [creatorPosts, followerList, followingList, myFollow] = await Promise.all([
        base44.entities.Post.filter({ user_id: found.id, is_draft: false }, "-created_date", 30),
        base44.entities.Follow.filter({ following_id: found.id }),
        base44.entities.Follow.filter({ follower_id: found.id }),
        base44.entities.Follow.filter({ follower_id: me.id, following_id: found.id }),
      ]);
      setPosts(creatorPosts);
      setFollowers(followerList.length);
      setFollowing(followingList.length);
      setIsFollowing(myFollow.length > 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username]);

  async function toggleFollow() {
    if (!currentUser || !creator) return;
    if (isFollowing) {
      const follows = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: creator.id });
      if (follows.length > 0) await base44.entities.Follow.delete(follows[0].id);
      setIsFollowing(false);
      setFollowers(f => Math.max(0, f - 1));
    } else {
      await base44.entities.Follow.create({
        follower_id: currentUser.id,
        follower_username: currentUser.email?.split("@")[0],
        following_id: creator.id,
        following_username: creator.email?.split("@")[0],
      });
      await base44.entities.Notification.create({
        user_id: creator.id,
        from_user_id: currentUser.id,
        from_username: currentUser.email?.split("@")[0],
        type: "follow",
      });
      setIsFollowing(true);
      setFollowers(f => f + 1);
    }
  }

  function startChat() {
    if (!currentUser || !creator) return;
    const ids = [currentUser.id, creator.id].sort();
    navigate(`/chat/${ids.join("_")}`);
  }

  const creatorName = creator?.full_name || creator?.email?.split("@")[0] || username;
  const avColor = getAvColor(creatorName);
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const isMe = currentUser?.id === creator?.id;

  return (
    <div className="flex flex-col h-screen bg-background overflow-y-auto hide-scrollbar">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="flex-1 text-base font-bold text-foreground">@{username}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : !creator ? (
        <div className="text-center py-16 text-muted-foreground">User not found</div>
      ) : (
        <>
          {/* Profile header */}
          <div className="px-4 pt-5 pb-4 flex flex-col items-center flex-shrink-0">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden mb-3"
              style={{ background: avColor.bg, color: avColor.text }}>
              {creator.avatar_url
                ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(creatorName)}
            </div>
            <div className="text-base font-bold text-foreground mb-0.5">{creatorName}</div>
            <div className="text-sm text-muted-foreground mb-3">@{creator.email?.split("@")[0]}</div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              {[
                { label: "Loops", value: fmtN(posts.length) },
                { label: "Followers", value: fmtN(followers) },
                { label: "Following", value: fmtN(following) },
                { label: "Likes", value: fmtN(totalLikes) },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-base font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            {!isMe && (
              <div className="flex gap-2 w-full">
                <button
                  onClick={toggleFollow}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={isFollowing
                    ? { border: "1.5px solid var(--border)", color: "var(--foreground)", background: "transparent" }
                    : { background: accentColor, color: "#fff" }
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={startChat}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground"
                >
                  <MessageCircle size={15} /> Message
                </button>
              </div>
            )}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map(post => (
              <div key={post.id} className="aspect-[9/16] relative overflow-hidden cursor-pointer"
                style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}>
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
        </>
      )}
    </div>
  );
}