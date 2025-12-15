import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';
import { AnalysisResult } from '../types';

// In Expo, process.env is replaced at build time for EXPO_PUBLIC_* variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('Gemini API Key configured:', API_KEY ? 'Yes' : 'No');

const getClient = () => {
    if (!API_KEY) {
        console.warn('Gemini API key not configured');
        return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Generate a response from the AI tutor "Chike" (Gemini 3.0 Pro with Thinking)
 */
export const generateTutorResponse = async (userText: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing. Please configure EXPO_PUBLIC_GEMINI_API_KEY";

    try {
        const model = 'gemini-3-pro-preview';
        const prompt = `You are 'Chike', a native Igbo language tutor. 
    User input: "${userText}"
    
    Instructions:
    1. If the user writes in English, translate it to Igbo and explain briefly.
    2. If the user writes in Igbo, correct any grammar mistakes.
    3. CRITICAL: When writing Igbo words, you MUST use correct standard Igbo diacritics (dots under ọ, ụ, ị) and tone markings where necessary to help with pronunciation.
    4. Prioritize Central Igbo dialect.
    5. Reply in a helpful, encouraging tone.`;

        // Enable thinking for complex tutoring
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 1024 }, // Set a budget for reasoning
            }
        });

        return response.text || "Ndo (Sorry), I couldn't understand that.";
    } catch (error) {
        console.error('Tutor response error:', error);
        return "Network error. Please try again.";
    }
};

/**
 * Generate Igbo TTS audio (returns base64 PCM)
 */
export const generateIgboSpeech = async (text: string): Promise<string | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        // Improved Logic: Explicitly instruct the model to pronounce as Igbo with specific attention to tones
        const promptText = `Pronounce the following text clearly in Igbo, paying strict attention to tonality and diacritics: "${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: promptText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // Using Zephyr as it tends to have a deeper, more neutral tone suitable for West African accents
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error('TTS error:', error);
        return null;
    }
};

/**
 * Transcribe audio to text (Speech-to-Text) - Using Flash
 */
export const transcribeUserAudio = async (audioBase64: string, mimeType: string = 'audio/wav'): Promise<string> => {
    const ai = getClient();
    if (!ai) return '';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64
                        }
                    },
                    { text: "Transcribe this audio exactly. If it is Igbo, write the Igbo words with correct diacritics. If it's English, write English." }
                ]
            }
        });

        return response.text || '';
    } catch (error) {
        console.error('STT error:', error);
        return '';
    }
};

/**
 * Analyze pronunciation and provide feedback (Structured)
 */
export const analyzePronunciation = async (
    targetPhrase: string,
    userTranscription: string
): Promise<AnalysisResult | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        Role: Igbo Language Teacher.
        Task: Compare the User's Audio Transcript to the Target Phrase.
        
        Target Phrase: "${targetPhrase}"
        User Audio Transcript: "${userTranscription}"
        
        Return a JSON object with this EXACT schema:
        {
          "user_said_igbo": "Transcribe what the user actually said in Igbo (or 'N/A' if completely wrong)",
          "user_said_english": "Translate what the user said to English",
          "feedback": "Specific advice on pronunciation, tone, or grammar. Keep it short and encouraging.",
          "score": number (0-100 based on accuracy)
        }
      `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) return null;

        return JSON.parse(text) as AnalysisResult;
    } catch (error) {
        console.error('Pronunciation analysis error:', error);
        return null;
    }
};

/**
 * Grade handwriting from an image (Vision)
 */
export const gradeHandwriting = async (
    imageBase64: string,
    targetLetter: string
): Promise<{
    score: number;
    feedback: string;
} | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
            Act as a kind kindergarten teacher. 
            The user has attempted to trace/write the Igbo letter or word: "${targetLetter}".
            Analyze the image provided.
            
            Return a JSON object:
            {
                "score": number (0-100, be generous but accurate. If it looks like scribbles, give low score. If it follows the shape, give high score.),
                "feedback": "Simple, encouraging feedback in English (max 1 sentence) for a child."
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        console.error('Handwriting grading error:', error);
        return null;
    }
};

export default {
    generateTutorResponse,
    generateIgboSpeech,
    transcribeUserAudio,
    analyzePronunciation,
    gradeHandwriting,
};
