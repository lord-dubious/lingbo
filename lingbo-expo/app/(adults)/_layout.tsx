import { Stack } from 'expo-router';

export default function AdultsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="level/[id]" />
        </Stack>
    );
}
