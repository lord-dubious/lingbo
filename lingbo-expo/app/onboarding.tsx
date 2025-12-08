import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useUser } from '@/context/UserContext';

const { width } = Dimensions.get('window');

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const { addProfile } = useUser();
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    const handleFinish = () => {
        if (name.trim()) {
            addProfile(name, 'adult');
            router.replace('/hub');
        }
    };

    const slides = [
        {
            title: "Nnọ! Welcome",
            subtitle: "A language for generations.",
            desc: "Your journey to mastering the Igbo Language starts here",
            isLogo: true
        },
        {
            title: "Learn Naturally",
            subtitle: "",
            desc: "Discover the language through stories, everyday words, and gentle practice. Learn The Igbo Way.",
            icon: "🌿",
            iconBg: '#dcfce7',
        },
        {
            title: "Your Name",
            subtitle: "",
            desc: "Let's personalize your experience.",
            icon: "👋",
            iconBg: '#fef3c7',
            isInput: true
        }
    ];

    const currentSlide = slides[step];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {step > 0 && (
                    <TouchableOpacity
                        onPress={() => setStep(step - 1)}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                )}

                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        {currentSlide.isLogo ? (
                            <View style={styles.logoContainer}>
                                <Text style={styles.logoEmoji}>📚</Text>
                            </View>
                        ) : (
                            <View style={[styles.iconContainer, { backgroundColor: currentSlide.iconBg }]}>
                                <Text style={styles.iconEmoji}>{currentSlide.icon}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.title}>{currentSlide.title}</Text>
                    {currentSlide.subtitle ? (
                        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                    ) : null}
                    <Text style={styles.description}>{currentSlide.desc}</Text>

                    {currentSlide.isInput && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={inputRef}
                                placeholder="Enter your name"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleFinish}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    {step < 2 ? (
                        <TouchableOpacity
                            onPress={() => setStep(step + 1)}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleFinish}
                            disabled={!name.trim()}
                            style={[styles.button, !name.trim() && styles.buttonDisabled]}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.dots}>
                        {slides.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === step ? styles.dotActive : styles.dotInactive
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 44,
        height: 44,
        backgroundColor: '#f3f4f6',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        marginBottom: 32,
    },
    logoContainer: {
        width: 192,
        height: 192,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEmoji: {
        fontSize: 100,
    },
    iconContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconEmoji: {
        fontSize: 64,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#f97316',
        fontWeight: '500',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 26,
    },
    inputContainer: {
        width: '100%',
        marginTop: 32,
    },
    input: {
        width: '100%',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#4b5563',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
    },
    footer: {
        paddingBottom: 32,
    },
    button: {
        width: '100%',
        backgroundColor: '#f97316',
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 32,
        backgroundColor: '#f97316',
    },
    dotInactive: {
        width: 8,
        backgroundColor: '#e5e7eb',
    },
});
