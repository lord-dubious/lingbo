import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { IGBO_ALPHABET_FULL } from '@/constants';

export default function AlphabetBoard() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Alphabet - Abidii</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {IGBO_ALPHABET_FULL.map((letter, i) => (
                    <TouchableOpacity key={i} style={styles.letterCard}>
                        <Text style={styles.letter}>{letter}</Text>
                        <View style={styles.speakIcon}>
                            <Volume2 size={16} color="#9333ea" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, justifyContent: 'center' },
    letterCard: {
        width: 80, height: 80, backgroundColor: 'white', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    letter: { fontSize: 32, fontWeight: 'bold', color: '#9333ea' },
    speakIcon: { position: 'absolute', bottom: 8, right: 8 },
});
