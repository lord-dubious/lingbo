import { Stack } from 'expo-router';

export default function KidsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="games" />
            <Stack.Screen name="trace" />
        </Stack>
    );
}
