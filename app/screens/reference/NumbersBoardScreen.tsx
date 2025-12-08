import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IGBO_NUMBERS } from '../../constants';
import { generateIgboSpeech } from '../../services/geminiService';
import { playPCMAudio } from '../../utils/audioUtils';
import { Volume2, ChevronLeft } from 'lucide-react-native';

const NumbersBoardScreen = () => {
  const navigation = useNavigation<any>();

  const renderNumber = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.numberCard}
      onPress={() =>
        generateIgboSpeech(item.word).then(b64 => b64 && playPCMAudio(b64))
      }
    >
      <Text style={styles.numberValue}>{item.number}</Text>
      <Text style={styles.numberWord}>{item.word}</Text>
      <Volume2 size={14} color="#2563eb" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Igbo Numbers</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={IGBO_NUMBERS}
        renderItem={renderNumber}
        keyExtractor={(item) => item.number.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numberCard: {
    width: '47%',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#93c5fd',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  numberWord: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
    marginBottom: 8,
  },
});

export default NumbersBoardScreen;
