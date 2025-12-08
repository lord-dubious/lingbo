import React from 'react';
import { useRouter, usePathname, Link } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Platform
} from 'react-native';
import {
    ArrowLeft,
    User,
    Bell,
    Home,
    BookOpen,
    Mic,
    Library,
    ChevronLeft
} from 'lucide-react-native';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    backPath?: string;
    onBack?: () => void;
    isKidsMode?: boolean;
    hideBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    title,
    showBack = false,
    backPath,
    onBack,
    isKidsMode = false,
    hideBottomNav = false
}) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleBack = () => {
        if (showBack) {
            if (onBack) {
                onBack();
            } else if (backPath) {
                router.push(backPath as any);
            } else {
                router.back();
            }
        }
    };

    // Helper to determine active tab
    const getActiveTab = (path: string) => {
        if (path === '/' || path === '/hub') return 'home';
        if (path.startsWith('/adults') || path.startsWith('/(adults)')) return 'learn';
        if (path.startsWith('/practice')) return 'practice';
        if (path.startsWith('/library')) return 'library';
        if (path.startsWith('/profile')) return 'profile';
        return 'home';
    };

    const activeTab = getActiveTab(pathname);

    const navItems = [
        { key: 'home', icon: Home, label: 'Home', route: '/hub' },
        { key: 'learn', icon: BookOpen, label: 'Learn', route: '/(adults)' },
        { key: 'practice', icon: Mic, label: 'Tutor', route: '/practice', isCenter: true },
        { key: 'library', icon: Library, label: 'Library', route: '/library' },
        { key: 'profile', icon: User, label: 'Profile', route: '/profile' },
    ];

    return (
        <SafeAreaView style={[styles.container, isKidsMode && styles.containerKids]}>
            {/* Header */}
            <View style={[styles.header, isKidsMode && styles.headerKids]}>
                <View style={styles.headerLeft}>
                    {/* Back Button for Adults */}
                    {showBack && !isKidsMode && (
                        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                            <ArrowLeft size={24} color="#374151" />
                        </TouchableOpacity>
                    )}

                    {/* Logo and Title */}
                    <TouchableOpacity
                        onPress={() => router.push('/hub')}
                        style={styles.logoContainer}
                    >
                        {(!showBack || isKidsMode) && (
                            <Image
                                source={require('../assets/images/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={[styles.headerTitle, isKidsMode && styles.headerTitleKids]}>
                            {title || 'Lingbo'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRight}>
                    {!isKidsMode && (
                        <TouchableOpacity style={styles.headerButton}>
                            <Bell size={20} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        style={styles.avatarButton}
                    >
                        <User size={18} color="#6b7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={[
                styles.content,
                !isKidsMode && !hideBottomNav && styles.contentWithNav
            ]}>
                {children}
            </View>

            {/* Kids Mode: Bottom-Left Back Button */}
            {isKidsMode && showBack && (
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.kidsBackButton}
                >
                    <ChevronLeft size={32} strokeWidth={3} color="#ca8a04" />
                </TouchableOpacity>
            )}

            {/* Adult Mode: Bottom Navigation */}
            {!isKidsMode && !hideBottomNav && (
                <View style={styles.bottomNav}>
                    <View style={styles.bottomNavInner}>
                        {navItems.map((item) => {
                            const isActive = activeTab === item.key;
                            const IconComponent = item.icon;

                            if (item.isCenter) {
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        onPress={() => router.push(item.route as any)}
                                        style={styles.centerNavItem}
                                    >
                                        <View style={[
                                            styles.centerNavButton,
                                            isActive && styles.centerNavButtonActive
                                        ]}>
                                            <IconComponent
                                                size={28}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                color={isActive ? 'white' : '#9ca3af'}
                                            />
                                        </View>
                                        <View style={{ height: 24 }} />
                                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => router.push(item.route as any)}
                                    style={styles.navItem}
                                >
                                    <IconComponent
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        color={isActive ? '#f97316' : '#9ca3af'}
                                    />
                                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    containerKids: {
        backgroundColor: '#fef3c7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerKids: {
        backgroundColor: '#facc15',
        borderBottomColor: '#eab308',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        padding: 8,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 32,
        height: 32,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerTitleKids: {
        color: '#1e40af',
        fontSize: 20,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarButton: {
        width: 32,
        height: 32,
        backgroundColor: '#e5e7eb',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    contentWithNav: {
        paddingBottom: 100,
    },
    kidsBackButton: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 64,
        height: 64,
        backgroundColor: 'white',
        borderRadius: 32,
        borderWidth: 4,
        borderColor: '#fde047',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomNavInner: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    centerNavItem: {
        alignItems: 'center',
        position: 'relative',
    },
    centerNavButton: {
        position: 'absolute',
        top: -40,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#f9fafb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    centerNavButtonActive: {
        backgroundColor: '#f97316',
        shadowColor: '#f97316',
        shadowOpacity: 0.3,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#9ca3af',
    },
    navLabelActive: {
        color: '#f97316',
    },
});

export default Layout;
