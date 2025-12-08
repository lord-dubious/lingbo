import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateTutorResponse } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';
import { Send, ChevronLeft, Mic } from 'lucide-react-native';

const PracticeScreen = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [tab, setTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');

    setLoading(true);
    try {
      const response = await generateTutorResponse(message);
      const modelMsg = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      showToast('Failed to get response', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Tutor</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'chat' && styles.tabActive]}
          onPress={() => setTab('chat')}
        >
          <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'live' && styles.tabActive]}
          onPress={() => setTab('live')}
        >
          <Text style={[styles.tabText, tab === 'live' && styles.tabTextActive]}>
            Live
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'coach' && styles.tabActive]}
          onPress={() => setTab('coach')}
        >
          <Text style={[styles.tabText, tab === 'coach' && styles.tabTextActive]}>
            Coach
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.messagesContainer}>
            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Start a conversation with Chike, your Igbo tutor!</Text>
              </View>
            )}
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.message,
                  msg.role === 'user' ? styles.userMessage : styles.modelMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === 'user' && styles.userMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.modelMessage}>
                <Text style={styles.messageText}>Chike is thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask Chike something..."
              value={message}
              onChangeText={setMessage}
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={loading}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tab === 'live' && (
        <View style={styles.comingSoon}>
          <Mic size={48} color="#ccc" />
          <Text style={styles.comingSoonText}>Live Voice Tutoring</Text>
          <Text style={styles.comingSoonSubtext}>Coming soon! 🎤</Text>
        </View>
      )}

      {tab === 'coach' && (
        <View style={styles.comingSoon}>
          <Mic size={48} color="#ccc" />
          <Text style={styles.comingSoonText}>Pronunciation Coach</Text>
          <Text style={styles.comingSoonSubtext}>Coming soon! 🎤</Text>
        </View>
      )}
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  message: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f97316',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modelMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default PracticeScreen;
