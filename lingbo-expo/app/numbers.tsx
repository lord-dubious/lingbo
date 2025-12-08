import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { IGBO_NUMBERS } from '@/constants';

export default function NumbersBoard() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Numbers - Onuogugu</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {IGBO_NUMBERS.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.numberCard}>
                        <View style={styles.numberBadge}>
                            <Text style={styles.number}>{item.number}</Text>
                        </View>
                        <Text style={styles.word}>{item.word}</Text>
                        <Volume2 size={20} color="#2563eb" />
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
    list: { padding: 16, gap: 12 },
    numberCard: {
        backgroundColor: 'white', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    numberBadge: { width: 48, height: 48, backgroundColor: '#dbeafe', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    number: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
    word: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
});
