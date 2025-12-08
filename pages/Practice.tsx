
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Volume2, Send, Mic, AudioWaveform, Phone, X } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import Layout from '../components/Layout';
import { ChatMessage, AnalysisResult } from '../types';
import { generateTutorResponse, generateIgboSpeech, transcribeUserAudio, analyzePronunciation, blobToBase64 } from '../services/geminiService';
import { playPCMAudio, base64ToUint8Array, pcmToAudioBuffer } from '../utils/audioUtils';

// --- TextChat ---
const TextChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Nnọ! I am Chike. We can practice conversation. Gwa m okwu (Talk to me)!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    const b64 = await generateIgboSpeech(text);
    if (b64) {
      await playPCMAudio(b64);
    }
    setPlayingId(null);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
              {m.text}
              {m.role === 'model' && !m.isError && (
                 <button 
                  onClick={() => handlePlayAudio(m.text, m.id)} 
                  disabled={playingId === m.id}
                  className={`ml-2 inline-block p-1 bg-white/50 rounded-full hover:bg-white transition-all ${playingId === m.id ? 'animate-pulse text-primary' : ''}`}
                 >
                   {playingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                 </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type in Igbo or English..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
        />
        <button onClick={handleSend} disabled={loading} className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition-colors"><Send size={20} /></button>
      </div>
    </div>
  );
};

// --- LiveChat ---
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

// --- PronunciationCoach ---
const PronunciationCoach = () => {
   const [isRecording, setIsRecording] = useState(false);
   const [transcript, setTranscript] = useState('');
   const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
   const [targetPhrase, setTargetPhrase] = useState("Kedu ka i mere?"); // Default
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const chunksRef = useRef<Blob[]>([]);

   const phrases = ["Ututu ọma", "Kedu ka i mere?", "Nnọ", "Biko", "Daalu", "Aham bu Chike"];

   const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = async () => {
           const blob = new Blob(chunksRef.current, { type: 'audio/wav' }); // or webm
           const b64 = await blobToBase64(blob);
           const trans = await transcribeUserAudio(b64, blob.type);
           setTranscript(trans);
           const res = await analyzePronunciation(targetPhrase, trans);
           setAnalysis(res);
        };
        mr.start();
        setIsRecording(true);
        mediaRecorderRef.current = mr;
      } catch (e) {
        console.error("Mic error", e);
        alert("Microphone access denied.");
      }
   };

   const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
         setIsRecording(false);
         mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <div className="mb-6 text-center">
            <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Practice Phrase</h3>
            <div className="text-2xl font-bold text-gray-800 mb-4">{targetPhrase}</div>
            <div className="flex gap-2 justify-center flex-wrap">
               {phrases.map(p => (
                  <button key={p} onClick={() => { setTargetPhrase(p); setAnalysis(null); setTranscript(''); }} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${targetPhrase === p ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{p}</button>
               ))}
            </div>
         </div>

         <div className="flex justify-center mb-8">
            <button 
               onMouseDown={startRecording} 
               onMouseUp={stopRecording} 
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 scale-110 ring-8 ring-red-100' : 'bg-primary hover:bg-orange-600'}`}
            >
               <Mic size={40} className="text-white" />
            </button>
         </div>
         <p className="text-center text-gray-400 text-sm mb-6">{isRecording ? 'Listening...' : 'Hold to Speak'}</p>

         {transcript && (
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
               <div className="text-xs font-bold text-gray-400 uppercase mb-1">We heard:</div>
               <div className="text-gray-800 italic">"{transcript}"</div>
            </div>
         )}

         {analysis && (
            <div className={`p-4 rounded-xl border-l-4 ${analysis.score > 70 ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
               <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800">Feedback</h4>
                  <span className={`font-bold px-2 py-1 rounded text-sm ${analysis.score > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{analysis.score}% Match</span>
               </div>
               <p className="text-sm text-gray-600 mb-2">{analysis.feedback}</p>
               <div className="text-xs text-gray-500">
                  <span className="font-bold">You said (Igbo):</span> {analysis.user_said_igbo}
               </div>
            </div>
         )}
      </div>
   );
};

export const SpeakPractice = () => {
  const [tab, setTab] = useState('chat');
  return (
    <Layout title="AI Tutor" showBack>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
        <button onClick={()=>setTab('chat')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='chat'?'bg-white shadow text-primary':''}`}>Chat</button>
        <button onClick={()=>setTab('live')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='live'?'bg-white shadow text-primary':''}`}>Live</button>
        <button onClick={()=>setTab('coach')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${tab==='coach'?'bg-white shadow text-primary':''}`}>Coach</button>
      </div>
      {tab==='chat'&&<TextChat/>}
      {tab==='live'&&<LiveChat/>}
      {tab==='coach'&&<PronunciationCoach/>}
    </Layout>
  );
};
