import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Grid3x3, Copy, Check, Camera } from "lucide-react";
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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [tab, setTab] = useState("loops");
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setUser(u);
      const uname = u.username || u.email?.split("@")[0];
      base44.entities.Post.filter({ username: uname, is_draft: false }, "-created_date", 30).then(setPosts);
      base44.entities.Follow.filter({ following_id: u.id }).then(setFollowers);
      base44.entities.Follow.filter({ follower_id: u.id }).then(setFollowing);
    });
  }, []);

  const username = user?.username || user?.email?.split("@")[0] || "you";
  const displayName = user?.full_name || username;
  const avColor = getAvColor(username);

  function copyUsername() {
    navigator.clipboard.writeText(`@${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    setUser(prev => ({ ...prev, avatar_url: file_url }));
    setUploadingPhoto(false);
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button onClick={copyUsername} className="flex items-center gap-1.5">
          <span className="text-base font-bold text-foreground">@{username}</span>
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
        </button>
        <button onClick={() => navigate("/settings")} className="p-1">
          <Settings size={22} className="text-foreground" />
        </button>
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4 flex flex-col items-center text-center">
        {/* Avatar with photo change */}
        <div className="relative mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 overflow-hidden"
            style={{ borderColor: accentColor }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: avColor.bg, color: avColor.text }}>
                {getInitials(displayName)}
              </div>
            )}
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center"
          >
            {uploadingPhoto ? (
              <div className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            ) : (
              <Camera size={12} className="text-foreground" />
            )}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="text-lg font-bold text-foreground">{displayName}</div>
        <div className="text-sm text-muted-foreground mb-1">@{username}</div>
        {user?.bio && <div className="text-sm text-foreground mb-2">{user.bio}</div>}

        {/* Stats tabs */}
        <div className="flex gap-6 my-3">
          {[
            { label: "Loops", value: fmtN(posts.length), key: "loops" },
            { label: "Followers", value: fmtN(followers.length), key: "followers" },
            { label: "Following", value: fmtN(following.length), key: "following" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className="flex flex-col items-center transition-opacity"
              style={{ opacity: tab === s.key ? 1 : 0.55 }}
            >
              <span className="text-lg font-bold text-foreground">{s.value}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: tab === s.key ? accentColor : "var(--muted-foreground)" }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => navigate("/edit-profile")} className="flex-1 py-2 rounded-full border border-border text-sm font-semibold text-foreground">
            Edit Profile
          </button>
          <button onClick={() => navigate("/analytics")} className="flex-1 py-2 rounded-full text-white text-sm font-semibold" style={{ background: accentColor }}>
            Analytics
          </button>
        </div>
      </div>

      {/* Tab content */}
      {tab === "loops" && (
        <div className="px-0.5">
          {posts.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Grid3x3 size={40} className="text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No loops yet</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map(p => (
                <div key={p.id} className="aspect-square relative overflow-hidden" style={{ background: BG_MAP[p.bg_class] || BG_MAP.bg1 }}>
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
      )}

      {tab === "followers" && (
        <div className="flex-1 px-4 space-y-1">
          {followers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No followers yet</div>
          ) : (
            followers.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-3 border-b border-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: getAvColor(f.follower_username).bg, color: getAvColor(f.follower_username).text }}>
                  {getInitials(f.follower_username)}
                </div>
                <span className="text-sm font-semibold text-foreground">@{f.follower_username}</span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "following" && (
        <div className="flex-1 px-4 space-y-1">
          {following.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Not following anyone yet</div>
          ) : (
            following.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-3 border-b border-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: getAvColor(f.following_username).bg, color: getAvColor(f.following_username).text }}>
                  {getInitials(f.following_username)}
                </div>
                <span className="text-sm font-semibold text-foreground">@{f.following_username}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}