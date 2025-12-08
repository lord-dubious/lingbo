
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Volume2, Send } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateTutorResponse, generateIgboSpeech } from '../../services/geminiService';
import { playPCMAudio } from '../../utils/audioUtils';

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
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
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

      {/* Input bar - Sticky Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-gray-50 flex gap-2 z-10 backdrop-blur-sm bg-white/90">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type in Igbo or English..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 h-10"
        />
        <button onClick={handleSend} disabled={loading} className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition-colors h-10 w-10 flex items-center justify-center shadow-sm active:scale-95"><Send size={18} /></button>
      </div>
    </div>
  );
};

export default TextChat;
