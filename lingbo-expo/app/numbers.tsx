import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { IGBO_NUMBERS } from '@/constants';
import { generateIgboSpeech } from '@/services/geminiService';
import { playPCMAudio } from '@/utils/audioUtils';

export default function NumbersBoard() {
    const handlePlay = async (word: string) => {
        try {
            const b64 = await generateIgboSpeech(word);
            if (b64) {
                await playPCMAudio(b64);
            }
        } catch (e) {
            console.error('Playback failed', e);
        }
    };

    return (
        <Layout title="Onuọgụgụ (Numbers)" showBack>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {IGBO_NUMBERS.map((item) => (
                    <TouchableOpacity
                        key={item.number}
                        onPress={() => handlePlay(item.word)}
                        style={styles.numberCard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.numberBadge}>
                            <Text style={styles.number}>{item.number}</Text>
                        </View>
                        <Text style={styles.word}>{item.word}</Text>
                        <Volume2 size={20} color="#3b82f6" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 32,
        gap: 12,
    },
    numberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    numberBadge: {
        width: 48,
        height: 48,
        backgroundColor: '#dbeafe',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    number: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    word: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
});
