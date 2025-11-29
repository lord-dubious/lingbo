import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { MEMORY_GAME_DATA } from '../../constants';
import { playGameSound } from '../../services/audioService';
import { ConfettiOverlay } from '../features/ConfettiOverlay';

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<string[]>([]);
    const [won, setWon] = useState(false);
    const [matchBubble, setMatchBubble] = useState<{ x: number, y: number, text: string } | null>(null);

    useEffect(() => { setCards([...MEMORY_GAME_DATA].sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uid: i }))); }, []);

    const handleCardClick = (index: number, e: React.MouseEvent) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].matchId)) return;
        playGameSound('flip');
        const newFlipped = [...flipped, index]; setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const id1 = cards[newFlipped[0]].matchId; const id2 = cards[newFlipped[1]].matchId;
            if (id1 === id2) {
                setTimeout(() => {
                    playGameSound('success');
                    setMatched(p => [...p, id1]);
                    setFlipped([]);

                    // Show match bubble
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setMatchBubble({ x: rect.left + rect.width / 2, y: rect.top, text: "Match!" });
                    setTimeout(() => setMatchBubble(null), 1500);

                    if (matched.length + 1 === MEMORY_GAME_DATA.length / 2) { playGameSound('win'); setWon(true); }
                }, 300);
            }
            else { setTimeout(() => setFlipped([]), 1000); }
        }
    };

    return (
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-4 border-purple-100 min-h-[500px] flex flex-col relative overflow-hidden">
            {won && <ConfettiOverlay onRestart={() => window.location.reload()} />}
            {matchBubble && createPortal(
                <div
                    className="fixed z-50 pointer-events-none animate-in zoom-in fade-out slide-out-to-top-10 duration-1000 flex flex-col items-center justify-center"
                    style={{ left: matchBubble.x, top: matchBubble.y, transform: 'translate(-50%, -100%)' }}
                >
                    <div className="relative">
                        <Star size={120} className="text-yellow-400 fill-yellow-400 animate-spin-slow drop-shadow-xl" />
                        <span className="absolute inset-0 flex items-center justify-center font-kids font-bold text-3xl text-purple-600 drop-shadow-sm rotate-12">
                            {matchBubble.text}
                        </span>
                    </div>
                </div>,
                document.body
            )}

            <div className="flex justify-between items-center mb-6"><button onClick={onBack}><ArrowLeft size={24} className="text-gray-600" /></button><h3 className="font-kids font-bold text-2xl text-purple-600">Memory Match</h3><div className="w-6"></div></div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-1 content-start perspective-1000">
                {cards.map((card, i) => (
                    <button
                        key={card.uid}
                        onClick={(e) => handleCardClick(i, e)}
                        className="aspect-square relative group cursor-pointer perspective-1000"
                    >
                        <div
                            className="w-full h-full transition-all duration-500 transform-style-3d"
                            style={{
                                transform: (flipped.includes(i) || matched.includes(card.matchId)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Front (Question Mark) */}
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-sm backface-hidden"
                                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                            >
                                <span className="text-white font-kids font-bold text-4xl opacity-50">?</span>
                            </div>

                            {/* Back (Content) */}
                            <div
                                className="absolute inset-0 bg-white rounded-xl border-4 border-purple-200 flex items-center justify-center overflow-hidden shadow-sm backface-hidden"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                {card.type === 'image' ? <img src={card.content} className="w-full h-full object-cover" /> : <span className="font-kids font-bold text-gray-800 text-sm text-center px-1">{card.content}</span>}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MemoryGame;
