import React, { useState, useEffect, useRef } from "react";
import { X, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { timeAgo, getAvColor, getInitials } from "@/lib/utils";

const ACID = "#00ff88";

export default function CommentsPanel({ post, onClose, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef(null);

  async function load(append = false) {
    try {
      const res = await base44.entities.Comment.filter(
        { post_id: post.id },
        { sort: "-created_date", limit: 20, cursor: append ? cursor : undefined }
      );
      const items = Array.isArray(res) ? res : (res.items || []);
      setComments(prev => append ? [...[...items].reverse(), ...prev] : [...items].reverse());
      setCursor(Array.isArray(res) ? null : (res.next_cursor || null));
      setHasMore(Array.isArray(res) ? false : !!res.has_more);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [post.id]);

  useEffect(() => {
    if (!loading && !hasMore) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments, loading, hasMore]);

  async function submit() {
    if (!text.trim() || !currentUser || sending) return;
    const msg = text.trim();
    setSending(true);
    setText("");
    try {
      const newComment = await base44.entities.Comment.create({
        post_id: post.id,
        user_id: currentUser.id,
        username: currentUser.email?.split("@")[0] || "user",
        display_name: currentUser.full_name || currentUser.email?.split("@")[0],
        text: msg,
      });
      setComments(prev => [...prev, newComment]);
      // The Post write rule is owner-only, so only fire the counter write where it can land.
      if (currentUser.id === post.created_by_id) {
        base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});
      }
    } catch {
      setText(msg);
    }
    setSending(false);
  }

  async function remove(c) {
    try {
      await base44.entities.Comment.delete(c.id);
      setComments(prev => prev.filter(x => x.id !== c.id));
      if (currentUser?.id === post.created_by_id) {
        base44.entities.Post.update(post.id, { comments_count: Math.max(0, (post.comments_count || 1) - 1) }).catch(() => {});
      }
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full flex flex-col animate-slide-up"
        style={{ maxHeight: "78vh", background: "#0d1110", borderTop: "1px solid rgba(255,255,255,0.12)", borderRadius: "24px 24px 0 0" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />

        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ font: "11px ui-monospace, monospace", letterSpacing: "1.6px", textTransform: "uppercase", color: "#79817d" }}>
            {comments.length} Comments
          </span>
          <button onClick={onClose}><X size={18} style={{ color: "#a1aaa5" }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-4">
          {hasMore && !loading && (
            <button onClick={() => load(true)} className="w-full py-2 text-xs font-bold" style={{ color: ACID }}>
              Load earlier comments
            </button>
          )}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: ACID }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "#79817d" }}>No comments yet. Be the first!</div>
          ) : (
            comments.map(c => {
              const avColor = getAvColor(c.username);
              const mine = currentUser?.id === c.user_id;
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: avColor.bg, color: avColor.text }}>
                    {getInitials(c.display_name || c.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold" style={{ color: "#f5f7f5" }}>@{c.username}</span>
                      <span style={{ font: "10px ui-monospace, monospace", color: "#79817d" }}>{timeAgo(c.created_date)}</span>
                    </div>
                    <p className="text-sm break-words" style={{ color: "#e7eee9" }}>{c.text}</p>
                  </div>
                  {mine && (
                    <button onClick={() => remove(c)} className="p-1 flex-shrink-0" aria-label="Delete comment">
                      <Trash2 size={14} style={{ color: "#79817d" }} />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Add a comment…"
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={{ background: "#121715", border: "1px solid rgba(255,255,255,0.12)", color: "#f5f7f5" }}
          />
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: text.trim() ? ACID : "#1b201e", color: text.trim() ? "#07110c" : "#79817d" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}