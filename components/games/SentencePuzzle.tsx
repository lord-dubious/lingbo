
import React, { useState } from 'react';
import { RefreshCcw, Check } from 'lucide-react';
import { KIDS_GAMES } from '../../constants';
import { playPCMAudio, playGameSound } from '../../utils/audioUtils';
import { generateIgboSpeech } from '../../services/geminiService';
import Layout from '../Layout';
import { ConfettiOverlay } from '../ConfettiOverlay';

export const SentencePuzzle = () => {
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
            setTimeout(() => {
                playGameSound('win');
                setGameWon(true);
                generateIgboSpeech("O mara nma!").then(b64 => b64 && playPCMAudio(b64));
            }, 500);
          } else {
            setTimeout(() => {
                playGameSound('error');
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

    // Color palette for blocks to make them fun
    const colors = [
        "bg-red-400 border-red-600",
        "bg-blue-400 border-blue-600",
        "bg-green-400 border-green-600",
        "bg-yellow-400 border-yellow-600",
        "bg-purple-400 border-purple-600"
    ];

    const getBlockColor = (word: string) => {
        const index = word.length % colors.length;
        return colors[index];
    };

    return (
        <Layout title="Sentence Puzzle" showBack backPath="/kids/games" isKidsMode hideBottomNav>
             <div className="flex flex-col h-[calc(100vh-140px)]">
               {gameWon && <ConfettiOverlay onRestart={reset} title="You did it!" subtitle={sentenceGame.example_round.target_sentence} />}
               
               {/* Goal Card */}
               <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 mb-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-full bg-orange-50 skew-x-12 -mr-6"></div>
                 <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 border-2 border-orange-200 z-10 shadow-inner">
                    <img src={sentenceGame.example_round.visual_aid} className="w-16 h-16 object-cover rounded-xl" alt="Hint" />
                 </div>
                 <div className="z-10">
                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Check size={12} /> Target Sentence
                    </div>
                    <div className="font-kids font-bold text-2xl text-gray-800 tracking-wide">"{sentenceGame.example_round.target_sentence}"</div>
                 </div>
               </div>

               {/* Drop Zone */}
               <div className="flex-1 bg-white rounded-[2rem] border-[3px] border-dashed border-gray-300 p-6 flex flex-wrap content-start gap-4 relative mb-6 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                  <div className="absolute top-[-15px] left-6 bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Build Here
                  </div>

                  {builtSentence.length === 0 && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 font-kids font-bold text-2xl opacity-60 pointer-events-none">
                          <div className="border-4 border-dashed border-gray-200 w-16 h-16 rounded-xl mb-2"></div>
                          Tap blocks below!
                      </div>
                  )}
                  {builtSentence.map((word, i) => (
                      <button 
                        key={`${word}-${i}`} 
                        onClick={() => handleRemoveBlock(word, i)}
                        className={`
                            ${getBlockColor(word)} text-white 
                            font-kids font-bold text-xl px-6 py-3 rounded-2xl 
                            shadow-[0_4px_0_rgba(0,0,0,0.2)] border-b-4 
                            animate-in zoom-in duration-300 
                            hover:scale-105 active:scale-95 active:shadow-none active:translate-y-1 active:border-b-0
                        `}
                      >
                          {word}
                      </button>
                  ))}
               </div>

               {/* Block Pool */}
               <div className="bg-gray-100 rounded-t-[3rem] -mx-4 -mb-4 p-8 pb-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                 <div className="flex justify-center mb-6">
                     <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                 </div>
                 <div className="flex flex-wrap justify-center gap-4 min-h-[80px]">
                    {availableBlocks.map((word, i) => (
                        <button 
                            key={`${word}-${i}`} 
                            onClick={() => handleBlockClick(word)} 
                            className="bg-white text-gray-700 font-kids font-bold text-xl px-6 py-4 rounded-2xl shadow-[0_4px_0_#e5e7eb] border-2 border-gray-200 active:shadow-none active:translate-y-1 transition-all hover:border-blue-300 hover:text-blue-600"
                        >
                            {word}
                        </button>
                    ))}
                 </div>
                 
                 <div className="mt-8 flex justify-center">
                    <button onClick={reset} className="text-gray-400 flex items-center gap-2 text-sm font-bold hover:text-gray-600 bg-gray-200 px-6 py-3 rounded-full transition-colors">
                        <RefreshCcw size={16} /> Reset Blocks
                    </button>
                 </div>
               </div>
            </div>
        </Layout>
    );
};

export default SentencePuzzle;
