
import React, { useState, useEffect, useRef } from 'react';
import { Phone, AudioWaveform, Mic, X } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, pcmToAudioBuffer } from '../../utils/audioUtils';

const LiveChat = () => {
  const [connected, setConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    return () => disconnect();
  }, []);

  const connect = async () => {
    setError(null);
    if (!process.env.API_KEY) { 
      setError("API Key missing"); 
      return; 
    }

    try {
      const audioCtxOut = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioCtxOut.resume();
      audioContextOutputRef.current = audioCtxOut;
      nextStartTimeRef.current = audioCtxOut.currentTime + 0.1;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtxIn = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextInputRef.current = audioCtxIn;
      await audioCtxIn.resume();

      const source = audioCtxIn.createMediaStreamSource(stream);
      const processor = audioCtxIn.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtxIn.destination);

      const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } 
          },
          systemInstruction: { 
            parts: [{ text: "You are Chike, a friendly and patient Igbo language teacher. Speak English with a Nigerian accent. Keep responses short and conversational. Teach basic phrases." }] 
          }
        },
        callbacks: {
          onopen: () => {
            setConnected(true);
            setIsSpeaking(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const ctx = audioContextOutputRef.current;
              if (!ctx) return;

              try {
                const pcmData = base64ToUint8Array(base64Audio);
                const buffer = await pcmToAudioBuffer(pcmData, ctx, 24000, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                if (nextStartTimeRef.current < ctx.currentTime) {
                  nextStartTimeRef.current = ctx.currentTime + 0.05;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                source.onended = () => {
                  if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsSpeaking(false);
                  }
                };
              } catch (err) {
                console.error("Decoding error:", err);
              }
            }
          },
          onclose: () => {
            setConnected(false);
            setIsSpeaking(false);
          },
          onerror: (err) => {
            console.error("Session error:", err);
            setError("Connection failed");
            setConnected(false);
          }
        }
      });

      sessionRef.current = sessionPromise;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64Data = btoa(binary);

        if (sessionRef.current) {
          sessionRef.current.then((session: any) => {
             session.sendRealtimeInput({ 
               media: { 
                 mimeType: 'audio/pcm;rate=16000', 
                 data: base64Data 
               } 
             });
          });
        }
      };

    } catch (e: any) {
      console.error(e);
      setError("Could not access microphone or connect.");
      setConnected(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setIsSpeaking(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextInputRef.current) {
      audioContextInputRef.current.close();
      audioContextInputRef.current = null;
    }
    if (audioContextOutputRef.current) {
      audioContextOutputRef.current.close();
      audioContextOutputRef.current = null;
    }
    sessionRef.current = null;
  };

  return (
    <div className="h-[450px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-gray-100 relative overflow-hidden transition-all duration-500">
      {connected && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-20'}`}>
          <div className="w-64 h-64 bg-primary/10 rounded-full animate-ping absolute"></div>
          <div className="w-48 h-48 bg-primary/20 rounded-full animate-pulse absolute delay-100"></div>
          <div className="w-32 h-32 bg-primary/30 rounded-full animate-pulse absolute delay-200"></div>
        </div>
      )}
      <div className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all duration-500 shadow-2xl ${connected ? 'bg-gradient-to-br from-red-500 to-pink-500 scale-110' : 'bg-gray-100'}`}>
        {connected ? (
            isSpeaking ? <AudioWaveform size={48} className="text-white animate-pulse" /> : <Mic size={48} className="text-white" />
        ) : (
            <Phone size={48} className="text-gray-400" />
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-2">{connected ? (isSpeaking ? 'Chike is speaking...' : 'Listening...') : 'Start Call'}</h3>
      <p className="text-gray-500 mb-8 max-w-xs text-lg">
        {error ? <span className="text-red-500 font-bold">{error}</span> : (connected ? 'Speak naturally in English or Igbo.' : 'Practice conversation with a real-time AI tutor.')}
      </p>
      {!connected ? (
        <button onClick={connect} className="bg-primary text-white font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-3">
           <Phone size={24} /> Call Chike
        </button>
      ) : (
        <button onClick={disconnect} className="bg-gray-200 text-gray-700 font-bold text-lg px-10 py-4 rounded-full hover:bg-red-100 hover:text-red-600 transition-all flex items-center gap-3">
           <X size={24} /> End Call
        </button>
      )}
    </div>
  );
};

export default LiveChat;
