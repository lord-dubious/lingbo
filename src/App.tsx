
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Routes, Route, useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Gamepad2, 
  BookOpen, 
  PlayCircle, 
  Mic, 
  ChevronRight, 
  Lock, 
  Volume2, 
  Image as ImageIcon,
  CheckCircle,
  RefreshCcw,
  Send,
  AudioWaveform,
  StopCircle,
  Play,
  Settings,
  Trophy,
  Flame,
  Calendar,
  X,
  Type,
  Puzzle,
  ArrowLeft,
  Star,
  Zap,
  Plus,
  Users,
  Smile,
  Layout as LayoutIcon,
  Video,
  Music,
  FileText,
  Sparkles,
  Timer,
  Hash,
  Lightbulb,
  Loader2,
  Phone
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

import Layout from './components/Layout';
import IgboKeyboard from './components/IgboKeyboard';
import { ADULT_CURRICULUM, KIDS_FLASHCARDS, KIDS_GAMES, LIBRARY_BOOKS, VIDEO_RESOURCES, IGBO_ALPHABET_FULL, ACHIEVEMENTS, MEMORY_GAME_DATA, IGBO_NUMBERS, WORKBOOKS, FUN_FACTS } from './constants';
import { 
  generateTutorResponse, 
  generateIgboSpeech, 
  transcribeUserAudio, 
  analyzePronunciation, 
  blobToBase64,
  getGeminiClient
} from './services/geminiService';
import { ChatMessage, VideoResource, AnalysisResult, UserProfile, ProfileType } from './types';

