import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle, Ban, Flag, MoreHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import TipModal from "@/components/TipModal";
import ReportModal from "@/components/ReportModal";

const ACID = "#00ff88";

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
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setCurrentUser(me);
      const allUsers = await base44.entities.User.list("full_name", 100);
      let found = allUsers.find(u =>
        u.email?.split("@")[0] === username || u.id === username
      );
      if (!found) {
        const matchingPosts = await base44.entities.Post.filter({ username });
        if (matchingPosts.length > 0 && matchingPosts[0].user_id) {
          found = allUsers.find(u => u.id === matchingPosts[0].user_id);
        }
      }
      if (!found) { setLoading(false); return; }
      setCreator(found);
      const [creatorPosts, followerList, followingList, myFollow, myBlock] = await Promise.all([
        base44.entities.Post.filter({ user_id: found.id, is_draft: false, visibility: "public" }, "-created_date", 30),
        base44.entities.Follow.filter({ following_id: found.id }),
        base44.entities.Follow.filter({ follower_id: found.id }),
        base44.entities.Follow.filter({ follower_id: me.id, following_id: found.id }),
        base44.entities.Block.filter({ blocker_id: me.id, blocked_id: found.id }),
      ]);
      setPosts(creatorPosts);
      setFollowers(followerList.length);
      setFollowing(followingList.length);
      setIsFollowing(myFollow.length > 0);
      setIsBlocked(myBlock.length > 0);
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

  async function toggleBlock() {
    if (!currentUser || !creator) return;
    setShowMenu(false);
    if (isBlocked) {
      const blocks = await base44.entities.Block.filter({ blocker_id: currentUser.id, blocked_id: creator.id });
      if (blocks.length > 0) await base44.entities.Block.delete(blocks[0].id);
      setIsBlocked(false);
    } else {
      await base44.entities.Block.create({ blocker_id: currentUser.id, blocked_id: creator.id });
      setIsBlocked(true);
      if (isFollowing) {
        const follows = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: creator.id });
        if (follows.length > 0) await base44.entities.Follow.delete(follows[0].id);
        setIsFollowing(false);
        setFollowers(f => Math.max(0, f - 1));
      }
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

  const monoNum = { fontFamily: "ui-monospace, SFMono-Regular, monospace", fontWeight: 700, fontSize: 16, color: "#f5f7f5" };
  const statLabel = { fontSize: 12, color: "#79817d" };

  return (
    <div className="flex flex-col h-screen overflow-y-auto hide-scrollbar" style={{ background: "#090b0b" }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} style={{ color: "#f5f7f5" }} /></button>
        <span className="flex-1 text-base font-bold" style={{ color: "#f5f7f5" }}>@{username}</span>
        {!isMe && (
          <button onClick={() => setShowMenu(v => !v)} className="p-1">
            <MoreHorizontal size={20} style={{ color: "#a1aaa5" }} />
          </button>
        )}
        {showMenu && !isMe && (
          <div className="absolute right-4 top-14 z-30 rounded-xl overflow-hidden animate-fade-in" style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)" }}>
            <button
              onClick={toggleBlock}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left active:bg-white/5"
              style={{ color: "#f5f7f5" }}
            >
              <Ban size={14} /> {isBlocked ? "Unblock" : "Block"}
            </button>
            <button
              onClick={() => { setShowMenu(false); setShowReport(true); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left active:bg-white/5"
              style={{ color: "#f5f7f5", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Flag size={14} /> Report
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: ACID }} />
        </div>
      ) : !creator ? (
        <div className="text-center py-16" style={{ color: "#79817d" }}>User not found</div>
      ) : isBlocked ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: "#79817d" }}>
          <Ban size={40} />
          <div className="text-sm">You blocked this account</div>
          <button onClick={toggleBlock} className="text-sm font-bold" style={{ color: ACID }}>Unblock</button>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="px-4 pt-5 pb-4 flex flex-col items-center flex-shrink-0">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden mb-3"
              style={{ background: avColor.bg, color: avColor.text, border: "2px solid rgba(255,255,255,0.12)" }}>
              {creator.avatar_url
                ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(creatorName)}
            </div>
            <div className="text-base font-bold mb-0.5" style={{ color: "#f5f7f5" }}>{creatorName}</div>
            <div className="text-sm mb-3" style={{ color: "#79817d" }}>@{creator.email?.split("@")[0]}</div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              {[
                { label: "Loops", value: fmtN(posts.length) },
                { label: "Followers", value: fmtN(followers) },
                { label: "Following", value: fmtN(following) },
                { label: "Likes", value: fmtN(totalLikes) },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <span style={monoNum}>{s.value}</span>
                  <span style={statLabel}>{s.label}</span>
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
                    ? { border: "1.5px solid rgba(255,255,255,0.12)", color: "#a1aaa5", background: "transparent" }
                    : { background: ACID, color: "#07110c" }
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={startChat}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#f5f7f5" }}
                >
                  <MessageCircle size={15} /> Message
                </button>
                <button
                  onClick={() => setShowTip(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(233,30,140,0.15)", color: "#e91e8c" }}
                >
                  💝 Tip
                </button>
              </div>
            )}
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: "#79817d" }}>
              <div className="text-3xl">🎬</div>
              <span className="text-sm">No loops yet</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map(post => (
                <div key={post.id} className="aspect-[9/16] relative overflow-hidden cursor-pointer"
                  style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}>
                  {post.video_url
                    ? <video src={post.video_url} className="w-full h-full object-cover" muted />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
                  }
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))" }} />
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {showTip && creator && <TipModal creator={creator} onClose={() => setShowTip(false)} />}
      {showReport && creator && (
        <ReportModal targetType="user" targetId={creator.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}