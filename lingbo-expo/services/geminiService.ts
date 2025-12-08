import { GoogleGenAI } from '@google/genai';
import Constants from 'expo-constants';

// Get API key from Expo constants or environment
const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const getClient = () => {
    if (!API_KEY) {
        console.warn('Gemini API key not configured');
        return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Generate a response from the AI tutor "Chike"
 */
export const generateTutorResponse = async (userText: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing. Please configure EXPO_PUBLIC_GEMINI_API_KEY";

    try {
        const model = 'gemini-2.0-flash';
        const prompt = `You are 'Chike', a native Igbo language tutor. Respond in a friendly, encouraging way. 
If the user speaks English, translate key phrases to Igbo.
If the user speaks Igbo, correct their grammar if needed and provide the English translation.
Always use correct Igbo diacritics and tone markings.
Keep responses concise (under 100 words).

User: ${userText}`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || "Ndo, I couldn't understand. Try again?";
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `[SPEAK_IGBO]: ${text}`,
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            }
        });

        // Extract audio data from response
        const audioPart = response.candidates?.[0]?.content?.parts?.find(
            (p: any) => p.inlineData?.mimeType?.includes('audio')
        );

        return audioPart?.inlineData?.data || null;
    } catch (error) {
        console.error('TTS error:', error);
        return null;
    }
};

/**
 * Transcribe audio to text (Speech-to-Text)
 */
export const transcribeUserAudio = async (audioBase64: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return '';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { text: 'Transcribe the following audio. If it\'s Igbo, transcribe with correct diacritics:' },
                { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }
            ]
        });

        return response.text || '';
    } catch (error) {
        console.error('STT error:', error);
        return '';
    }
};

/**
 * Analyze pronunciation and provide feedback
 */
export const analyzePronunciation = async (
    targetPhrase: string,
    userTranscription: string
): Promise<{
    score: number;
    feedback: string;
    corrections: string[];
}> => {
    const ai = getClient();
    if (!ai) {
        return { score: 0, feedback: 'API not available', corrections: [] };
    }

    try {
        const prompt = `Compare the target Igbo phrase to what the user said.
Target: "${targetPhrase}"
User said: "${userTranscription}"

Respond in this exact JSON format:
{
  "score": <0-100 accuracy score>,
  "feedback": "<brief encouraging feedback>",
  "corrections": ["<specific corrections if any>"]
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const text = response.text || '{}';
        // Try to parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { score: 50, feedback: 'Good effort!', corrections: [] };
    } catch (error) {
        console.error('Pronunciation analysis error:', error);
        return { score: 0, feedback: 'Analysis failed', corrections: [] };
    }
};

/**
 * Grade handwriting from an image (for TraceBook)
 */
export const gradeHandwriting = async (
    imageBase64: string,
    targetLetter: string
): Promise<{
    score: number;
    feedback: string;
}> => {
    const ai = getClient();
    if (!ai) {
        return { score: 0, feedback: 'API not available' };
    }

    try {
        const prompt = `You are grading a child's handwriting practice.
They were asked to trace the Igbo letter/word: "${targetLetter}"
Look at the image and grade their attempt.

Respond in JSON format:
{
  "score": <0-100>,
  "feedback": "<brief encouraging feedback for a child>"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { text: prompt },
                { inlineData: { mimeType: 'image/png', data: imageBase64 } }
            ]
        });

        const text = response.text || '{}';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { score: 70, feedback: 'Good try!' };
    } catch (error) {
        console.error('Handwriting grading error:', error);
        return { score: 0, feedback: 'Grading failed' };
    }
};

export default {
    generateTutorResponse,
    generateIgboSpeech,
    transcribeUserAudio,
    analyzePronunciation,
    gradeHandwriting,
};
