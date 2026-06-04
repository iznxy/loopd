import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN, getAvColor, getInitials, getConversationId } from "@/lib/utils";
import { TIPS } from "@/lib/constants";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const avColor = getAvColor(username);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    base44.entities.Post.filter({ username, is_draft: false }, "-created_date", 30).then(setPosts);
  }, [username]);

  async function follow() {
    if (!currentUser) return;
    if (isFollowing) {
      setIsFollowing(false);
      setFollowCount(c => c - 1);
    } else {
      setIsFollowing(true);
      setFollowCount(c => c + 1);
      await base44.entities.Follow.create({
        follower_id: currentUser.id,
        follower_username: currentUser.email?.split("@")[0],
        following_id: username,
        following_username: username,
      });
    }
  }

  async function sendTip(tip) {
    if (!currentUser) return;
    await base44.entities.Tip.create({
      from_user_id: currentUser.id,
      from_username: currentUser.email?.split("@")[0],
      to_username: username,
      amount: tip.p,
      label: tip.l,
    });
    setShowTip(false);
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-y-auto hide-scrollbar">
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border bg-card sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} className="text-foreground" /></button>
        <span className="text-base font-bold text-foreground">@{username}</span>
      </div>

      <div className="px-4 py-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 border-4" style={{ background: avColor.bg, color: avColor.text, borderColor: accentColor }}>
          {getInitials(username)}
        </div>
        <div className="text-lg font-bold text-foreground">@{username}</div>

        <div className="flex gap-6 my-3">
          {[
            { label: "Loops", value: fmtN(posts.length) },
            { label: "Followers", value: fmtN(followCount) },
            { label: "Likes", value: fmtN(posts.reduce((s, p) => s + (p.likes_count || 0), 0)) },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={follow}
            className="flex-1 py-2 rounded-full text-white text-sm font-semibold"
            style={{ background: isFollowing ? "var(--muted)" : accentColor, color: isFollowing ? "var(--foreground)" : "#fff" }}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button
            onClick={() => {
              if (!currentUser) return;
              const convId = getConversationId(currentUser.id, username);
              navigate(`/chat/${convId}`, { state: { otherId: username, otherName: username } });
            }}
            className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground flex items-center gap-1"
          >
            <MessageCircle size={14} /> DM
          </button>
          <button
            onClick={() => setShowTip(true)}
            className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground"
          >
            💰 Tip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 px-0.5">
        {posts.map(p => (
          <div key={p.id} className="aspect-square relative overflow-hidden" style={{ background: BG_MAP[p.bg_class] || BG_MAP.bg1 }}>
            {p.video_url ? <video src={p.video_url} className="w-full h-full object-cover" muted /> : <div className="w-full h-full flex items-center justify-center text-3xl">{p.emoji || "🎬"}</div>}
          </div>
        ))}
      </div>

      {/* Tip modal */}
      {showTip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowTip(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="text-base font-bold text-foreground mb-4">Send a tip to @{username}</div>
            <div className="grid grid-cols-3 gap-3">
              {TIPS.map(t => (
                <button key={t.l} onClick={() => sendTip(t)} className="flex flex-col items-center p-4 rounded-xl border border-border hover:border-current transition-colors" style={{ "--tw-border-opacity": 1 }}>
                  <span className="text-3xl mb-1">{t.c}</span>
                  <span className="text-sm font-bold text-foreground">${t.p}</span>
                  <span className="text-xs text-muted-foreground">{t.l}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTip(false)} className="w-full py-2.5 text-sm text-muted-foreground mt-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}