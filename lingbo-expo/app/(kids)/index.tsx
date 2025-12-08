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
    Gamepad2,
    PlayCircle,
    Image as ImageIcon,
    Type,
    Hash,
    Pencil,
    ArrowLeft,
} from 'lucide-react-native';
import { useUser } from '@/context/UserContext';

interface MenuItem {
    label: string;
    sub: string;
    icon: any;
    bg: string;
    borderColor: string;
    path: string;
}

export default function KidsDashboard() {
    const router = useRouter();
    const { activeProfile } = useUser();

    const menu: MenuItem[] = [
        { label: "Words", sub: "Flashcards", icon: ImageIcon, bg: "#f472b6", borderColor: "#db2777", path: "/(kids)/games/words" },
        { label: "Games", sub: "Play Time", icon: Gamepad2, bg: "#60a5fa", borderColor: "#2563eb", path: "/(kids)/games" },
        { label: "Write", sub: "Trace Book", icon: Pencil, bg: "#fb923c", borderColor: "#ea580c", path: "/(kids)/trace" },
        { label: "ABC", sub: "Alphabet", icon: Type, bg: "#4ade80", borderColor: "#16a34a", path: "/alphabet" },
        { label: "123", sub: "Numbers", icon: Hash, bg: "#facc15", borderColor: "#ca8a04", path: "/numbers" },
        { label: "Watch", sub: "Videos", icon: PlayCircle, bg: "#f87171", borderColor: "#dc2626", path: "/videos" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/hub')} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kids Corner</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Greeting Card */}
                <View style={styles.greetingCard}>
                    <Text style={styles.avatar}>{activeProfile?.avatar || '🐻'}</Text>
                    <View>
                        <Text style={styles.greetingTitle}>Hi, {activeProfile?.name || 'Friend'}!</Text>
                        <Text style={styles.greetingSubtitle}>What do you want to do?</Text>
                    </View>
                </View>

                {/* Menu Grid */}
                <View style={styles.grid}>
                    {menu.map((item, i) => {
                        const IconComponent = item.icon;
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => router.push(item.path as any)}
                                style={[
                                    styles.menuItem,
                                    { backgroundColor: item.bg, borderBottomColor: item.borderColor }
                                ]}
                                activeOpacity={0.9}
                            >
                                {/* Decorative circles */}
                                <View style={styles.decor1} />
                                <View style={styles.decor2} />

                                {/* Icon */}
                                <View style={styles.iconContainer}>
                                    <IconComponent size={56} color="white" />
                                </View>

                                {/* Labels */}
                                <View style={styles.labelContainer}>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <Text style={styles.menuSub}>{item.sub}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
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
        backgroundColor: '#facc15',
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
        color: '#1e40af',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    greetingCard: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    avatar: {
        fontSize: 48,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    greetingSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    menuItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderBottomWidth: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    decor1: {
        position: 'absolute',
        top: -40,
        left: -40,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decor2: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        marginBottom: 8,
    },
    labelContainer: {
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    menuSub: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
});
