
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Check } from 'lucide-react';
import { KIDS_GAMES } from '../../constants';
import { playPCMAudio, playGameSound } from '../../utils/audioUtils';
import { generateIgboSpeech } from '../../services/geminiService';
import Layout from '../Layout';
import { ConfettiOverlay } from '../ConfettiOverlay';
import { useUser } from '../../context/UserContext';
import TutorialOverlay from '../TutorialOverlay';

export const SentencePuzzle = () => {
    const [gameWon, setGameWon] = useState(false);
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);
    const sentenceGame = KIDS_GAMES[0];
    const [availableBlocks, setAvailableBlocks] = useState<string[]>(sentenceGame.example_round.scrambled_blocks);

    const { activeProfile, markTutorialSeen } = useUser();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (activeProfile && (!activeProfile.progress?.tutorialsSeen?.includes('sentence_puzzle'))) {
            setShowTutorial(true);
        }
    }, []);
    
    const handleTutorialComplete = () => {
        setShowTutorial(false);
        markTutorialSeen('sentence_puzzle');
    };

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
        <Layout title="Sentence Puzzle" showBack isKidsMode hideBottomNav>
             {showTutorial && (
                 <TutorialOverlay 
                     type="tap" 
                     message="Tap the blocks to build the correct sentence!" 
                     onComplete={handleTutorialComplete} 
                 />
             )}
             <div className="flex flex-col h-[calc(100vh-100px)] relative">
               {gameWon && <ConfettiOverlay onRestart={reset} title="You did it!" subtitle={sentenceGame.example_round.target_sentence} />}
               
               {/* Goal Card - Compact */}
               <div className="bg-white rounded-3xl p-4 shadow-sm border border-orange-100 flex items-center gap-3 mb-4 shrink-0">
                 <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 border-2 border-orange-200">
                    <img src={sentenceGame.example_round.visual_aid} className="w-12 h-12 object-cover rounded-xl" alt="Hint" />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1">
                        <Check size={10} /> Target
                    </div>
                    <div className="font-kids font-bold text-lg text-gray-800 leading-tight">"{sentenceGame.example_round.target_sentence}"</div>
                 </div>
               </div>

               {/* Drop Zone - Flexible */}
               <div className="flex-1 bg-blue-50/50 rounded-[2rem] border-[3px] border-dashed border-blue-200 p-4 flex flex-wrap content-start gap-2 relative mb-32 transition-colors hover:border-blue-400 overflow-y-auto">
                  {builtSentence.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-300 font-kids font-bold text-xl opacity-60 pointer-events-none">
                          <div className="border-4 border-dashed border-blue-200 w-12 h-12 rounded-xl mb-2"></div>
                          Put blocks here!
                      </div>
                  )}
                  {builtSentence.map((word, i) => (
                      <button 
                        key={`${word}-${i}`} 
                        onClick={() => handleRemoveBlock(word, i)}
                        className={`
                            ${getBlockColor(word)} text-white 
                            font-kids font-bold text-lg px-4 py-2 rounded-xl 
                            shadow-[0_4px_0_rgba(0,0,0,0.2)] border-b-4 
                            animate-in zoom-in duration-300 
                            active:scale-95 active:shadow-none active:translate-y-1 active:border-b-0
                        `}
                      >
                          {word}
                      </button>
                  ))}
               </div>

               {/* Block Pool - Fixed Bottom */}
               <div className="fixed bottom-0 left-0 right-0 bg-gray-100 rounded-t-[2rem] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30">
                 <div className="flex justify-center mb-4">
                     <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                 </div>
                 
                 <div className="flex flex-wrap justify-center gap-3">
                    {availableBlocks.map((word, i) => (
                        <button 
                            key={`${word}-${i}`} 
                            onClick={() => handleBlockClick(word)} 
                            className="bg-white text-gray-700 font-kids font-bold text-lg px-5 py-3 rounded-2xl shadow-[0_4px_0_#e5e7eb] border-2 border-gray-200 active:shadow-none active:translate-y-1 transition-all"
                        >
                            {word}
                        </button>
                    ))}
                    {availableBlocks.length === 0 && (
                         <div className="text-gray-400 text-sm font-bold italic py-2">No blocks left!</div>
                    )}
                 </div>
                 
                 <div className="mt-4 flex justify-center">
                    <button onClick={reset} className="text-gray-400 flex items-center gap-1 text-xs font-bold hover:text-gray-600 bg-gray-200 px-4 py-2 rounded-full transition-colors">
                        <RefreshCcw size={12} /> Reset
                    </button>
                 </div>
               </div>
            </div>
        </Layout>
    );
};

export default SentencePuzzle;
