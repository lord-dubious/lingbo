import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Layout from '@/components/Layout';
import TextChat from '@/components/practice/TextChat';
import LiveChat from '@/components/practice/LiveChat';
import PronunciationCoach from '@/components/practice/PronunciationCoach';

export default function Practice() {
    const [tab, setTab] = useState<'chat' | 'live' | 'coach'>('chat');

    return (
        <Layout title="AI Tutor" showBack>
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setTab('chat')}
                    style={[styles.tab, tab === 'chat' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>
                        Chat
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('live')}
                    style={[styles.tab, tab === 'live' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, tab === 'live' && styles.tabTextActive]}>
                        Live
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('coach')}
                    style={[styles.tab, tab === 'coach' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, tab === 'coach' && styles.tabTextActive]}>
                        Coach
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {tab === 'chat' && <TextChat />}
                {tab === 'live' && <LiveChat />}
                {tab === 'coach' && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <PronunciationCoach />
                    </ScrollView>
                )}
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        padding: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#f97316',
    },
    content: {
        flex: 1,
    },
});