// --- Global Context for User & Profiles ---
interface UserContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  addProfile: (name: string, type: ProfileType) => void;
  switchProfile: (profileId: string) => void;
  updateActiveProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('lingbo_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    return localStorage.getItem('lingbo_active_profile_id');
  });

  useEffect(() => {
    localStorage.setItem('lingbo_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) localStorage.setItem('lingbo_active_profile_id', activeProfileId);
    else localStorage.removeItem('lingbo_active_profile_id');
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const addProfile = (name: string, type: ProfileType) => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name,
      type,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      streak: 1,
      level: 1,
      xp: 0,
      avatar: type === 'kid' ? '🐻' : '👤'
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
  };

  const updateActiveProfile = (data: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...data } : p));
  };

  const logout = () => {
    setActiveProfileId(null);
  };

  return (
    <UserContext.Provider value={{ profiles, activeProfile, addProfile, switchProfile, updateActiveProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

// --- Audio Helpers (PCM) ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function pcmToAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let globalAudioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
  return globalAudioCtx;
};

const playPCMAudio = async (base64: string) => {
  try {
    const audioCtx = getAudioContext();
    const pcmData = base64ToUint8Array(base64);
    const buffer = await pcmToAudioBuffer(pcmData, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (e) { console.error("Audio playback failed", e); }
};

const playGameSound = (type: 'success' | 'error' | 'click' | 'win' | 'flip') => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
       // Simple arpeggio
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(400, now);
       osc.frequency.setValueAtTime(500, now + 0.1);
       osc.frequency.setValueAtTime(600, now + 0.2);
       osc.frequency.setValueAtTime(800, now + 0.3);
       gain.gain.setValueAtTime(0.1, now);
       gain.gain.linearRampToValueAtTime(0, now + 0.6);
       osc.start(now);
       osc.stop(now + 0.6);
    } else {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch(e) { /* ignore */ }
};

// --- Components ---

const ConfettiOverlay = ({ onRestart }: { onRestart?: () => void }) => (
  <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center animate-in zoom-in p-6 text-center backdrop-blur-sm">
    <div className="mb-6 relative">
        <Sparkles size={80} className="text-yellow-400 animate-spin-slow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Trophy size={100} className="text-purple-500 relative z-10 drop-shadow-xl" />
    </div>
    <h3 className="font-kids font-bold text-4xl text-pink-500 mb-2">Great Job!</h3>
    <p className="font-bold text-gray-500 text-lg mb-8">O mara nma!</p>
    {onRestart && <button onClick={onRestart} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Play Again</button>}
  </div>
);

// 1. Onboarding
const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const { addProfile } = useUser();
  const navigate = useNavigate();

  const handleFinish = () => {
    if (name.trim()) {
      addProfile(name, 'adult'); // Default first profile is Adult
      navigate('/hub');
    }
  };

  const slides = [
    { 
      title: "Nnọ! Welcome", 
      subtitle: "A language for generations.",
      desc: "Your journey to mastering the Igbo Language starts here", 
      image: "/assets/images/lingbo_logo_main.png"
    },
    { 
      title: "Learn Naturally", 
      subtitle: "",
      desc: "Discover the language through stories, everyday words, and gentle practice. Learn The Igbo Way.", 
      icon: "🌿",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    { 
      title: "Your Name", 
      subtitle: "",
      desc: "Let's personalize your experience.", 
      icon: "👋",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      isInput: true 
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative">
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          {slides[step].image ? (
            <img src={slides[step].image} alt="Lingbo" className="w-48 h-48 object-contain mx-auto animate-in zoom-in duration-500" />
          ) : (
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${slides[step].iconBg} ${slides[step].iconColor} mx-auto animate-in zoom-in duration-500 shadow-lg`}>
              <div className="text-6xl">{slides[step].icon}</div>
            </div>
          )}
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slides[step].title}</h2>
        {slides[step].subtitle && <h3 className="text-lg text-primary font-medium mb-4">{slides[step].subtitle}</h3>}
        <p className="text-gray-500 text-lg mb-8 max-w-xs mx-auto">{slides[step].desc}</p>

        {slides[step].isInput && (
          <div className="w-full mb-8 animate-in slide-in-from-bottom-8 delay-100">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-gray-600 text-white font-bold placeholder:text-gray-300 text-center text-xl outline-none focus:ring-4 focus:ring-primary/30 shadow-lg transition-all"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-sm mt-auto">
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Next
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!name.trim()} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl shadow-orange-200">
            Get Started
          </button>
        )}
        <div className="flex gap-2 justify-center mt-8">
          {slides.map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Profile Selector
const ProfileSelector = ({ type, onClose }: { type: ProfileType, onClose: () => void }) => {
  const { profiles, switchProfile, addProfile } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const filteredProfiles = profiles.filter(p => p.type === type);

  const handleSelect = (id: string) => {
    switchProfile(id);
    onClose();
    if (type === 'adult') navigate('/adults');
    else navigate('/kids');
  };

  const handleCreate = () => {
    if (newName.trim()) {
      addProfile(newName.trim(), type);
      onClose();
      if (type === 'adult') navigate('/adults');
      else navigate('/kids');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Who is learning?</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {!isAdding ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProfiles.map(p => (
              <button key={p.id} onClick={() => handleSelect(p.id)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                <div className="w-20 h-20 rounded-full bg-gray-100 text-4xl flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  {p.avatar}
                </div>
                <span className="font-bold text-gray-700">{p.name}</span>
              </button>
            ))}
            <button onClick={() => setIsAdding(true)} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary group transition-all">
              <div className="w-20 h-20 rounded-full bg-white text-gray-400 flex items-center justify-center group-hover:text-primary transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold text-gray-500 group-hover:text-primary">Add Profile</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-600">New {type === 'adult' ? 'Adult' : 'Kid'} Profile</h3>
            <input 
              autoFocus 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter Name"
              className="w-full p-4 bg-gray-100 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary text-gray-800"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Main Hub
const Hub = () => {
  const [showProfileSelector, setShowProfileSelector] = useState<ProfileType | null>(null);
  const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
      {showProfileSelector && <ProfileSelector type={showProfileSelector} onClose={() => setShowProfileSelector(null)} />}
      
      <header className="max-w-4xl mx-auto flex items-center justify-between py-4 mb-6">
        <img src="/assets/images/lingbo_logo_main.png" alt="Lingbo" className="h-10 object-contain" />
        <Link to="/profile" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"><Settings size={20} className="text-gray-500" /></Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* Word of Day */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
           <div className="flex gap-4 items-center">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                 <Calendar size={24} />
              </div>
              <div>
                 <div className="text-xs font-bold text-gray-400 uppercase">Word of the Day</div>
                 <div className="font-bold text-gray-800 text-lg">{dailyWord.igbo}</div>
                 <div className="text-sm text-gray-500">{dailyWord.english}</div>
              </div>
           </div>
           <button 
             onClick={async () => { const b64 = await generateIgboSpeech(dailyWord.igbo); if(b64) playPCMAudio(b64); }} 
             className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-primary transition-colors"
           >
             <Volume2 size={24} />
           </button>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => setShowProfileSelector('adult')} className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all text-left overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-orange-200 shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Adult Learning</h2>
              <p className="text-gray-500">Curriculum-based lessons, detailed grammar, and cultural insights.</p>
              <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                <Users size={16} /> Select Profile <ChevronRight size={16} />
              </div>
            </div>
          </button>

          <button onClick={() => setShowProfileSelector('kid')} className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-yellow-200 transition-all text-left overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-yellow-400 text-yellow-900 rounded-2xl flex items-center justify-center mb-6 shadow-yellow-200 shadow-lg group-hover:scale-110 transition-transform">
                <Smile size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Kids Corner</h2>
              <p className="text-gray-500">Fun games, stories, and interactive activities designed for children.</p>
              <div className="mt-6 flex items-center gap-2 text-yellow-600 font-bold text-sm group-hover:gap-3 transition-all">
                <Users size={16} /> Select Profile <ChevronRight size={16} />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

// 4. Chat Components
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

const LiveChat = () => {
  const [connected, setConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio contexts to prevent garbage collection and closure issues
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // Store the active session

  useEffect(() => {
    // Cleanup on unmount
    return () => disconnect();
  }, []);

  const connect = async () => {
    setError(null);
    if (!process.env.API_KEY) { 
      setError("API Key missing"); 
      return; 
    }

    try {
      // 1. Setup Output Audio Context (24kHz for Gemini output)
      // We create a new context per session to ensure fresh time/state
      const audioCtxOut = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioCtxOut.resume(); // Ensure it's active
      audioContextOutputRef.current = audioCtxOut;
      nextStartTimeRef.current = audioCtxOut.currentTime + 0.1; // Small buffer start

      // 2. Setup Input Audio Context (16kHz for Gemini input)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtxIn = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextInputRef.current = audioCtxIn;
      await audioCtxIn.resume();

      const source = audioCtxIn.createMediaStreamSource(stream);
      // Buffer size 4096 is standard for good latency/performance balance
      const processor = audioCtxIn.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtxIn.destination); // Necessary for chrome to fire events

      // 3. Connect to Gemini
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
                // Decode and Schedule
                const pcmData = base64ToUint8Array(base64Audio);
                // Gemini Output is 24kHz PCM
                const buffer = await pcmToAudioBuffer(pcmData, ctx, 24000, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                // Smart Scheduling
                // If nextStartTime is in the past, reset to now (plus tiny buffer) to avoid overlap "catch up"
                if (nextStartTimeRef.current < ctx.currentTime) {
                  nextStartTimeRef.current = ctx.currentTime + 0.05;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                // Visual feedback reset after speaking
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

      // Save promise to use in processor
      sessionRef.current = sessionPromise;

      // 4. Handle Mic Input
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 (-1 to 1) to Int16 PCM
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Convert to Base64 manually
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64Data = btoa(binary);

        // Send to Gemini
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
    
    // Stop Mic Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    // Stop Processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    // Close Input Context
    if (audioContextInputRef.current) {
      audioContextInputRef.current.close();
      audioContextInputRef.current = null;
    }
    // Close Output Context
    if (audioContextOutputRef.current) {
      audioContextOutputRef.current.close();
      audioContextOutputRef.current = null;
    }
    sessionRef.current = null;
  };

  return (
    <div className="h-[450px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-gray-100 relative overflow-hidden transition-all duration-500">
      
      {/* Dynamic Visualizer */}
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

const AdultDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  return (
    <Layout title="Curriculum" showBack backPath="/hub">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between bg-orange-50 p-6 rounded-2xl border border-orange-100">
           <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Nnọ, {activeProfile?.name || 'Friend'}!</h2>
              <p className="text-gray-600 text-sm">Ready to continue your learning?</p>
           </div>
           <div className="text-4xl">{activeProfile?.avatar}</div>
        </div>

        {/* Fun Fact */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
           <Lightbulb size={24} className="text-blue-500 shrink-0 mt-1" />
           <div>
              <h4 className="font-bold text-blue-700 text-sm mb-1">Did You Know?</h4>
              <p className="text-blue-900 text-sm leading-relaxed">{funFact}</p>
           </div>
        </div>

        {/* Reference Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-primary"/> Reference Materials</h3>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/alphabet')} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                 <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">Ab</div>
                 <div className="text-left"><div className="font-bold text-gray-800">Alphabet</div><div className="text-xs text-gray-500">Abidii</div></div>
              </button>
              <button onClick={() => navigate('/numbers')} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">123</div>
                 <div className="text-left"><div className="font-bold text-gray-800">Numbers</div><div className="text-xs text-gray-500">Onuogugu</div></div>
              </button>
           </div>
        </div>

        {/* Curriculum List */}
        <div className="grid grid-cols-1 gap-4">
          <h3 className="font-bold text-gray-800">Lessons</h3>
          {ADULT_CURRICULUM.map((level) => (
            <div 
              key={level.level_id}
              onClick={() => level.status !== 'locked' && navigate(`/adults/level/${level.level_id}`)}
              className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${level.status === 'locked' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-md cursor-pointer'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${level.status === 'completed' ? 'bg-green-100 text-green-600' : level.status === 'in_progress' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                  {level.status === 'completed' ? <CheckCircle size={24} /> : level.level_id}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Level {level.level_id}</div>
                  <div className="font-bold text-gray-800 text-xl">{level.title}</div>
                  {level.description && <div className="text-sm text-gray-500 mt-1">{level.description}</div>}
                </div>
              </div>
              {level.status === 'locked' ? <Lock size={24} className="text-gray-300" /> : <ChevronRight size={24} className="text-primary" />}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// 5. Kids Dashboard
const KidsDashboard = () => {
  const navigate = useNavigate();
  const { activeProfile } = useUser();

  const shortcuts = [
    { name: "Library", icon: BookOpen, color: "bg-blue-100 text-blue-600", path: "/library" },
    { name: "Videos", icon: PlayCircle, color: "bg-red-100 text-red-600", path: "/videos" },
    { name: "Speak", icon: Mic, color: "bg-green-100 text-green-600", path: "/practice" },
    { name: "ABC", icon: Type, color: "bg-purple-100 text-purple-600", path: "/alphabet" },
    { name: "123", icon: Hash, color: "bg-orange-100 text-orange-600", path: "/numbers" }
  ];

  return (
    <Layout title="Kids Corner" showBack backPath="/hub" isKidsMode hideBottomNav>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 bg-yellow-100 p-4 rounded-3xl border border-yellow-200">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
            {activeProfile?.avatar || '🐻'}
          </div>
          <div>
            <h2 className="font-kids font-bold text-xl text-yellow-800">Hi, {activeProfile?.name}!</h2>
            <p className="text-yellow-600 text-sm font-medium">Ready to play?</p>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
          {shortcuts.map((s, i) => (
            <button key={i} onClick={() => navigate(s.path)} className="flex flex-col items-center gap-2 min-w-[64px] group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color} shadow-sm group-active:scale-95 transition-transform`}>
                <s.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* BOOKS */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <BookOpen size={20} className="text-blue-500" />
               <h3 className="font-kids font-bold text-gray-700 text-lg tracking-wide">BOOKS</h3>
             </div>
             <button onClick={() => navigate('/library')} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200" className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt="Turtle" />
                <div className="text-left flex-1">
                  <h4 className="font-bold text-gray-800">The Turtle and the Hare</h4>
                  <p className="text-xs text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded mt-1 font-bold">Interactive Story</p>
                </div>
                <PlayCircle size={24} className="text-blue-500" />
             </button>
          </div>

          {/* VIDEO LIBRARY */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <Video size={20} className="text-red-500" />
               <h3 className="font-kids font-bold text-gray-700 text-lg tracking-wide">VIDEO LIBRARY</h3>
             </div>
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <button onClick={() => navigate('/videos')} className="bg-red-50 hover:bg-red-100 p-4 rounded-xl text-center transition-colors">
                   <div className="font-bold text-red-600 mb-1">Lessons</div>
                   <div className="text-xs text-red-400">Watch & Learn</div>
                 </button>
                 <button onClick={() => navigate('/videos')} className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl text-center transition-colors">
                   <div className="font-bold text-purple-600 mb-1">Songs</div>
                   <div className="text-xs text-purple-400">Sing Along</div>
                 </button>
               </div>
               <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Activities</h5>
                  <div className="space-y-2">
                    <button onClick={() => navigate('/kids/game/words')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <span className="font-bold text-gray-700">Flashcards</span>
                      <ImageIcon size={18} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                    <button onClick={() => navigate('/kids/game/sentence')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <span className="font-bold text-gray-700">Sentence Puzzle</span>
                      <Puzzle size={18} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                    <button onClick={() => navigate('/kids/game/memory')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <span className="font-bold text-gray-700">Memory Match</span>
                      <Zap size={18} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                    <button onClick={() => navigate('/kids/game/speed')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <span className="font-bold text-gray-700">Speed Tap</span>
                      <Timer size={18} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </div>
               </div>
             </div>
          </div>

          {/* WORKSHEETS */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <FileText size={20} className="text-orange-500" />
               <h3 className="font-kids font-bold text-gray-700 text-lg tracking-wide">WORKSHEETS</h3>
             </div>
             <button onClick={() => navigate('/library')} className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
                <p className="text-orange-500 font-bold text-sm">View Workbooks in Library</p>
             </button>
          </div>

        </div>
      </div>
    </Layout>
  );
};

const AlphabetBoard = () => {
  return (
    <Layout title="Abidii (Alphabet)" showBack>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {IGBO_ALPHABET_FULL.map((char) => (
          <button
            key={char}
            onClick={async () => {
               const b64 = await generateIgboSpeech(char);
               if (b64) playPCMAudio(b64);
            }}
            className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-primary hover:text-white hover:scale-105 transition-all"
          >
            {char}
          </button>
        ))}
      </div>
    </Layout>
  );
};

const NumbersBoard = () => {
  return (
    <Layout title="Onuogugu (Numbers)" showBack>
      <div className="grid grid-cols-2 gap-4">
        {IGBO_NUMBERS.map((item) => (
          <button
            key={item.number}
            onClick={async () => {
               const b64 = await generateIgboSpeech(item.word);
               if (b64) playPCMAudio(b64);
            }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-primary transition-all group"
          >
            <span className="text-3xl font-bold text-blue-500 group-hover:scale-110 transition-transform">{item.number}</span>
            <span className="font-bold text-gray-700 text-lg">{item.word}</span>
          </button>
        ))}
      </div>
    </Layout>
  );
};

const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'books' | 'workbooks'>('books');
  
  return (
    <Layout title="Library" showBack>
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('books')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'books' ? 'bg-white shadow text-primary' : ''}`}>Story Books</button>
        <button onClick={() => setActiveTab('workbooks')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all text-gray-700 ${activeTab === 'workbooks' ? 'bg-white shadow text-primary' : ''}`}>Workbooks</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activeTab === 'books' ? LIBRARY_BOOKS.map((book, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3">
             <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
               <img src={book.cover} className="w-full h-full object-cover" alt={book.title}/>
             </div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{book.title}</h4>
               <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{book.type}</span>
             </div>
          </div>
        )) : WORKBOOKS.map((wb) => (
          <button key={wb.id} onClick={() => navigate(`/library/workbook/${wb.id}`)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 text-left hover:shadow-md transition-all">
             <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
               <img src={wb.cover} className="w-full h-full object-cover" alt={wb.title}/>
               <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</div>
             </div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{wb.title}</h4>
               <p className="text-xs text-gray-400">{wb.pages} Pages</p>
             </div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [cards, setCards] = useState(() => {
     return [...MEMORY_GAME_DATA, ...MEMORY_GAME_DATA.map(i => ({...i, id: i.id + '_pair'}))].sort(() => Math.random() - 0.5).map(c => ({...c, flipped: false, matched: false}));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].matchId === cards[second].matchId) {
        setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, matched: true, flipped: true } : c));
        setFlipped([]);
        playGameSound('success');
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 1000);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.every(c => c.matched)) {
        setSolved(true);
        playGameSound('win');
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !cards[index].flipped && !cards[index].matched) {
      playGameSound('flip');
      setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
      setFlipped(prev => [...prev, index]);
    }
  };

  return (
     <Layout title="Memory Match" showBack isKidsMode hideBottomNav>
        {solved && <ConfettiOverlay onRestart={() => window.location.reload()} />}
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card, i) => (
             <button 
               key={card.id} 
               onClick={() => handleCardClick(i)} 
               className={`aspect-square rounded-xl shadow-sm border-b-4 transition-all duration-300 transform ${card.flipped || card.matched ? 'bg-white border-blue-200 rotate-y-180' : 'bg-blue-500 border-blue-700'}`}
             >
               {(card.flipped || card.matched) ? (
                 <div className="w-full h-full flex items-center justify-center p-2">
                    {card.type === 'image' ? <img src={card.content} className="w-full h-full object-contain" /> : <span className="font-bold text-lg text-gray-700">{card.content}</span>}
                 </div>
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl text-white/50">?</span>
                 </div>
               )}
             </button>
          ))}
        </div>
     </Layout>
  );
};

const SpeedTapGame = ({ onBack }: { onBack: () => void }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentQuestion, setCurrentQuestion] = useState(KIDS_FLASHCARDS[0]);
    const [options, setOptions] = useState<typeof KIDS_FLASHCARDS>([]);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
       if (timeLeft > 0 && !gameOver) {
         const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
         return () => clearInterval(timer);
       } else if (timeLeft === 0) {
         setGameOver(true);
         playGameSound('win');
       }
    }, [timeLeft, gameOver]);

    const generateRound = () => {
       const target = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
       let opts = [target];
       while (opts.length < 4) {
          const r = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
          if (!opts.find(o => o.igbo === r.igbo)) opts.push(r);
       }
       setOptions(opts.sort(() => Math.random() - 0.5));
       setCurrentQuestion(target);
    };

    useEffect(() => {
       generateRound();
    }, []);

    const handleTap = (item: typeof KIDS_FLASHCARDS[0]) => {
       if (item.igbo === currentQuestion.igbo) {
          setScore(s => s + 10);
          playGameSound('success');
          generateRound();
       } else {
          setScore(s => Math.max(0, s - 5));
          playGameSound('error');
       }
    };

    return (
       <Layout title="Speed Tap" showBack isKidsMode hideBottomNav>
          {gameOver ? (
             <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-4xl font-kids font-bold text-purple-600 mb-4">Time's Up!</h2>
                <div className="text-6xl font-bold text-gray-800 mb-8">{score}</div>
                <button onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); generateRound(); }} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg">Play Again</button>
             </div>
          ) : (
             <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                   <div className="flex items-center gap-2 font-bold text-purple-700"><Timer /> {timeLeft}s</div>
                   <div className="font-bold text-2xl text-purple-900">{score}</div>
                </div>
                <div className="text-center mb-8">
                   <h3 className="text-gray-500 font-bold uppercase text-sm mb-2">Find:</h3>
                   <div className="text-4xl font-bold text-gray-800">{currentQuestion.igbo}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                   {options.map((opt, i) => (
                      <button key={i} onClick={() => handleTap(opt)} className="bg-white rounded-2xl p-4 shadow-md border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center">
                         <img src={opt.image} className="w-full h-full object-contain max-h-32" alt={opt.english} />
                      </button>
                   ))}
                </div>
             </div>
          )}
       </Layout>
    );
};

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

