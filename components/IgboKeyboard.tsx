
import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { IGBO_KEYS } from '../constants';

interface IgboKeyboardProps {
  onKeyPress?: (key: string) => void;
}

const IgboKeyboard: React.FC<IgboKeyboardProps> = ({ onKeyPress }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyClick = (k: string) => {
    // Dispatch a custom event or callback. 
    // For a real app, this would integrate with the focused input.
    // Here we just copy to clipboard as a fallback or use the callback if provided.
    if (onKeyPress) {
      onKeyPress(k);
    } else {
      navigator.clipboard.writeText(k).then(() => {
        alert(`Copied '${k}' to clipboard!`);
      });
    }
  };

  return (
    <>
      {/* Floating Action Button - Moved up to bottom-24 to clear nav bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Toggle Igbo Keyboard"
      >
        {isOpen ? <X size={24} /> : <Keyboard size={24} />}
      </button>

      {/* Overlay Keyboard */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-50 bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-64 animate-in slide-in-from-bottom-5">
          <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Igbo Characters</h3>
          <div className="grid grid-cols-4 gap-2">
            {IGBO_KEYS.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyClick(char)}
                className="bg-neutral hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-md active:scale-95 transition-transform"
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default IgboKeyboard;
