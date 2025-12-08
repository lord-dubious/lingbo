import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Construction } from 'lucide-react-native';

export default function Videos() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Videos</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <Construction size={64} color="#f87171" />
                <Text style={styles.title}>Coming Soon!</Text>
                <Text style={styles.subtitle}>Video library is being built</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: 16, color: '#6b7280' },
});