const MemoryGameWrapper = () => <MemoryGame onBack={() => window.history.back()} />;
const SpeedGameWrapper = () => <SpeedTapGame onBack={() => window.history.back()} />;

const SentenceGameWrapper = () => {
    const [gameWon, setGameWon] = useState(false);
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);
    const sentenceGame = KIDS_GAMES[0];
    const [availableBlocks, setAvailableBlocks] = useState<string[]>(sentenceGame.example_round.scrambled_blocks);

    const handleBlockClick = (word: string) => {
        playGameSound('click');
        const newSentence = [...builtSentence, word];
        setBuiltSentence(newSentence);
        setAvailableBlocks(availableBlocks.filter(b => b !== word));
        if (newSentence.length === sentenceGame.example_round.correct_order.length) {
          if (newSentence.every((val, i) => val === sentenceGame.example_round.correct_order[i])) {
            playGameSound('win');
            setGameWon(true);
            generateIgboSpeech("O mara nma!").then(b64 => b64 && playPCMAudio(b64));
          } else {
            playGameSound('error');
          }
        }
    };
    const reset = () => { setBuiltSentence([]); setAvailableBlocks(sentenceGame.example_round.scrambled_blocks); setGameWon(false); };
    return (
        <Layout title="Sentence Puzzle" showBack isKidsMode hideBottomNav>
             <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100 relative overflow-hidden min-h-[450px] flex flex-col max-w-2xl mx-auto">
               {gameWon && <ConfettiOverlay onRestart={reset} />}
               <div className="text-center mb-6 mt-6">
                 <h3 className="font-kids font-bold text-2xl text-pink-500 mb-1">Sentence Builder</h3>
                 <p className="text-gray-500 text-sm">Make: <span className="text-gray-800 font-bold bg-gray-100 px-1 rounded">"{sentenceGame.example_round.target_sentence}"</span></p>
               </div>
               <div className="bg-gray-50 rounded-2xl p-6 min-h-[120px] flex gap-3 flex-wrap items-center justify-center mb-8 border-2 border-dashed border-gray-300">
                  {builtSentence.map((word, i) => <div key={i} className="bg-white px-5 py-3 rounded-xl shadow-md font-bold text-gray-700 animate-in zoom-in border border-gray-100 text-lg hover:scale-105 transition-transform">{word}</div>)}
               </div>
               <div className="flex gap-4 justify-center flex-wrap mt-auto">
                 {availableBlocks.map((word, i) => <button key={i} onClick={() => handleBlockClick(word)} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold px-6 py-4 rounded-2xl shadow-md border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-lg animate-in fade-in slide-in-from-bottom-2">{word}</button>)}
               </div>
               <div className="mt-8 flex justify-center"><button onClick={reset} className="text-gray-400 flex items-center gap-2 text-sm font-bold hover:text-pink-500"><RefreshCcw size={16} /> Start Over</button></div>
            </div>
        </Layout>
    );
};

const FlashcardWrapper = () => {
    const [currentCard, setCurrentCard] = useState(0);
    const card = KIDS_FLASHCARDS[currentCard];
    const next = () => setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length);
    const prev = () => setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
    return (
        <Layout title="Flashcards" showBack isKidsMode hideBottomNav>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-6 flex flex-col items-center justify-between relative overflow-hidden">
                 <div className="w-full flex justify-between items-center text-gray-400 text-sm font-bold">
                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">{card.english}</span>
                   <button onClick={async () => { const b64 = await generateIgboSpeech(card.igbo); if(b64) playPCMAudio(b64); }} className="p-3 hover:bg-blue-50 rounded-full border border-gray-100 shadow-sm transition-colors"><Volume2 size={24} className="text-blue-500" /></button>
                 </div>
                 <div className="relative flex-1 flex items-center justify-center w-full">
                    <img src={card.image} alt={card.english} className="w-48 h-48 object-contain drop-shadow-lg relative z-10" />
                 </div>
                 <div className="text-center w-full">
                   <h2 className="text-5xl font-kids font-bold text-blue-600 mb-2">{card.igbo}</h2>
                 </div>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <button onClick={prev} className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-95 transition-transform"><ChevronRight size={36} className="rotate-180" /></button>
                <button onClick={next} className="w-16 h-16 bg-blue-500 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:bg-blue-600 active:scale-95 transition-transform"><ChevronRight size={36} /></button>
              </div>
            </div>
        </Layout>
    )
};

