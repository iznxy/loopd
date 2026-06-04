import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const FAQS = [
  { q: "📌 How do I get verified?", a: "You need 10K+ followers, original content, and 30+ days of activity. Apply in Settings → Creator." },
  { q: "📌 How does tipping work?", a: "Viewers tip with real money via Stripe. You receive 85% of every tip. Min withdrawal is $5." },
  { q: "📌 What is 18+ content?", a: "Mature themes. Must be marked when posting. Viewers verify age to see it." },
  { q: "📌 Can I use copyrighted music?", a: "No. Only royalty-free tracks from our library or your own original music." },
  { q: "📌 How do I download my loops?", a: "Loop → Share → Download. Or bulk export in Settings → Privacy." },
  { q: "📌 How do I earn money?", a: "Through the Creator Fund (per view), tips from fans, and fan subscriptions. Get paid via PayPal." },
];

export default function Help() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [open, setOpen] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Help & Support</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 p-4 space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-xl text-white" style={{ background: accentColor }}>
          <span className="text-3xl">💬</span>
          <div className="flex-1">
            <div className="text-sm font-bold">Live Chat Support</div>
            <div className="text-xs opacity-80">Avg. 2 min response</div>
          </div>
          <button className="bg-white text-sm font-bold px-3 py-1.5 rounded-full" style={{ color: accentColor }}>Chat</button>
        </div>

        {FAQS.map((faq, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm font-semibold text-foreground">{faq.q}</span>
              {open === i ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
            {open === i && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>}
          </div>
        ))}

        <div className="flex gap-3 mt-2">
          <button className="flex-1 py-3 rounded-xl bg-card border border-border text-sm font-semibold text-foreground">📧 Email Support</button>
          <button className="flex-1 py-3 rounded-xl bg-card border border-border text-sm font-semibold text-foreground">🚨 Report</button>
        </div>
      </div>
    </div>
  );
}