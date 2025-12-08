import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Loader2, Volume2, Send } from 'lucide-react-native';
import { generateTutorResponse, generateIgboSpeech } from '../../services/geminiService';
import { playPCMAudio } from '../../utils/audioUtils';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

const TextChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Nnọ! I am Chike. We can practice conversation. Gwa m okwu (Talk to me)!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
        setLoading(true);

        try {
            const responseText = await generateTutorResponse(userText);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
        } catch (e) {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Network error.', isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAudio = async (text: string, id: string) => {
        if (playingId === id) return;
        setPlayingId(id);
        try {
            const b64 = await generateIgboSpeech(text);
            if (b64) {
                await playPCMAudio(b64);
            }
        } catch (e) {
            console.error('Audio playback failed', e);
        }
        setPlayingId(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                ref={scrollRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((m) => (
                    <View
                        key={m.id}
                        style={[
                            styles.messageBubble,
                            m.role === 'user' ? styles.userBubble : styles.modelBubble
                        ]}
                    >
                        <Text style={[
                            styles.messageText,
                            m.role === 'user' ? styles.userText : styles.modelText
                        ]}>
                            {m.text}
                        </Text>
                        {m.role === 'model' && !m.isError && (
                            <TouchableOpacity
                                onPress={() => handlePlayAudio(m.text, m.id)}
                                disabled={playingId === m.id}
                                style={styles.audioButton}
                            >
                                {playingId === m.id ? (
                                    <ActivityIndicator size="small" color="#f97316" />
                                ) : (
                                    <Volume2 size={14} color="#6b7280" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {loading && (
                    <View style={[styles.messageBubble, styles.modelBubble]}>
                        <View style={styles.typingIndicator}>
                            <View style={[styles.typingDot, styles.typingDot1]} />
                            <View style={[styles.typingDot, styles.typingDot2]} />
                            <View style={[styles.typingDot, styles.typingDot3]} />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input bar */}
            <View style={styles.inputBar}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    placeholder="Type in Igbo or English..."
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    returnKeyType="send"
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading || !input.trim()}
                    style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                >
                    <Send size={18} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 80,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#f97316',
        borderBottomRightRadius: 4,
    },
    modelBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f3f4f6',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    userText: {
        color: 'white',
    },
    modelText: {
        color: '#1f2937',
    },
    audioButton: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },
    typingIndicator: {
        flexDirection: 'row',
        gap: 4,
        padding: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#9ca3af',
    },
    typingDot1: {
        // Animation would be applied here with reanimated
    },
    typingDot2: {
        opacity: 0.7,
    },
    typingDot3: {
        opacity: 0.5,
    },
    inputBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#1f2937',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f97316',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default TextChat;
