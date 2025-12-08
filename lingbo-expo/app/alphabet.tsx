import React from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { IGBO_ALPHABET_FULL } from '@/constants';
import { generateIgboSpeech } from '@/services/geminiService';
import { playPCMAudio } from '@/utils/audioUtils';

export default function AlphabetBoard() {
    const handlePlay = async (letter: string) => {
        try {
            const b64 = await generateIgboSpeech(letter);
            if (b64) {
                await playPCMAudio(b64);
            }
        } catch (e) {
            console.error('Playback failed', e);
        }
    };

    return (
        <Layout title="Abidii (Alphabet)" showBack>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.grid}>
                    {IGBO_ALPHABET_FULL.map((char) => (
                        <TouchableOpacity
                            key={char}
                            onPress={() => handlePlay(char)}
                            style={styles.letterCard}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.letter}>{char}</Text>
                            <View style={styles.speakBadge}>
                                <Volume2 size={14} color="#9333ea" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    letterCard: {
        width: 72,
        height: 72,
        backgroundColor: 'white',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    letter: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#9333ea',
    },
    speakBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: '#f3e8ff',
        padding: 4,
        borderRadius: 8,
    },
});
