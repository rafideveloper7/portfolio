import React from 'react';
// Import whichever icon you chose (e.g., your custom TikTokIcon or a dial/phone icon)
import { MessageSquare } from 'lucide-react'; 

export default function MobileFunButton() {
  return (
    <button 
      className="
        fixed bottom-6 right-6 z-50 
        p-4 bg-zinc-800 text-white rounded-full shadow-lg
        hover:scale-110 active:scale-95 transition-transform
        /* CRITICAL: Shows as block on mobile, hides on desktop */
        block md:hidden
      "
      onClick={() => alert("Just for fun! 🚀")}
    >
      {/* Put your icon here (TikTok, Dial, or whatever you like) */}
      <MessageSquare className="w-6 h-6 text-blue-400" />
    </button>
  );
}