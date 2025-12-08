
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

// 1. Smart Chat (Gemini 3.0 Pro with Thinking)
export const generateTutorResponse = async (userText: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const ai = getClient();
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
    console.error("Gemini API Error:", error);
    return "Network error. Please try again later.";
  }
};

// 2. Generate Speech (TTS)
export const generateIgboSpeech = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
   } catch (e) {
     console.error("Analysis Failed", e);
     return null;
   }
}

// 5. Grade Handwriting (Vision)
export const gradeHandwriting = async (imageBase64: string, targetText: string): Promise<{ score: number, feedback: string } | null> => {
    if (!process.env.API_KEY) return null;

    try {
        const ai = getClient();
        const prompt = `
            Act as a kind kindergarten teacher. 
            The user has attempted to trace/write the Igbo letter or word: "${targetText}".
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

    } catch (e) {
        console.error("Handwriting Grading Failed", e);
        return null;
    }
};