const WorkbookViewer = () => {
  const { id } = useParams();
  const book = WORKBOOKS.find(w => w.id === id);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  if (!book) return <Navigate to="/library" />;

  return (
     <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="flex justify-between items-center p-4 text-white">
           <button onClick={() => navigate(-1)}><ArrowLeft /></button>
           <span className="font-bold">{book.title}</span>
           <span className="text-sm text-gray-400">{page} / {book.pages}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-800 relative">
           <div className="w-full max-w-md aspect-[3/4] bg-white rounded shadow-lg flex items-center justify-center relative overflow-hidden">
              {/* Simulated Page Content */}
              <div className="text-center p-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Page {page}</h2>
                 <p className="text-gray-500">This is a simulated view of the workbook content.</p>
                 <div className="mt-8 border-2 border-dashed border-gray-300 h-64 w-full rounded flex items-center justify-center text-gray-300">Content Placeholder</div>
              </div>
           </div>
           {page > 1 && <button onClick={() => setPage(p => p - 1)} className="absolute left-4 p-4 bg-black/50 rounded-full text-white hover:bg-black/70"><ChevronRight className="rotate-180" /></button>}
           {page < book.pages && <button onClick={() => setPage(p => p + 1)} className="absolute right-4 p-4 bg-black/50 rounded-full text-white hover:bg-black/70"><ChevronRight /></button>}
        </div>
     </div>
  );
};

