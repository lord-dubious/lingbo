import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { RefreshCw, CheckCircle, Volume2 } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../../components/Layout';
import { playGameSound, playPCMAudio } from '../../../utils/audioUtils';
import { generateIgboSpeech } from '../../../services/geminiService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const SENTENCES = [
    {
        igbo: "Nne na-esi nri",
        english: "Mother is cooking food",
        parts: ["Nne", "na-esi", "nri"]
    },
    {
        igbo: "Ada na-aga akwukwo",
        english: "Ada is going to school",
        parts: ["Ada", "na-aga", "akwukwo"]
    },
    {
        igbo: "Anyi nwere nkita",
        english: "We have a dog",
        parts: ["Anyi", "nwere", "nkita"]
    }
];

export default function SentencePuzzle() {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [shuffledParts, setShuffledParts] = useState<string[]>([]);
    const [selectedParts, setSelectedParts] = useState<string[]>([]);

    const currentSentence = SENTENCES[currentIdx];

    useEffect(() => {
        resetGame();
    }, [currentIdx]);

    const resetGame = () => {
        setShuffledParts([...currentSentence.parts].sort(() => Math.random() - 0.5));
        setSelectedParts([]);
    };

    const handleSelect = (word: string) => {
        if (!selectedParts.includes(word)) {
            playGameSound('click');
            const newSelection = [...selectedParts, word];
            setSelectedParts(newSelection);
            setShuffledParts(prev => prev.filter(p => p !== word));

            if (newSelection.length === currentSentence.parts.length) {
                checkAnswer(newSelection);
            }
        }
    };

    const handleDeselect = (word: string) => {
        playGameSound('pop');
        setSelectedParts(prev => prev.filter(p => p !== word));
        setShuffledParts(prev => [...prev, word]);
    };

    const checkAnswer = async (selection: string[]) => {
        const formed = selection.join(" ");
        if (formed === currentSentence.igbo) {
            playGameSound('success');
            const b64 = await generateIgboSpeech(formed);
            if(b64) playPCMAudio(b64);
            Alert.alert("Correct!", "O ga-adiri gi mma!", [
                { text: "Next Puzzle", onPress: () => {
                    if (currentIdx < SENTENCES.length - 1) {
                        setCurrentIdx(prev => prev + 1);
                    } else {
                        Alert.alert("Game Over", "You finished all puzzles!");
                        setCurrentIdx(0);
                    }
                }}
            ]);
        } else {
            playGameSound('error');
            Alert.alert("Try Again", "Not quite right yet.");
            resetGame();
        }
    };

    return (
        <Layout title="Sentence Puzzle" showBack backPath="/kids/games" isKidsMode hideBottomNav>
            <StyledView className="flex-1 items-center justify-center p-4">
                 <StyledView className="bg-white/50 p-6 rounded-3xl mb-8 w-full items-center">
                     <StyledText className="text-gray-600 font-bold mb-2">Make this sentence:</StyledText>
                     <StyledText className="text-xl text-gray-800 font-bold text-center italic">"{currentSentence.english}"</StyledText>
                 </StyledView>

                 {/* Drop Zone */}
                 <StyledView className="flex-row flex-wrap gap-2 min-h-[80px] w-full bg-white/40 border-2 border-dashed border-white/60 rounded-2xl p-4 mb-8 justify-center items-center">
                     {selectedParts.map((word, i) => (
                         <StyledTouchableOpacity key={i} onPress={() => handleDeselect(word)} className="bg-orange-400 px-6 py-3 rounded-xl shadow-sm">
                             <StyledText className="text-white font-bold text-xl">{word}</StyledText>
                         </StyledTouchableOpacity>
                     ))}
                     {selectedParts.length === 0 && <StyledText className="text-gray-400 font-bold">Tap words below to build</StyledText>}
                 </StyledView>

                 {/* Word Bank */}
                 <StyledView className="flex-row flex-wrap gap-3 justify-center">
                     {shuffledParts.map((word, i) => (
                         <StyledTouchableOpacity
                            key={i}
                            onPress={() => handleSelect(word)}
                            className="bg-white px-6 py-4 rounded-xl shadow-md border-b-4 border-gray-200 active:border-b-0 active:translate-y-1"
                         >
                             <StyledText className="text-gray-800 font-bold text-xl">{word}</StyledText>
                         </StyledTouchableOpacity>
                     ))}
                 </StyledView>

                 <StyledTouchableOpacity onPress={resetGame} className="mt-12 p-4 bg-gray-200 rounded-full">
                     <RefreshCw size={24} color="#4b5563" />
                 </StyledTouchableOpacity>
            </StyledView>
        </Layout>
    );
}
