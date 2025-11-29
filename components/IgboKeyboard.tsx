
import React, { useState, useRef } from 'react';
import { Keyboard, X } from 'lucide-react';
import { IGBO_KEYS } from '../constants';

interface IgboKeyboardProps {
  onKeyPress?: (key: string) => void;
}

const IgboKeyboard: React.FC<IgboKeyboardProps> = ({ onKeyPress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 96 }); // Start at left: 24px, bottom: 96px
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleKeyClick = (k: string) => {
    if (onKeyPress) {
      onKeyPress(k);
    } else {
      navigator.clipboard.writeText(k).then(() => {
        alert(`Copied '${k}' to clipboard!`);
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 64, dragRef.current.initialX + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 64, dragRef.current.initialY + deltaY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* Draggable Floating Button - Semi-transparent */}
      <button
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!isDragging) setIsOpen(!isOpen);
        }}
        className="fixed z-50 bg-primary/70 backdrop-blur-sm text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all cursor-move"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        aria-label="Toggle Igbo Keyboard"
      >
        {isOpen ? <X size={24} /> : <Keyboard size={24} />}
      </button>

      {/* Overlay Keyboard - Appears near button */}
      {isOpen && (
        <div
          className="fixed z-50 bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-64 animate-in slide-in-from-bottom-5"
          style={{
            left: `${Math.min(position.x, window.innerWidth - 280)}px`,
            top: `${Math.max(position.y + 70, 0)}px`
          }}
        >
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
