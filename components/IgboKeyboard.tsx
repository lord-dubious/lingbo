
import React, { useState } from 'react';
import { Keyboard, ChevronDown } from 'lucide-react';
import { IGBO_KEYS } from '../constants';

interface IgboKeyboardProps {
  onKeyPress?: (key: string) => void;
}

const IgboKeyboard: React.FC<IgboKeyboardProps> = ({ onKeyPress }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyClick = (k: string) => {
    if (onKeyPress) {
      onKeyPress(k);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(k).then(() => {
        // Optional: show a small toast or visual feedback here
      });
    }
  };

  return (
    <>
      {/* Trigger Button (Only visible if keyboard is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 bg-white/90 backdrop-blur text-primary border border-primary/20 p-3 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all active:scale-95"
          aria-label="Open Igbo Keyboard"
        >
          <Keyboard size={24} />
        </button>
      )}

      {/* Slide-up Accessory Bar */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[100] bg-gray-100 border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-200/50 border-b border-gray-200/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Igbo Characters</span>
          <button onClick={() => setIsOpen(false)} className="p-1 bg-gray-300 rounded-full text-gray-600 hover:bg-gray-400">
            <ChevronDown size={16} />
          </button>
        </div>
        
        <div className="p-2 grid grid-cols-8 gap-1.5 md:gap-2 overflow-x-auto">
          {IGBO_KEYS.map((char) => (
            <button
              key={char}
              onClick={() => handleKeyClick(char)}
              className="bg-white hover:bg-orange-50 active:bg-orange-100 text-gray-800 font-bold text-lg py-3 rounded-lg shadow-sm border-b-2 border-gray-200 active:border-b-0 active:translate-y-[2px] transition-all touch-manipulation"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default IgboKeyboard;
