import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Share2, Bell, Repeat2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
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

export default function Home() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [posts, setPosts] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [reloopedIds, setReloopedIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentPost, setCommentPost] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (u) {
        base44.entities.Notification.filter({ user_id: u.id, is_read: false }).then(r => setUnreadCount(r.length));
      }
    }).catch(() => {});
    base44.entities.Post.list("-created_date", 30)
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleLike(post) {
    if (!currentUser) return;
    const liked = likedIds.has(post.id);
    setLikedIds(prev => { const next = new Set(prev); liked ? next.delete(post.id) : next.add(post.id); return next; });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + (liked ? -1 : 1) } : p));
    if (!liked) {
      await base44.entities.Like.create({ post_id: post.id, user_id: currentUser.id, username: currentUser.email?.split("@")[0] });
      await base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 });
    }
  }

  async function toggleReloop(post) {
    if (!currentUser) return;
    const relooped = reloopedIds.has(post.id);
    setReloopedIds(prev => { const next = new Set(prev); relooped ? next.delete(post.id) : next.add(post.id); return next; });
    const delta = relooped ? -1 : 1;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reloops_count: Math.max(0, (p.reloops_count || 0) + delta) } : p));
    await base44.entities.Post.update(post.id, { reloops_count: Math.max(0, (post.reloops_count || 0) + delta) });
  }

  function sharePost(post) {
    const url = window.location.origin + `/?post=${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.caption || "Check this loop!", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.error("Could not copy link"));
    }
  }

  function reloadFeed() {
    setLoading(true);
    base44.entities.Post.list("-created_date", 30)
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-display" style={{ color: accentColor }}>Loopd</span>
          <button onClick={reloadFeed} className="p-1"><RefreshCw size={16} className="text-muted-foreground" /></button>
        </div>
        <button onClick={() => navigate("/notifications")} className="relative p-1">
          <Bell size={22} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: accentColor }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Comments panel */}
      {commentPost && (
        <CommentsPanel
          post={commentPost}
          currentUser={currentUser}
          onClose={() => setCommentPost(null)}
        />
      )}

      {/* Feed */}
      <div ref={containerRef} className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory">
        {posts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="text-6xl">🎬</div>
            <div>
              <div className="text-xl font-bold text-foreground mb-1">Welcome to Loopd!</div>
              <p className="text-sm text-muted-foreground">Share 6-second moments with the world.</p>
            </div>
            <div className="w-full max-w-xs space-y-3">
              {[
                { icon: "🎥", text: "Record a 6-second loop" },
                { icon: "❤️", text: "Like & comment on loops" },
                { icon: "💰", text: "Earn tips from fans" },
              ].map(s => (
                <div key={s.text} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm text-foreground">{s.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/record")}
              className="px-8 py-3.5 rounded-full text-white font-bold text-sm shadow-lg"
              style={{ background: accentColor }}
            >
              🎬 Create Your First Loop
            </button>
            <button onClick={() => navigate("/explore")} className="text-sm font-semibold" style={{ color: accentColor }}>
              Explore Loops →
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedIds.has(post.id)}
              relooped={reloopedIds.has(post.id)}
              onLike={() => toggleLike(post)}
              onReloop={() => toggleReloop(post)}
              onShare={() => sharePost(post)}
              onProfile={() => navigate(`/creator/${post.username}`)}
              onComment={() => setCommentPost(post)}
              accentColor={accentColor}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, liked, relooped, onLike, onReloop, onShare, onProfile, onComment, accentColor }) {
  const avColor = getAvColor(post.username);
  const bgStyle = post.bg_class ? { background: BG_MAP[post.bg_class] || BG_MAP.bg1 } : { background: BG_MAP.bg1 };

  return (
    <div className="relative h-screen snap-start flex-shrink-0 flex flex-col" style={bgStyle}>
      {/* Video / emoji display */}
      {post.video_url ? (
        <video
          src={post.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl select-none">{post.emoji || "🎬"}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Bottom info */}
      <div className="absolute bottom-20 left-0 right-12 p-4">
        <button onClick={onProfile} className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: avColor.bg, color: avColor.text }}>
            {getInitials(post.display_name || post.username)}
          </div>
          <span className="text-white text-sm font-bold">@{post.username}</span>
        </button>
        {post.caption && <p className="text-white text-sm mb-1">{post.caption}</p>}
        {post.tags && <p className="text-white/70 text-xs">{post.tags}</p>}
        {post.music && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-white/70 text-xs">🎵 {post.music}</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <ActionBtn icon={<Heart size={26} fill={liked ? accentColor : "none"} color={liked ? accentColor : "#fff"} />} label={fmtN(post.likes_count || 0)} onClick={onLike} />
        <ActionBtn icon={<MessageCircle size={26} color="#fff" />} label={fmtN(post.comments_count || 0)} onClick={onComment} />
        <ActionBtn icon={<Repeat2 size={26} fill={relooped ? accentColor : "none"} color={relooped ? accentColor : "#fff"} />} label={fmtN(post.reloops_count || 0)} onClick={onReloop} />
        <ActionBtn icon={<Share2 size={26} color="#fff" />} label="Share" onClick={onShare} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-white text-[11px] font-semibold">{label}</span>
    </button>
  );
}