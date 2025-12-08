
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Volume2, ChevronRight, Timer } from 'lucide-react';
import { KIDS_FLASHCARDS, KIDS_GAMES, MEMORY_GAME_DATA } from '../constants';
import { playPCMAudio, playGameSound } from '../utils/audioUtils';
import { generateIgboSpeech } from '../services/geminiService';
import Layout from '../components/Layout';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { Sparkles } from 'lucide-react';

// --- Flashcards ---
export const FlashcardWrapper = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const card = KIDS_FLASHCARDS[currentCard];
    const next = () => setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length);
    const prev = () => setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
    return (
        <Layout title="Flashcards" showBack isKidsMode hideBottomNav>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-6 flex flex-col items-center justify-between relative overflow-hidden">
                 <div className="w-full flex justify-between items-center text-gray-400 text-sm font-bold">
                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">{card.english}</span>
                   <button onClick={async () => { const b64 = await generateIgboSpeech(card.igbo); if(b64) playPCMAudio(b64); }} className="p-3 hover:bg-blue-50 rounded-full border border-gray-100 shadow-sm transition-colors"><Volume2 size={24} className="text-blue-500" /></button>
                 </div>
                 <div className="relative flex-1 flex items-center justify-center w-full">
                    <img src={card.image} alt={card.english} className="w-48 h-48 object-contain drop-shadow-lg relative z-10" />
                 </div>
                 <div className="text-center w-full">
                   <h2 className="text-5xl font-kids font-bold text-blue-600 mb-2">{card.igbo}</h2>
                 </div>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <button onClick={prev} className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-95 transition-transform"><ChevronRight size={36} className="rotate-180" /></button>
                <button onClick={next} className="w-16 h-16 bg-blue-500 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:bg-blue-600 active:scale-95 transition-transform"><ChevronRight size={36} /></button>
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
        if (newSentence.length === sentenceGame.example_round.correct_order.length) {
          if (newSentence.every((val, i) => val === sentenceGame.example_round.correct_order[i])) {
            playGameSound('win');
            setGameWon(true);
            generateIgboSpeech("O mara nma!").then(b64 => b64 && playPCMAudio(b64));
          } else {
            playGameSound('error');
          }
        }
    };
    const reset = () => { setBuiltSentence([]); setAvailableBlocks(sentenceGame.example_round.scrambled_blocks); setGameWon(false); };
    return (
        <Layout title="Sentence Puzzle" showBack isKidsMode hideBottomNav>
             <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100 relative overflow-hidden min-h-[450px] flex flex-col max-w-2xl mx-auto">
               {gameWon && <ConfettiOverlay onRestart={reset} />}
               <div className="text-center mb-6 mt-6">
                 <h3 className="font-kids font-bold text-2xl text-pink-500 mb-1">Sentence Builder</h3>
                 <p className="text-gray-500 text-sm">Make: <span className="text-gray-800 font-bold bg-gray-100 px-1 rounded">"{sentenceGame.example_round.target_sentence}"</span></p>
               </div>
               <div className="bg-gray-50 rounded-2xl p-6 min-h-[120px] flex gap-3 flex-wrap items-center justify-center mb-8 border-2 border-dashed border-gray-300">
                  {builtSentence.map((word, i) => <div key={i} className="bg-white px-5 py-3 rounded-xl shadow-md font-bold text-gray-700 animate-in zoom-in border border-gray-100 text-lg hover:scale-105 transition-transform">{word}</div>)}
               </div>
               <div className="flex gap-4 justify-center flex-wrap mt-auto">
                 {availableBlocks.map((word, i) => <button key={i} onClick={() => handleBlockClick(word)} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-6 py-4 rounded-2xl shadow-md border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-lg animate-in fade-in slide-in-from-bottom-2">{word}</button>)}
               </div>
               <div className="mt-8 flex justify-center"><button onClick={reset} className="text-gray-400 flex items-center gap-2 text-sm font-bold hover:text-pink-500"><RefreshCcw size={16} /> Start Over</button></div>
            </div>
        </Layout>
    );
};

// --- Memory Match ---
const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState(() => {
     return [...MEMORY_GAME_DATA, ...MEMORY_GAME_DATA.map(i => ({...i, id: i.id + '_pair'}))].sort(() => Math.random() - 0.5).map(c => ({...c, flipped: false, matched: false}));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].matchId === cards[second].matchId) {
        setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, matched: true, flipped: true } : c));
        setFlipped([]);
        playGameSound('success');
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 1000);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.every(c => c.matched)) {
        setSolved(true);
        playGameSound('win');
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !cards[index].flipped && !cards[index].matched) {
      playGameSound('flip');
      setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
      setFlipped(prev => [...prev, index]);
    }
  };

  return (
     <Layout title="Memory Match" showBack isKidsMode hideBottomNav>
        {solved && <ConfettiOverlay onRestart={() => window.location.reload()} />}
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card, i) => (
             <button 
               key={card.id} 
               onClick={() => handleCardClick(i)} 
               className={`aspect-square rounded-xl shadow-sm border-b-4 transition-all duration-300 transform ${card.flipped || card.matched ? 'bg-white border-blue-200 rotate-y-180' : 'bg-blue-500 border-blue-700'}`}
             >
               {(card.flipped || card.matched) ? (
                 <div className="w-full h-full flex items-center justify-center p-2">
                    {card.type === 'image' ? <img src={card.content} className="w-full h-full object-contain" /> : <span className="font-bold text-lg text-gray-700">{card.content}</span>}
                 </div>
               ) : (
                 <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                    <Sparkles className="text-white/40 w-8 h-8" />
                 </div>
               )}
             </button>
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
       }
    };

    return (
       <Layout title="Speed Tap" showBack isKidsMode hideBottomNav>
          {gameOver ? (
             <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-4xl font-kids font-bold text-purple-600 mb-4">Time's Up!</h2>
                <div className="text-6xl font-bold text-gray-800 mb-8">{score}</div>
                <button onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); generateRound(); }} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg">Play Again</button>
             </div>
          ) : (
             <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                   <div className="flex items-center gap-2 font-bold text-purple-700"><Timer /> {timeLeft}s</div>
                   <div className="font-bold text-2xl text-purple-900">{score}</div>
                </div>
                <div className="text-center mb-8">
                   <h3 className="text-gray-500 font-bold uppercase text-sm mb-2">Find:</h3>
                   <div className="text-4xl font-bold text-gray-800">{currentQuestion.igbo}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                   {options.map((opt, i) => (
                      <button key={i} onClick={() => handleTap(opt)} className="bg-white rounded-2xl p-4 shadow-md border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center">
                         <img src={opt.image} className="w-full h-full object-contain max-h-32" alt={opt.english} />
                      </button>
                   ))}
                </div>
             </div>
          )}
       </Layout>
    );
};
export const SpeedGameWrapper = () => <SpeedTapGame onBack={() => window.history.back()} />;
