
import React from 'react';
import { Hand, Pointer, ArrowUp } from 'lucide-react';

interface TutorialOverlayProps {
  type: 'tap' | 'swipe' | 'trace' | 'drag';
  message: string;
  onComplete: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ type, message, onComplete }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <style>{`
        @keyframes tap {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(0.9); opacity: 1; }
        }
        @keyframes swipe {
          0% { transform: translateX(-40px) rotate(-10deg); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateX(40px) rotate(10deg); opacity: 1; }
          100% { transform: translateX(60px) rotate(10deg); opacity: 0; }
        }
        @keyframes drag {
          0% { transform: translateY(40px); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateY(-40px); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes trace {
            0% { transform: translateX(-30px) translateY(20px); }
            25% { transform: translateX(0px) translateY(-20px); }
            50% { transform: translateX(30px) translateY(20px); }
            75% { transform: translateX(0px) translateY(-20px); }
            100% { transform: translateX(-30px) translateY(20px); }
        }
      `}</style>

      <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
        {/* Hand Graphic */}
        <div 
            className="text-white drop-shadow-2xl"
            style={{
                animation: type === 'tap' ? 'tap 1s infinite' : 
                           type === 'swipe' ? 'swipe 2s infinite ease-in-out' : 
                           type === 'trace' ? 'trace 3s infinite linear' :
                           'drag 2s infinite ease-in-out'
            }}
        >
            <Hand size={80} fill="white" className="stroke-black stroke-2" />
        </div>

        {/* Visual Cues */}
        {type === 'tap' && <div className="absolute w-20 h-20 bg-white/30 rounded-full animate-ping"></div>}
      </div>

      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in slide-in-from-bottom-8">
        <h3 className="font-kids font-bold text-2xl text-gray-800 mb-2">Let's Play!</h3>
        <p className="text-gray-600 text-lg mb-6">{message}</p>
        <button 
          onClick={onComplete}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-600 hover:scale-105 transition-all text-xl"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
