import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Hash, Users, Film } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { fmtN, getAvColor, getInitials } from "@/lib/utils";
import { TRENDING_TAGS } from "@/lib/constants";

const ACID = "#00ff88";

const BG_MAP = {
  bg1: "linear-gradient(135deg,#667eea,#764ba2)",
  bg2: "linear-gradient(135deg,#f093fb,#f5576c)",
  bg3: "linear-gradient(135deg,#4facfe,#00f2fe)",
  bg4: "linear-gradient(135deg,#43e97b,#38f9d7)",
  bg5: "linear-gradient(135deg,#fa709a,#fee140)",
  bg6: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
};

export default function Explore() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const TABS = [
    { key: "top", label: t("tab_top"), Icon: TrendingUp },
    { key: "users", label: t("tab_people"), Icon: Users },
    { key: "tags", label: t("tab_tags"), Icon: Hash },
    { key: "vines", label: "Vines 🍇", Icon: Film },
  ];
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("top");
  const [currentUser, setCurrentUser] = useState(null);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [blockedIds, setBlockedIds] = useState(new Set());

  useEffect(() => {
    Promise.all([
      base44.entities.Post.filter({ is_draft: false, visibility: "public" }, "-views_count", 60),
      base44.entities.User.list("full_name", 30),
      base44.auth.me(),
    ]).then(async ([p, u, me]) => {
      setPosts(p);
      setUsers(u);
      setCurrentUser(me);
      if (me) {
        const [follows, blocks] = await Promise.all([
          base44.entities.Follow.filter({ follower_id: me.id }),
          base44.entities.Block.filter({ blocker_id: me.id }),
        ]);
        setFollowingIds(new Set(follows.map(f => f.following_id)));
        setBlockedIds(new Set(blocks.map(b => b.blocked_id)));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Debounced server-side search
  useEffect(() => {
    if (query === "") return;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await base44.entities.Post.filter({
          is_draft: false,
          visibility: "public",
          $or: [
            { caption: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        }, "-created_date", 30);
        setPosts(results.filter(p => !blockedIds.has(p.user_id)));
      } catch {}
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, blockedIds]);

  async function handleFollow(u) {
    if (!currentUser) return;
    const uname = u.full_name || u.email?.split("@")[0] || "user";
    if (followingIds.has(u.id)) {
      const follows = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: u.id });
      if (follows.length > 0) await base44.entities.Follow.delete(follows[0].id);
      setFollowingIds(prev => { const s = new Set(prev); s.delete(u.id); return s; });
    } else {
      await base44.entities.Follow.create({
        follower_id: currentUser.id,
        follower_username: currentUser.email?.split("@")[0],
        following_id: u.id,
        following_username: u.email?.split("@")[0],
      });
      setFollowingIds(prev => new Set([...prev, u.id]));
    }
  }

  const filteredUsers = query
    ? users.filter(u =>
        u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
      ).filter(u => !blockedIds.has(u.id))
    : users.filter(u => !blockedIds.has(u.id));

  return (
    <div className="flex flex-col h-full" style={{ background: "#090b0b" }}>
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Search size={16} style={{ color: "#79817d", flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#f5f7f5" }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} style={{ color: "#79817d" }} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={activeTab === key
                ? { background: ACID, color: "#07110c" }
                : { background: "#121715", color: "#79817d", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Trending tags strip */}
        {!query && activeTab === "top" && (
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="mb-2 flex items-center gap-1" style={{ font: "11px ui-monospace, monospace", letterSpacing: "1.6px", textTransform: "uppercase", color: "#79817d" }}>
              <TrendingUp size={11} /> {t("trending_now")}
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: ACID, color: "#07110c" }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading || searchLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: ACID }} />
          </div>
        ) : activeTab === "users" ? (
          <div>
            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-sm" style={{ color: "#79817d" }}>{t("no_users_found")}</div>
            ) : filteredUsers.map(u => {
              const uname = u.full_name || u.email?.split("@")[0] || "user";
              const avColor = getAvColor(uname);
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/creator/${u.email?.split("@")[0] || u.id}`)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm overflow-hidden" style={{ background: avColor.bg, color: avColor.text }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(uname)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: "#f5f7f5" }}>{u.full_name || uname}</div>
                    <div className="text-xs" style={{ color: "#79817d" }}>@{u.email?.split("@")[0]}</div>
                  </div>
                  {currentUser?.id !== u.id && (
                    <button
                      onClick={e => { e.stopPropagation(); handleFollow(u); }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold"
                      style={followingIds.has(u.id)
                        ? { border: "1.5px solid rgba(255,255,255,0.12)", color: "#a1aaa5", background: "transparent" }
                        : { background: ACID, color: "#07110c" }}
                    >
                      {followingIds.has(u.id) ? t("following_btn") : t("follow")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : activeTab === "tags" ? (
          <div className="px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {TRENDING_TAGS.map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); setActiveTab("top"); }}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", background: "#121715" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: `hsl(${(i * 47) % 360}, 65%, 55%)` }}>
                    #
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#f5f7f5" }}>{tag}</div>
                    <div className="text-xs" style={{ color: "#79817d" }}>{(i + 1) * 123}K loops</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : activeTab === "vines" ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="text-5xl">🍇</div>
            <div className="text-center">
              <div className="font-bold text-base mb-1" style={{ color: "#f5f7f5" }}>{t("classic_vines_archive")}</div>
              <div className="text-sm leading-relaxed" style={{ color: "#79817d" }}>{t("classic_vines_desc")}</div>
            </div>
            <button
              onClick={() => navigate("/classic-vines")}
              className="px-6 py-3 rounded-full text-sm font-bold"
              style={{ background: ACID, color: "#07110c" }}
            >
              {t("open_vine_archive")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/creator/${post.username}`)}
                className="aspect-[9/16] relative cursor-pointer overflow-hidden"
                style={{ background: BG_MAP[post.bg_class] || BG_MAP.bg1 }}
              >
                {post.video_url ? (
                  <video src={post.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{post.emoji || "🎬"}</div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }} />
                <div className="absolute bottom-1.5 left-1.5">
                  <span className="text-white text-[10px] font-bold drop-shadow">▶ {fmtN(post.views_count || 0)}</span>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="col-span-3 py-16 text-center text-sm" style={{ color: "#79817d" }}>No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}