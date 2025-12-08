
import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, RotateCw, Star } from 'lucide-react';
import { KIDS_FLASHCARDS } from '../../constants';
import { playPCMAudio, playGameSound } from '../../utils/audioUtils';
import { generateIgboSpeech } from '../../services/geminiService';
import Layout from '../Layout';
import { useUser } from '../../context/UserContext';
import TutorialOverlay from '../TutorialOverlay';

export const WordFlash = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const card = KIDS_FLASHCARDS[currentCard];
    
    const { activeProfile, markTutorialSeen } = useUser();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [currentCard]);

    useEffect(() => {
        if (activeProfile && (!activeProfile.progress?.tutorialsSeen?.includes('word_flash'))) {
            setShowTutorial(true);
        }
    }, []);
    
    const handleTutorialComplete = () => {
        setShowTutorial(false);
        markTutorialSeen('word_flash');
    };
    
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

    const handlePlayAudio = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const b64 = await generateIgboSpeech(card.igbo);
        if (b64) playPCMAudio(b64);
    };

    return (
        <Layout title="Word Flash" showBack isKidsMode hideBottomNav>
            {showTutorial && (
                <TutorialOverlay 
                    type="tap" 
                    message="Tap the card to see the Igbo word!" 
                    onComplete={handleTutorialComplete} 
                />
            )}
            <div className="flex flex-col items-center h-[calc(100vh-140px)] justify-between pb-4">
              
              {/* Progress Dots */}
              <div className="flex gap-2 mb-4">
                  {KIDS_FLASHCARDS.map((_, i) => (
                      <div key={i} className={`h-3 rounded-full transition-all duration-300 ${i === currentCard ? 'w-8 bg-yellow-400' : 'w-3 bg-gray-200'}`} />
                  ))}
              </div>

              {/* Card Container */}
              <div 
                className="w-full max-w-sm flex-1 relative perspective-1000 group cursor-pointer"
                onClick={toggleFlip}
                style={{ perspective: '1000px' }}
              >
                 <div 
                    className={`w-full h-full transition-all duration-500 relative ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                 >
                    
                    {/* FRONT */}
                    <div 
                        className="absolute inset-0 bg-white rounded-[3rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-yellow-100 flex flex-col items-center p-8 overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                         {/* Decoration */}
                         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-50 to-transparent z-0"></div>
                         
                         <div className="relative z-10 w-full flex justify-end mb-4">
                            <div className="bg-white p-3 rounded-full shadow-sm text-yellow-400 animate-pulse">
                                <RotateCw size={24} />
                            </div>
                         </div>

                         <div className="relative z-10 flex-1 w-full flex items-center justify-center">
                            <div className="relative w-64 h-64">
                                <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-20 blur-2xl scale-75"></div>
                                <img src={card.image} alt={card.english} className="w-full h-full object-contain relative z-10 drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                            </div>
                         </div>

                         <div className="relative z-10 mt-6 bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest">
                             Tap to Reveal
                         </div>
                    </div>

                    {/* BACK */}
                    <div 
                        className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                         <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
                         
                         <div className="relative z-10 text-center">
                             <div className="mb-2 opacity-80 font-bold uppercase tracking-widest text-sm">Igbo Word</div>
                             <h2 className="text-6xl font-kids font-black mb-6 drop-shadow-md">{card.igbo}</h2>
                             
                             <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-6"></div>

                             <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-2xl mb-12 border border-white/30">
                                 <p className="text-3xl font-bold">{card.english}</p>
                             </div>

                             <button 
                                 onClick={handlePlayAudio}
                                 className="w-24 h-24 bg-white text-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all mx-auto"
                             >
                                <Volume2 size={42} fill="currentColor" />
                             </button>
                         </div>
                    </div>
                 </div>
              </div>

              {/* Controls */}
              <div className="w-full max-w-sm flex items-center justify-between mt-8 px-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); prev(); }} 
                    className="w-16 h-16 bg-white rounded-2xl shadow-lg border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 flex items-center justify-center text-gray-400 hover:text-yellow-500 transition-all"
                >
                    <ChevronRight size={32} className="rotate-180" />
                </button>

                <div className="text-gray-300 font-black text-xl font-kids">
                    {currentCard + 1} / {KIDS_FLASHCARDS.length}
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); next(); }} 
                    className="w-16 h-16 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-200 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white transition-all"
                >
                    <ChevronRight size={32} />
                </button>
              </div>
            </div>
        </Layout>
    );
};

export default WordFlash;
