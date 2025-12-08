
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Volume2, ChevronRight, Timer, Star, Trophy, Sparkles, XCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { KIDS_FLASHCARDS, KIDS_GAMES, MEMORY_GAME_DATA } from '../constants';
import { playPCMAudio, playGameSound } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';
import Layout from '../components/Layout';
import { ConfettiOverlay } from '../components/ConfettiOverlay';

// --- Flashcards ---
export const FlashcardWrapper = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const card = KIDS_FLASHCARDS[currentCard];

    useEffect(() => {
        setIsFlipped(false);
    }, [currentCard]);
    
    const next = () => {
        playGameSound('click');
        setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length);
    };
    
    const prev = () => {
        playGameSound('click');
        setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
    };

    const toggleFlip = () => {
        playGameSound('flip');
        setIsFlipped(!isFlipped);
    };

    return (
        <Layout title="Word Flash" showBack isKidsMode hideBottomNav>
            <div className="flex flex-col items-center h-full justify-center pb-8 perspective-1000">
              {/* Card Container with 3D Flip */}
              <div 
                onClick={toggleFlip}
                className="w-full max-w-sm aspect-[3/4] relative cursor-pointer group"
                style={{ perspective: '1000px' }}
              >
                 <div className={`w-full h-full transition-all duration-700 transform preserve-3d ${isFlipped ? 'rotate-y-180' : ''} relative`}>
                    
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[40px] shadow-xl border-[6px] border-white ring-4 ring-blue-100 flex flex-col items-center justify-center p-6">
                         <div className="absolute top-6 right-6">
                            <div className="bg-blue-100 text-blue-500 rounded-full p-2 hover:bg-blue-200 transition-colors"><RotateCw size={20} /></div>
                         </div>
                         <div className="flex-1 flex items-center justify-center w-full">
                            <img src={card.image} alt="Guess" className="w-64 h-64 object-contain drop-shadow-md" />
                         </div>
                         <p className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-4">Tap to reveal</p>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-500 rounded-[40px] shadow-xl border-[6px] border-blue-400 ring-4 ring-blue-200 flex flex-col items-center justify-center p-6 text-white">
                         <h2 className="text-6xl font-kids font-bold mb-4">{card.igbo}</h2>
                         <div className="bg-blue-600/50 px-6 py-2 rounded-full mb-8 backdrop-blur-sm">
                             <p className="text-2xl font-bold opacity-90">{card.english}</p>
                         </div>
                         <button 
                             onClick={(e) => { 
                                 e.stopPropagation();
                                 generateIgboSpeech(card.igbo).then(b64 => b64 && playPCMAudio(b64)); 
                             }} 
                             className="w-24 h-24 bg-white text-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
                         >
                            <Volume2 size={40} />
                         </button>
                    </div>
                 </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-6 mt-10">
                <button onClick={prev} className="w-16 h-16 bg-white rounded-full shadow-md text-gray-400 hover:text-blue-500 transition-colors flex items-center justify-center border-2 border-gray-100 active:scale-95">
                    <ChevronRight size={32} className="rotate-180" />
                </button>
                 <div className="flex gap-1.5">
                    {KIDS_FLASHCARDS.map((_, i) => (
                        <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentCard ? 'w-8 bg-blue-500' : 'w-2.5 bg-gray-200'}`} />
                    ))}
                </div>
                <button onClick={next} className="w-16 h-16 bg-blue-500 rounded-full shadow-lg shadow-blue-200 text-white flex items-center justify-center hover:bg-blue-600 transition-colors active:scale-95">
                    <ChevronRight size={32} />
                </button>
              </div>
            </div>
        </Layout>
    )
};

// --- Sentence Puzzle ---
export const SentenceGameWrapper = () => {
    const [gameWon, setGameWon] = useState(false);
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);
    const sentenceGame = KIDS_GAMES[0];
    const [availableBlocks, setAvailableBlocks] = useState<string[]>(sentenceGame.example_round.scrambled_blocks);

    const handleBlockClick = (word: string) => {
        playGameSound('click');
        const newSentence = [...builtSentence, word];
        setBuiltSentence(newSentence);
        setAvailableBlocks(availableBlocks.filter(b => b !== word));
        
        // Check win condition
        if (newSentence.length === sentenceGame.example_round.correct_order.length) {
          if (newSentence.every((val, i) => val === sentenceGame.example_round.correct_order[i])) {
            setTimeout(() => {
                playGameSound('win');
                setGameWon(true);
                generateIgboSpeech("O mara nma!").then(b64 => b64 && playPCMAudio(b64));
            }, 500);
          } else {
            setTimeout(() => {
                playGameSound('error');
                // Auto reset on wrong attempt after delay
                // Optional: visual shake effect
            }, 300);
          }
        }
    };

    const reset = () => { 
        setBuiltSentence([]); 
        setAvailableBlocks(sentenceGame.example_round.scrambled_blocks); 
        setGameWon(false); 
    };

    const handleRemoveBlock = (word: string, index: number) => {
        playGameSound('click');
        const newSentence = [...builtSentence];
        newSentence.splice(index, 1);
        setBuiltSentence(newSentence);
        setAvailableBlocks([...availableBlocks, word]);
    };

    return (
        <Layout title="Puzzle" showBack isKidsMode hideBottomNav>
             <div className="flex flex-col h-[calc(100vh-140px)]">
               {gameWon && <ConfettiOverlay onRestart={reset} title="You did it!" subtitle={sentenceGame.example_round.target_sentence} />}
               
               {/* Goal Section */}
               <div className="bg-white rounded-3xl p-4 shadow-sm border border-orange-100 flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                    <img src={sentenceGame.example_round.visual_aid} className="w-14 h-14 object-cover rounded-xl" alt="Hint" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-1">Make this sentence:</div>
                    <div className="font-bold text-xl text-gray-800">"{sentenceGame.example_round.target_sentence}"</div>
                 </div>
               </div>

               {/* Drop Zone */}
               <div className="flex-1 bg-blue-50/50 rounded-3xl border-4 border-dashed border-blue-200 p-6 flex flex-wrap content-start gap-3 relative mb-6 transition-colors hover:bg-blue-50 hover:border-blue-300">
                  {builtSentence.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-blue-300 font-kids font-bold text-2xl opacity-50 pointer-events-none">
                          Put blocks here!
                      </div>
                  )}
                  {builtSentence.map((word, i) => (
                      <button 
                        key={`${word}-${i}`} 
                        onClick={() => handleRemoveBlock(word, i)}
                        className="bg-white text-blue-600 font-kids font-bold text-xl px-6 py-3 rounded-2xl shadow-[0_4px_0_#bfdbfe] border-2 border-blue-100 animate-in zoom-in duration-300 hover:scale-105 active:scale-95 active:shadow-none active:translate-y-1"
                      >
                          {word}
                      </button>
                  ))}
               </div>

               {/* Choice Blocks */}
               <div className="bg-orange-100 rounded-t-[40px] -mx-4 -mb-4 p-8 pb-12">
                 <div className="flex justify-center mb-4">
                     <div className="w-12 h-1.5 bg-orange-200 rounded-full"></div>
                 </div>
                 <div className="flex flex-wrap justify-center gap-4 min-h-[80px]">
                    {availableBlocks.map((word, i) => (
                        <button 
                            key={`${word}-${i}`} 
                            onClick={() => handleBlockClick(word)} 
                            className="bg-orange-500 text-white font-kids font-bold text-xl px-6 py-4 rounded-2xl shadow-[0_6px_0_#9a3412] active:shadow-none active:translate-y-1.5 transition-all hover:bg-orange-400"
                        >
                            {word}
                        </button>
                    ))}
                 </div>
                 
                 <div className="mt-8 flex justify-center">
                    <button onClick={reset} className="text-orange-700/60 flex items-center gap-2 text-sm font-bold hover:text-orange-700 bg-orange-200/50 px-4 py-2 rounded-full transition-colors">
                        <RefreshCcw size={16} /> Reset Puzzle
                    </button>
                 </div>
               </div>
            </div>
        </Layout>
    );
};

// --- Memory Match ---
const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState(() => {
     return [...MEMORY_GAME_DATA, ...MEMORY_GAME_DATA.map(i => ({...i, id: i.id + '_pair'}))]
         .sort(() => Math.random() - 0.5)
         .map(c => ({...c, flipped: false, matched: false, isError: false }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false); // Lock for animation

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
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
            playGameSound('error');
            // Show error state briefly
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
    // Block clicks if checking, already flipped, or already matched
    if (isChecking || cards[index].flipped || cards[index].matched) return;
    
    playGameSound('flip');
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    setFlipped(prev => [...prev, index]);
  };

  return (
     <Layout title="Memory Match" showBack isKidsMode hideBottomNav>
        {solved && <ConfettiOverlay onRestart={() => window.location.reload()} title="You Won!" subtitle={`Found all pairs in ${moves} moves`} />}
        
        <div className="flex justify-center mb-6">
             <div className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full text-lg font-bold flex items-center gap-2 shadow-sm border border-indigo-200">
                 <RefreshCcw size={18} /> Moves: {moves}
             </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
          {cards.map((card, i) => (
             <div key={card.id} className="aspect-square relative perspective-1000 group">
                <button 
                    onClick={() => handleCardClick(i)} 
                    className={`w-full h-full rounded-2xl transition-all duration-500 transform preserve-3d shadow-md relative ${card.flipped || card.matched ? 'rotate-y-180' : ''} ${card.isError ? 'animate-shake' : ''}`}
                    disabled={isChecking || card.flipped || card.matched}
                >
                    {/* Front (Hidden state) */}
                    <div className="absolute inset-0 backface-hidden bg-indigo-500 rounded-2xl border-b-[6px] border-indigo-700 flex items-center justify-center">
                        <div className="text-indigo-300/50">
                            <Sparkles size={40} />
                        </div>
                    </div>

                    {/* Back (Revealed state) */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl border-[4px] flex items-center justify-center overflow-hidden transition-colors duration-300
                        ${card.matched ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : card.isError ? 'border-red-400 bg-red-50' : 'border-indigo-200'}
                    `}>
                        {/* Match Indicator Overlay */}
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
export const MemoryGameWrapper = () => <MemoryGame onBack={() => window.history.back()} />;

// --- Speed Tap ---
const SpeedTapGame = ({ onBack }: { onBack: () => void }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentQuestion, setCurrentQuestion] = useState(KIDS_FLASHCARDS[0]);
    const [options, setOptions] = useState<typeof KIDS_FLASHCARDS>([]);
    const [gameOver, setGameOver] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
       if (timeLeft > 0 && !gameOver) {
         const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
         return () => clearInterval(timer);
       } else if (timeLeft === 0) {
         setGameOver(true);
         playGameSound('win');
       }
    }, [timeLeft, gameOver]);

    const generateRound = () => {
       const target = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
       let opts = [target];
       while (opts.length < 4) {
          const r = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
          if (!opts.find(o => o.igbo === r.igbo)) opts.push(r);
       }
       setOptions(opts.sort(() => Math.random() - 0.5));
       setCurrentQuestion(target);
    };

    useEffect(() => {
       generateRound();
    }, []);

    const handleTap = (item: typeof KIDS_FLASHCARDS[0]) => {
       if (item.igbo === currentQuestion.igbo) {
          setScore(s => s + 10);
          playGameSound('success');
          generateRound();
       } else {
          setScore(s => Math.max(0, s - 5));
          playGameSound('error');
          setShake(true);
          setTimeout(() => setShake(false), 400);
       }
    };

    return (
       <Layout title="Speed Tap" showBack isKidsMode hideBottomNav>
          {gameOver ? (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Trophy size={48} className="text-purple-600" />
                </div>
                <h2 className="text-4xl font-kids font-bold text-purple-600 mb-2">Time's Up!</h2>
                <p className="text-gray-400 font-bold mb-6">You scored</p>
                <div className="text-7xl font-black text-gray-800 mb-8">{score}</div>
                <button onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); generateRound(); }} className="bg-purple-500 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-purple-200 hover:scale-105 transition-transform text-xl">Play Again</button>
             </div>
          ) : (
             <div className="flex flex-col h-full">
                {/* Stats Bar */}
                <div className="flex justify-between items-center mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex items-center gap-2 font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                       <Timer size={18} /> {timeLeft}s
                   </div>
                   {/* Progress Bar for Timer */}
                   <div className="flex-1 mx-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 10 ? 'bg-red-500' : 'bg-purple-500'}`} 
                         style={{ width: `${(timeLeft / 30) * 100}%` }}
                       />
                   </div>
                   <div className="font-black text-xl text-purple-600 bg-purple-50 px-4 py-1.5 rounded-xl border border-purple-100">
                       {score}
                   </div>
                </div>

                {/* Target */}
                <div className={`text-center mb-8 transition-transform ${shake ? 'translate-x-1' : ''}`}>
                   <h3 className="text-gray-400 font-bold uppercase text-xs mb-2 tracking-widest">TAP THE PICTURE FOR</h3>
                   <div className="inline-block bg-white px-8 py-4 rounded-3xl shadow-md border-b-4 border-gray-200">
                       <div className="text-4xl font-kids font-bold text-gray-800">{currentQuestion.igbo}</div>
                   </div>
                </div>

                {/* Grid */}
                <div className={`grid grid-cols-2 gap-4 flex-1 pb-4 ${shake ? 'animate-shake' : ''}`}>
                   {options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleTap(opt)} 
                        className="bg-white rounded-3xl p-4 shadow-sm border-b-[6px] border-gray-100 active:border-b-0 active:translate-y-1.5 transition-all flex items-center justify-center relative overflow-hidden group hover:border-purple-200"
                      >
                         <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <img src={opt.image} className="w-full h-full object-contain max-h-32 relative z-10 pointer-events-none" alt={opt.english} />
                      </button>
                   ))}
                </div>
             </div>
          )}
       </Layout>
    );
};
export const SpeedGameWrapper = () => <SpeedTapGame onBack={() => window.history.back()} />;
