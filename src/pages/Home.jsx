import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import CommentsPanel from "@/components/CommentsPanel";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

function PostCard({ post, currentUser, accentColor, onLike, onComment }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    base44.entities.Like.filter({ post_id: post.id, user_id: currentUser.id })
      .then(likes => setLiked(likes.length > 0))
      .catch(() => {});
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
    if (liked) {
      const likes = await base44.entities.Like.filter({ post_id: post.id, user_id: currentUser.id });
      if (likes.length > 0) await base44.entities.Like.delete(likes[0].id);
      setLiked(false);
      setLikesCount(c => Math.max(0, c - 1));
      await base44.entities.Post.update(post.id, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
    } else {
      await base44.entities.Like.create({ post_id: post.id, user_id: currentUser.id, username: currentUser.email?.split("@")[0] });
      setLiked(true);
      setLikesCount(c => c + 1);
      await base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 });
    }
  }

  function handleDoubleTap() {
    if (!liked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  }

  const username = post.username || post.display_name || "user";
  const avColor = getAvColor(username);

  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
      onDoubleClick={handleDoubleTap}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}>
        {post.video_url
          ? <video ref={videoRef} src={post.video_url} className="w-full h-full object-cover" loop muted={muted} playsInline />
          : <div className="w-full h-full flex items-center justify-center text-8xl">{post.emoji || "🎬"}</div>
        }
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Double-tap heart */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart size={80} fill="#fff" color="#fff" className="opacity-90 animate-ping" />
        </div>
      )}

      {/* Mute toggle */}
      {post.video_url && (
        <button
          className="absolute top-4 right-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center z-10"
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        >
          {muted ? <VolumeX size={14} color="#fff" /> : <Volume2 size={14} color="#fff" />}
        </button>
      )}

      {/* Right action bar */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        <button onClick={e => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1">
          <Heart size={26} fill={liked ? "#e91e8c" : "none"} color={liked ? "#e91e8c" : "#fff"} strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{fmtN(likesCount)}</span>
        </button>
        <button onClick={e => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-1">
          <MessageCircle size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{fmtN(post.comments_count || 0)}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Save</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Share</span>
        </button>

        {/* Spinning disc avatar */}
        <div
          className="w-11 h-11 rounded-full border-2 border-white overflow-hidden flex items-center justify-center font-bold text-sm cursor-pointer"
          style={{ background: avColor.bg, color: avColor.text, animation: "spin 4s linear infinite" }}
          onClick={e => { e.stopPropagation(); navigate(`/creator/${username}`); }}
        >
          {getInitials(username)}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-16 z-10">
        <div
          className="font-bold text-white text-sm mb-1 cursor-pointer"
          onClick={e => { e.stopPropagation(); navigate(`/creator/${username}`); }}
        >
          @{username}
        </div>
        {post.caption && <p className="text-white text-sm leading-snug mb-1 line-clamp-2">{post.caption}</p>}
        {post.music && (
          <div className="flex items-center gap-1.5">
            <Music2 size={12} color="#fff" />
            <span className="text-white text-xs opacity-80">{post.music}</span>
          </div>
        )}
      </div>

      {showComments && (
        <CommentsPanel post={post} onClose={() => setShowComments(false)} currentUser={currentUser} />
      )}
    </div>
  );
}

export default function Home() {
  const { accentColor } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("foryou");

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Post.filter({ is_draft: false }, "-created_date", 20),
    ]).then(([user, data]) => {
      setCurrentUser(user);
      setPosts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-6 pt-3 pb-2 pointer-events-none">
        {["foryou", "following"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pointer-events-auto text-sm font-bold transition-all"
            style={{
              color: tab === t ? "#fff" : "rgba(255,255,255,0.5)",
              borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            {t === "foryou" ? "For You" : "Following"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
          <div className="text-4xl">🎬</div>
          <div className="text-lg font-bold">No loops yet</div>
          <div className="text-sm opacity-60">Be the first to post!</div>
        </div>
      ) : (
        <div
          className="w-full h-full overflow-y-scroll hide-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              accentColor={accentColor}
              onComment={() => {}}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}