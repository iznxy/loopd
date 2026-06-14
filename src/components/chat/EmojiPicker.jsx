import React, { useState } from "react";

const EMOJI_CATEGORIES = {
  "😀 Smileys": ["😀","😂","🤣","😍","🥰","😘","😎","🤩","😱","😭","😤","🤔","😴","🥺","🤯","🥳","😇","😈","🤪","🙄","😑","🤫","🤭","🫡","🫠","😮‍💨"],
  "❤️ Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💗","💓","💞","💕","💟","❣️","💔","🫀","❤️‍🔥","❤️‍🩹"],
  "👋 Hands": ["👍","👎","👌","🤌","✌️","🤞","🤙","💪","🙌","👏","🤝","🫶","✋","🤚","🖐️","🖖","🤟","🤘","☝️","🫵","👊","🤜","🤛","✊"],
  "🔥 Hype": ["🔥","💯","⚡","🎉","🎊","🥇","🏆","🎯","💥","✨","🌟","💫","⭐","🌈","🦋","🎵","🎶","🚀","💎","👑"],
  "🍕 Food": ["🍕","🍔","🌮","🍜","🍣","🍦","☕","🧋","🍺","🎂","🍩","🍇","🍓","🍑","🥑","🌭","🥐","🧇","🍪","🍫"],
  "😸 Animals": ["🐶","🐱","🐼","🦊","🐻","🐸","🐧","🦁","🐯","🐨","🦋","🐝","🦄","🐉","🦖","🐙","🦑","🐬","🦈","🦒"],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" style={{ width: 300, maxHeight: 360 }}>
      {/* Category tabs */}
      <div className="flex overflow-x-auto hide-scrollbar px-2 pt-2 gap-1 border-b border-border pb-2">
        {Object.keys(EMOJI_CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 text-lg px-1.5 py-0.5 rounded-lg transition-all"
            style={{ background: activeCategory === cat ? "var(--muted)" : "transparent" }}
          >
            {cat.split(" ")[0]}
          </button>
        ))}
      </div>
      {/* Emoji grid */}
      <div className="p-2 overflow-y-auto hide-scrollbar" style={{ maxHeight: 280 }}>
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].map(emoji => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="text-xl p-1 rounded-lg hover:bg-muted transition-colors text-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}