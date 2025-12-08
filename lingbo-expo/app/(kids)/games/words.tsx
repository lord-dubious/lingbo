import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Image,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, RotateCw } from 'lucide-react-native';
import { KIDS_FLASHCARDS } from '@/constants';
import { generateIgboSpeech } from '@/services/geminiService';
import { playPCMAudio, playGameSound } from '@/utils/audioUtils';

const { width, height } = Dimensions.get('window');

export default function WordFlash() {
    const router = useRouter();
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const card = KIDS_FLASHCARDS[index];

    useEffect(() => {
        setIsFlipped(false);
    }, [index]);

    const next = () => {
        playGameSound('click');
        setIndex((index + 1) % KIDS_FLASHCARDS.length);
    };

    const prev = () => {
        playGameSound('click');
        setIndex((index - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
    };

    const toggleFlip = () => {
        playGameSound('click');
        setIsFlipped(!isFlipped);
    };

    const handlePlayAudio = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            const b64 = await generateIgboSpeech(card.igbo);
            if (b64) await playPCMAudio(b64);
        } catch (e) {
            console.error('Audio failed', e);
        }
        setIsPlaying(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Word Flash</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
                {KIDS_FLASHCARDS.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === index && styles.dotActive
                        ]}
                    />
                ))}
            </View>

            {/* Card */}
            <View style={styles.cardContainer}>
                <TouchableOpacity
                    onPress={toggleFlip}
                    style={styles.cardTouchable}
                    activeOpacity={0.95}
                >
                    {!isFlipped ? (
                        // FRONT - Image
                        <View style={styles.cardFront}>
                            {/* Decoration gradient */}
                            <LinearGradient
                                colors={['rgba(250,204,21,0.2)', 'transparent']}
                                style={styles.cardGradient}
                            />

                            {/* Flip hint */}
                            <View style={styles.flipHint}>
                                <RotateCw size={24} color="#eab308" />
                            </View>

                            {/* Image */}
                            <View style={styles.imageContainer}>
                                <View style={styles.imageShadow} />
                                <Image
                                    source={{ uri: card.image }}
                                    style={styles.cardImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Tap hint */}
                            <View style={styles.tapHintContainer}>
                                <Text style={styles.tapHint}>Tap to Reveal</Text>
                            </View>
                        </View>
                    ) : (
                        // BACK - Word
                        <LinearGradient
                            colors={['#facc15', '#f97316']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardBack}
                        >
                            {/* Pattern overlay */}
                            <View style={styles.patternOverlay} />

                            <View style={styles.backContent}>
                                <Text style={styles.backLabel}>IGBO WORD</Text>
                                <Text style={styles.igboWord}>{card.igbo}</Text>

                                <View style={styles.divider} />

                                <View style={styles.englishContainer}>
                                    <Text style={styles.englishWord}>{card.english}</Text>
                                </View>

                                {/* Play button */}
                                <TouchableOpacity
                                    onPress={handlePlayAudio}
                                    style={styles.playButton}
                                    disabled={isPlaying}
                                >
                                    <Volume2 size={42} color="#f97316" fill="#f97316" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    )}
                </TouchableOpacity>
            </View>

            {/* Navigation Controls */}
            <View style={styles.controls}>
                <TouchableOpacity onPress={prev} style={styles.navButton}>
                    <ChevronLeft size={32} color="#6b7280" />
                </TouchableOpacity>

                <Text style={styles.counter}>
                    {index + 1} / {KIDS_FLASHCARDS.length}
                </Text>

                <TouchableOpacity onPress={next} style={styles.navButtonActive}>
                    <ChevronRight size={32} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef3c7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'white',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 16,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e5e7eb',
    },
    dotActive: {
        width: 32,
        backgroundColor: '#facc15',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    cardTouchable: {
        width: width - 48,
        height: width - 48,
        maxWidth: 360,
        maxHeight: 360,
    },
    cardFront: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#fef08a',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    flipHint: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    imageShadow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(250,204,21,0.2)',
    },
    cardImage: {
        width: 200,
        height: 200,
    },
    tapHintContainer: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    tapHint: {
        backgroundColor: '#fef08a',
        color: '#a16207',
        fontWeight: 'bold',
        fontSize: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardBack: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    patternOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        // Pattern would be done with SVG in production
    },
    backContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 8,
    },
    igboWord: {
        fontSize: 56,
        fontWeight: '900',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
    },
    divider: {
        width: 64,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        marginVertical: 24,
    },
    englishContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    englishWord: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    playButton: {
        marginTop: 24,
        width: 96,
        height: 96,
        backgroundColor: 'white',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingVertical: 24,
    },
    navButton: {
        width: 64,
        height: 64,
        backgroundColor: 'white',
        borderRadius: 20,
        borderBottomWidth: 4,
        borderBottomColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonActive: {
        width: 64,
        height: 64,
        backgroundColor: '#facc15',
        borderRadius: 20,
        borderBottomWidth: 4,
        borderBottomColor: '#ca8a04',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#facc15',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    counter: {
        fontSize: 20,
        fontWeight: '900',
        color: '#d1d5db',
    },
});
