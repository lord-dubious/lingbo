import { Stack } from 'expo-router';

export default function GamesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="words" />
            <Stack.Screen name="sentence" />
            <Stack.Screen name="memory" />
            <Stack.Screen name="speed" />
        </Stack>
    );
}
