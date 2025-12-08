import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const TraceBookScreen = () => {
  const navigation = useNavigation<any>();
  const [currentLetter, setCurrentLetter] = useState('A');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TraceBook</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Trace the letter with your finger</Text>
        
        <View style={styles.tracingArea}>
          <Text style={styles.tracingLetter}>{currentLetter}</Text>
          <Text style={styles.tracingSubtext}>Draw on this area</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.comingSoon}>Canvas rendering coming soon! 🚀</Text>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  tracingArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  tracingLetter: {
    fontSize: 120,
    fontWeight: '700',
    color: '#ccc',
    marginBottom: 16,
  },
  tracingSubtext: {
    fontSize: 12,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  comingSoon: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});

export default TraceBookScreen;
