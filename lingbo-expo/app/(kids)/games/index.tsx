import React from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView
} from 'react-native';
import {
    Puzzle,
    Sparkles,
    Timer,
    Image as ImageIcon,
    ArrowLeft,
    Play
} from 'lucide-react-native';

interface Game {
    title: string;
    icon: any;
    color: string;
    borderColor: string;
    path: string;
}

export default function GamesMenu() {
    const router = useRouter();

    const games: Game[] = [
        { title: "Sentence Puzzle", icon: Puzzle, color: "#fb923c", borderColor: "#ea580c", path: "/(kids)/games/sentence" },
        { title: "Memory Match", icon: Sparkles, color: "#22d3ee", borderColor: "#0891b2", path: "/(kids)/games/memory" },
        { title: "Speed Tap", icon: Timer, color: "#818cf8", borderColor: "#4f46e5", path: "/(kids)/games/speed" },
        { title: "Word Flash", icon: ImageIcon, color: "#f472b6", borderColor: "#db2777", path: "/(kids)/games/words" }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Games</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {games.map((game, i) => {
                    const IconComponent = game.icon;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => router.push(game.path as any)}
                            style={[
                                styles.gameCard,
                                { backgroundColor: game.color, borderBottomColor: game.borderColor }
                            ]}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconContainer}>
                                <IconComponent size={32} color="white" />
                            </View>
                            <View style={styles.gameInfo}>
                                <Text style={styles.gameTitle}>{game.title}</Text>
                                <Text style={styles.gameSubtitle}>Tap to play!</Text>
                            </View>
                            <View style={styles.playButton}>
                                <Play size={24} color="white" fill="white" />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    gameCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderBottomWidth: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        gap: 24,
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        padding: 16,
        borderRadius: 16,
    },
    gameInfo: {
        flex: 1,
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    gameSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.8)',
    },
    playButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 24,
    },
});
