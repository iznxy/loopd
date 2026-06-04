import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

export default function CommentsPanel({ post, onClose, currentUser }) {
  const { accentColor } = useTheme();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.Comment.filter({ post_id: post.id }, "created_date", 50)
      .then(data => { setComments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [post.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function submit() {
    if (!text.trim() || !currentUser) return;
    const msg = text.trim();
    setText("");
    const newComment = await base44.entities.Comment.create({
      post_id: post.id,
      user_id: currentUser.id,
      username: currentUser.email?.split("@")[0] || "user",
      display_name: currentUser.full_name || currentUser.email?.split("@")[0],
      text: msg,
    });
    setComments(prev => [...prev, newComment]);
    await base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl flex flex-col"
        style={{ maxHeight: "75vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
          <span className="text-sm font-bold text-foreground">
            {post.comments_count || comments.length} Comments
          </span>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No comments yet. Be the first! 👇
            </div>
          ) : (
            comments.map(c => {
              const avColor = getAvColor(c.username);
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: avColor.bg, color: avColor.text }}
                  >
                    {getInitials(c.display_name || c.username)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground">@{c.username}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_date)}</span>
                    </div>
                    <p className="text-sm text-foreground">{c.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border flex-shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Add a comment…"
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background: text.trim() ? accentColor : "var(--muted)" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}