import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Volume2, VolumeX, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { fmtN } from "@/lib/utils";
import CommentsPanel from "@/components/CommentsPanel";
import ShareSheet from "@/components/ShareSheet";
import { getFilterStyle } from "@/components/VideoFilters";
import SkeletonPost from "@/components/SkeletonPost";
import StoriesRow from "@/components/StoriesRow";
import { haptic } from "@/lib/haptics";
import WelcomeVineReel from "@/components/onboarding/WelcomeVineReel";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

const ACID = "#00ff88";
let currentPlayingVideo = null;

function PostCard({ post, currentUser, onSaveChange, index, total }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const clickTimer = useRef(null);

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
      ([entry]) => {
        if (entry.isIntersecting) {
          if (currentPlayingVideo && currentPlayingVideo !== video) currentPlayingVideo.pause();
          video.play().catch(() => {});
          currentPlayingVideo = video;
        } else {
          video.pause();
          if (currentPlayingVideo === video) currentPlayingVideo = null;
        }
      },
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
      base44.entities.Post.update(post.id, { likes_count: Math.max(0, (post.likes_count || 0) - 1) }).catch(() => {});
    } else {
      setLiked(true);
      setLikesCount(c => c + 1);
      haptic("success");
      await base44.entities.Like.create({ post_id: post.id, user_id: currentUser.id, username: currentUser.email?.split("@")[0] });
      base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 }).catch(() => {});
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

  function handleTap() {
    if (clickTimer.current) return;
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    }, 260);
  }

  function handleDoubleTap() {
    clearTimeout(clickTimer.current);
    clickTimer.current = null;
    if (!liked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  }

  const username = post.username || post.display_name || "user";
  const filterStyle = getFilterStyle(post.filter || "none");
  const actionBtnStyle = {
    width: 48, height: 56, borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.24)",
    background: "rgba(13,17,16,0.43)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
      onClick={handleTap}
      onDoubleClick={handleDoubleTap}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: BG_MAP[post.bg_class] || "#121716" }}>
        {post.video_url && !videoError
          ? <video
              ref={videoRef}
              src={post.video_url}
              className="w-full h-full object-cover"
              loop muted={muted} playsInline
              style={filterStyle}
              onError={() => setVideoError(true)}
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

      {/* Scrim */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(3,5,5,0.5), transparent 27%, transparent 52%, rgba(3,5,5,0.82))" }} />

      {/* Top bar: live tag + counter */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 pointer-events-none">
        <div className="flex items-center" style={{ font: "11px ui-monospace, SFMono-Regular, monospace", textTransform: "uppercase", letterSpacing: "1.5px", color: "#e7eee9" }}>
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: ACID, boxShadow: "0 0 13px #00ff88", animation: "pulse-accent 2s ease-in-out infinite" }} />
          Loopd
        </div>
        {total > 0 && (
          <div style={{ font: "11px ui-monospace, SFMono-Regular, monospace", letterSpacing: "1.5px", color: "#929a96" }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Double-tap heart burst */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div style={{ animation: "heartBurst 0.9s ease forwards" }}>
            <Heart size={90} fill={ACID} color={ACID} />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      {post.video_url && (
        <button
          className="absolute top-14 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform active:scale-90"
          style={{ border: "1px solid rgba(255,255,255,0.45)", background: "rgba(12,16,15,0.46)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        >
          {muted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
        </button>
      )}

      {/* Right action bar */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-2.5 z-10">
        <button onClick={e => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90" style={actionBtnStyle}>
          <Heart size={18} fill={liked ? ACID : "none"} color={liked ? ACID : "#f5f7f5"} strokeWidth={1.7} />
          <span style={{ font: "9px ui-monospace, monospace", color: liked ? ACID : "#f5f7f5" }}>{fmtN(likesCount)}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90" style={actionBtnStyle}>
          <MessageCircle size={18} color="#f5f7f5" strokeWidth={1.7} />
          <span style={{ font: "9px ui-monospace, monospace", color: "#f5f7f5" }}>{fmtN(post.comments_count || 0)}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); handleSave(); }} className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90" style={actionBtnStyle}>
          <Bookmark size={18} fill={saved ? ACID : "none"} color={saved ? ACID : "#f5f7f5"} strokeWidth={1.7} />
          <span style={{ font: "9px ui-monospace, monospace", color: saved ? ACID : "#f5f7f5" }}>{saved ? "Saved" : "Save"}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); setShowShare(true); }} className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90" style={actionBtnStyle}>
          <Share2 size={18} color="#f5f7f5" strokeWidth={1.7} />
          <span style={{ font: "9px ui-monospace, monospace", color: "#f5f7f5" }}>Share</span>
        </button>

        {post.allow_downloads && post.video_url && (
          <button onClick={e => { e.stopPropagation(); handleDownload(); }} className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90" style={actionBtnStyle}>
            <Download size={18} color="#f5f7f5" strokeWidth={1.7} />
            <span style={{ font: "9px ui-monospace, monospace", color: "#f5f7f5" }}>Save</span>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-20 z-10">
        <div
          className="font-bold text-white text-base mb-2 cursor-pointer"
          style={{ letterSpacing: "0.15px" }}
          onClick={e => { e.stopPropagation(); navigate(`/creator/${username}`); }}
        >
          @{username}
        </div>
        {post.caption && (
          <p className="text-white/90 text-sm leading-snug mb-2 line-clamp-2">{post.caption}</p>
        )}
        {post.music && (
          <div className="flex items-center gap-2" style={{ font: "11px ui-monospace, SFMono-Regular, monospace", color: "#c1c9c4" }}>
            <Music2 size={11} /> {post.music}
          </div>
        )}
        {post.filter && post.filter !== "none" && (
          <div className="mt-2 inline-block px-2 py-0.5" style={{ font: "10px ui-monospace, monospace", color: "#929a96", border: "1px solid rgba(255,255,255,0.12)" }}>
            {post.filter.toUpperCase()}
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
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVineReel, setShowVineReel] = useState(() => localStorage.getItem("loopd_new_user") === "1");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("foryou");
  const [followingIds, setFollowingIds] = useState(new Set());
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const feedRef = useRef(null);
  const sentinelRef = useRef(null);
  const pullStartY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);

  async function loadFeed(silent = false, append = false) {
    if (!currentUser) return;
    if (!silent && !append) setLoading(true);
    try {
      const [blocks, mutes] = await Promise.all([
        base44.entities.Block.filter({ blocker_id: currentUser.id }),
        base44.entities.Mute.filter({ muter_id: currentUser.id }),
      ]);
      const excluded = new Set([
        ...blocks.map(b => b.blocked_id),
        ...mutes.map(m => m.muted_id),
      ]);
      setBlockedIds(excluded);

      let query = { is_draft: false, visibility: "public" };
      let sort = "-created_date";
      if (tab === "following") {
        const follows = await base44.entities.Follow.filter({ follower_id: currentUser.id });
        const ids = follows.map(f => f.following_id);
        setFollowingIds(new Set(ids));
        if (ids.length === 0) {
          setPosts([]); setHasMore(false); setNextCursor(null);
          if (!silent) setLoading(false);
          return;
        }
        query = { ...query, user_id: { $in: ids } };
      } else if (tab === "popular") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = { ...query, created_date: { $gte: weekAgo } };
        sort = "-likes_count";
      }

      const res = await base44.entities.Post.filter(query, { sort, limit: 20, cursor: append ? nextCursor : undefined });
      const items = (Array.isArray(res) ? res : (res.items || [])).filter(p => !excluded.has(p.user_id));
      setPosts(prev => append ? [...prev, ...items] : items);
      setNextCursor(Array.isArray(res) ? null : (res.next_cursor || null));
      setHasMore(Array.isArray(res) ? false : !!res.has_more);
    } catch {}
    if (!silent) setLoading(false);
  }

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (currentUser) loadFeed();
  }, [currentUser, tab]);

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe((event) => {
      if (tab === "following") return;
      if (event.type === "create" && event.data && !event.data.is_draft && event.data.visibility === "public") {
        if (!blockedIds.has(event.data.user_id)) {
          setPosts(prev => [event.data, ...prev]);
        }
      } else if (event.type === "update" && event.data) {
        setPosts(prev => prev.map(p => p.id === event.data.id ? { ...p, ...event.data } : p));
      } else if (event.type === "delete") {
        setPosts(prev => prev.filter(p => p.id !== event.id));
      }
    });
    return unsub;
  }, [tab, blockedIds]);

  // Incremental loading sentinel
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const node = sentinelRef.current;
    const root = feedRef.current;
    if (!node || !root) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadingMore(true);
      loadFeed(true, true).finally(() => setLoadingMore(false));
    }, { root, threshold: 0.1 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, nextCursor, posts.length]);

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
      await loadFeed(true);
      setRefreshing(false);
    } else {
      setPullDistance(0);
      pullStartY.current = null;
    }
  }

  const displayPosts = posts;

  if (showVineReel) {
    return <WelcomeVineReel onFinish={() => {
      localStorage.removeItem("loopd_new_user");
      setShowVineReel(false);
      setShowOnboarding(true);
    }} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#090b0b" }}>
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
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(3,5,5,0.5), transparent)" }}>
        <div className="pointer-events-auto text-lg" style={{ fontWeight: 750, letterSpacing: "-1.5px", color: "#f5f7f5", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Loopd<span style={{ color: ACID }}>.</span>
        </div>
        <div className="flex items-center gap-6 pointer-events-auto">
          {["foryou", "following", "latest", "popular"].map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className="transition-colors"
              style={{
                font: "600 12px ui-monospace, SFMono-Regular, monospace",
                textTransform: "uppercase",
                letterSpacing: "1.1px",
                color: tab === tabKey ? "#f4f6f4" : "#79817d",
                borderBottom: tab === tabKey ? `2px solid ${ACID}` : "2px solid transparent",
                paddingBottom: 2,
              }}
            >
              {tabKey === "foryou" ? t("for_you") : tabKey === "following" ? t("following") : tabKey === "latest" ? "Latest" : "Popular"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full h-full overflow-hidden">
          <SkeletonPost />
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "#f5f7f5" }}>
          <div className="text-5xl" style={{ animation: "float 2s ease-in-out infinite" }}>🎬</div>
          <div className="text-lg" style={{ fontWeight: 700 }}>{t("no_posts")}</div>
          <div className="text-sm" style={{ color: "#929a96" }}>{t("no_posts_sub")}</div>
        </div>
      ) : (
        <div
          ref={feedRef}
          className="w-full h-full overflow-y-scroll hide-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Stories row — snaps as first card */}
          <div
            className="relative w-full flex-shrink-0"
            style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always", background: "#090b0b" }}
          >
            <div className="absolute inset-0 flex flex-col justify-end pb-28 px-4">
              {/* Loopd wordmark */}
              <div className="flex flex-col gap-3 mb-8 animate-panel-up">
                <div className="text-4xl" style={{ fontWeight: 750, letterSpacing: "-2px", color: "#f5f7f5" }}>
                  Loopd<span style={{ color: ACID }}>.</span>
                </div>
                <div style={{ font: "11px ui-monospace, SFMono-Regular, monospace", letterSpacing: "1.5px", textTransform: "uppercase", color: "#929a96" }}>
                  Swipe up to start watching
                </div>
              </div>
              {/* Stories section */}
              <div className="animate-panel-up" style={{ animationDelay: "0.08s" }}>
                <div className="flex items-center justify-between mb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "12px" }}>
                  <span style={{ font: "11px ui-monospace, SFMono-Regular, monospace", letterSpacing: "1.6px", textTransform: "uppercase", color: "#929a96" }}>Stories</span>
                </div>
                <StoriesRow currentUser={currentUser} />
              </div>
            </div>
          </div>

          {tab === "following" && displayPosts.length === 0 ? (
            <div
              className="relative w-full flex-shrink-0 flex flex-col items-center justify-center gap-3"
              style={{ height: "100svh", scrollSnapAlign: "start", background: "#090b0b", color: "#f5f7f5" }}
            >
              <div className="text-5xl">👥</div>
              <div className="text-lg" style={{ fontWeight: 700 }}>No loops yet</div>
              <div className="text-sm" style={{ color: "#929a96" }}>Follow more creators to see their loops here</div>
            </div>
          ) : (
            <>
              {displayPosts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  index={i}
                  total={displayPosts.length}
                />
              ))}
              {hasMore && (
                <div ref={sentinelRef} className="w-full flex items-center justify-center" style={{ minHeight: 96, background: "#090b0b" }}>
                  <div className="w-6 h-6 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: ACID }} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes heartBurst {
          0% { transform: scale(0.3); opacity: 1; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}