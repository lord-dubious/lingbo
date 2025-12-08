import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Image
} from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, RotateCw } from 'lucide-react-native';
import { KIDS_FLASHCARDS } from '@/constants';

const { width } = Dimensions.get('window');

export default function WordFlash() {
    const router = useRouter();
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const card = KIDS_FLASHCARDS[index];

    const next = () => {
        setIndex((index + 1) % KIDS_FLASHCARDS.length);
        setFlipped(false);
    };

    const prev = () => {
        setIndex((index - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
        setFlipped(false);
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

            {/* Progress */}
            <View style={styles.progress}>
                <Text style={styles.progressText}>{index + 1} / {KIDS_FLASHCARDS.length}</Text>
            </View>

            {/* Card */}
            <View style={styles.cardContainer}>
                <TouchableOpacity
                    onPress={() => setFlipped(!flipped)}
                    style={[styles.card, flipped && styles.cardFlipped]}
                    activeOpacity={0.9}
                >
                    {!flipped ? (
                        // Front - Image
                        <>
                            <Image
                                source={{ uri: card.image }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.tapHint}>Tap to reveal</Text>
                        </>
                    ) : (
                        // Back - Word
                        <View style={styles.cardBack}>
                            <Text style={styles.igboWord}>{card.igbo}</Text>
                            <Text style={styles.englishWord}>{card.english}</Text>
                            <TouchableOpacity style={styles.speakButton}>
                                <Volume2 size={28} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.flipIcon}>
                        <RotateCw size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity onPress={prev} style={styles.navButton}>
                    <ChevronLeft size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={next} style={styles.navButton}>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    progress: {
        alignItems: 'center',
        marginBottom: 24,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: width - 48,
        height: width - 48,
        backgroundColor: '#f472b6',
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 6,
        borderColor: 'white',
    },
    cardFlipped: {
        backgroundColor: '#8b5cf6',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    tapHint: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cardBack: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    igboWord: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    englishWord: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 24,
    },
    speakButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        borderRadius: 32,
    },
    flipIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 8,
        borderRadius: 16,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        paddingVertical: 32,
    },
    navButton: {
        width: 64,
        height: 64,
        backgroundColor: '#f97316',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});
