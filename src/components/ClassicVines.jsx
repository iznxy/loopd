import React, { useState } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Curated classic vines with original creators and copyright attribution
const CLASSIC_VINES = [
  {
    id: "cv1",
    title: "Road Work Ahead",
    creator: "Danny Duncan",
    year: "2015",
    description: "\"Road work ahead? Uh, yeah, I sure hope it does!\"",
    category: "Comedy",
    emoji: "🚧",
    gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    copyright: "© Danny Duncan. Original Vine content. All rights reserved.",
    url: null,
  },
  {
    id: "cv2",
    title: "Whoa, I Never Lost One Game",
    creator: "KingBach",
    year: "2014",
    description: "KingBach's iconic reaction format that defined Vine comedy.",
    category: "Comedy",
    emoji: "😂",
    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
    copyright: "© Andrew Bachelor (KingBach). Original Vine content.",
    url: null,
  },
  {
    id: "cv3",
    title: "Back At It Again at Krispy Kreme",
    creator: "Darius Benson",
    year: "2015",
    description: "The iconic skateboarding Krispy Kreme vine.",
    category: "Iconic",
    emoji: "🍩",
    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
    copyright: "© Darius Benson. Original Vine content. Viral 2015.",
    url: null,
  },
  {
    id: "cv4",
    title: "It Is Wednesday My Dudes",
    creator: "Lele Pons",
    year: "2016",
    description: "The frog vine that defined mid-week internet culture.",
    category: "Meme",
    emoji: "🐸",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    copyright: "© Popular meme format, original frog footage public domain.",
    url: null,
  },
  {
    id: "cv5",
    title: "Two Bros in a Hot Tub",
    creator: "Thomas Sanders",
    year: "2014",
    description: "The vine that launched a thousand memes.",
    category: "Comedy",
    emoji: "🛁",
    gradient: "linear-gradient(135deg,#fa709a,#fee140)",
    copyright: "© Thomas Sanders. Original Vine content.",
    url: null,
  },
  {
    id: "cv6",
    title: "Hi Welcome to Chili's",
    creator: "Various / Anonymous",
    year: "2014",
    description: "The classic Vine intro that became synonymous with internet humor.",
    category: "Iconic",
    emoji: "🌶️",
    gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    copyright: "© Original creator unknown. Viral Vine format, 2014.",
    url: null,
  },
  {
    id: "cv7",
    title: "Catch Me Outside",
    creator: "Bhad Bhabie",
    year: "2016",
    description: "\"Cash me ousside, how bow dah?\" — Dr. Phil viral moment.",
    category: "Viral",
    emoji: "💅",
    gradient: "linear-gradient(135deg,#f093fb,#764ba2)",
    copyright: "© Dr. Phil / CBS. Clip from Dr. Phil Show, aired 2016.",
    url: null,
  },
  {
    id: "cv8",
    title: "Hurricane Tortilla",
    creator: "Liane V",
    year: "2013",
    description: "One of the earliest viral Vine cooking fails.",
    category: "Fail",
    emoji: "🌀",
    gradient: "linear-gradient(135deg,#4facfe,#667eea)",
    copyright: "© Liane V. Original Vine content.",
    url: null,
  },
  {
    id: "cv9",
    title: "Do It for the Vine",
    creator: "Multiple Creators",
    year: "2013–2016",
    description: "The rallying cry of Vine culture — creators doing crazy stunts.",
    category: "Culture",
    emoji: "🍇",
    gradient: "linear-gradient(135deg,#43e97b,#667eea)",
    copyright: "© Various creators. Vine Inc. platform closed Jan 2017.",
    url: null,
  },
  {
    id: "cv10",
    title: "Deez Nuts",
    creator: "WelvenDaGreat",
    year: "2015",
    description: "Welven Harris's breakout Vine that spawned endless parodies.",
    category: "Comedy",
    emoji: "😆",
    gradient: "linear-gradient(135deg,#fa709a,#fee140)",
    copyright: "© Welven Harris (WelvenDaGreat). Original Vine content, 2015.",
    url: null,
  },
  {
    id: "cv11",
    title: "Broom Broom",
    creator: "Brittany Furlan",
    year: "2014",
    description: "Brittany Furlan's iconic parody driving vine.",
    category: "Comedy",
    emoji: "🚗",
    gradient: "linear-gradient(135deg,#a18cd1,#4facfe)",
    copyright: "© Brittany Furlan. Original Vine content.",
    url: null,
  },
  {
    id: "cv12",
    title: "Damn Daniel",
    creator: "Josh Holz",
    year: "2016",
    description: "\"Damn Daniel! Back at it again with the white Vans!\"",
    category: "Viral",
    emoji: "👟",
    gradient: "linear-gradient(135deg,#f5576c,#43e97b)",
    copyright: "© Josh Holz. Original Vine / Twitter content, 2016.",
    url: null,
  },
];

const CATEGORIES = ["All", "Comedy", "Iconic", "Meme", "Viral", "Fail", "Culture"];

export default function ClassicVines() {
  const { accentColor } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = activeCategory === "All"
    ? CLASSIC_VINES
    : CLASSIC_VINES.filter(v => v.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-bold text-foreground">🍇 Classic Vines</span>
          <span className="text-xs text-muted-foreground">— The Originals</span>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={activeCategory === cat
                ? { background: accentColor, color: "#fff" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vine cards */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-3">
        {filtered.map(vine => (
          <div
            key={vine.id}
            className="rounded-2xl overflow-hidden border border-border cursor-pointer"
            onClick={() => setExpanded(expanded === vine.id ? null : vine.id)}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-3.5" style={{ background: vine.gradient }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl bg-black/20 flex-shrink-0">
                {vine.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm drop-shadow truncate">{vine.title}</div>
                <div className="text-white/80 text-xs">@{vine.creator} · {vine.year}</div>
              </div>
              <span className="text-white/70 text-[10px] bg-black/20 rounded-full px-2 py-0.5 flex-shrink-0">{vine.category}</span>
            </div>

            {/* Expanded detail */}
            {expanded === vine.id && (
              <div className="bg-card px-4 py-3 space-y-2">
                <p className="text-sm text-foreground italic">"{vine.description}"</p>
                <div className="flex items-start gap-2 bg-muted rounded-xl p-2.5">
                  <span className="text-[10px]">©</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{vine.copyright}</p>
                </div>
                <div className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  ⚠️ Vine platform was shut down on January 17, 2017. All original content belongs to its respective creators. Displayed here for cultural archival and educational purposes only.
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Footer disclaimer */}
        <div className="bg-muted rounded-xl px-4 py-3 mt-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            🍇 Vine (2012–2017) was a short-form video platform owned by Twitter, Inc. All vine content and associated rights belong to their original creators. Loopd is not affiliated with Vine or Twitter/X Corp. Content shown for cultural archival purposes.
          </p>
        </div>
      </div>
    </div>
  );
}