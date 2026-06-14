import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Volume2, VolumeX, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import CommentsPanel from "@/components/CommentsPanel";
import ShareSheet from "@/components/ShareSheet";
import { getFilterStyle } from "@/components/VideoFilters";
import SkeletonPost from "@/components/SkeletonPost";
import StoriesRow from "@/components/StoriesRow";
import { haptic } from "@/lib/haptics";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

function PostCard({ post, currentUser, accentColor, onSaveChange }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      base44.entities.Like.filter({ post_id: post.id, user_id: currentUser.id }),
      base44.entities.SavedLoop.filter({ post_id: post.id, user_id: currentUser.id }),
    ]).then(([likes, saves]) => {
      setLiked(likes.length > 0);
      setSaved(saves.length > 0);
    }).catch(() => {});
  }, [post.id, currentUser]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? video.play().catch(() => {}) : video.pause(); },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  async function handleLike() {
    if (!currentUser) return;
    haptic("light");
    if (liked) {
      setLiked(false);
      setLikesCount(c => Math.max(0, c - 1));
      const likes = await base44.entities.Like.filter({ post_id: post.id, user_id: currentUser.id });
      if (likes.length > 0) await base44.entities.Like.delete(likes[0].id);
      await base44.entities.Post.update(post.id, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
    } else {
      setLiked(true);
      setLikesCount(c => c + 1);
      haptic("success");
      await base44.entities.Like.create({ post_id: post.id, user_id: currentUser.id, username: currentUser.email?.split("@")[0] });
      await base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 });
      if (post.user_id && post.user_id !== currentUser.id) {
        base44.entities.Notification.create({
          user_id: post.user_id,
          from_user_id: currentUser.id,
          from_username: currentUser.email?.split("@")[0],
          type: "like",
          post_id: post.id,
        }).catch(() => {});
      }
    }
  }

  async function handleSave() {
    if (!currentUser) return;
    haptic("medium");
    if (saved) {
      setSaved(false);
      const saves = await base44.entities.SavedLoop.filter({ post_id: post.id, user_id: currentUser.id });
      if (saves.length > 0) await base44.entities.SavedLoop.delete(saves[0].id);
    } else {
      setSaved(true);
      await base44.entities.SavedLoop.create({ post_id: post.id, user_id: currentUser.id });
    }
    onSaveChange?.();
  }

  async function handleDownload() {
    if (!post.allow_downloads) {
      alert("This creator has disabled downloads for this loop.");
      return;
    }
    if (!post.video_url) return;
    const a = document.createElement("a");
    a.href = post.video_url;
    a.download = `loop_${post.id}.mp4`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDoubleTap() {
    if (!liked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  }

  const username = post.username || post.display_name || "user";
  const avColor = getAvColor(username);
  const filterStyle = getFilterStyle(post.filter || "none");

  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
      onDoubleClick={handleDoubleTap}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}>
        {post.video_url
          ? <video
              ref={videoRef}
              src={post.video_url}
              className="w-full h-full object-cover"
              loop muted={muted} playsInline
              style={filterStyle}
            />
          : <div className="w-full h-full flex items-center justify-center text-8xl" style={filterStyle}>
              {post.emoji || "🎬"}
            </div>
        }
      </div>

      {/* Film grain overlay for vintage feel */}
      {(post.filter === "vintage" || post.filter === "film" || post.filter === "retro") && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "150px" }} />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

      {/* Double-tap heart burst */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div style={{ animation: "heartBurst 0.9s ease forwards" }}>
            <Heart size={90} fill="#e91e8c" color="#e91e8c" />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      {post.video_url && (
        <button
          className="absolute top-14 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center z-10 backdrop-blur-sm"
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        >
          {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
        </button>
      )}

      {/* Right action bar */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <button onClick={e => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1">
          <div style={{ animation: liked ? "likePop 0.3s ease" : "none" }}>
            <Heart size={28} fill={liked ? "#e91e8c" : "none"} color={liked ? "#e91e8c" : "#fff"} strokeWidth={2} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow">{fmtN(likesCount)}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-1">
          <MessageCircle size={28} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{fmtN(post.comments_count || 0)}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); handleSave(); }} className="flex flex-col items-center gap-1">
          <Bookmark
            size={28}
            fill={saved ? "#fff" : "none"}
            color="#fff"
            strokeWidth={2}
            style={{ animation: saved ? "savePop 0.3s ease" : "none" }}
          />
          <span className="text-white text-xs font-bold drop-shadow">{saved ? "Saved" : "Save"}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); setShowShare(true); }} className="flex flex-col items-center gap-1">
          <Share2 size={28} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Share</span>
        </button>

        {post.allow_downloads && post.video_url && (
          <button onClick={e => { e.stopPropagation(); handleDownload(); }} className="flex flex-col items-center gap-1">
            <Download size={24} color="#fff" strokeWidth={2} />
            <span className="text-white text-xs font-bold drop-shadow">Save</span>
          </button>
        )}

        {/* Spinning disc avatar */}
        <div
          className="w-12 h-12 rounded-full border-2 border-white overflow-hidden flex items-center justify-center font-bold text-sm cursor-pointer"
          style={{ background: avColor.bg, color: avColor.text, animation: "vinylSpin 3s linear infinite" }}
          onClick={e => { e.stopPropagation(); navigate(`/creator/${username}`); }}
        >
          {getInitials(username)}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-20 z-10">
        <div
          className="font-bold text-white text-sm mb-1 cursor-pointer drop-shadow-md"
          onClick={e => { e.stopPropagation(); navigate(`/creator/${username}`); }}
        >
          @{username}
        </div>
        {post.caption && (
          <p className="text-white text-sm leading-snug mb-1.5 line-clamp-2 drop-shadow">{post.caption}</p>
        )}
        {post.music && (
          <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm w-fit">
            <Music2 size={11} color="#fff" className="animate-pulse" />
            <span className="text-white text-xs">{post.music}</span>
          </div>
        )}
        {post.filter && post.filter !== "none" && (
          <div className="mt-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm w-fit">
            <span className="text-white/70 text-[10px]">✦ {post.filter}</span>
          </div>
        )}
      </div>

      {showComments && (
        <CommentsPanel post={post} onClose={() => setShowComments(false)} currentUser={currentUser} />
      )}
      {showShare && (
        <ShareSheet post={post} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

export default function Home() {
  const { accentColor } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("foryou");
  const [followingIds, setFollowingIds] = useState(new Set());
  const feedRef = useRef(null);
  const pullStartY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);

  async function loadPosts() {
    const data = await base44.entities.Post.filter({ is_draft: false }, "-created_date", 30);
    setPosts(data);
    return data;
  }

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Post.filter({ is_draft: false }, "-created_date", 30)])
      .then(async ([user, data]) => {
        setCurrentUser(user);
        setPosts(data);
        if (user) {
          const follows = await base44.entities.Follow.filter({ follower_id: user.id });
          setFollowingIds(new Set(follows.map(f => f.following_id)));
        }
        setLoading(false);
      }).catch(() => setLoading(false));

    // Real-time updates
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.type === "create" && event.data && !event.data.is_draft) {
        setPosts(prev => [event.data, ...prev]);
      } else if (event.type === "update" && event.data) {
        setPosts(prev => prev.map(p => p.id === event.data.id ? { ...p, ...event.data } : p));
      } else if (event.type === "delete") {
        setPosts(prev => prev.filter(p => p.id !== event.id));
      }
    });
    return unsub;
  }, []);

  // Pull to refresh
  function onTouchStart(e) {
    if (feedRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }

  function onTouchMove(e) {
    if (pullStartY.current === null) return;
    const dist = e.touches[0].clientY - pullStartY.current;
    if (dist > 0 && dist < 100) setPullDistance(dist);
  }

  async function onTouchEnd() {
    if (pullDistance > 60) {
      setRefreshing(true);
      setPullDistance(0);
      pullStartY.current = null;
      await loadPosts();
      setRefreshing(false);
    } else {
      setPullDistance(0);
      pullStartY.current = null;
    }
  }

  const displayPosts = tab === "following"
    ? posts.filter(p => followingIds.has(p.user_id))
    : posts;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center transition-all"
          style={{ height: refreshing ? 48 : pullDistance * 0.6, overflow: "hidden" }}
        >
          <div className={`w-6 h-6 border-3 border-white/40 border-t-white rounded-full ${refreshing ? "animate-spin" : ""}`}
            style={{ borderWidth: 3, transform: `rotate(${pullDistance * 3}deg)` }} />
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-6 pt-3 pb-2 pointer-events-none">
        {["foryou", "following"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pointer-events-auto text-sm font-bold transition-all"
            style={{
              color: tab === t ? "#fff" : "rgba(255,255,255,0.45)",
              borderBottom: tab === t ? "2.5px solid #fff" : "2.5px solid transparent",
              paddingBottom: 2,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {t === "foryou" ? "For You" : "Following"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="w-full h-full overflow-hidden">
          <SkeletonPost />
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
          <div className="text-5xl" style={{ animation: "float 2s ease-in-out infinite" }}>🎬</div>
          <div className="text-lg font-bold">No loops yet</div>
          <div className="text-sm opacity-60">Be the first to post!</div>
        </div>
      ) : (
        <>
          <StoriesRow currentUser={currentUser} />
          <div
            ref={feedRef}
            className="w-full h-full overflow-y-scroll hide-scrollbar"
            style={{ scrollSnapType: "y mandatory" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {displayPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                accentColor={accentColor}
              />
            ))}
            {tab === "following" && displayPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
                <div className="text-5xl">👥</div>
                <div className="text-lg font-bold">No loops from people you follow</div>
                <div className="text-sm opacity-60">Follow more creators to see their loops here</div>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes heartBurst {
          0% { transform: scale(0.3); opacity: 1; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        @keyframes likePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        @keyframes savePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}