const VideoLibrary = () => {
  const [playingVideo, setPlayingVideo] = useState<VideoResource | null>(null);
  
  return (
    <Layout title="Videos" showBack>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {VIDEO_RESOURCES.map((v) => (
           <button onClick={() => setPlayingVideo(v)} key={v.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 text-left hover:shadow-md transition-all group">
             <div className="w-32 aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
               <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30"><PlayCircle className="text-white drop-shadow-md"/></div>
             </div>
             <div><h4 className="font-bold text-sm text-gray-800 mb-1">{v.title}</h4><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{v.duration}</span></div>
           </button>
         ))}
       </div>
       {playingVideo && createPortal(
         <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setPlayingVideo(null)}>
           <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`} title={playingVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
             <button onClick={() => setPlayingVideo(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"><X size={24}/></button>
           </div>
           <h3 className="text-white font-bold text-xl mt-4">{playingVideo.title}</h3>
         </div>,
         document.body
       )}
    </Layout>
  );
};

const LessonView = () => {
  const { id } = useParams();
  const level = ADULT_CURRICULUM.find(l => l.level_id === Number(id));
  const [activeTab, setActiveTab] = useState<'vocab' | 'quiz'>('vocab');
  const [quizScore, setQuizScore] = useState(0);

  if (!level) return <Navigate to="/adults" />;

  const vocabLesson = level.lessons?.find(l => l.type === 'vocabulary');
  const quizLesson = level.lessons?.find(l => l.type === 'quiz_section');

  return (
    <Layout title={level.title} showBack backPath="/adults">
       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-500 mb-4">{level.description}</p>
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setActiveTab('vocab')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'vocab' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}>Vocabulary</button>
             <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'quiz' ? 'bg-white text-primary shadow' : 'text-gray-500'}`}>Quiz</button>
          </div>
       </div>

       {activeTab === 'vocab' && vocabLesson && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
             {vocabLesson.data?.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                   <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt={item.english} />
                   <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800">{item.igbo}</h4>
                      <p className="text-gray-500 text-sm">{item.english}</p>
                   </div>
                   <button onClick={async () => { const b64 = await generateIgboSpeech(item.igbo); if(b64) playPCMAudio(b64); }} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20"><Volume2 size={20}/></button>
                </div>
             ))}
          </div>
       )}

       {activeTab === 'quiz' && quizLesson && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
             <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100"><Trophy className="inline mb-1 text-orange-500" size={20}/> <span className="font-bold text-orange-700">Quiz Score: {quizScore}</span></div>
             {quizLesson.activities?.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h4 className="font-bold text-gray-800 mb-4">Q{i+1}: {q.question || q.instruction}</h4>
                   {q.quiz_type === 'multiple_choice_3_options' && (
                      <div className="space-y-2">
                         {q.options?.map(opt => (
                            <button key={opt} onClick={() => { if(opt === q.correct_answer) { playGameSound('success'); setQuizScore(s=>s+10); } else playGameSound('error'); }} className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 hover:border-primary font-medium text-gray-700">{opt}</button>
                         ))}
                      </div>
                   )}
                   {q.quiz_type === 'match_picture_to_word' && (
                      <div className="grid grid-cols-3 gap-2">
                         {q.options?.map(opt => (
                            <button key={opt} onClick={() => { if(opt === q.correct_answer) { playGameSound('success'); setQuizScore(s=>s+10); } else playGameSound('error'); }} className="aspect-square border rounded-lg overflow-hidden hover:border-primary"><img src={opt} className="w-full h-full object-cover"/></button>
                         ))}
                      </div>
                   )}
                </div>
             ))}
          </div>
       )}
    </Layout>
  );
};

