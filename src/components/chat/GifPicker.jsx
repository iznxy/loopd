import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function fetchGifs(q) {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("giphy", { query: q });
      setGifs(res?.data?.gifs || []);
    } catch {
      setGifs([]);
    }
    setLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" style={{ width: 320, maxHeight: 400 }}>
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search GIFs…"
          className="flex-1 bg-transparent text-sm text-foreground outline-none"
        />
        <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
      </div>
      <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 340 }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-10">No GIFs found</div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-1">
            {gifs.map(gif => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.full)}
                className="aspect-square overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
              >
                <img
                  src={gif.preview}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
        <div className="text-center text-[10px] text-muted-foreground py-2">Powered by GIPHY</div>
      </div>
    </div>
  );
}