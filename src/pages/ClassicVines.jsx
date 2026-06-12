import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const ARCHIVE_ID = "clean_vines_for_the_children_of_jesus";

// Curated individual Vine mp4s from archive.org — direct streaming, no CORS issues
// Format: https://archive.org/download/{id}/{filename}
const CURATED_VINES = [
  {
    file: "Annie Are You Ok [23441736 views \u2022 20160401] - by Ratamamhata kanishka - NR1zHdFN8A4.mp4",
    title: "Annie Are You Ok",
    creator: "Ratamamhata kanishka",
    views: "23.4M",
    year: "2016",
  },
  {
    file: "Battery Vine _ AAA [43303757 views \u2022 20170210] - by Ry0x - YUTeAcKyR24.mp4",
    title: "Battery Vine",
    creator: "Ry0x",
    views: "43.3M",
    year: "2017",
  },
  {
    file: "Back at it again at Krispy Kreme Vine [3848204 views \u2022 20161028] - by Melissa Romero - ax27VgI-lVE.mp4",
    title: "Back at it again at Krispy Kreme",
    creator: "Melissa Romero",
    views: "3.8M",
    year: "2016",
  },
  {
    file: "Anything for you Beyonce [3927939 views \u2022 20131027] - by Best Vines - KY_nkn5ShfM.mp4",
    title: "Anything for you Beyoncé",
    creator: "Best Vines",
    views: "3.9M",
    year: "2013",
  },
  {
    file: "'Baby It's You' - Vine [16036764 views \u2022 20140613] - by Nene Rawrs - 2IVw0Hx_i_E.mp4",
    title: "Baby It's You",
    creator: "Nene Rawrs",
    views: "16M",
    year: "2014",
  },
  {
    file: "Ball Goes Under Treadmill! [5959609 views \u2022 20150305] - by PoohProductions - x1lICBhp_W8.mp4",
    title: "Ball Goes Under Treadmill!",
    creator: "PoohProductions",
    views: "5.9M",
    year: "2015",
  },
  {
    file: "'They. are. my. crocs.'  -by - Joey Gatto LIKE \u27a1 Vines For [7540493 views \u2022 20150806] - by Pesona Martus - zxLF7kR6An4.mp4",
    title: "They. are. my. crocs.",
    creator: "Joey Gatto",
    views: "7.5M",
    year: "2015",
  },
  {
    file: "Baby you got a Body like a Croissant Vine [4769701 views \u2022 20150711] - by CallOfJewD - CTng3plfCxU.mp4",
    title: "Body like a Croissant",
    creator: "CallOfJewD",
    views: "4.7M",
    year: "2015",
  },
  {
    file: "'I had a great time when I was Trick or Treating. I had lots of makeup on my face.' Vine inspirat... [4472480 views \u2022 20131106] - by Family Vines - AvGhRhdvozI.mp4",
    title: "Trick or Treating Vine",
    creator: "Family Vines",
    views: "4.4M",
    year: "2013",
  },
];

const BG_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
];

function buildUrl(file) {
  return `https://archive.org/download/${ARCHIVE_ID}/${encodeURIComponent(file)}`;
}

function VineCard({ vine, index, isActive, accentColor }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || error) return;
    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive, error]);

  const videoUrl = buildUrl(vine.file);

  return (
    <div
      className="relative w-full flex-shrink-0 bg-black"
      style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      {!error ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain bg-black"
          loop
          muted={muted}
          playsInline
          onError={() => setError(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            v.paused ? v.play() : v.pause();
          }}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-4"
          style={{ background: BG_GRADIENTS[index % BG_GRADIENTS.length] }}
        >
          <div className="text-6xl">🍇</div>
          <div className="text-white font-bold text-center px-8 text-lg">{vine.title}</div>
          <div className="text-white/50 text-xs">by {vine.creator} · {vine.year}</div>
          <a
            href={`https://archive.org/details/${ARCHIVE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-4 py-2 rounded-full text-white text-xs font-bold bg-white/20 backdrop-blur-sm"
          >
            View on Archive.org
          </a>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 pointer-events-none" />

      {/* Mute toggle */}
      {!error && (
        <button
          className="absolute top-16 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center z-10 backdrop-blur-sm"
          onClick={() => setMuted(m => !m)}
        >
          {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
        </button>
      )}

      {/* Right actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <div
          className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-base"
          style={{ background: accentColor }}
        >
          🍇
        </div>
        <button
          onClick={() => setLiked(l => !l)}
          className="flex flex-col items-center gap-1"
        >
          <Heart size={28} fill={liked ? "#e91e8c" : "none"} color={liked ? "#e91e8c" : "#fff"} strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{vine.views}</span>
        </button>
        <button
          onClick={() => {
            try { navigator.share({ title: vine.title, text: `Classic Vine: ${vine.title} 🍇` }); } catch {}
          }}
          className="flex flex-col items-center gap-1"
        >
          <Share2 size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Share</span>
        </button>
        {!error && (
          <button
            onClick={() => {
              const v = videoRef.current;
              if (v) { v.currentTime = 0; v.play(); }
            }}
            className="flex flex-col items-center gap-1"
          >
            <RotateCcw size={22} color="#fff" strokeWidth={2} />
            <span className="text-white text-xs font-bold drop-shadow">Loop</span>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-20 z-10 pointer-events-none">
        <div className="font-bold text-white text-sm mb-0.5 drop-shadow-md">@{vine.creator}</div>
        <p className="text-white/90 text-sm leading-snug drop-shadow mb-2 font-medium">{vine.title}</p>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
            📼 archive.org · {vine.year}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
            👁 {vine.views} views
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ClassicVines() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [extraVines, setExtraVines] = useState([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef(null);

  // Fetch more vines dynamically from the archive.org metadata API
  useEffect(() => {
    fetch(`https://archive.org/metadata/${ARCHIVE_ID}/files`)
      .then(r => r.json())
      .then(data => {
        const mp4s = (data.result || [])
          .filter(f => f.format === "MPEG4" && f.name.endsWith(".mp4") && f.length && parseFloat(f.length) < 60)
          .slice(0, 40);

        const curated = new Set(CURATED_VINES.map(v => v.file));
        const extras = mp4s
          .filter(f => !curated.has(f.name))
          .map(f => {
            // Parse title and creator from filename pattern: "Title [views • date] - by Creator - ID.mp4"
            const match = f.name.match(/^(.+?)\s*\[[\d,.]+ views[^\]]*\]\s*-\s*by\s+(.+?)\s*-\s*[\w]+\.mp4$/);
            const idMatch = f.name.match(/-\s*([\w]+)\.mp4$/);
            const views = f.name.match(/\[([\d,.]+[KMB]?)\s*views/);
            const year = f.name.match(/20(\d{2})\d{4}/);
            return {
              file: f.name,
              title: match ? match[1].trim() : f.name.replace(/\[.*/, "").trim(),
              creator: match ? match[2].trim() : "Vine",
              views: views ? views[1] : "?",
              year: year ? `20${year[1]}` : "2015",
            };
          });
        setExtraVines(extras);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allVines = [...CURATED_VINES, ...extraVines];

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setCurrentIndex(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Floating header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 pt-3 pb-3 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="white" />
        </button>
        <span className="text-white font-bold text-base flex-1">🍇 Classic Vines</span>
        <span className="text-white/50 text-xs">
          {loading ? "Loading…" : `${allVines.length} vines`}
        </span>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-scroll hide-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {allVines.map((vine, i) => (
          <VineCard
            key={vine.file}
            vine={vine}
            index={i}
            isActive={i === currentIndex}
            accentColor={accentColor}
          />
        ))}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}