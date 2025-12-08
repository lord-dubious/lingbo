import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import Layout from '../components/Layout';




export default function NumbersBoard() {
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

    return (
        <Layout title="Numbers" showBack>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="flex-row flex-wrap justify-between gap-2">
                    {numbers.map((num) => (
                        <View key={num} className="w-[30%] aspect-square bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm mb-2">
                            <Text className="text-4xl font-bold text-blue-600">{num}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Layout>
    );
}