const SpeakPractice = () => {
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

const ProfilePage = () => {
  const { activeProfile, logout } = useUser();
  if (!activeProfile) return <Navigate to="/" />;
  return (
    <Layout title="Profile" showBack backPath="/hub">
       <div className="space-y-6">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <div className="text-6xl mb-4">{activeProfile.avatar}</div>
             <h2 className="text-2xl font-bold text-gray-800">{activeProfile.name}</h2>
             <p className="text-gray-500 text-sm font-medium uppercase mt-1">Joined {activeProfile.joinedDate}</p>
             <button onClick={logout} className="mt-6 text-red-500 font-bold hover:bg-red-50 px-6 py-2 rounded-full transition-colors border border-red-100">Log Out</button>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> Achievements</h3>
             <div className="space-y-4">
                {ACHIEVEMENTS.map(ach => (
                   <div key={ach.id} className={`flex items-center gap-4 p-3 rounded-xl border ${ach.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="text-2xl">{ach.unlocked ? ach.icon : '🔒'}</div>
                      <div>
                         <h4 className="font-bold text-gray-800 text-sm">{ach.title}</h4>
                         <p className="text-xs text-gray-500">{ach.description}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </Layout>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profiles } = useUser();
  if (profiles.length === 0) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

// --- Updated App Router ---
const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <IgboKeyboard />
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<RequireAuth><Hub /></RequireAuth>} />

          {/* Adult Section */}
          <Route path="/adults" element={<RequireAuth><AdultDashboard /></RequireAuth>} />
          <Route path="/adults/level/:id" element={<RequireAuth><LessonView /></RequireAuth>} />

          {/* Kid Section */}
          <Route path="/kids" element={<RequireAuth><KidsDashboard /></RequireAuth>} />
          <Route path="/kids/game/words" element={<RequireAuth><FlashcardWrapper /></RequireAuth>} />
          <Route path="/kids/game/sentence" element={<RequireAuth><SentenceGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/memory" element={<RequireAuth><MemoryGameWrapper /></RequireAuth>} />
          <Route path="/kids/game/speed" element={<RequireAuth><SpeedGameWrapper /></RequireAuth>} />
          
          {/* Shared Features */}
          <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
          <Route path="/library/workbook/:id" element={<RequireAuth><WorkbookViewer /></RequireAuth>} />
          <Route path="/videos" element={<RequireAuth><VideoLibrary /></RequireAuth>} />
          <Route path="/practice" element={<RequireAuth><SpeakPractice /></RequireAuth>} />
          <Route path="/alphabet" element={<RequireAuth><AlphabetBoard /></RequireAuth>} />
          <Route path="/numbers" element={<RequireAuth><NumbersBoard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
