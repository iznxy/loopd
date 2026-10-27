import React, { useState, useEffect } from "react";
import { X, UserCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { getAvColor, getInitials } from "@/lib/utils";

export default function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myFollowing, setMyFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setCurrentUser(me);
      const [follows, myF] = await Promise.all([
        type === "followers"
          ? base44.entities.Follow.filter({ following_id: userId })
          : base44.entities.Follow.filter({ follower_id: userId }),
        base44.entities.Follow.filter({ follower_id: me.id }),
      ]);
      setList(follows);
      setMyFollowing(myF.map(f => f.following_id));
      // Fetch only the accounts that appear on this list — never the whole directory.
      const ids = [...new Set(follows.map(f => (type === "followers" ? f.follower_id : f.following_id)))];
      setUsers(ids.length ? await base44.entities.User.filter({ id: { $in: ids } }) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId, type]);

  async function toggleFollow(targetId, targetUsername) {
    if (!currentUser) return;
    if (myFollowing.includes(targetId)) {
      const follows = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: targetId });
      if (follows.length > 0) await base44.entities.Follow.delete(follows[0].id);
      setMyFollowing(prev => prev.filter(id => id !== targetId));
    } else {
      await base44.entities.Follow.create({
        follower_id: currentUser.id,
        follower_username: currentUser.email?.split("@")[0],
        following_id: targetId,
        following_username: targetUsername,
      });
      setMyFollowing(prev => [...prev, targetId]);
    }
  }

  const getUser = (id) => users.find(u => u.id === id);

  const listIds = type === "followers"
    ? list.map(f => f.follower_id)
    : list.map(f => f.following_id);

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl flex flex-col" style={{ maxHeight: "75vh" }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
          <span className="text-sm font-bold text-foreground capitalize">{type}</span>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : listIds.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No {type} yet
            </div>
          ) : listIds.map(uid => {
            const u = getUser(uid);
            const name = u?.full_name || u?.email?.split("@")[0] || uid.slice(0, 8);
            const avColor = getAvColor(name);
            const isMe = currentUser?.id === uid;
            const isFollowing = myFollowing.includes(uid);
            const handle = u?.email?.split("@")[0] || "";
            return (
              <div key={uid} className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 cursor-pointer overflow-hidden"
                  style={{ background: avColor.bg, color: avColor.text }}
                  onClick={() => { navigate(`/creator/${handle || uid}`); onClose(); }}
                >
                  {u?.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(name)}
                </div>
                <div className="flex-1" onClick={() => { navigate(`/creator/${handle || uid}`); onClose(); }}>
                  <div className="text-sm font-bold text-foreground cursor-pointer">{name}</div>
                  {handle && <div className="text-xs text-muted-foreground">@{handle}</div>}
                </div>
                {!isMe && (
                  <button
                    onClick={() => toggleFollow(uid, handle)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={isFollowing
                      ? { border: "1.5px solid var(--border)", color: "var(--foreground)" }
                      : { background: accentColor, color: "#fff" }
                    }
                  >
                    {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}