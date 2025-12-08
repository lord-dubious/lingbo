import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

import Layout from '../components/Layout';
import { Play } from 'lucide-react-native';






export default function VideoLibrary() {
    return (
        <Layout title="Videos" showBack>
            <View className="flex-1 items-center justify-center p-6">
                <Text className="text-gray-500 text-lg text-center mb-6">
                    Watch and learn!
                </Text>

                <View className="w-full gap-6">
                     <TouchableOpacity className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                         <View className="h-48 bg-gray-200 items-center justify-center relative">
                             {/* Placeholder for thumbnail */}
                             <View className="absolute bg-black/30 p-4 rounded-full">
                                <Play size={32} color="white" fill="white" />
                             </View>
                         </View>
                         <View className="p-4">
                             <Text className="font-bold text-lg text-gray-800">Learn Colors in Igbo</Text>
                             <Text className="text-gray-500">Duration: 5:00</Text>
                         </View>
                     </TouchableOpacity>
                </View>
            </View>
        </Layout>
    );
}
