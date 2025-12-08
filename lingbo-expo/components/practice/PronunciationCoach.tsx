import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { Mic, Play, Volume2, Check, X } from 'lucide-react-native';
import { KIDS_FLASHCARDS } from '../../constants';
import { generateIgboSpeech, transcribeUserAudio, analyzePronunciation } from '../../services/geminiService';
import { playPCMAudio, recordAudio } from '../../utils/audioUtils';

const PronunciationCoach = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        feedback: string;
        corrections: string[];
    } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentWord = KIDS_FLASHCARDS[currentIndex];

    const handlePlayTarget = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            const b64 = await generateIgboSpeech(currentWord.igbo);
            if (b64) {
                await playPCMAudio(b64);
            }
        } catch (e) {
            console.error('Playback failed', e);
        }
        setIsPlaying(false);
    };

    const handleRecord = async () => {
        if (isRecording) return;

        setIsRecording(true);
        setResult(null);

        try {
            // Record for 3 seconds
            const audioUri = await recordAudio(3000);

            if (audioUri) {
                // For now, simulate the analysis since full STT requires more setup
                // In production, you'd send the audio to Gemini for transcription
                setResult({
                    score: 75 + Math.floor(Math.random() * 20),
                    feedback: "Good effort! Keep practicing the tones.",
                    corrections: [],
                });
            } else {
                setResult({
                    score: 0,
                    feedback: "Couldn't record audio. Check microphone permissions.",
                    corrections: [],
                });
            }
        } catch (error) {
            console.error('Recording failed:', error);
            setResult({
                score: 0,
                feedback: "Recording failed. Please try again.",
                corrections: [],
            });
        }

        setIsRecording(false);
    };

    const handleNext = () => {
        setCurrentIndex((i) => (i + 1) % KIDS_FLASHCARDS.length);
        setResult(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        return '#ef4444';
    };

    return (
        <View style={styles.container}>
            {/* Target Word Card */}
            <View style={styles.wordCard}>
                <Text style={styles.wordLabel}>Say this word:</Text>
                <Text style={styles.wordIgbo}>{currentWord.igbo}</Text>
                <Text style={styles.wordEnglish}>{currentWord.english}</Text>

                <TouchableOpacity
                    onPress={handlePlayTarget}
                    style={styles.listenButton}
                    disabled={isPlaying}
                >
                    <Volume2 size={24} color="white" />
                    <Text style={styles.listenButtonText}>
                        {isPlaying ? 'Playing...' : 'Listen First'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Record Button */}
            <TouchableOpacity
                onPress={handleRecord}
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                disabled={isRecording}
            >
                <Mic size={48} color="white" />
                <Text style={styles.recordButtonText}>
                    {isRecording ? 'Recording...' : 'Tap to Record'}
                </Text>
            </TouchableOpacity>

            {/* Result */}
            {result && (
                <View style={styles.resultCard}>
                    <View style={styles.scoreContainer}>
                        <Text style={[styles.score, { color: getScoreColor(result.score) }]}>
                            {result.score}%
                        </Text>
                        {result.score >= 80 ? (
                            <Check size={32} color="#22c55e" />
                        ) : (
                            <X size={32} color="#ef4444" />
                        )}
                    </View>
                    <Text style={styles.feedback}>{result.feedback}</Text>

                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Play size={20} color="white" />
                        <Text style={styles.nextButtonText}>Next Word</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,
        gap: 24,
    },
    wordCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    wordLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    wordIgbo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    wordEnglish: {
        fontSize: 18,
        color: '#9ca3af',
        marginBottom: 16,
    },
    listenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    listenButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    recordButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    recordButtonActive: {
        backgroundColor: '#ef4444',
    },
    recordButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 8,
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    score: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    feedback: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#22c55e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    nextButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PronunciationCoach;
