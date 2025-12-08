import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Construction } from 'lucide-react-native';

export default function TraceBook() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trace Book</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <Construction size={64} color="#fb923c" />
                <Text style={styles.title}>Coming Soon!</Text>
                <Text style={styles.subtitle}>TraceBook with canvas drawing is being built</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fef3c7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 },
});
