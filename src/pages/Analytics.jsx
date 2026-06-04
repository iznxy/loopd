import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { fmtN } from "@/lib/utils";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const VIEW_DATA = [120,185,140,220,310,280,185];

export default function Analytics() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [posts, setPosts] = useState([]);
  const maxViews = Math.max(...VIEW_DATA);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      const uname = u.username || u.email?.split("@")[0];
      base44.entities.Post.filter({ username: uname, is_draft: false }, "-views_count", 10).then(setPosts);
    });
  }, []);

  const totalViews = posts.reduce((s, p) => s + (p.views_count || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Analytics</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 p-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm font-bold text-foreground mb-1">📈 Views — Last 7 Days</div>
          <div className="text-2xl font-bold font-display mb-3" style={{ color: accentColor }}>{fmtN(totalViews || 1200000)}</div>
          <div className="flex items-end gap-1.5 h-20 mb-2">
            {VIEW_DATA.map((v, i) => (
              <div key={i} className="flex-1 rounded-t cursor-pointer hover:opacity-80" style={{ height: `${(v/maxViews)*100}%`, background: accentColor, opacity: 0.5 + i*0.07 }} title={`${v}K`} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {DAYS.map(d => <div key={d} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</div>)}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-bold text-sm text-foreground">📊 Performance</div>
          {[
            { label: "Total Views", value: fmtN(totalViews || 1200000), green: true },
            { label: "Total Likes", value: fmtN(totalLikes || 14880), green: true },
            { label: "Completion Rate", value: "84%", green: true },
            { label: "Like Rate", value: "12.4%", green: true },
            { label: "Reloop Rate", value: "4.2%" },
            { label: "Profile Visits", value: "8.4K" },
            { label: "New Followers", value: "+340", green: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className="text-sm font-bold" style={{ color: r.green ? accentColor : "var(--foreground)" }}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-bold text-sm text-foreground">🌍 Top Countries</div>
          {[
            { flag: "🇺🇸", country: "United States", pct: "38%" },
            { flag: "🇬🇧", country: "United Kingdom", pct: "14%" },
            { flag: "🇦🇺", country: "Australia", pct: "9%" },
            { flag: "🌍", country: "Other", pct: "39%" },
          ].map(r => (
            <div key={r.country} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{r.flag} {r.country}</span>
              <span className="text-sm font-bold text-foreground">{r.pct}</span>
            </div>
          ))}
        </div>

        {posts.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-bold text-sm text-foreground">🎬 Top Loops</div>
            {posts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                <div className={`w-10 h-10 rounded-lg ${p.bg_class || "bg1"} flex items-center justify-center text-xl flex-shrink-0`}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{p.caption || "Loop"}</div>
                  <div className="text-xs text-muted-foreground">{fmtN(p.views_count || 0)} views · {fmtN(p.likes_count || 0)} likes</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}