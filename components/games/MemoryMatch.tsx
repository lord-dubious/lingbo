import React, { useState, useEffect } from 'react';
import { RefreshCcw, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { MEMORY_GAME_DATA } from '../../constants';
import { playGameSound } from '../../utils/audioUtils';
import Layout from '../Layout';
import { ConfettiOverlay } from '../ConfettiOverlay';

const MemoryMatch = () => {
  const [cards, setCards] = useState(() => {
     return [...MEMORY_GAME_DATA, ...MEMORY_GAME_DATA.map(i => ({...i, id: i.id + '_pair'}))]
         .sort(() => Math.random() - 0.5)
         .map(c => ({...c, flipped: false, matched: false, isError: false }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);

  // Check for match when 2 cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flipped;
      setIsChecking(true);

      if (cards[first].matchId === cards[second].matchId) {
        // MATCH
        setTimeout(() => {
             playGameSound('success');
             setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, matched: true } : c));
             setFlipped([]);
             setIsChecking(false);
             
             // Show Match Overlay
             setShowMatchOverlay(true);
             setTimeout(() => setShowMatchOverlay(false), 1200);

        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
            playGameSound('error');
            setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, isError: true } : c));
            
            setTimeout(() => {
                setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, flipped: false, isError: false } : c));
                setFlipped([]);
                setIsChecking(false);
                playGameSound('flip'); 
            }, 800);
        }, 500);
      }
    }
  }, [flipped]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
        setTimeout(() => {
            setSolved(true);
            playGameSound('win');
        }, 500);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].flipped || cards[index].matched) return;
    
    playGameSound('flip');
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    setFlipped(prev => [...prev, index]);
  };

  return (
     <Layout title="Memory Match" showBack isKidsMode hideBottomNav>
        {solved && <ConfettiOverlay onRestart={() => window.location.reload()} title="You Won!" subtitle={`Found all pairs in ${moves} moves`} />}
        
        {/* Match Visual Cue Overlay */}
        {showMatchOverlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-green-500/90 backdrop-blur-sm p-8 rounded-3xl animate-in zoom-in fade-in duration-300 flex flex-col items-center">
                    <Star size={80} className="text-yellow-300 fill-yellow-300 animate-spin-slow drop-shadow-lg" />
                    <h2 className="text-5xl font-kids font-black text-white mt-4 drop-shadow-md">MATCH!</h2>
                </div>
            </div>
        )}

        <div className="flex justify-center mb-6">
             <div className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full text-lg font-bold flex items-center gap-2 shadow-sm border border-indigo-200">
                 <RefreshCcw size={18} /> Moves: {moves}
             </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
          {cards.map((card, i) => (
             <div key={card.id} className="aspect-square relative group" style={{ perspective: '1000px' }}>
                <button 
                    onClick={() => handleCardClick(i)} 
                    className={`w-full h-full rounded-2xl transition-all duration-500 relative shadow-md ${card.isError ? 'animate-shake' : ''} hover:scale-105`}
                    style={{ transformStyle: 'preserve-3d', transform: (card.flipped || card.matched) ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    disabled={isChecking || card.flipped || card.matched}
                >
                    {/* Front (Blue side - default visible) */}
                    <div 
                        className="absolute inset-0 bg-indigo-500 rounded-2xl border-b-[6px] border-indigo-700 flex items-center justify-center"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-indigo-300/50">
                            <Sparkles size={40} />
                        </div>
                    </div>

                    {/* Back (White side - content) */}
                    <div 
                        className={`absolute inset-0 bg-white rounded-2xl border-[4px] flex items-center justify-center overflow-hidden transition-colors duration-300
                            ${card.matched ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : card.isError ? 'border-red-400 bg-red-50' : 'border-indigo-200'}
                        `}
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        {card.matched && (
                             <div className="absolute top-1 right-1 z-20 bg-green-500 text-white rounded-full p-0.5 animate-in zoom-in">
                                 <CheckCircle2 size={16} />
                             </div>
                        )}

                        {card.type === 'image' ? (
                            <img src={card.content} className="w-full h-full object-cover p-1 rounded-xl" alt="Memory Card" />
                        ) : (
                            <span className="font-bold text-lg text-gray-700 font-kids text-center leading-tight px-1">{card.content}</span>
                        )}
                    </div>
                </button>
             </div>
          ))}
        </div>
     </Layout>
  );
};

export default MemoryMatch;