import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import Layout from '../components/Layout';
import { Book, Video } from 'lucide-react-native';





export default function Library() {
    return (
        <Layout title="Library" showBack>
            <View className="flex-1 items-center justify-center p-6">
                <Text className="text-gray-500 text-lg text-center">
                    Workbooks and resources will appear here.
                </Text>

                <View className="mt-8 w-full gap-4">
                     <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center gap-4 shadow-sm border border-gray-100">
                         <View className="p-3 bg-purple-100 rounded-xl">
                            <Book size={24} color="#9333ea" />
                         </View>
                         <View>
                             <Text className="font-bold text-lg text-gray-800">My First Igbo Book</Text>
                             <Text className="text-gray-500">PDF • 12 Pages</Text>
                         </View>
                     </TouchableOpacity>
                </View>
            </View>
        </Layout>
    );
}
