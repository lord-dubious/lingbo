
import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

export const ConfettiOverlay = ({ onRestart, title = "Great Job!", subtitle = "O mara nma!" }: { onRestart?: () => void, title?: string, subtitle?: string }) => (
  <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in p-6 text-center backdrop-blur-sm rounded-3xl">
    <div className="mb-6 relative">
        <Sparkles size={80} className="text-yellow-400 animate-spin-slow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Trophy size={100} className="text-purple-500 relative z-10 drop-shadow-xl" />
    </div>
    <h3 className="font-kids font-bold text-4xl text-pink-500 mb-2">{title}</h3>
    <p className="font-bold text-gray-500 text-lg mb-8">{subtitle}</p>
    {onRestart && <button onClick={onRestart} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Play Again</button>}
  </div>
);
