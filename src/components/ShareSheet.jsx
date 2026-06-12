import React, { useState } from "react";
import { X, Link, Download, Copy, Check } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Latest social media brand colors & SVG logos
const SOCIAL_PLATFORMS = [
  {
    name: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    getUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    name: "X (Twitter)",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Instagram",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    getUrl: (url) => `https://www.instagram.com/`,
  },
  {
    name: "TikTok",
    color: "#010101",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
    getUrl: (url) => `https://www.tiktok.com/`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    getUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export default function ShareSheet({ post, onClose }) {
  const { accentColor } = useTheme();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/creator/${post.username}`;
  const shareText = post.caption ? `Check out this loop: ${post.caption}` : "Check out this loop on Loopd!";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: "Loopd", text: shareText, url: shareUrl });
      onClose();
    } catch (e) {
      // User dismissed or permission denied — silently ignore
    }
  }

  async function handleDownload() {
    if (!post.allow_downloads) {
      alert("This creator has disabled downloads.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl pb-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
        <div className="px-5 mb-4">
          <div className="text-sm font-bold text-foreground mb-1">Share Loop</div>
          <div className="text-xs text-muted-foreground truncate">@{post.username}</div>
        </div>

        {/* Social platforms */}
        <div className="flex gap-4 px-5 overflow-x-auto hide-scrollbar pb-2">
          {SOCIAL_PLATFORMS.map(p => (
            <a
              key={p.name}
              href={p.getUrl(shareUrl, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                style={{ background: p.color }}>
                {p.icon}
              </div>
              <span className="text-[10px] text-muted-foreground">{p.name}</span>
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 mt-4 space-y-2">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-muted text-sm font-medium text-foreground"
          >
            {copied ? <Check size={18} style={{ color: accentColor }} /> : <Link size={18} className="text-muted-foreground" />}
            {copied ? "Link copied!" : "Copy link"}
          </button>
          {post.video_url && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-muted text-sm font-medium"
              style={{ color: post.allow_downloads ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              <Download size={18} className={post.allow_downloads ? "text-foreground" : "text-muted-foreground"} />
              {post.allow_downloads ? "Download loop" : "Downloads disabled by creator"}
            </button>
          )}
          {navigator.share && (
            <button
              onClick={nativeShare}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: accentColor }}
            >
              <Share2Icon /> More options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Share2Icon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}