import React, { useState, useEffect } from 'react';
import { Timer, Trophy } from 'lucide-react';
import { KIDS_FLASHCARDS } from '../../constants';
import { playGameSound } from '../../utils/audioUtils';
import Layout from '../Layout';

export const SpeedTap = () => {
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

export default SpeedTap;