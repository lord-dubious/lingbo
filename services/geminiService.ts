
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client factory
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getGeminiClient = getClient;

// 1. Smart Chat (Gemini API)
export const generateTutorResponse = async (userText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "⚠️ API Key missing. Please add GEMINI_API_KEY to your .env.local file and restart the server.";
  }

  try {
    const ai = getClient();
    const model = 'gemini-2.5-flash'; // Using Gemini 2.5 Flash
    const prompt = `You are 'Chike', an expert Igbo language tutor passionate about teaching the Igbo language.

USER MESSAGE: "${userText}"

YOUR TEACHING APPROACH:
1. **For English input**: Translate to Igbo, explain meaning, and teach pronunciation
   - Always use proper Igbo diacritics (ọ, ụ, ị, ṅ, m̄)
   - Break down complex words
   - Give usage examples

2. **For Igbo input**: Praise their effort, offer corrections if needed
   - Gently correct grammar/spelling
   - Suggest more natural phrasing
   - Explain tones when relevant

3. **Teaching Focus**:
   - Use Central Igbo dialect (standard)
   - Keep responses concise (2-3 sentences max)
   - Be encouraging and patient
   - Include cultural context when helpful

4. **Format**:
   - Use proper Igbo orthography
   - Show tone marks for difficult words
   - Give literal translations when useful

Remember: You're teaching, not just translating. Help them understand WHY, not just WHAT.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
      },
    });

    return response.text || "Ndo (Sorry), I couldn't understand that.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes('API_KEY')) {
      return "⚠️ API Key error. Please check your .env.local file has GEMINI_API_KEY set correctly.";
    }
    return "Network error. Please try again later.";
  }
};

// 2. Generate Speech (TTS)
export const generateIgboSpeech = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing for TTS");
    return null;
  }

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Puck voice for better compatibility
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.error("No audio data returned from TTS");
    }
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// 3. Transcribe Audio (STT) - Using Flash
export const transcribeUserAudio = async (audioBase64: string, mimeType: string = 'audio/wav'): Promise<string> => {
  if (!process.env.API_KEY) return "Error: No API Key";

  try {
    const ai = getClient();
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

    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

// 4. Analyze Pronunciation (Structured)
export const analyzePronunciation = async (targetPhrase: string, userTranscript: string): Promise<AnalysisResult | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const ai = getClient();
    const prompt = `
       Role: Igbo Language Teacher.
       Task: Compare the User's Audio Transcript to the Target Phrase.
       
       Target Phrase: "${targetPhrase}"
       User Audio Transcript: "${userTranscript}"
       
       Return a JSON object with this EXACT schema:
       {
         "user_said_igbo": "Transcribe what the user actually said in Igbo (or 'N/A' if completely wrong)",
         "user_said_english": "Translate what the user said to English",
         "feedback": "Specific advice on pronunciation, tone, or grammar. Keep it short and encouraging."
        
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
  } catch (e) {
    console.error("Analysis Failed", e);
    return null;
  }
}
