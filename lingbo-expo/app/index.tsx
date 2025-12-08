import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useUser } from '@/context/UserContext';

export default function Index() {
    const { activeProfile, isLoading } = useUser();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    // No active profile? Go to onboarding
    if (!activeProfile) {
        return <Redirect href="/onboarding" />;
    }

    // Has profile? Go to hub
    return <Redirect href="/hub" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});
